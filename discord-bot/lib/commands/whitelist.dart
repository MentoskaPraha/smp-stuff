import "package:discord_bot/database/database.dart";
import "package:discord_bot/plugins/database.dart";
import "package:discord_bot/utils.dart";
import "package:drift/drift.dart";
import "package:nyxx/nyxx.dart";
import "package:nyxx_commands/nyxx_commands.dart";

ChatGroup whitelist(Snowflake guildId) => ChatGroup(
  "whitelist",
  "Add yourself to the whitelist for all our Minecraft servers.",
  children: [
    ChatCommand(
      "set",
      "Set the Minecraft username that will be used to whitelist you.",
      id("whitelist-set", (
        InteractionChatContext context,
        @Description("Your Minecraft username.") String username,
      ) async {
        final db = context.client.database;

        await (db.update(db.users)
              ..where((u) => u.id.equals(context.user.id)))
            .write(UsersCompanion(minecraftUsername: Value(username)));

        //TODO Sync the whitelist with servers that are online.

        await context.respond(
          Utils.successMessage(
            "$username is now the username used to whitelist you on our Minecraft servers!",
          ),
        );
      }),
    ),
    ChatCommand(
      "get",
      "Returns the Minecraft username that's used to whitelist you.",
      id("whitelist-get", (InteractionChatContext context) async {
        final db = context.client.database;
        final user =
            await ((db.select(db.users)
                  ..where((u) => u.id.equals(context.user.id)))
                .getSingleOrNull());

        if (user?.minecraftUsername == null) {
          await context.respond(
            Utils.failureMessage(
              "You do not have a Minecraft username on file!",
            ),
          );
        } else {
          await context.respond(
            Utils.successMessage("${user!.minecraftUsername}"),
          );
        }
      }),
    ),
  ],
  options: CommandOptions(
    autoAcknowledgeInteractions: true,
    defaultResponseLevel: ResponseLevel.private,
    type: CommandType.slashOnly,
  ),
  checks: [GuildCheck.id(guildId)],
);
