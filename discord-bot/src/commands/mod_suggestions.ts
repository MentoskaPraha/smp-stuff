import bot from "@bot";
import logger from "@logger";
import {
  ChannelType,
  ChatInputCommandInteraction,
  InteractionContextType,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mod_suggestions")
    .setDescription("Commands pertaining to mod suggestions.")
    .setContexts(InteractionContextType.Guild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channel")
        .setDescription("Set the channel used to mod suggestions.")
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
        .setName("lock")
        .setDescription("Whether or not mod suggestions are being taken.")
        .addBooleanOption((option) =>
          option
            .setName("state")
            .setDescription("The state of the lock.")
            .setRequired(true)
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
      case "channel": {
        const channel = interaction.options.getChannel<ChannelType.GuildText>(
          "channel",
          true
        );

        await channel.permissionOverwrites.create(bot.guildID, {
          SendMessages: false,
          SendMessagesInThreads: false,
          CreatePublicThreads: false,
          CreatePrivateThreads: false,
          EmbedLinks: true,
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

        bot.settings.modSuggestionChannelId = channel.id;
        bot.settings.updateConfigFile();

        logger.info(
          `modSuggestionChannelId has been updated to ${channel.id}!`
        );

        await interaction.reply({
          content: "The mod suggestion channel has been updated!",
          flags: MessageFlags.Ephemeral
        });

        break;
      }
      case "lock": {
        if (bot.settings.modSuggestionChannelId == null) {
          await interaction.reply({
            content: `The mod suggestion channel is not set!\nPlease set it before making changes to the mod suggestion lock.`,
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        const state = interaction.options.getBoolean("state", true);

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel =
          (await interaction.guild?.channels.fetch(
            bot.settings.modSuggestionChannelId
          )) ?? null;

        if (channel == null) {
          bot.settings.modSuggestionChannelId = null;
          bot.settings.modSuggestionsEnabled = false;
          bot.settings.updateConfigFile();
          logger.warn(
            undefined,
            "modSuggestionChannelId and modSuggestionsEnabled have been reset to default because the channel doesn't exist anymore!"
          );
          await interaction.reply({
            content:
              "modSuggestionChannelId and modSuggestionsEnabled have been reset to default because the channel doesn't exist anymore!\nPlease set the modSuggestionChannelId and try again.",
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        await channel.edit({
          permissionOverwrites: [
            {
              id: bot.guildID,
              allow: state
                ? [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.SendMessagesInThreads,
                    PermissionsBitField.Flags.CreatePublicThreads
                  ]
                : undefined,
              deny: !state
                ? [
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.SendMessagesInThreads,
                    PermissionsBitField.Flags.CreatePublicThreads
                  ]
                : undefined
            }
          ]
        });

        bot.settings.modSuggestionsEnabled = state;
        bot.settings.updateConfigFile();

        logger.info(`modSuggestionsEnabled has been updated to ${state}!`);

        await interaction.reply({
          content: `The mod suggestion state has been updated!\nUsers ${state ? "now can" : "can no longer"} submit mod suggestions.`,
          flags: MessageFlags.Ephemeral
        });

        break;
      }
    }
  }
};
