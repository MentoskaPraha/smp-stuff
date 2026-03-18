import "package:discord_bot/database/database.dart";
import "package:discord_bot/plugins/database.dart";
import "package:discord_bot/plugins/settings.dart";
import "package:discord_bot/utils.dart";
import "package:drift/drift.dart";
import "package:nyxx/nyxx.dart" hide User;
import "package:nyxx_commands/nyxx_commands.dart";

ChatCommand sync(Snowflake userId) => ChatCommand(
  "sync",
  "Syncs data from the bot with all platforms. Should be run before first use or after a config change.",
  id("sync", (InteractionChatContext context) async {
    final db = context.client.database;
    final guild = context.client.guilds[context.client.settings.guildId];
    final membersAndUsers = await Future.wait([
      guild.members.list(),
      db.select(db.users).get(),
    ]);

    final members = membersAndUsers[0] as List<Member>;
    final memberIds = members.map((m) => m.id).toSet();

    final users = membersAndUsers[1] as List<User>;
    final userIds = users.map((u) => u.discordId).toSet();

    final addIds = memberIds.where((id) => !userIds.contains(id));
    final removeIds = userIds.where((id) => !memberIds.contains(id));

    await db.transaction(() async {
      await Future.wait(
        addIds.map(
          (id) => db
              .into(db.users)
              .insert(
                UsersCompanion.insert(discordId: id),
                mode: InsertMode.insertOrIgnore,
                onConflict: DoNothing(),
              ),
        ),
      );
      await (db.delete(
        db.users,
      )..where((u) => u.discordId.isIn(removeIds))).go();
    });

    await context.respond(Utils.successMessage());
  }),
  options: CommandOptions(
    autoAcknowledgeInteractions: true,
    defaultResponseLevel: ResponseLevel.private,
    type: CommandType.slashOnly,
  ),
  checks: [UserCheck.id(userId)],
);
