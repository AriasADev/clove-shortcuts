import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { SlashCommand } from '../../types/Command';

// Slash command: /ping
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),

    async execute(interaction: ChatInputCommandInteraction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(
            `🏓 Pong!\n` +
            `Roundtrip latency: ${latency}ms\n` +
            `WebSocket latency: ${apiLatency}ms`
        );
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];