import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    ComponentType
} from 'discord.js';
import { doughAPI } from '../../utils/doughAPI';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('lockout')
        .setDescription('🚨 EMERGENCY: Regenerate bot token (terminates current token)'),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Create confirmation buttons
            const confirmButton = new ButtonBuilder()
                .setCustomId('lockout_confirm')
                .setLabel('⚠️ Yes, Regenerate Token')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('lockout_cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(cancelButton, confirmButton);

            const warningEmbed = new EmbedBuilder()
                .setColor(0xED4245) // Red
                .setTitle('🚨 Emergency Token Lockout')
                .setDescription(
                    '**⚠️ WARNING: This will immediately terminate the current bot token!**\n\n' +
                    '**What happens:**\n' +
                    '• Current bot token becomes invalid immediately\n' +
                    '• New token is generated\n' +
                    '• Bot will stop working until you update the token\n' +
                    '• You will receive the new token in this message\n\n' +
                    '**Use this only if:**\n' +
                    '• Token has been compromised/leaked\n' +
                    '• Unauthorized access detected\n' +
                    '• Emergency security lockout needed\n\n' +
                    '**Are you sure you want to proceed?**'
                )
                .setFooter({ text: 'This action cannot be undone. Choose carefully.' })
                .setTimestamp();

            const response = await interaction.editReply({
                embeds: [warningEmbed],
                components: [row]
            });

            // Create button collector
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 30_000 // 30 seconds to decide
            });

            collector.on('collect', async (i: ButtonInteraction) => {
                // Only allow the original user to use the buttons
                if (i.user.id !== interaction.user.id) {
                    await i.reply({
                        content: 'This confirmation is not for you!',
                        ephemeral: true
                    });
                    return;
                }

                if (i.customId === 'lockout_cancel') {
                    const cancelEmbed = new EmbedBuilder()
                        .setColor(0x5865F2) // Blue
                        .setTitle('✅ Lockout Cancelled')
                        .setDescription('Token regeneration has been cancelled. Current token remains active.')
                        .setTimestamp();

                    await i.update({
                        embeds: [cancelEmbed],
                        components: []
                    });

                    collector.stop();
                    return;
                }

                if (i.customId === 'lockout_confirm') {
                    // Show processing message
                    const processingEmbed = new EmbedBuilder()
                        .setColor(0xFEE75C) // Yellow
                        .setTitle('🔄 Regenerating Token...')
                        .setDescription('Please wait while the bot token is regenerated...')
                        .setTimestamp();

                    await i.update({
                        embeds: [processingEmbed],
                        components: []
                    });

                    try {
                        // Regenerate the token
                        const result = await doughAPI.regenerateToken();

                        if (result.success) {
                            const successEmbed = new EmbedBuilder()
                                .setColor(0x57F287) // Green
                                .setTitle('✅ Token Regenerated Successfully')
                                .setDescription(
                                    '**🔒 Old token has been terminated immediately.**\n\n' +
                                    '**New Bot Token:**\n' +
                                    `\`\`\`\n${result.new_token}\n\`\`\`\n\n` +
                                    '**⚠️ IMPORTANT - Update Immediately:**\n\n' +
                                    '**1. Update Bot `.env` file:**\n' +
                                    '```bash\n' +
                                    `DOUGH_API_TOKEN=${result.new_token}\n` +
                                    '```\n\n' +
                                    '**2. Restart the bot:**\n' +
                                    '```bash\n' +
                                    'npm start\n' +
                                    '# Or with Docker:\n' +
                                    'docker compose restart\n' +
                                    '```\n\n' +
                                    '**3. Delete this message after copying the token!**\n\n' +
                                    '⚠️ The bot will stop working in a few seconds until you update the token.'
                                )
                                .setFooter({ text: 'Save this token immediately!' })
                                .setTimestamp();

                            await interaction.editReply({
                                embeds: [successEmbed],
                                components: []
                            });
                        } else {
                            throw new Error(result.message || 'Unknown error occurred');
                        }
                    } catch (error) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(0xED4245) // Red
                            .setTitle('❌ Token Regeneration Failed')
                            .setDescription(
                                `Failed to regenerate token: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                                'Current token remains active. Please try again or check backend logs.'
                            )
                            .setTimestamp();

                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        });
                    }

                    collector.stop();
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    // Timeout - user didn't choose
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(0xFEE75C) // Yellow
                        .setTitle('⏱️ Confirmation Timed Out')
                        .setDescription(
                            'Token regeneration was not confirmed within 30 seconds.\n\n' +
                            'Current token remains active. Run the command again if needed.'
                        )
                        .setTimestamp();

                    try {
                        await interaction.editReply({
                            embeds: [timeoutEmbed],
                            components: []
                        });
                    } catch (error) {
                        // Message might have been deleted
                    }
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Error')
                .setDescription(`Failed to initiate token lockout: ${errorMessage}`)
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};