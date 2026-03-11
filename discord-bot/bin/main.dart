import "dart:io";
import "package:discord_bot/database/database.dart";
import "package:discord_bot/exceptions.dart";
import "package:discord_bot/plugins/database.dart";
import "package:discord_bot/plugins/settings.dart";
import "package:dotenv/dotenv.dart";
import "package:nyxx/nyxx.dart";
import "package:nyxx_commands/nyxx_commands.dart";
import "package:path/path.dart";

void main() async {
  final env = DotEnv(includePlatformEnvironment: true, quiet: true);
  env.load();

  final debug = env.getOrElse("DEBUG", () => "false") == "true";

  final dataDir = Directory(
    normalize(absolute(env.getOrElse("DATA_DIR", () => "."))),
  );

  if (!dataDir.existsSync()) dataDir.createSync(recursive: true);

  final settings = Settings(
    dataDir: dataDir,
    adminId: Snowflake.parse(
      env.getOrElse(
        "DISCORD_ADMIN_ID",
        () => throw NoDiscordAdminIdException(
          "Admin ID not found in ENV variables!",
        ),
      ),
    ),
    guildId: Snowflake.parse(
      env.getOrElse(
        "DISCORD_GUILD_ID",
        () => throw NoDiscordGuildIdException(
          "Guild ID not found in ENV variables!",
        ),
      ),
    ),
    clientId: Snowflake.parse(
      env.getOrElse(
        "DISCORD_CLIENT_ID",
        () => throw NoDiscordClientIdException(
          "Client ID not found in ENV variables!",
        ),
      ),
    ),
  );

  await Nyxx.connectGateway(
    env.getOrElse(
      "DISCORD_TOKEN",
      () => throw NoDiscordTokenException("Token not found in ENV variables!"),
    ),
    GatewayIntents.allUnprivileged,
    options: GatewayClientOptions(
      plugins: [
        cliIntegration,
        SettingsPlugin(settings),
        DatabasePlugin(Database(dataDir)),
        Logging(logLevel: debug ? Level.ALL : Level.INFO),
        CommandsPlugin(
          prefix: null,
          options: CommandsOptions(
            logErrors: true,
            inferDefaultCommandType: true,
            autoAcknowledgeInteractions: false,
            type: CommandType.slashOnly,
          ),
        ),
      ],
    ),
  );
}
