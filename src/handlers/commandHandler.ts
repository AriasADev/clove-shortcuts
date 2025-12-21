import { Collection } from 'discord.js';
import { Command } from '../types/Command';
import * as fs from 'fs';
import * as path from 'path';

interface SubcommandModule {
    data: any;
    execute: Function;
}

interface CategoryCommand {
    data: any;
    execute: Function;
    subcommands: Map<string, SubcommandModule>;
}

/**
 * Dynamically load commands from the commands directory
 * 
 * Structure:
 * - src/commands/standalone.ts → /standalone command
 * - src/commands/category/subcommand.ts → /category subcommand
 * 
 * Examples:
 * - src/commands/ping.ts → /ping
 * - src/commands/dough/health.ts → /dough health
 * - src/commands/fun/cheese.ts → /fun cheese
 */
export async function loadCommands(): Promise<Collection<string, Command>> {
    const commands = new Collection<string, Command>();
    const commandsPath = path.join(__dirname, '../commands');

    if (!fs.existsSync(commandsPath)) {
        console.warn('Commands directory does not exist');
        return commands;
    }

    // Get all items in commands directory
    const items = fs.readdirSync(commandsPath, { withFileTypes: true });

    // Process standalone command files (not in subdirectories)
    const standaloneFiles = items
        .filter(item => item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js')))
        .map(item => item.name);

    for (const file of standaloneFiles) {
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(filePath);

        // Support both single command export and multiple commands array export
        if (commandModule.commands && Array.isArray(commandModule.commands)) {
            // Multiple commands in one file
            for (const command of commandModule.commands) {
                if ('data' in command && 'execute' in command) {
                    commands.set(command.data.name, command);
                    console.log(`✓ Loaded command: /${command.data.name}`);
                }
            }
        } else if (commandModule.command && 'data' in commandModule.command && 'execute' in commandModule.command) {
            // Single command export (backward compatibility)
            const command = commandModule.command as Command;
            commands.set(command.data.name, command);
            console.log(`✓ Loaded command: /${command.data.name}`);
        } else {
            console.warn(`⚠ Command at ${filePath} is missing required "data" or "execute" property`);
        }
    }

    // Process category directories (folders containing subcommands)
    const categoryDirs = items
        .filter(item => item.isDirectory())
        .map(item => item.name);

    for (const categoryName of categoryDirs) {
        const categoryPath = path.join(commandsPath, categoryName);
        const subcommandFiles = fs.readdirSync(categoryPath)
            .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

        if (subcommandFiles.length === 0) {
            console.warn(`⚠ Category directory '${categoryName}' is empty`);
            continue;
        }

        // Load all subcommands for this category
        const subcommands = new Map<string, SubcommandModule>();

        for (const file of subcommandFiles) {
            const filePath = path.join(categoryPath, file);
            const subcommandModule = await import(filePath);

            // Support default export for subcommands
            if (subcommandModule.default && 'data' in subcommandModule.default && 'execute' in subcommandModule.default) {
                const subcommand = subcommandModule.default;
                const subcommandName = subcommand.data.name;
                subcommands.set(subcommandName, subcommand);
                console.log(`  ✓ Loaded subcommand: /${categoryName} ${subcommandName}`);
            } else {
                console.warn(`  ⚠ Subcommand at ${filePath} is missing required "data" or "execute" property`);
            }
        }

        if (subcommands.size === 0) {
            console.warn(`⚠ No valid subcommands found in category '${categoryName}'`);
            continue;
        }

        // Create the category command dynamically
        const categoryCommand = createCategoryCommand(categoryName, subcommands);
        commands.set(categoryName, categoryCommand);
        console.log(`✓ Created category command: /${categoryName} (${subcommands.size} subcommands)`);
    }

    return commands;
}

/**
 * Create a category command that handles subcommands
 */
function createCategoryCommand(categoryName: string, subcommands: Map<string, SubcommandModule>): Command {
    const { SlashCommandBuilder } = require('discord.js');

    // Build the command with all subcommands
    const commandBuilder = new SlashCommandBuilder()
        .setName(categoryName)
        .setDescription(`${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} commands`);

    // Add each subcommand to the builder
    for (const [subcommandName, subcommand] of subcommands) {
        commandBuilder.addSubcommand(subcommand.data);
    }

    // Create the execute handler
    return {
        data: commandBuilder,
        async execute(interaction: any) {
            const subcommandName = interaction.options.getSubcommand();
            const subcommand = subcommands.get(subcommandName);

            if (!subcommand) {
                await interaction.reply({
                    content: `Unknown subcommand: ${subcommandName}`,
                    ephemeral: true
                });
                return;
            }

            try {
                await subcommand.execute(interaction);
            } catch (error) {
                console.error(`Error executing /${categoryName} ${subcommandName}:`, error);

                const errorMessage = {
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    };
}