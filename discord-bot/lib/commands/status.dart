import "package:nyxx/nyxx.dart";
import "package:nyxx_commands/nyxx_commands.dart";

final status = ChatCommand(
  "status",
  "Get the bot's status.",
  id("status", (InteractionChatContext context) async {
    //get letancy metrics
    final latency =
        (context.client.httpHandler.latency.inMicroseconds /
                Duration.microsecondsPerMillisecond)
            .toStringAsFixed(3);
    final realLatency =
        (context.client.httpHandler.realLatency.inMicroseconds /
                Duration.microsecondsPerMillisecond)
            .toStringAsFixed(3);
    final gatewayLatency =
        (context.client.httpHandler.realLatency.inMicroseconds /
                Duration.microsecondsPerMillisecond)
            .toStringAsFixed(3);

    //build response embed
    final embed = EmbedBuilder(
      title: "Status",
      color: DiscordColor.fromRgb(255, 165, 0),
      timestamp: DateTime.now(),
      description:
          "🟢 - Discord Connection\n🟢 - Database Connection\n🔴 - Pterodactyl Connection",
      footer: EmbedFooterBuilder(text: "Version: 1.0.0"),
      fields: [
        EmbedFieldBuilder(
          name: "Discord Latency Metrics",
          value:
              "**Latency:** ${latency}ms\n**Real Latency:** ${realLatency}ms\n**Gateway Latency:** ${gatewayLatency}ms",
          isInline: true,
        ),
        EmbedFieldBuilder(
          name: "Game Server Status",
          value: "There are no active game servers.",
          isInline: true,
        ),
      ],
    );

    await context.respond(MessageBuilder(embeds: [embed]));
  }),
  options: CommandOptions(
    autoAcknowledgeInteractions: false,
    defaultResponseLevel: ResponseLevel.public,
    type: CommandType.slashOnly,
  ),
);
