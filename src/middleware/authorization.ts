import { Interaction, EmbedBuilder } from 'discord.js';

/**
 * Authorization levels for the bot
 * 
 * OWNER: Full access to all commands including sensitive operations
 * FRIEND: Access to non-sensitive commands only
 */

/** Owner - Full access (you) */
const OWNER_ID = '1025770042245251122';

/** Friends - Limited access (non-sensitive commands only) */
const FRIEND_IDS = [
    '652597508027187240',
    '810257561596461166',
];

/** Commands that require owner-level access */
const OWNER_ONLY_COMMANDS = [
    'dough' // Sensitive API access
];

export enum AuthLevel {
    UNAUTHORIZED = 0,
    FRIEND = 1,
    OWNER = 2
}

/**
 * Get the authorization level for a user
 */
export function getAuthLevel(userId: string): AuthLevel {
    if (userId === OWNER_ID) {
        return AuthLevel.OWNER;
    }
    if (FRIEND_IDS.includes(userId)) {
        return AuthLevel.FRIEND;
    }
    return AuthLevel.UNAUTHORIZED;
}

/**
 * Check if a user is authorized to use a specific command
 */
export function isAuthorizedForCommand(userId: string, commandName: string): boolean {
    const authLevel = getAuthLevel(userId);

    // Unauthorized users can't use anything
    if (authLevel === AuthLevel.UNAUTHORIZED) {
        return false;
    }

    // Owner can use everything
    if (authLevel === AuthLevel.OWNER) {
        return true;
    }

    // Friends can't use owner-only commands
    if (OWNER_ONLY_COMMANDS.includes(commandName)) {
        return false;
    }

    // Friends can use everything else
    return true;
}

/**
 * Check if the interaction user is authorized for the command
 */
export function isAuthorized(interaction: Interaction): boolean {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) {
        // For non-command interactions, just check if they're not unauthorized
        return getAuthLevel(interaction.user.id) !== AuthLevel.UNAUTHORIZED;
    }

    const commandName = interaction.commandName;
    return isAuthorizedForCommand(interaction.user.id, commandName);
}

/**
 * Send an unauthorized response
 */
export async function sendUnauthorizedResponse(interaction: Interaction, commandName?: string): Promise<void> {
    if (!interaction.isRepliable()) return;

    const authLevel = getAuthLevel(interaction.user.id);
    
    let title: string;
    let description: string;

    if (authLevel === AuthLevel.UNAUTHORIZED) {
        // Completely unauthorized
        title = '🔒 Unauthorized';
        description = 'You are not authorized to use this bot.';
    } else if (authLevel === AuthLevel.FRIEND && commandName && OWNER_ONLY_COMMANDS.includes(commandName)) {
        // Friend trying to use owner-only command
        title = '🔒 Owner Only';
        description = `The \`/${commandName}\` command is restricted to the bot owner for security reasons.`;
    } else {
        // Fallback
        title = '🔒 Unauthorized';
        description = 'You do not have permission to use this command.';
    }

    const embed = new EmbedBuilder()
        .setColor(0xED4245) // Red
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: 'Access restricted' })
        .setTimestamp();

    const response = { embeds: [embed], ephemeral: true };

    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(response);
    } else {
        await interaction.reply(response);
    }
}