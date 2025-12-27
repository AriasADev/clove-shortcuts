import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const ANGRY = 'https://tenor.com/view/angry-cat-noises-shout-anime-scream-angry-gif-16517686';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('angry')
        .setDescription('Angry!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${ANGRY})`);
        } else {
            await interaction.reply(ANGRY);
        }
    }
};