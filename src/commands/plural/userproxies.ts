import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../../types/Command';

const USERPROXY_MESSAGE = 'You can setup a Userproxy using this guide <https://youtu.be/spRkTssPCqg>!'

// Slash command: /userproxies [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('userproxies')
        .setDescription('Send the tutorial on how to setup a userproxy')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to ping')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there ${targetUser}! ${USERPROXY_MESSAGE}`);
        } else {
            await interaction.reply(USERPROXY_MESSAGE);
        }
    }
};

// User context menu: Right-click user → Apps → Userproxies
export const userContextCommand: UserContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('Userproxies')
        .setType(ApplicationCommandType.User),

    async execute(interaction: UserContextMenuCommandInteraction) {
        const targetUser = interaction.targetUser;
        await interaction.reply(`Hey there, ${targetUser}! ${USERPROXY_MESSAGE}`);
    }
};

// Message context menu: Right-click message → Apps → Userproxies
export const messageContextCommand: MessageContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('Userproxies')
        .setType(ApplicationCommandType.Message),

    async execute(interaction: MessageContextMenuCommandInteraction) {
        const targetUser = interaction.targetMessage.author;
        await interaction.reply(`Hey there, ${targetUser}! ${USERPROXY_MESSAGE}`);
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand, userContextCommand, messageContextCommand];