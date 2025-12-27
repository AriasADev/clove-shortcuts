import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const NYA = 'https://tenor.com/view/neko-meow-gif-20441790';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('meow')
        .setDescription('Meow!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${NYA})`);
        } else {
            await interaction.reply(NYA);
        }
    }
};