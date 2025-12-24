import {
  SlashCommandSubcommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js';
import axios from 'axios';

const data = new SlashCommandSubcommandBuilder()
  .setName('usercheck')
  .setDescription('Check if a Hytale username is available')
  .addStringOption(option =>
    option
      .setName('username')
      .setDescription('The username to check')
      .setRequired(true)
  );

async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const username = interaction.options.getString('username', true);

  try {
    const res = await axios.get(
      `http://hytale-api:8070/check/${encodeURIComponent(username)}`,
      { timeout: 5000 }
    );

    const available = res.data.available;

    const embed = new EmbedBuilder()
      .setTitle(available ? '✅ Username Available' : '❌ Username Taken')
      .setDescription(
        `**${username}** is ${
          available ? 'available!' : 'already taken.'
        }`
      )
      .setColor(available ? 0x57f287 : 0xed4245)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await interaction.editReply(
      '⚠️ Failed to check username.'
    );
  }
}

export default {
  data,
  execute
};
