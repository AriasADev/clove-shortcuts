import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const WANT_PETS = 'https://tenor.com/view/okayu-watanabe_masafumi-masafumi-cat-catgirl-gif-23454773';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('wantpets')
        .setDescription('Want pets!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${WANT_PETS})`);
        } else {
            await interaction.reply(WANT_PETS);
        }
    }
};