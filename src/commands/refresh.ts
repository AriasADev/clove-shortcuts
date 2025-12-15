import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../types/Command';

const REFRESH_MESSAGE = 'To refresh your client to fix bugs or reload commands, use:\nControl + R on Windows and Linux\nCommand(⌘) + R on Mac\nSwipe clear and reopen on Mobile';


// Slash command: /pk [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Explain how to refresh clients')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ping')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there, ${targetUser}! ${REFRESH_MESSAGE}`);
        } else {
            await interaction.reply(REFRESH_MESSAGE);
        }
    }
};

export const commands = [slashCommand];