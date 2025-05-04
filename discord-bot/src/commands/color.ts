import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js";

export default {
  global: false,
  data: new SlashCommandBuilder()
    .setName("color")
    .setDescription("Change the color of your name.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("See what your colors currently are.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Resets your colors back to default.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("match")
        .setDescription("SMatches your Discord color  to your Minecraft color.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("change_discord")
        .setDescription("Change your color on Discord.")
        .addStringOption((option) =>
          option
            .setName("hex_code")
            .setDescription("The hex-code of your color. Example: #3063dd")
            .setRequired(true)
            .setMinLength(7)
            .setMaxLength(7)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("change_minecraft")
        .setDescription("Change your color on the Minecraft Server.")
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("The color that you want to have.")
            .setRequired(true)
            .addChoices(
              { name: "Dark Blue", value: "dark_blue" },
              { name: "Dark Green", value: "dark_green" },
              { name: "Dark Aqua", value: "dark_aqua" },
              { name: "Dark Red", value: "dark_red" },
              { name: "Dark Purple", value: "dark_purple" },
              { name: "Gold", value: "gold" },
              { name: "Blue", value: "blue" },
              { name: "Green", value: "green" },
              { name: "Aqua", value: "aqua" },
              { name: "Red", value: "red" },
              { name: "Light Purple", value: "light_purple" },
              { name: "Yellow", value: "yellow" },
              { name: "White", value: "white" }
            )
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: "This command has yet to be implement.",
      flags: MessageFlags.Ephemeral
    });
  }
};
