import bot from "@bot";
import logger from "@logger";
import {
  ChannelType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Change the bot's settings.")
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status_channel")
        .setDescription("The channel where the bot posts the server status.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel that will be used.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("gamechat_channel")
        .setDescription(
          "The channel that will be linked with the in-game chat."
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel that will be used.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.user.id != bot.adminID) {
      await interaction.reply({
        content: "You do not have permission to run this command!",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    switch (interaction.options.getSubcommand()) {
      case "status_channel": {
        const channel = interaction.options.getChannel("channel", true);

        bot.settings.statusChannelId = channel.id;
        bot.settings.updateConfigFile();

        logger.info(`statusChannelId has been updated to ${channel.id}!`);

        await interaction.reply({
          content: "The status channel has been updated!",
          flags: MessageFlags.Ephemeral
        });

        break;
      }
      case "gamechat_channel": {
        const channel = interaction.options.getChannel<ChannelType.GuildText>(
          "channel",
          true
        );

        await channel.permissionOverwrites.create(bot.guildID, {
          SendMessagesInThreads: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
          EmbedLinks: false,
          AttachFiles: false,
          AddReactions: false,
          UseExternalEmojis: false,
          SendTTSMessages: false,
          SendVoiceMessages: false,
          SendPolls: false,
          UseApplicationCommands: false,
          UseEmbeddedActivities: false,
          UseExternalApps: false
        });

        bot.settings.gamechatChannelId = channel.id;
        bot.settings.updateConfigFile();

        logger.info(`gamechatChannelId has been updated to ${channel.id}!`);

        await interaction.reply({
          content: "The gamechat channel has been updated!",
          flags: MessageFlags.Ephemeral
        });

        break;
      }
    }
  }
};
