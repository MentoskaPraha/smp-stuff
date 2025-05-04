import logger from "@logger";
import commands from "@commands";
import events from "@events";
import {
  Client,
  ClientEvents,
  GatewayIntentBits,
  REST,
  Routes
} from "discord.js";
import { INTEGER, ModelDefined, Sequelize, STRING } from "sequelize";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ConfigFileDate, DatabaseEntry, DatabaseEntryCreation } from "@types";

class DiscordBot {
  public client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent
    ]
  });
  public clientID = process.env.DISCORD_CLIENT_ID as string;
  public guildID = process.env.DISCORD_GUILD_ID as string;

  private sequilize = new Sequelize("database", "user", undefined, {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: join(
      import.meta.dirname.split("/src")[0],
      "data",
      "database.sqlite"
    )
  });
  public database: ModelDefined<DatabaseEntry, DatabaseEntryCreation> =
    this.sequilize.define("users", {
      id: {
        type: STRING,
        unique: true,
        primaryKey: true,
        allowNull: false
      },
      minecraft_username: {
        type: STRING,
        allowNull: true,
        defaultValue: null
      },
      minecraft_color: {
        type: STRING,
        allowNull: true,
        defaultValue: null
      },
      discord_color: {
        type: STRING,
        allowNull: true,
        defaultValue: null
      },
      discord_color_role_id: {
        type: STRING,
        allowNull: true,
        defaultValue: null
      },
      mod_suggestions_number: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      mod_suggestion_msg_1: {
        type: STRING,
        allowNull: true,
        defaultValue: null,
        unique: true
      },
      mod_suggestion_msg_2: {
        type: STRING,
        allowNull: true,
        defaultValue: null,
        unique: true
      },
      mod_suggestion_msg_3: {
        type: STRING,
        allowNull: true,
        defaultValue: null,
        unique: true
      },
      mod_suggestion_msg_4: {
        type: STRING,
        allowNull: true,
        defaultValue: null,
        unique: true
      },
      mod_suggestion_msg_5: {
        type: STRING,
        allowNull: true,
        defaultValue: null,
        unique: true
      }
    });

  public settings = new DiscordBotSetting();

  login() {
    logger.debug("Bot is logging in...");
    this.client.login(process.env.DISCORD_TOKEN).catch((error: Error) => {
      logger.fatal(error, "Failed to login to Discord!");
      logger.destroy();
      process.exit(1);
    });
  }

  async logout() {
    logger.debug("Bot is logging out...");
    await this.client.destroy();
    logger.info("Bot has been logged out!");
  }

  async registerEvents() {
    logger.debug("Registering Discord events...");

    (await events).forEach((event) => {
      if (event.once) {
        this.client.once(
          event.name,
          (...args: ClientEvents[typeof event.name]) => event.execute(...args)
        );
      } else {
        this.client.on(event.name, (...args: ClientEvents[typeof event.name]) =>
          event.execute(...args)
        );
      }
    });

    logger.info("Listening to Discord events!");
  }

  async registerCmd() {
    logger.debug("Registering application commands...");

    const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

    rest
      .put(Routes.applicationGuildCommands(this.clientID, this.guildID), {
        body: (await commands)
          .filter((command) => !command.global)
          .map((command) => command.data.toJSON())
      })
      .then(() => logger.info("Register guild specific application commands!"))
      .catch((error: Error) =>
        logger.error(
          error,
          "Failed to register guild specific application commands!"
        )
      );

    rest
      .put(Routes.applicationCommands(this.clientID), {
        body: (await commands)
          .filter((command) => command.global)
          .map((command) => command.data.toJSON())
      })
      .then(() => logger.info("Register global application commands!"))
      .catch((error: Error) =>
        logger.error(error, "Failed to register global application commands!")
      );
  }

  async setupDatabase() {
    //sync the model to the db
    logger.debug("Syncing database model to database...");
    await this.database.sync();

    //register logger hooks
    logger.debug("Registering hooks...");
    this.database.afterCreate((entry) =>
      logger.info(`Create new entry(${entry.dataValues.id}) in database.`)
    );
    this.database.afterUpdate((entry) =>
      logger.info(`Updated entry(${entry.dataValues.id}) in database.`)
    );
    this.database.afterDestroy((entry) =>
      logger.info(`Removed entry(${entry.dataValues.id}) in database.`)
    );

    if ((process.env.DEV as boolean | undefined) ?? false) {
      this.database.beforeCreate((entry) =>
        logger.debug(
          `Creating new entry(${entry.dataValues.id}) in database...`
        )
      );
      this.database.beforeUpdate((entry) =>
        logger.debug(`Updating entry(${entry.dataValues.id}) in database...`)
      );
      this.database.beforeDestroy((entry) =>
        logger.debug(`Removing entry(${entry.dataValues.id}) in database...`)
      );
    }

    logger.info("Database is ready!");
  }
}

class DiscordBotSetting {
  private configFile = join(
    import.meta.dirname.split("/src")[0],
    "data",
    "config.json"
  );

  public announcementChannelId: string | null = null;
  public modSuggestionChannelId: string | null = null;
  public modSuggestionsEnabled = false;

  constructor() {
    //create the config file if it does not exist
    if (!existsSync(this.configFile)) this.updateConfigFile();
  }

  updateConfigFile() {
    const config = {
      announcementChannelId: this.announcementChannelId,
      modSuggestionChannelId: this.modSuggestionChannelId,
      modSuggestionsEnabled: this.modSuggestionsEnabled
    };
    const configJSON = JSON.stringify(config);

    try {
      writeFileSync(this.configFile, configJSON);
    } catch (error) {
      logger.error(error as Error, "Failed to write config to config file!");
    }
  }

  refreshConfigFromFile() {
    try {
      const configJSON = readFileSync(this.configFile).toString();
      const config = JSON.parse(configJSON) as ConfigFileDate;

      this.announcementChannelId = config.announcementChannelId;
      this.modSuggestionChannelId = config.modSuggestionChannelId;
      this.modSuggestionsEnabled = config.modSuggestionsEnabled;
    } catch (error) {
      logger.error(error as Error, "Failed to read the config file!");
      return;
    }
  }
}

export default new DiscordBot();
