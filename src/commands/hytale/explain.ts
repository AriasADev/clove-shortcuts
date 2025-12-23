import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder
} from 'discord.js';

const HYTALE_MESSAGE = 'Hytale is an upcoming block-based sandbox adventure RPG, similar to Minecraft but with deeper RPG systems, custom content tools, and creator focus, developed by Hypixel Studios (from the popular Minecraft server) and recently brought back under their full control after a brief cancellation by Riot Games. It features a procedurally generated world (Orbis) for exploration, combat, building, minigames, and extensive modding, with an early access launch planned for Windows on January 13, 2026.';

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('explain')
        .setDescription('Explain Hytale')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to notify')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there ${targetUser}, here is more on Hytale\n${HYTALE_MESSAGE}`);
        } else {
            await interaction.reply(HYTALE_MESSAGE);
        }
    }
};