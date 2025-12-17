import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ComponentType
} from 'discord.js';
import { SlashCommand } from '../types/Command';

interface CommandCategory {
    id: string;
    name: string;
    emoji: string;
    commands: Array<{ name: string; description: string }>;
}

const categories: CommandCategory[] = [
    {
        id: 'plurality',
        name: 'Plurality',
        emoji: '🌟',
        commands: [
            { name: '/plurality', description: 'Information about plurality/multiplicity' },
            { name: '/pk', description: 'Explain PluralKit bot' },
            { name: '/plural', description: 'Explain /plu/ral bot' },
            { name: '/userproxies', description: 'Tutorial on setting up userproxies' }
        ]
    },
    {
        id: 'utility',
        name: 'Utility',
        emoji: '🔧',
        commands: [
            { name: '/ping', description: 'Check bot latency' },
            { name: '/refresh', description: 'How to refresh Discord client' },
            { name: '/help', description: 'Display this help message' }
        ]
    },
    {
        id: 'discord',
        name: 'Discord Info',
        emoji: 'ℹ️',
        commands: [
            { name: '/adb', description: 'Info about Active Developer Badge' }
        ]
    },
    {
        id: 'personal',
        name: 'Personal',
        emoji: '👤',
        commands: [
            { name: '/userid', description: 'Display bot owner\'s user ID' },
            { name: '/invite', description: 'Server invite link' }
        ]
    },
    {
        id: 'fun',
        name: 'Fun',
        emoji: '🎉',
        commands: [
            { name: '/cheese', description: 'Send the cheese GIF' },
            { name: '/crazy', description: 'I was crazy once...' },
            { name: '/gayzy', description: 'I was gay once...'}
        ]
    }
];

function createMainEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📚 Bot Commands')
        .setDescription('Select a category from the dropdown below to view commands in that category.')
        .addFields({
            name: 'Categories',
            value: categories.map(cat => `${cat.emoji} **${cat.name}** - ${cat.commands.length} command${cat.commands.length !== 1 ? 's' : ''}`).join('\n')
        })
        .setFooter({ text: 'Some commands also have right-click context menu options!' });
}

function createCategoryEmbed(category: CommandCategory): EmbedBuilder {
    const commandList = category.commands
        .map(cmd => `**${cmd.name}**\n${cmd.description}`)
        .join('\n\n');

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`${category.emoji} ${category.name} Commands`)
        .setDescription(commandList)
        .setFooter({ text: 'Use the dropdown to view other categories' });
}

function createSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Select a category')
        .addOptions([
            {
                label: 'Overview',
                description: 'View all categories',
                value: 'overview',
                emoji: '📚'
            },
            ...categories.map(cat => ({
                label: cat.name,
                description: `View ${cat.name.toLowerCase()} commands`,
                value: cat.id,
                emoji: cat.emoji
            }))
        ]);

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
}

// Slash command: /help
export const slashCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display all available commands organized by category'),

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = createMainEmbed();
        const row = createSelectMenu();

        const response = await interaction.reply({
            embeds: [embed],
            components: [row]
        });

        // Create a collector to handle select menu interactions
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 300_000 // 5 minutes
        });

        collector.on('collect', async (i: StringSelectMenuInteraction) => {
            // Only allow the original user to use the select menu
            if (i.user.id !== interaction.user.id) {
                await i.reply({
                    content: 'This help menu is not for you! Use `/help` to get your own.',
                    ephemeral: true
                });
                return;
            }

            const selectedValue = i.values[0];

            if (selectedValue === 'overview') {
                await i.update({
                    embeds: [createMainEmbed()],
                    components: [createSelectMenu()]
                });
            } else {
                const category = categories.find(cat => cat.id === selectedValue);
                if (category) {
                    await i.update({
                        embeds: [createCategoryEmbed(category)],
                        components: [createSelectMenu()]
                    });
                }
            }
        });

        collector.on('end', async () => {
            // Disable the select menu after timeout
            const disabledRow = createSelectMenu();
            disabledRow.components[0].setDisabled(true);

            try {
                await response.edit({ components: [disabledRow] });
            } catch (error) {
                // Message might have been deleted
            }
        });
    }
};

// Export all commands as an array for the command handler
export const commands = [slashCommand];