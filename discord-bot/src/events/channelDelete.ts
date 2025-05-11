import bot from "@bot";
import logger from "@logger";
import { Events, GuildChannel } from "discord.js";

export default {
  name: Events.ChannelDelete,
  once: false,
  execute(channel: GuildChannel) {
    if (channel.id == bot.settings.gamechatChannelId) {
      bot.settings.gamechatChannelId = null;
      bot.settings.updateConfigFile();
      logger.warn(
        undefined,
        "gamechatChannelId has been reset to default because the channel was deleted!"
      );

      bot.client.users
        .send(
          bot.adminID,
          "gamechatChannelId has been reset to default because the channel was deleted!"
        )
        .catch((error: Error) =>
          logger.error(
            error,
            "Failed to notify admin that gamechatChannelId has been reset to default."
          )
        );
      return;
    }

    if (channel.id == bot.settings.statusChannelId) {
      bot.settings.statusChannelId = null;
      bot.settings.updateConfigFile();
      logger.warn(
        undefined,
        "statusChannelId has been reset to default because the channel was deleted!"
      );

      bot.client.users
        .send(
          bot.adminID,
          "statusChannelId has been reset to default because the channel was deleted!"
        )
        .catch((error: Error) =>
          logger.error(
            error,
            "Failed to notify admin that statusChannelId has been reset to default."
          )
        );
      return;
    }

    if (channel.id == bot.settings.modSuggestionChannelId) {
      bot.settings.modSuggestionChannelId = null;
      bot.settings.modSuggestionsEnabled = false;
      bot.settings.updateConfigFile();
      logger.warn(
        undefined,
        "modSuggestionChannelId and modSuggestionsEnabled have been reset to default because the channel was deleted!"
      );

      bot.client.users
        .send(
          bot.adminID,
          "modSuggestionChannelId and modSuggestionsEnabled have been reset to default because the channel was deleted!"
        )
        .catch((error: Error) =>
          logger.error(
            error,
            "Failed to notify admin that modSuggestionChannelId and modSuggestionsEnabled have been reset to default."
          )
        );
      return;
    }
  }
};
