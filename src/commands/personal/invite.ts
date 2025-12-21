import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { SlashCommand } from '../../types/Command';

// Slash command: /ping
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Display personal server invite link'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`https://discord.gg/k8HrBvDaQn`);
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];