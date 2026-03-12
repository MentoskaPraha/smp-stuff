import "dart:async";
import "package:discord_bot/database/database.dart";
import "package:nyxx/nyxx.dart";

class DatabasePlugin extends NyxxPlugin<NyxxGateway> {
  final Database db;
  final _logger = Logger("Database");

  DatabasePlugin(this.db);

  @override
  FutureOr<void> beforeConnect(
    ApiOptions apiOptions,
    ClientOptions clientOptions,
  ) {
    _logger.info("Database is ready!");
  }

  @override
  FutureOr<void> afterClose() {
    return db.close().then((_) => _logger.info("Database was closed!"));
  }
}

extension DatabaseClientExtension on NyxxGateway {
  Database get db => options.plugins.whereType<DatabasePlugin>().first.db;
}
