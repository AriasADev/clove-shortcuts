import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('userid')
        .setDescription('Display personal userid')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get the ID of')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user') || interaction.user;
        await interaction.reply(`${user.id}`);
    }
};