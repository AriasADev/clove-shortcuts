import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const CRAZY_MESSAGE = 'Crazy?...\nI was crazy once...\nThey locked me in a room...\nA rubber room\nA rubber room of rats...\nAnd rats make me crazy...';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('crazy')
        .setDescription('I was crazy once')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to annoy')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`You know what ${targetUser}...\n${CRAZY_MESSAGE}`);
        } else {
            await interaction.reply(CRAZY_MESSAGE);
        }
    }
};