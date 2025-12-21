import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../../types/Command';

const PK_MESSAGE = '<@466378653216014359> is a bot used by plural systems to proxy their messages as their system members!\nYou can find more on the bot [online](<https://pluralkit.me>)';


// Slash command: /pk [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('pk')
        .setDescription('Explain PluralKit')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ping')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there, ${targetUser}! ${PK_MESSAGE}`);
        } else {
            await interaction.reply(PK_MESSAGE);
        }
    }
};

export const commands = [slashCommand];