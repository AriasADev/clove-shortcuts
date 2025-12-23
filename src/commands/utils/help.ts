import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ComponentType,
    MessageFlags
} from 'discord.js';

interface CommandCategory {
    id: string;
    name: string;
    emoji: string;
    commands: Array<{ name: string; description: string }>;
}

const categories: CommandCategory[] = [
    {
        id: 'dough',
        name: 'Doughmination',
        emoji: '🍩',
        commands: [
            { name: '/dough add', description: 'Add a member to the front (autocomplete search)' },
            { name: '/dough remove', description: 'Remove a member from the front (autocomplete search)' },
            { name: '/dough health', description: 'Check API connection status' },
            { name: '/dough lockout', description: '🚨 EMERGENCY: Regenerate bot token' }
        ]
    },
    {
        id: 'plural',
        name: 'Plurality',
        emoji: '🌟',
        commands: [
            { name: '/plural plurality', description: 'Information about plurality/multiplicity' },
            { name: '/plural pk', description: 'Explain PluralKit bot' },
            { name: '/plural plural', description: 'Explain /plu/ral bot' },
            { name: '/plural userproxies', description: 'Tutorial on setting up userproxies' }
        ]
    },
    {
        id: 'utils',
        name: 'Utility',
        emoji: '🔧',
        commands: [
            { name: '/utils ping', description: 'Check bot latency' },
            { name: '/utils refresh', description: 'How to refresh Discord client' },
            { name: '/utils help', description: 'Display this help message' },
            { name: '/utils adb', description: 'Info about Active Developer Badge' },
            { name: '/utils invite', description: 'Display personal server invite link' },
            { name: '/utils userid', description: 'Display people\'s userid' }
        ]
    },
    {
        id: 'fun',
        name: 'Fun',
        emoji: '🎉',
        commands: [
            { name: '/fun cheese', description: 'Send the cheese GIF' },
            { name: '/fun crazy', description: 'I was crazy once...' },
            { name: '/fun gayzy', description: 'I was gay once...'}
        ]
    },
    {
        id: 'hytale',
        name: 'Hytale',
        emoji: '🎮',
        commands: [
            { name: '/hytale explain', description: 'Explain Hytale' }
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
        .setFooter({ text: 'Commands are organized by category!' });
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

export default {
    data: new SlashCommandSubcommandBuilder()
        .setName('help')
        .setDescription('Display all available commands organized by category'),

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = createMainEmbed();
        const row = createSelectMenu();

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: MessageFlags.Ephemeral
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
                    content: 'This help menu is not for you! Use `/utils help` to get your own.',
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