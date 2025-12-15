import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { loadEvents } from './handlers/eventHandler';

// Load environment variables
dotenv.config();

// Create a new client instance with minimal intents for user-installed bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
});

// Load all events
loadEvents(client).then(() => {
    console.log('All events loaded');
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});