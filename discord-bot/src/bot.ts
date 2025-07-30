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
import {
  BOOLEAN,
  INTEGER,
  ModelDefined,
  Sequelize,
  STRING,
  UniqueConstraintError
} from "sequelize";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  ConfigFileDate,
  DatabaseEntry,
  DatabaseEntryCreation,
  ModSuggestionMsgsDatabaseEntry
} from "@types";

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

  public user_database: ModelDefined<DatabaseEntry, DatabaseEntryCreation> =
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
      }
    });

  public mod_suggestion_msgs_database: ModelDefined<
    ModSuggestionMsgsDatabaseEntry,
    ModSuggestionMsgsDatabaseEntry
  > = this.sequilize.define("mod_suggestion_msgs", {
    id: {
      type: STRING,
      unique: true,
      primaryKey: true,
      allowNull: false
    },
    content: {
      type: STRING,
      unique: true,
      allowNull: false
    },
    authorId: {
      type: STRING,
      unique: false,
      allowNull: false
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
    //setup relations between databases
    this.user_database.hasMany(this.mod_suggestion_msgs_database, {
      foreignKey: "authorId"
    });
    this.mod_suggestion_msgs_database.belongsTo(this.user_database, {
      foreignKey: "authorId"
    });

    //sync the model to the db
    logger.debug("Syncing database model to database...");
    await this.user_database.sync();
    await this.mod_suggestion_msgs_database.sync();

    //register logger hooks
    logger.debug("Registering hooks...");
    this.user_database.afterCreate((entry) =>
      logger.info(`Create new entry(${entry.dataValues.id}) in user database.`)
    );
    this.user_database.afterUpdate((entry) =>
      logger.info(`Updated entry(${entry.dataValues.id}) in user database.`)
    );
    this.user_database.afterDestroy((entry) =>
      logger.info(`Removed entry(${entry.dataValues.id}) in user database.`)
    );
    this.mod_suggestion_msgs_database.afterCreate((entry) =>
      logger.info(
        `Create new entry(${entry.dataValues.id}) in mod_suggestion_msgs database.`
      )
    );
    this.mod_suggestion_msgs_database.afterUpdate((entry) =>
      logger.info(
        `Updated entry(${entry.dataValues.id}) in mod_suggestion_msgs database.`
      )
    );
    this.mod_suggestion_msgs_database.afterDestroy((entry) =>
      logger.info(
        `Removed entry(${entry.dataValues.id}) in mod_suggestion_msgs database.`
      )
    );

    if ((process.env.DEV as boolean | undefined) ?? false) {
      this.user_database.beforeCreate((entry) =>
        logger.debug(
          `Creating new entry(${entry.dataValues.id}) in user database...`
        )
      );
      this.user_database.beforeUpdate((entry) =>
        logger.debug(
          `Updating entry(${entry.dataValues.id}) in user database...`
        )
      );
      this.user_database.beforeDestroy((entry) =>
        logger.debug(
          `Removing entry(${entry.dataValues.id}) in user database...`
        )
      );
      this.mod_suggestion_msgs_database.beforeCreate((entry) =>
        logger.debug(
          `Creating new entry(${entry.dataValues.id}) in mod_suggestion_msgs database...`
        )
      );
      this.mod_suggestion_msgs_database.beforeUpdate((entry) =>
        logger.debug(
          `Updating entry(${entry.dataValues.id}) in mod_suggestion_msgs database...`
        )
      );
      this.mod_suggestion_msgs_database.beforeDestroy((entry) =>
        logger.debug(
          `Removing entry(${entry.dataValues.id}) in mod_suggestion_msgs database...`
        )
      );
    }

    logger.info("Database is ready!");
  }

  /**
   * Fetches a user's database entry or creates one if it doesn't exist.
   * @param userID The Discord id of the user's entry.
   * @returns The DatabaseEntry of the user provided.
   */
  async getUserFromDatabase(userID: string) {
    const entry = await this.user_database.findOne({ where: { id: userID } });

    if (entry == null) {
      const newEntry = await this.user_database.create({
        id: userID,
        minecraft_username: null,
        minecraft_color: "white",
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
   */
  async updateUserInDatabase(
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
    }
  ) {
    const affected = await this.user_database.update(
      {
        minecraft_username: updatedEntry.minecraft_username,
        minecraft_color: updatedEntry.minecraft_color,
        discord_color: updatedEntry.discord_color,
        discord_color_role_id: updatedEntry.discord_color_role_id,
        notify_activity: updatedEntry.notify_activity,
        notify_activity_player_threshold:
          updatedEntry.notify_activity_player_threshold,
        notify_activity_cooldown_min: updatedEntry.notify_activity_cooldown_min,
        notify_activity_timestamp: updatedEntry.notify_activity_timestamp
      },
      { where: { id: userID } }
    );

    if (affected[0] == 0) {
      await this.user_database.create({
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
        notify_activity_timestamp: updatedEntry.notify_activity_timestamp
      });
    }
  }

  /**
   * Creates a new Mod Suggestion Message in the database.
   * @param msgId The id of the message.
   * @param content The content of the message.
   * @param userId The id of the author of the message.
   * @returns True if the message is a duplicate, false otherwise.
   */
  async createModSuggestionMsg(msgId: string, content: string, userId: string) {
    //make sure the author has a database entry
    await this.getUserFromDatabase(userId);

    //create the message
    try {
      await this.mod_suggestion_msgs_database.create({
        id: msgId,
        content: content,
        authorId: userId
      });
      return false;
    } catch (error) {
      //if this error is thrown it's a duplicate
      if (error instanceof UniqueConstraintError) {
        return true;
      } else {
        throw error;
      }
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
    this.refreshConfigFromFile();
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
