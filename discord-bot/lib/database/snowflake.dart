import "package:drift/drift.dart";
import "package:nyxx/nyxx.dart";

class SnowflakeType implements CustomSqlType<Snowflake> {
  const SnowflakeType();

  @override
  String mapToSqlLiteral(Snowflake dartValue) => dartValue.toString();

  @override
  Object mapToSqlParameter(Snowflake dartValue) => dartValue.toString();

  @override
  Snowflake read(Object fromSql) => Snowflake.parse(fromSql);

  @override
  String sqlTypeName(GenerationContext context) => "TEXT";
}
