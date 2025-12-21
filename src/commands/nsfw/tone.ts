import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const TONE_GIF = 'https://www.yuri-lover.win/cdn/gifs/tone.gif';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('tone')
        .setDescription('Lower someones tone')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to lower the tone of')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${TONE_GIF})`);
        } else {
            await interaction.reply(TONE_GIF);
        }
    }
};