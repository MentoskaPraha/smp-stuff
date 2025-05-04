import {
  ChatInputCommandInteraction,
  ClientEvents,
  SlashCommandBuilder
} from "discord.js";
import { Optional } from "sequelize";

export interface ConfigFileDate {
  announcementChannelId: string | null;
  modSuggestionChannelId: string | null;
  modSuggestionsEnabled: boolean;
}

export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once: boolean;
  execute(...args: ClientEvents[K]): Promise<void>;
}

export interface BotCommand {
  global: boolean;
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface DatabaseEntry {
  id: string;
  minecraft_username: string;
  discord_color: string;
  discord_color_role_id: string;
  mod_suggestions_number: number;
  mod_suggestion_msg_1: string;
  mod_suggestion_msg_2: string;
  mod_suggestion_msg_3: string;
  mod_suggestion_msg_4: string;
  mod_suggestion_msg_5: string;
}

export type DatabaseEntryCreation = Optional<DatabaseEntry, "id">;
