import bot from "@bot";
import logger from "@logger";
import { Events, Message } from "discord.js";

export default {
  name: Events.MessageDelete,
  once: false,
  async execute(message: Message) {
    if (
      message.channelId == bot.settings.modSuggestionChannelId &&
      bot.settings.modSuggestionsEnabled
    ) {
      const msg = await bot.mod_suggestion_msgs_database.findOne({
        where: { id: message.id }
      });

      if (msg != null) {
        await msg.destroy();
        logger.info(
          `Someone deleted a message(${message.id}) ${message.author.displayName}(${message.author.id}) in mod_suggestions(${message.channelId}).`
        );
      }

      return;
    }
  }
};
