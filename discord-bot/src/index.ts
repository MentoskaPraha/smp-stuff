import Bot from "@bot";
import logger from "@logger";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

//ensure the data directory exists
const dataDir = join(import.meta.dirname.split("/src")[0], "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

//setup the bot
logger.info("Starting bot...");

await Bot.setupDatabase();

await Bot.registerEvents();

await Bot.registerCmd();

Bot.login();

//ensure that the bot shuts-down gracefully
const shutdown = async () => {
  logger.info("Recieved shutdown signal!");

  await Bot.logout();
  logger.info("Shutdown Complete!");

  logger.destroy();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
