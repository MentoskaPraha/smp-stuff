import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

export default {
  global: true,
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Get the current system status."),
  async execute(interaction: ChatInputCommandInteraction) {
    const statusEmbed = new EmbedBuilder()
      .setTitle("Status")
      .setColor("Orange")
      .setTimestamp()
      .setDescription(`🟢 - Discord Connection\n🔴 - MC Server Connection`)
      .addFields(
        {
          name: "Discord Connection Ping",
          value: `${interaction.client.ws.ping}ms`
        },
        { name: "MC Server Ping", value: "MC Server is down" }
      );

    await interaction.reply({
      embeds: [statusEmbed]
    });
  }
};
