import { readdirSync } from "node:fs";
import { BotEvent } from "@types";
import { Collection } from "discord.js";
import { join } from "node:path";

export default (async () => {
  const events = new Collection<string, BotEvent>();

  const files = readdirSync(import.meta.dirname, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts")) &&
        !entry.name.startsWith("_")
    )
    .map((entry) => join(import.meta.dirname, entry.name));

  await Promise.all(
    files.map(async (file) => {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const event = (await import(file)).default as BotEvent;
      events.set(event.name, event);
    })
  );

  return events;
})();
