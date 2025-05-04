import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js";

export default {
  global: true,
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Whitelist yourself one the server.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Your Minecraft username.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: "This command has yet to be implement.",
      flags: MessageFlags.Ephemeral
    });
  }
};
