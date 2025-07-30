import bot from "@bot";
import logger from "@logger";
import { Events, Message } from "discord.js";

export default {
  name: Events.MessageUpdate,
  once: false,
  async execute(_oldMessage: Message, newMessage: Message) {
    if (
      newMessage.channelId == bot.settings.modSuggestionChannelId &&
      bot.settings.modSuggestionsEnabled
    ) {
      await newMessage.delete();
      logger.info(
        `${newMessage.author.displayName}(${newMessage.author.id}) editted a message(${newMessage.id}) in mod_suggestions(${newMessage.channelId}) and it was deleted.`
      );
      return;
    }
  }
};
