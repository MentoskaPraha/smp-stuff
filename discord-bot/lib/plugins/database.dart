import "dart:async";
import "package:discord_bot/database/database.dart";
import "package:nyxx/nyxx.dart";

class DatabasePlugin extends NyxxPlugin<NyxxGateway> {
  final Database db;

  DatabasePlugin(this.db);

  @override
  FutureOr<void> afterClose() {
    return db.close();
  }
}

extension DatabaseClientExtension on NyxxGateway {
  Database get db => options.plugins.whereType<DatabasePlugin>().first.db;
}
