import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { SlashCommand } from '../../types/Command';

const ADB_MESSAGE = 'Starting December 5, 2025, the active developer badge has been **removed**, and is **no longer** obtainable. There are also *no* plans for a new badge replacing this.';

// Slash command: /adb [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('adb')
        .setDescription('Info about the Active Developer Badge')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to inform about the badge')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there, ${targetUser}! ${ADB_MESSAGE}`);
        } else {
            await interaction.reply(ADB_MESSAGE);
        }
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];