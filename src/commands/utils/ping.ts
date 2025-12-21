import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    MessageFlags
} from 'discord.js';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const start = Date.now();
        const apiLatency = Math.round(interaction.client.ws.ping);
        const latency = Date.now() - start;

        await interaction.editReply(
            `🏓 Pong!\n` +
            `Roundtrip latency: ${latency}ms\n` +
            `WebSocket latency: ${apiLatency}ms`
        );
    }
};