import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const CHOMP = 'https://tenor.com/view/cat-box-cat-box-bite-catch-box-gif-25512304';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('bite')
        .setDescription('Chomp!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${CHOMP})`);
        } else {
            await interaction.reply(CHOMP);
        }
    }
};