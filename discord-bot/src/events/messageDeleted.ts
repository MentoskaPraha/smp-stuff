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
      const regex = new RegExp("https:\/\/modrinth\.com\/project\/[A-Za-z0-9]");
      if (!regex.test(message.content)) return;

      const entry = await bot.getFromDatabase(message.author.id);
      const msgs = JSON.parse(entry.mod_suggestion_msgs_array) as Array<string>;

      const index = msgs.findIndex((val) => val == message.id);
      msgs.splice(index, 1);

      await bot.updateInDatabase(message.author.id, {
        mod_suggestion_msgs_array: JSON.stringify(msgs)
      });

      logger.info(
        `${message.author.displayName}(${message.author.id}) deleted a message(${message.id}) in mod_suggestions(${message.channelId}).`
      );
      return;
    }
  }
};
