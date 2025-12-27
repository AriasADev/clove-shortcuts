import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const boop = 'https://tenor.com/en-GB/view/boop-nose-anime-gif-6287077';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('boop')
        .setDescription('Boop!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${boop})`);
        } else {
            await interaction.reply(boop);
        }
    }
};