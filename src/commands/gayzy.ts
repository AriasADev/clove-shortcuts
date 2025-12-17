import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';
import { SlashCommand } from '../types/Command';

const GAYZY_MESSAGE = 'Gay?...\nI was gay once...\nThey locked me in a room...\nA rubber room\nA rubber room of cats...\nAnd cats make me gay...';

// Slash command: /gayzy [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('gayzy')
        .setDescription('I was gay once')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to annoy')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`You know what ${targetUser}...\n${GAYZY_MESSAGE}`);
        } else {
            await interaction.reply(GAYZY_MESSAGE);
        }
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];