import "dart:io";
import "package:discord_bot/database/snowflake.dart";
import "package:drift/drift.dart";
import "package:drift/native.dart";
import "package:nyxx/nyxx.dart";
import "package:path/path.dart";

part "database.g.dart";

class Users extends Table {
  @override
  Set<Column> get primaryKey => {discordId};

  Column<Snowflake> get discordId => customType(const SnowflakeType())();
  TextColumn get minecraftUsername => text().nullable()();
  DateTimeColumn get createdAt => dateTime().clientDefault(() => DateTime.now())();
  DateTimeColumn get lastModified => dateTime().clientDefault(() => DateTime.now())();
}

class Servers extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().nullable()();
  BoolColumn get online => boolean().withDefault(const Constant(false))();
  DateTimeColumn get createdAt => dateTime().clientDefault(() => DateTime.now())();
  DateTimeColumn get lastModified => dateTime().clientDefault(() => DateTime.now())();
}

@DriftDatabase(tables: [Users])
class Database extends _$Database {
  /**
   * Create a new database instance. Must provide QueryExecutor
   * or a data directory!
   */
  Database([Directory? dataDir, QueryExecutor? executor])
    : super(executor ?? _openConnection(dataDir!));

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection(Directory dataDir) {
    return NativeDatabase.createInBackground(
      File(join(dataDir.path, "database.sqlite")),
      setup: (database) {
        database.execute("pragma journal_mode = WAL;");
      },
      readPool: 2,
    );
  }
}
