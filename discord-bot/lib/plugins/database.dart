import "dart:async";
import "package:discord_bot/database/database.dart";
import "package:discord_bot/plugins/settings.dart";
import "package:nyxx/nyxx.dart";

class DatabasePlugin extends NyxxPlugin<NyxxGateway> {
  final Database db;
  final _logger = Logger("Database");

  DatabasePlugin(this.db);

  StreamSubscription<GuildMemberAddEvent>? _onGuildMemberAddedListener;
  StreamSubscription<GuildMemberRemoveEvent>? _onGuildMemberRemovedListener;

  @override
  FutureOr<void> beforeConnect(
    ApiOptions apiOptions,
    ClientOptions clientOptions,
  ) {
    _logger.info("Database is ready!");
  }

  @override
  FutureOr<void> afterConnect(NyxxGateway client) {
    _onGuildMemberAddedListener = client.onGuildMemberAdd.listen(
      _onGuildMemberAdded,
    );
    _onGuildMemberRemovedListener = client.onGuildMemberRemove.listen(
      _onGuildMemberRemoved,
    );
  }

  @override
  FutureOr<void> afterClose() async {
    await _onGuildMemberAddedListener?.cancel();
    await _onGuildMemberRemovedListener?.cancel();
    await db.close();
    _logger.info("Database was closed!");
  }

  void _onGuildMemberAdded(GuildMemberAddEvent event) async {
    if (event.guildId != event.gateway.client.settings.guildId) return;

    final data = await Future.wait([
      db.into(db.users).insert(UsersCompanion.insert(id: event.member.id)),
      event.gateway.client.users.createDm(event.member.id),
    ]);

    final channel = data[1] as DmChannel;
    await channel.sendMessage(
      MessageBuilder(
        embeds: [
          EmbedBuilder(
            color: DiscordColor.fromRgb(0, 255, 0),
            timestamp: DateTime.now(),
            title: "Welcome!",
            description:
                "Please use the `whitelist` command in the server to be whitelisted on all our servers.\nThank you for joining us, we hope you have fun!",
          ),
        ],
      ),
    );
  }

  void _onGuildMemberRemoved(GuildMemberRemoveEvent event) async {
    if (event.guildId != event.gateway.client.settings.guildId) return;

    final data = await Future.wait([
      (db.delete(db.users)..where((u) => u.id.equals(event.user.id))).go(),
      event.gateway.client.users.createDm(event.user.id),
    ]);

    final channel = data[1] as DmChannel;
    await channel.sendMessage(
      MessageBuilder(
        embeds: [
          EmbedBuilder(
            color: DiscordColor.fromRgb(0, 255, 0),
            timestamp: DateTime.now(),
            title: "Goodbye!",
            description:
                "All your data has been removed and you're no longer whitelisted on any of our servers.\nThank you for playing with us and good luck in all your future endevors!",
          ),
        ],
      ),
    );
  }
}

extension DatabaseClientExtension on NyxxGateway {
  Database get database => options.plugins.whereType<DatabasePlugin>().first.db;
}
