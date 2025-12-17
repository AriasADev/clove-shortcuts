import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../types/Command';

const TONE_GIF = 'https://www.yuri-lover.win/cdn/gifs/tone.gif';

// Slash command: /tone [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('tone')
        .setDescription('Lower someones tone')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to lower the tone of')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`${targetUser}[.](${TONE_GIF})`);
        } else {
            await interaction.reply(TONE_GIF);
        }
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];