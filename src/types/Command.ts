import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';

export interface SlashCommand {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface UserContextMenuCommand {
    data: ContextMenuCommandBuilder;
    execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>;
}

export interface MessageContextMenuCommand {
    data: ContextMenuCommandBuilder;
    execute: (interaction: MessageContextMenuCommandInteraction) => Promise<void>;
}

export type Command = SlashCommand | UserContextMenuCommand | MessageContextMenuCommand;