import bot from "@bot";
import logger from "@logger";
import { Events, Message } from "discord.js";

export default {
  name: Events.MessageUpdate,
  once: false,
  async execute(oldMessage: Message, newMessage: Message) {
    if (
      newMessage.channelId == bot.settings.modSuggestionChannelId &&
      bot.settings.modSuggestionsEnabled
    ) {
      if (oldMessage.content == newMessage.content) return;

      const msg = await bot.mod_suggestion_msgs_database.findOne({
        where: { id: newMessage.id }
      });

      if (msg != null) {
        await newMessage.delete();
        logger.info(
          `${newMessage.author.displayName}(${newMessage.author.id}) editted a message(${newMessage.id}) in mod_suggestions(${newMessage.channelId}) and it was deleted.`
        );
      }

      return;
    }
  }
};
