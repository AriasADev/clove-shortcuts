import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const GUZZLE = 'https://www.yuri-lover.win/cdn/gifs/guzzle.gif';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('guzzle')
        .setDescription('Guzzle!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${GUZZLE})`);
        } else {
            await interaction.reply(GUZZLE);
        }
    }
};