import { 
  ApplicationCommandType,
  ChatInputCommandInteraction, 
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../types/Command';

const PLURALITY_MESSAGE = 'Plurality (or multiplicity) is the existence of multiple self-aware entities inside one physical brain.\nYou can find some simple information [here](<https://morethanone.info>)\nand some more advanced info [here](<https://pluralpedia.org/w/Main_Page>)'

// Slash command: /plurality [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('plurality')
        .setDescription('Send information about plurality')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to ping')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there ${targetUser}! ${PLURALITY_MESSAGE}`);
        } else {
            await interaction.reply(PLURALITY_MESSAGE);
        }
    } 
};

// User context menu: Right-click user → Apps → Plurality
export const userContextCommand: UserContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('Plurality')
        .setType(ApplicationCommandType.User),

    async execute(interaction: UserContextMenuCommandInteraction) {
        const targetUser = interaction.targetUser;
        await interaction.reply(`Hey there, ${targetUser}! ${PLURALITY_MESSAGE}`);
    }
};

// Message context menu: Right-click message → Apps → Plurality
export const messageContextCommand: MessageContextMenuCommand = {
    data: new ContextMenuCommandBuilder()
        .setName('Plurality')
        .setType(ApplicationCommandType.Message),

    async execute(interaction: MessageContextMenuCommandInteraction) {
        const targetUser = interaction.targetMessage.author;
        await interaction.reply(`Hey there, ${targetUser}! ${PLURALITY_MESSAGE}`);
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand, userContextCommand, messageContextCommand];