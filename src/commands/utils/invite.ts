import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('invite')
        .setDescription('Display personal server invite link'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(`https://discord.gg/k8HrBvDaQn`);
    }
};