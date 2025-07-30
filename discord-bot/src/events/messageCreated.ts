import bot from "@bot";
import logger from "@logger";
import { Events, Message } from "discord.js";

export default {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message) {
    if (
      message.channelId == bot.settings.modSuggestionChannelId &&
      bot.settings.modSuggestionsEnabled
    ) {
      const regex = new RegExp("https:\/\/modrinth\.com\/project\/[A-Za-z0-9]");
      if (!regex.test(message.content)) {
        await message.delete();
        logger.info(
          `${message.author.displayName}(${message.author.id}) sent a message(${message.id}) in mod_suggestions(${message.channelId}) that was invalid and deleted.`
        );
        return;
      }

      const entry = await bot.getFromDatabase(message.author.id);
      const msgs = JSON.parse(entry.mod_suggestion_msgs_array);

      if (msgs.length == 5) {
        await (await message.channel.messages.fetch(msgs[0])).delete();
        msgs.shift();
        await message.react("👍");
        await message.react("👎");
        msgs.push(message.id);
      } else {
        await message.react("👍");
        await message.react("👎");
        msgs.push(message.id);
      }

      await bot.updateInDatabase(message.author.id, {
        mod_suggestion_msgs_array: JSON.stringify(msgs)
      });

      logger.info(
        `Registered and reacted to a message(${message.id}) in mod_suggestions(${message.channelId}) by ${message.author.displayName}(${message.author.id}).`
      );
      return;
    }
  }
};
