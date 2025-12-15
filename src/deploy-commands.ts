import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { loadCommands } from './handlers/commandHandler';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env file');
    process.exit(1);
}

async function deployCommands() {
    try {
        const commands = await loadCommands();
        const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());

        console.log(`Started refreshing ${commandData.length} application commands.`);

        const rest = new REST().setToken(token!);

        // Deploy globally for user-installed app
        const data = await rest.put(
            Routes.applicationCommands(clientId!),
            { body: commandData }
        ) as any[];

        console.log(`Successfully reloaded ${data.length} application commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
        process.exit(1);
    }
}

deployCommands();