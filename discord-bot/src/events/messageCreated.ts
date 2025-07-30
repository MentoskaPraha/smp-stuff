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
      const regex = new RegExp("https://modrinth.com/project/[A-Za-z0-9]");
      if (!regex.test(message.content)) {
        await message.delete();
        logger.info(
          `${message.author.displayName}(${message.author.id}) sent a message(${message.id}) in mod_suggestions(${message.channelId}) that was invalid and deleted.`
        );
        return;
      }

      const msgs = await bot.mod_suggestion_msgs_database.findAll({
        where: { authorId: message.author.id },
        limit: 5,
        order: [["createdAt", "ASC"]]
      });

      if (msgs.length == 5)
        await message.channel.messages.delete(msgs[0].dataValues.id);

      const duplicate = await bot.createModSuggestionMsg(
        message.id,
        message.content,
        message.author.id
      );
      if (duplicate) {
        await message.delete();
        logger.debug(
          `${message.author.displayName}(${message.author.id}) tried to send a duplicate message in mod_suggestions(${message.channelId}) which was deleted.`
        );
        return;
      }

      await message.react("👍");
      await message.react("👎");

      logger.info(
        `Registered and reacted to a message(${message.id}) in mod_suggestions(${message.channelId}) by ${message.author.displayName}(${message.author.id}).`
      );
      return;
    }
  }
};
