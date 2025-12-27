import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const POOF = 'https://tenor.com/view/im-out-we-out-peace-out-disappear-gif-15464202';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('poof')
        .setDescription('I\'m outta here!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Target User')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${POOF})`);
        } else {
            await interaction.reply(POOF);
        }
    }
};