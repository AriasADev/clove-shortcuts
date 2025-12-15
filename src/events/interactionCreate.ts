import { Events, Interaction } from 'discord.js';
import { loadCommands } from '../handlers/commandHandler';

export const name = Events.InteractionCreate;
export const once = false;

let commands: Awaited<ReturnType<typeof loadCommands>>;

// Load commands once when the module is imported
loadCommands().then(loaded => {
    commands = loaded;
});

export async function execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isUserContextMenuCommand() && !interaction.isMessageContextMenuCommand()) {
        return;
    }

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction as any);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);

        const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}