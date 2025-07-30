import bot from "@bot";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
  ColorResolvable,
  GuildMemberRoleManager
} from "discord.js";

const MC_COLOR_TO_HEX = new Map<string, string>([
  ["dark_blue", "0000AA	"],
  ["dark_green", "00AA00"],
  ["dark_aqua", "00AAAA"],
  ["dark_red", "AA0000"],
  ["dark_purple", "AA00AA"],
  ["gold", "FFAA00"],
  ["blue", "5555FF"],
  ["green", "55FF55"],
  ["aqua", "55FFFF"],
  ["red", "FF5555"],
  ["light_purple", "FF55FF"],
  ["yellow", "FFFF55"],
  ["white", "FFFFFF"]
]);

const MC_COLOR_TO_STRING = new Map<string, string>([
  ["dark_blue", "Dark Blue"],
  ["dark_green", "Dark Green"],
  ["dark_aqua", "Dark Aqua"],
  ["dark_red", "Dark Red"],
  ["dark_purple", "Dark Purple"],
  ["gold", "Gold"],
  ["blue", "Blue"],
  ["green", "Green"],
  ["aqua", "Aqua"],
  ["red", "Red"],
  ["light_purple", "Light Purple"],
  ["yellow", "Yellow"],
  ["white", "White"]
]);

export default {
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
        .setDescription("Matches your Discord color to your Minecraft color.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("change_discord")
        .setDescription("Change your color on Discord.")
        .addStringOption((option) =>
          option
            .setName("hex_code")
            .setDescription(
              "The hex-code of your color without the leading #. Example: 3063dd"
            )
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(6)
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
    switch (interaction.options.getSubcommand()) {
      case "view": {
        const embed = new EmbedBuilder().setTitle("Your Colors");

        const entry = await bot.getFromDatabase(interaction.user.id);

        if (entry.discord_color != null) {
          embed.setColor(entry.discord_color as ColorResolvable);
          embed.addFields({
            name: "Discord Color",
            value: `#${entry.discord_color}`
          });
        } else {
          embed.addFields({
            name: "Discord Color",
            value: "No color found :("
          });
          embed.setColor(
            (MC_COLOR_TO_HEX.get(entry.minecraft_color) ??
              "White") as ColorResolvable
          );
        }

        embed.addFields({
          name: "Minecraft Color",
          value: MC_COLOR_TO_STRING.get(entry.minecraft_color) ?? "White"
        });

        await interaction.reply({ embeds: [embed] });
        break;
      }
      case "reset": {
        const entry = await bot.getFromDatabase(interaction.user.id);

        if (entry.discord_color_role_id != null) {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });

          await (
            await bot.client.guilds.fetch(bot.guildID)
          ).roles.delete(entry.discord_color_role_id);
        }

        await bot.updateInDatabase(interaction.user.id, {
          minecraft_color: "white",
          discord_color: null,
          discord_color_role_id: null
        });

        await interaction.editReply({
          content: "Your colors have been reset!"
        });

        break;
      }
      case "match": {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const entry = await bot.getFromDatabase(interaction.user.id);
        const newColor = MC_COLOR_TO_HEX.get(entry.minecraft_color) ?? "White";

        const guild = await bot.client.guilds.fetch(bot.guildID);
        if (entry.discord_color_role_id != null) {
          const role = await guild.roles.fetch(entry.discord_color_role_id);
          if (role == null) {
            const newRole = await guild.roles.create({
              name: `Color: ${interaction.user.username}`,
              color: newColor as ColorResolvable,
              mentionable: false,
              position: interaction.guild?.members.me?.roles.highest.position,
              permissions: [],
              reason: `${interaction.user.username} updated their color, but their color role stopped existing, so it was re-created.`
            });

            await (interaction.member?.roles as GuildMemberRoleManager).add(
              newRole
            );

            await bot.updateInDatabase(interaction.user.id, {
              discord_color: newColor,
              discord_color_role_id: newRole.id
            });
          } else {
            await role.setColor(
              newColor as ColorResolvable,
              `${interaction.user.username} updated their color.`
            );

            await bot.updateInDatabase(interaction.user.id, {
              discord_color: newColor
            });
          }
        } else {
          const newRole = await guild.roles.create({
            name: `Color: ${interaction.user.username}`,
            color: newColor as ColorResolvable,
            mentionable: false,
            position: interaction.guild?.members.me?.roles.highest.position,
            permissions: [],
            reason: `${interaction.user.username} updated their color, but their color role didn't exist, so it was created.`
          });

          await (interaction.member?.roles as GuildMemberRoleManager).add(
            newRole
          );

          await bot.updateInDatabase(interaction.user.id, {
            discord_color: newColor,
            discord_color_role_id: newRole.id
          });
        }

        await interaction.editReply({
          content:
            "Your Discord color has been updated to match your Minecraft color!"
        });

        break;
      }
      case "change_discord": {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const newColor = interaction.options.getString("hex_code", true);
        const entry = await bot.getFromDatabase(interaction.user.id);

        const guild = await bot.client.guilds.fetch(bot.guildID);
        if (entry.discord_color_role_id != null) {
          const role = await guild.roles.fetch(entry.discord_color_role_id);
          if (role == null) {
            const newRole = await guild.roles.create({
              name: `Color: ${interaction.user.username}`,
              color: newColor as ColorResolvable,
              mentionable: false,
              position: interaction.guild?.members.me?.roles.highest.position,
              permissions: [],
              reason: `${interaction.user.username} updated their color, but their color role stopped existing, so it was re-created.`
            });

            await (interaction.member?.roles as GuildMemberRoleManager).add(
              newRole
            );

            await bot.updateInDatabase(interaction.user.id, {
              discord_color: newColor,
              discord_color_role_id: newRole.id
            });
          } else {
            await role.setColor(
              newColor as ColorResolvable,
              `${interaction.user.username} updated their color.`
            );

            await bot.updateInDatabase(interaction.user.id, {
              discord_color: newColor
            });
          }
        } else {
          const newRole = await guild.roles.create({
            name: `Color: ${interaction.user.username}`,
            color: newColor as ColorResolvable,
            mentionable: false,
            position: interaction.guild?.members.me?.roles.highest.position,
            permissions: [],
            reason: `${interaction.user.username} updated their color, but their color role didn't exist, so it was created.`
          });

          await (interaction.member?.roles as GuildMemberRoleManager).add(
            newRole
          );

          await bot.updateInDatabase(interaction.user.id, {
            discord_color: newColor,
            discord_color_role_id: newRole.id
          });
        }

        await interaction.editReply({
          content: "Your Discord color has been updated!"
        });

        break;
      }
      case "change_minecraft": {
        await bot.updateInDatabase(interaction.user.id, {
          minecraft_color: interaction.options.getString("color", true)
        });

        await interaction.reply({
          content: "Your Minecraft color has been updated!",
          flags: MessageFlags.Ephemeral
        });

        break;
      }
    }
  }
};
