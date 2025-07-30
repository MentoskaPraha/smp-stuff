import bot from "@bot";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js";

export default {
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
    const username = interaction.options.getString("username", true);

    await bot.updateUserInDatabase(interaction.user.id, {
      minecraft_username: username
    });

    await interaction.reply({
      content:
        "Your Minecraft username has been recorded and you have been whitelisted!",
      flags: MessageFlags.Ephemeral
    });
  }
};
