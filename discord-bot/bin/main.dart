import "dart:io";
import "package:discord_bot/database/database.dart";
import "package:discord_bot/exceptions.dart";
import "package:discord_bot/plugins/commands.dart";
import "package:discord_bot/plugins/database.dart";
import "package:discord_bot/plugins/settings.dart";
import "package:dotenv/dotenv.dart";
import "package:nyxx/nyxx.dart";
import "package:path/path.dart";

void main() async {
  final env = DotEnv(includePlatformEnvironment: true, quiet: true);
  env.load();

  final debug = env.getOrElse("DEBUG", () => "false") == "true";

  final dataDir = Directory(
    normalize(absolute(env.getOrElse("DATA_DIR", () => "/data"))),
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
  );

  await Nyxx.connectGateway(
    env.getOrElse(
      "DISCORD_TOKEN",
      () => throw NoDiscordTokenException("Token not found in ENV variables!"),
    ),
    GatewayIntents.guilds |
        GatewayIntents.guildMembers |
        GatewayIntents.guildMessages |
        GatewayIntents.messageContent,
    options: GatewayClientOptions(
      plugins: [
        cliIntegration,
        commands(settings.guildId),
        SettingsPlugin(settings),
        DatabasePlugin(Database(dataDir)),
        Logging(logLevel: debug ? Level.ALL : Level.INFO),
      ],
    ),
  );
}
