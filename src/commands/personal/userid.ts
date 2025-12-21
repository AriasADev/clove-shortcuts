import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { SlashCommand } from '../../types/Command';

// Slash command: /ping
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('userid')
        .setDescription('Display personal userid'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`1025770042245251122`);
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];