import "package:nyxx/nyxx.dart";

class Utils {
  /**
   * Returns a basic success message. An optional [description] can
   * be provided for additional context.
   */
  static MessageBuilder successMessage([String? description]) => MessageBuilder(
    embeds: [
      EmbedBuilder(
        title: "✅ Success",
        color: DiscordColor.fromRgb(0, 255, 0),
        timestamp: DateTime.now(),
        description: description,
      ),
    ],
  );

  /**
   * Returns a basic failure message. An optional [description] can
   * be provided for additional context.
   */
  static MessageBuilder failureMessage([String? description]) => MessageBuilder(
    embeds: [
      EmbedBuilder(
        title: "❌ Failure",
        color: DiscordColor.fromRgb(255, 0, 0),
        timestamp: DateTime.now(),
        description: description,
      ),
    ],
  );
}
