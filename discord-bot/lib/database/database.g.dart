// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $UsersTable extends Users with TableInfo<$UsersTable, User> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $UsersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _discordIdMeta =
      const VerificationMeta('discordId');
  @override
  late final GeneratedColumn<Snowflake> discordId = GeneratedColumn<Snowflake>(
      'discord_id', aliasedName, false,
      type: const SnowflakeType(), requiredDuringInsert: true);
  static const VerificationMeta _minecraftUsernameMeta =
      const VerificationMeta('minecraftUsername');
  @override
  late final GeneratedColumn<String> minecraftUsername =
      GeneratedColumn<String>('minecraft_username', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      clientDefault: () => DateTime.now());
  static const VerificationMeta _lastModifiedMeta =
      const VerificationMeta('lastModified');
  @override
  late final GeneratedColumn<DateTime> lastModified = GeneratedColumn<DateTime>(
      'last_modified', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      clientDefault: () => DateTime.now());
  @override
  List<GeneratedColumn> get $columns =>
      [discordId, minecraftUsername, createdAt, lastModified];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'users';
  @override
  VerificationContext validateIntegrity(Insertable<User> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('discord_id')) {
      context.handle(_discordIdMeta,
          discordId.isAcceptableOrUnknown(data['discord_id']!, _discordIdMeta));
    } else if (isInserting) {
      context.missing(_discordIdMeta);
    }
    if (data.containsKey('minecraft_username')) {
      context.handle(
          _minecraftUsernameMeta,
          minecraftUsername.isAcceptableOrUnknown(
              data['minecraft_username']!, _minecraftUsernameMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('last_modified')) {
      context.handle(
          _lastModifiedMeta,
          lastModified.isAcceptableOrUnknown(
              data['last_modified']!, _lastModifiedMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {discordId};
  @override
  User map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return User(
      discordId: attachedDatabase.typeMapping
          .read(const SnowflakeType(), data['${effectivePrefix}discord_id'])!,
      minecraftUsername: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}minecraft_username']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      lastModified: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_modified'])!,
    );
  }

  @override
  $UsersTable createAlias(String alias) {
    return $UsersTable(attachedDatabase, alias);
  }
}

class User extends DataClass implements Insertable<User> {
  final Snowflake discordId;
  final String? minecraftUsername;
  final DateTime createdAt;
  final DateTime lastModified;
  const User(
      {required this.discordId,
      this.minecraftUsername,
      required this.createdAt,
      required this.lastModified});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['discord_id'] = Variable<Snowflake>(discordId, const SnowflakeType());
    if (!nullToAbsent || minecraftUsername != null) {
      map['minecraft_username'] = Variable<String>(minecraftUsername);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['last_modified'] = Variable<DateTime>(lastModified);
    return map;
  }

  UsersCompanion toCompanion(bool nullToAbsent) {
    return UsersCompanion(
      discordId: Value(discordId),
      minecraftUsername: minecraftUsername == null && nullToAbsent
          ? const Value.absent()
          : Value(minecraftUsername),
      createdAt: Value(createdAt),
      lastModified: Value(lastModified),
    );
  }

  factory User.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return User(
      discordId: serializer.fromJson<Snowflake>(json['discordId']),
      minecraftUsername:
          serializer.fromJson<String?>(json['minecraftUsername']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      lastModified: serializer.fromJson<DateTime>(json['lastModified']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'discordId': serializer.toJson<Snowflake>(discordId),
      'minecraftUsername': serializer.toJson<String?>(minecraftUsername),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'lastModified': serializer.toJson<DateTime>(lastModified),
    };
  }

  User copyWith(
          {Snowflake? discordId,
          Value<String?> minecraftUsername = const Value.absent(),
          DateTime? createdAt,
          DateTime? lastModified}) =>
      User(
        discordId: discordId ?? this.discordId,
        minecraftUsername: minecraftUsername.present
            ? minecraftUsername.value
            : this.minecraftUsername,
        createdAt: createdAt ?? this.createdAt,
        lastModified: lastModified ?? this.lastModified,
      );
  @override
  String toString() {
    return (StringBuffer('User(')
          ..write('discordId: $discordId, ')
          ..write('minecraftUsername: $minecraftUsername, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastModified: $lastModified')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(discordId, minecraftUsername, createdAt, lastModified);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is User &&
          other.discordId == this.discordId &&
          other.minecraftUsername == this.minecraftUsername &&
          other.createdAt == this.createdAt &&
          other.lastModified == this.lastModified);
}

class UsersCompanion extends UpdateCompanion<User> {
  final Value<Snowflake> discordId;
  final Value<String?> minecraftUsername;
  final Value<DateTime> createdAt;
  final Value<DateTime> lastModified;
  final Value<int> rowid;
  const UsersCompanion({
    this.discordId = const Value.absent(),
    this.minecraftUsername = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastModified = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  UsersCompanion.insert({
    required Snowflake discordId,
    this.minecraftUsername = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.lastModified = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : discordId = Value(discordId);
  static Insertable<User> custom({
    Expression<Snowflake>? discordId,
    Expression<String>? minecraftUsername,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? lastModified,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (discordId != null) 'discord_id': discordId,
      if (minecraftUsername != null) 'minecraft_username': minecraftUsername,
      if (createdAt != null) 'created_at': createdAt,
      if (lastModified != null) 'last_modified': lastModified,
      if (rowid != null) 'rowid': rowid,
    });
  }

  UsersCompanion copyWith(
      {Value<Snowflake>? discordId,
      Value<String?>? minecraftUsername,
      Value<DateTime>? createdAt,
      Value<DateTime>? lastModified,
      Value<int>? rowid}) {
    return UsersCompanion(
      discordId: discordId ?? this.discordId,
      minecraftUsername: minecraftUsername ?? this.minecraftUsername,
      createdAt: createdAt ?? this.createdAt,
      lastModified: lastModified ?? this.lastModified,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (discordId.present) {
      map['discord_id'] =
          Variable<Snowflake>(discordId.value, const SnowflakeType());
    }
    if (minecraftUsername.present) {
      map['minecraft_username'] = Variable<String>(minecraftUsername.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (lastModified.present) {
      map['last_modified'] = Variable<DateTime>(lastModified.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('UsersCompanion(')
          ..write('discordId: $discordId, ')
          ..write('minecraftUsername: $minecraftUsername, ')
          ..write('createdAt: $createdAt, ')
          ..write('lastModified: $lastModified, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$Database extends GeneratedDatabase {
  _$Database(QueryExecutor e) : super(e);
  late final $UsersTable users = $UsersTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [users];
  @override
  DriftDatabaseOptions get options =>
      const DriftDatabaseOptions(storeDateTimeAsText: true);
}
