import { 
  ApplicationCommandType,
  ChatInputCommandInteraction, 
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../types/Command';

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


// User context menu: Right-click user → Apps → PK
export const userContextCommand: UserContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('PK')
        .setType(ApplicationCommandType.User),

    async execute(interaction: UserContextMenuCommandInteraction) {
        const targetUser = interaction.targetUser;
        await interaction.reply(`Hey there, ${targetUser}! ${PK_MESSAGE}`);
    }
};

// Message context menu: Right-click message → Apps → PK
export const messageContextCommand: MessageContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('PKS')
        .setType(ApplicationCommandType.Message),

    async execute(interaction: MessageContextMenuCommandInteraction) {
        const targetUser = interaction.targetMessage.author;
        await interaction.reply(`Hey there, ${targetUser}! ${PK_MESSAGE}`);
    }
};

export const commands = [slashCommand, userContextCommand, messageContextCommand];