import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    MessageFlags
} from 'discord.js';
import { hytaleAPI } from '../../utils/hytaleAPI';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('usercheck')
        .setDescription('Check if a Hytale username is available')
        .addStringOption(option =>
            option
                .setName('username')
                .setDescription('The username to check')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(16)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const username = interaction.options.getString('username', true);

        // Validate Hytale username restrictions: 3-16 characters, letters, numbers, and underscores only
        if (username.length < 3 || username.length > 16) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245) // Red
                .setTitle('❌ Invalid Username Length')
                .setDescription(`Usernames must be between 3-16 characters. **${username}** is ${username.length} character${username.length !== 1 ? 's' : ''}.`)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245) // Red
                .setTitle('❌ Invalid Username Format')
                .setDescription('Usernames can only contain letters (a-z, A-Z), numbers (0-9), and underscores (_).')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }

        try {
            // Check username availability using authenticated Hytale API
            const available = await hytaleAPI.checkUsername(username);

            if (available) {
                const availableEmbed = new EmbedBuilder()
                    .setColor(0x57F287) // Green
                    .setTitle('✅ Username Available')
                    .setDescription(`The username **${username}** is available!`)
                    .addFields({
                        name: 'Next Steps',
                        value: 'You can reserve this username on [Hytale.com](https://hytale.com) when username reservations are open.'
                    })
                    .setTimestamp();

                await interaction.editReply({ embeds: [availableEmbed] });
            } else {
                const takenEmbed = new EmbedBuilder()
                    .setColor(0xED4245) // Red
                    .setTitle('❌ Username Taken')
                    .setDescription(`The username **${username}** is already taken.`)
                    .addFields({
                        name: 'Try Again',
                        value: 'Consider adding numbers or underscores, or try a different username.'
                    })
                    .setTimestamp();

                await interaction.editReply({ embeds: [takenEmbed] });
            }

        } catch (error) {
            let errorMessage = 'Unknown error occurred';
            let errorTitle = '❌ Error Checking Username';
            
            if (error instanceof Error) {
                if (error.message.includes('HYTALE_EMAIL') || error.message.includes('HYTALE_PASSWORD')) {
                    errorTitle = '❌ Configuration Error';
                    errorMessage = 'Hytale API credentials not configured.\n\n**Setup Required:**\nAdd to `.env` file:\n```\nHYTALE_EMAIL=your_email\nHYTALE_PASSWORD=your_password\n```';
                } else if (error.message.includes('Login failed')) {
                    errorTitle = '❌ Authentication Failed';
                    errorMessage = 'Could not log in to Hytale. Please check your credentials in the `.env` file.';
                } else {
                    errorMessage = error.message;
                }
            }

            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245) // Red
                .setTitle(errorTitle)
                .setDescription(errorMessage)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};