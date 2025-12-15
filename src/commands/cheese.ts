import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../types/Command';

const CHEESE_GIF = 'https://cdn.discordapp.com/attachments/1427240630798782514/1446510314018439271/image0.gif';

// Slash command: /cheese [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
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

// User context menu: Right-click user → Apps → Cheese
export const userContextCommand: UserContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('Cheese')
        .setType(ApplicationCommandType.User),

    async execute(interaction: UserContextMenuCommandInteraction) {
        const targetUser = interaction.targetUser;
        await interaction.reply(`${targetUser} [.](${CHEESE_GIF})`);
    }
};

// Message context menu: Right-click message → Apps → Cheese
export const messageContextCommand: MessageContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('Cheese')
        .setType(ApplicationCommandType.Message),

    async execute(interaction: MessageContextMenuCommandInteraction) {
        const targetUser = interaction.targetMessage.author;
        await interaction.reply(`${targetUser} [.](${CHEESE_GIF})`);
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand, userContextCommand, messageContextCommand];