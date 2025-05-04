import commands from "@commands";
import logger from "@logger";
import { BaseInteraction, Events, MessageFlags } from "discord.js";

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction: BaseInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command = (await commands).get(interaction.commandName);

    if (command == undefined) {
      logger.warn(
        undefined,
        "The user has run a command which does not exist. Curios..."
      );
      await interaction.reply({
        content:
          "The command you ran does not exist, please contact the Server Administrator immediately!",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    command
      .execute(interaction)
      .then(() =>
        logger.info(
          `Executed ${command.data.name} command for ${interaction.user.username}(${interaction.user.id}).`
        )
      )
      .catch((error: Error) => {
        if (interaction.replied) {
          interaction
            .followUp({
              content: `An error has occured during the execution of your command!\n${error.message}`,
              flags: MessageFlags.Ephemeral
            })
            .catch((err: Error) =>
              logger.error(
                err,
                `Failed to notify ${interaction.user.username}(${interaction.user.id}) that ${command.data.name} command had failed!`
              )
            );
          logger.error(
            error,
            `An error occured when ${interaction.user.username}(${interaction.user.id}) ran ${command.data.name} command!`
          );
        } else {
          interaction
            .reply({
              content: `An error has occured during the execution of your command!\n${error.message}`,
              flags: MessageFlags.Ephemeral
            })
            .catch((err: Error) =>
              logger.error(
                err,
                `Failed to notify ${interaction.user.username}(${interaction.user.id}) that ${command.data.name} command had failed!`
              )
            );
          logger.error(
            error,
            `An error occured when ${interaction.user.username}(${interaction.user.id}) ran ${command.data.name} command!`
          );
        }
      });
  }
};
