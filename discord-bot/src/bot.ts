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
import { BOOLEAN, INTEGER, ModelDefined, Sequelize, STRING } from "sequelize";
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
  public adminID = process.env.DISCORD_ADMIN_USER_ID as string;

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
        allowNull: false,
        defaultValue: "white"
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
      notify_activity: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notify_activity_player_threshold: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      notify_activity_cooldown_min: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 20
      },
      notify_activity_timestamp: {
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

  public startTime = new Date(Date.now());

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
      .put(Routes.applicationCommands(this.clientID), {
        body: (await commands).map((command) => command.data.toJSON())
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

  /**
   * Fetches a user's database entry or creates one if it doesn't exist.
   * @param userID The Discord id of the user's entry.
   * @returns The DatabaseEntry of the user provided.
   */
  async getFromDatabase(userID: string) {
    const entry = await this.database.findOne({ where: { id: userID } });

    if (entry == null) {
      const newEntry = await this.database.create({
        id: userID,
        minecraft_username: null,
        minecraft_color: "white",
        mod_suggestions_number: 0,
        notify_activity: false,
        notify_activity_player_threshold: 5,
        notify_activity_cooldown_min: 20
      });

      return newEntry.dataValues;
    } else {
      return entry.dataValues;
    }
  }

  /**
   * Update a certain database entry or creates one if it doesn't exist.
   * @param userID The Discord id of the user's entry.
   * @param updatedEntry The data that should be changed.
   * @returns Whether the user existed or not.
   */
  async updateInDatabase(
    userID: string,
    updatedEntry: {
      minecraft_username?: string | null;
      minecraft_color?: string;
      discord_color?: string | null;
      discord_color_role_id?: string | null;
      notify_activity?: boolean;
      notify_activity_player_threshold?: number;
      notify_activity_cooldown_min?: number;
      notify_activity_timestamp?: string;
      mod_suggestions_number?: number;
      mod_suggestion_msg_1?: string | null;
      mod_suggestion_msg_2?: string | null;
      mod_suggestion_msg_3?: string | null;
      mod_suggestion_msg_4?: string | null;
      mod_suggestion_msg_5?: string | null;
    }
  ) {
    const affected = await this.database.update(
      {
        minecraft_username: updatedEntry.minecraft_username,
        minecraft_color: updatedEntry.minecraft_color,
        discord_color: updatedEntry.discord_color,
        discord_color_role_id: updatedEntry.discord_color_role_id,
        notify_activity: updatedEntry.notify_activity,
        notify_activity_player_threshold:
          updatedEntry.notify_activity_player_threshold,
        notify_activity_cooldown_min: updatedEntry.notify_activity_cooldown_min,
        notify_activity_timestamp: updatedEntry.notify_activity_timestamp,
        mod_suggestions_number: updatedEntry.mod_suggestions_number,
        mod_suggestion_msg_1: updatedEntry.mod_suggestion_msg_1,
        mod_suggestion_msg_2: updatedEntry.mod_suggestion_msg_2,
        mod_suggestion_msg_3: updatedEntry.mod_suggestion_msg_3,
        mod_suggestion_msg_4: updatedEntry.mod_suggestion_msg_4,
        mod_suggestion_msg_5: updatedEntry.mod_suggestion_msg_5
      },
      { where: { id: userID } }
    );

    if (affected[0] == 0) {
      await this.database.create({
        id: userID,
        minecraft_username: updatedEntry.minecraft_username,
        minecraft_color: updatedEntry.minecraft_color ?? "white",
        discord_color: updatedEntry.discord_color,
        discord_color_role_id: updatedEntry.discord_color_role_id,
        notify_activity: updatedEntry.notify_activity ?? false,
        notify_activity_player_threshold:
          updatedEntry.notify_activity_player_threshold ?? 5,
        notify_activity_cooldown_min:
          updatedEntry.notify_activity_cooldown_min ?? 20,
        notify_activity_timestamp: updatedEntry.notify_activity_timestamp,
        mod_suggestions_number: updatedEntry.mod_suggestions_number ?? 0,
        mod_suggestion_msg_1: updatedEntry.mod_suggestion_msg_1,
        mod_suggestion_msg_2: updatedEntry.mod_suggestion_msg_2,
        mod_suggestion_msg_3: updatedEntry.mod_suggestion_msg_3,
        mod_suggestion_msg_4: updatedEntry.mod_suggestion_msg_4,
        mod_suggestion_msg_5: updatedEntry.mod_suggestion_msg_5
      });
      return false;
    } else {
      return true;
    }
  }
}

class DiscordBotSetting {
  private configFile = join(
    import.meta.dirname.split("/src")[0],
    "data",
    "config.json"
  );

  public statusChannelId: string | null = null;
  public gamechatChannelId: string | null = null;
  public modSuggestionChannelId: string | null = null;
  public modSuggestionsEnabled = false;

  constructor() {
    //create the config file if it does not exist
    if (!existsSync(this.configFile)) this.updateConfigFile();
  }

  updateConfigFile() {
    const config = {
      statusChannelId: this.statusChannelId,
      gamechatChannelId: this.gamechatChannelId,
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

      this.statusChannelId = config.statusChannelId;
      this.gamechatChannelId = config.gamechatChannelId;
      this.modSuggestionChannelId = config.modSuggestionChannelId;
      this.modSuggestionsEnabled = config.modSuggestionsEnabled;
    } catch (error) {
      logger.error(error as Error, "Failed to read the config file!");
      return;
    }
  }
}

export default new DiscordBot();
