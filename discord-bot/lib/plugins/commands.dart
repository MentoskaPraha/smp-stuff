import "package:discord_bot/commands/status.dart";
import "package:discord_bot/commands/sync.dart";
import "package:discord_bot/commands/whitelist.dart";
import "package:nyxx/nyxx.dart";
import "package:nyxx_commands/nyxx_commands.dart";

CommandsPlugin commands(Snowflake userId, Snowflake guildId) =>
    CommandsPlugin(
        prefix: null,
        guild: guildId, //TODO Remove to make commands global.
        options: CommandsOptions(
          logErrors: true,
          inferDefaultCommandType: true,
          autoAcknowledgeInteractions: false,
          type: CommandType.slashOnly,
        ),
      )
      ..addCommand(status)
      ..addCommand(whitelist(guildId))
      ..addCommand(sync(userId));
