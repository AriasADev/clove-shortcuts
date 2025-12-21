import { 
  ApplicationCommandType,
  ChatInputCommandInteraction, 
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction
} from 'discord.js';
import { SlashCommand, UserContextMenuCommand, MessageContextMenuCommand } from '../../types/Command';

const PLURAL_MESSAGE = '<@1291501048493768784> is a bot used by plural systems to proxy their messages as their system members!\nYou can find more on the bot [online](<https://plural.gg>)';


// Slash command: /plural [user]
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('plural')
        .setDescription('Explain /plu/ral')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ping')
                .setRequired(false)
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user');

        if (targetUser) {
            await interaction.reply(`Hey there, ${targetUser}! ${PLURAL_MESSAGE}`);
        } else {
            await interaction.reply(PLURAL_MESSAGE);
        }
    }
};

export const commands = [slashCommand];