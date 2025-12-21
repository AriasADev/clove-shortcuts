import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const CHEESE_GIF = 'https://cdn.discordapp.com/attachments/1427240630798782514/1446510314018439271/image0.gif';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('cheese')
        .setDescription('Send the cheese GIF!')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to cheese')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${CHEESE_GIF})`);
        } else {
            await interaction.reply(CHEESE_GIF);
        }
    }
};