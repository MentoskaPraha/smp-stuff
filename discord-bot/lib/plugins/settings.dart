import "dart:io";
import "package:nyxx/nyxx.dart";

class Settings {
  final Directory dataDir;
  final Snowflake adminId;
  final Snowflake guildId;
  final Snowflake clientId;

  Settings({required this.dataDir, required this.adminId, required this.guildId, required this.clientId});
}

class SettingsPlugin extends NyxxPlugin<NyxxGateway> {
  final Settings settings;

  SettingsPlugin(this.settings);
}

extension SettingsClientExtension on NyxxGateway {
  Settings get settings => options.plugins.whereType<SettingsPlugin>().first.settings;
}
