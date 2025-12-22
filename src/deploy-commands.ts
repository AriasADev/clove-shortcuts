import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { loadCommands } from './handlers/commandHandler';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env file');
    process.exit(1);
}

interface CommandRecord {
    id: string;
    name: string;
    version: string;
    deployed_at: string;
}

const COMMAND_IDS_FILE = path.join(__dirname, '../command-ids.json');

/**
 * Load previously deployed command IDs
 */
function loadCommandIds(): Map<string, CommandRecord> {
    try {
        if (fs.existsSync(COMMAND_IDS_FILE)) {
            const data = JSON.parse(fs.readFileSync(COMMAND_IDS_FILE, 'utf-8'));
            return new Map(Object.entries(data));
        }
    } catch (error) {
        console.warn('Could not load command IDs file:', error);
    }
    return new Map();
}

/**
 * Save command IDs to file
 */
function saveCommandIds(commandIds: Map<string, CommandRecord>): void {
    try {
        const data = Object.fromEntries(commandIds);
        fs.writeFileSync(COMMAND_IDS_FILE, JSON.stringify(data, null, 2));
        console.log(`✓ Saved command IDs to ${COMMAND_IDS_FILE}`);
    } catch (error) {
        console.error('Failed to save command IDs:', error);
    }
}

/**
 * Calculate a simple version hash for a command
 */
function getCommandVersion(commandJson: any): string {
    // Create a hash of the command structure (name + options)
    const structure = JSON.stringify({
        name: commandJson.name,
        description: commandJson.description,
        options: commandJson.options
    });
    return Buffer.from(structure).toString('base64').slice(0, 8);
}

async function deployCommands() {
    try {
        const commands = await loadCommands();
        const commandData = Array.from(commands.values()).map(cmd => {
            const json = cmd.data.toJSON();
            // Set integration types for user-installable app
            json.integration_types = [0, 1]; // GUILD_INSTALL (0), USER_INSTALL (1)
            json.contexts = [0, 1, 2];       // GUILD (0), BOT_DM (1), PRIVATE_CHANNEL (2)
            return json;
        });

        console.log(`Started refreshing ${commandData.length} application commands.`);

        // Load existing command IDs
        const existingIds = loadCommandIds();
        console.log(`Loaded ${existingIds.size} existing command ID(s)`);

        const rest = new REST().setToken(token!);

        // First, fetch existing commands from Discord
        console.log('Fetching existing commands from Discord...');
        const existingCommands = await rest.get(
            Routes.applicationCommands(clientId!)
        ) as any[];

        console.log(`Found ${existingCommands.length} existing command(s) on Discord`);

        // Check for any commands that would be overwritten
        for (const existingCmd of existingCommands) {
            const localRecord = existingIds.get(existingCmd.name);
            if (localRecord && localRecord.id !== existingCmd.id) {
                console.warn(`⚠️  WARNING: Command "${existingCmd.name}" ID mismatch!`);
                console.warn(`   Local:  ${localRecord.id}`);
                console.warn(`   Discord: ${existingCmd.id}`);
                console.warn(`   This may indicate the command was recreated externally.`);
            }
        }

        // Deploy commands
        const data = await rest.put(
            Routes.applicationCommands(clientId!),
            { body: commandData }
        ) as any[];

        console.log(`\n✓ Successfully deployed ${data.length} application command(s).`);
        console.log('ℹ️  Integration Types: GUILD_INSTALL (0), USER_INSTALL (1)');
        console.log('ℹ️  Contexts: GUILD (0), BOT_DM (1), PRIVATE_CHANNEL (2)');

        // Update command IDs
        const newCommandIds = new Map<string, CommandRecord>();
        console.log('\n📋 Command IDs:');
        console.log('─'.repeat(80));

        for (const cmd of data) {
            const commandJson = commandData.find(c => c.name === cmd.name);
            const version = commandJson ? getCommandVersion(commandJson) : 'unknown';
            
            const record: CommandRecord = {
                id: cmd.id,
                name: cmd.name,
                version: version,
                deployed_at: new Date().toISOString()
            };

            newCommandIds.set(cmd.name, record);

            // Check if this is a new command or changed
            const oldRecord = existingIds.get(cmd.name);
            if (!oldRecord) {
                console.log(`✨ NEW: /${cmd.name.padEnd(20)} ID: ${cmd.id}`);
            } else if (oldRecord.id !== cmd.id) {
                console.log(`🔄 CHANGED: /${cmd.name.padEnd(20)} ID: ${cmd.id} (was: ${oldRecord.id})`);
            } else if (oldRecord.version !== version) {
                console.log(`📝 UPDATED: /${cmd.name.padEnd(20)} ID: ${cmd.id} (version changed)`);
            } else {
                console.log(`✓ /${cmd.name.padEnd(20)} ID: ${cmd.id}`);
            }
        }

        console.log('─'.repeat(80));

        // Save the new command IDs
        saveCommandIds(newCommandIds);

        // Check for deleted commands
        const deletedCommands = Array.from(existingIds.keys()).filter(
            name => !newCommandIds.has(name)
        );

        if (deletedCommands.length > 0) {
            console.log('\n⚠️  Removed commands:');
            for (const name of deletedCommands) {
                console.log(`   - /${name}`);
            }
        }

        console.log('\n✓ Deployment complete!\n');

    } catch (error) {
        console.error('Error deploying commands:', error);
        process.exit(1);
    }
}

deployCommands();