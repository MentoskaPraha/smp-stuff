import "package:nyxx_commands/nyxx_commands.dart";

class Utils {
  static bool isGuildCommand(InteractionChatContext context) => context.guild != null;
}
