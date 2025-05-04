import logger from "@logger";
import { Events } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute() {
    logger.info("Discord Client is ready!");
  }
};
