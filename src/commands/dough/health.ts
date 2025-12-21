import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder
} from 'discord.js';
import { doughAPI } from '../../utils/doughAPI';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('health')
        .setDescription('Check connection to Doughmination website API'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        try {
            const health = await doughAPI.healthCheck();

            const embed = new EmbedBuilder()
                .setColor(health.authenticated ? 0x00FF00 : 0xFF0000)
                .setTitle('🔗 API Health Check')
                .addFields(
                    { name: 'Status', value: health.status === 'ok' ? '✅ Online' : '❌ Offline', inline: true },
                    { name: 'Authenticated', value: health.authenticated ? '✅ Yes' : '❌ No', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ API Health Check Failed')
                .setDescription(error instanceof Error ? error.message : 'Unknown error occurred')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};