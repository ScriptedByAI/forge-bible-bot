// ============================================
// discord-bot.js — Forge Bible Bot (Discord)
// ============================================
// "For where two or three are gathered in my name,
//  there am I among them."
// — Matthew 18:20 (ESV)

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActivityType, MessageFlags } = require('discord.js');
const BibleService = require('./bible-service');
const DiscordCommandHandler = require('./discord-commands');
const Storage = require('./storage');
const TriviaGame = require('./trivia');
const { findReferenceInMessage } = require('./verse-parser');
const { loadConfig } = require('./custom-config');
const logger = require('./logger');
const cron = require('node-cron');

// ========================================
// CONFIGURATION
// ========================================

const config = {
  discordToken: process.env.DISCORD_BOT_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordGuildId: process.env.DISCORD_GUILD_ID,

  votdChannelId: process.env.DISCORD_VOTD_CHANNEL_ID,
  welcomeChannelId: process.env.DISCORD_WELCOME_CHANNEL_ID,
  prayerChannelId: process.env.DISCORD_PRAYER_CHANNEL_ID,

  esvApiKey: process.env.ESV_API_KEY,

  defaultTranslation: (process.env.DEFAULT_TRANSLATION || 'esv').toLowerCase(),
  commandCooldown: parseInt(process.env.COMMAND_COOLDOWN) || 3,

  autoDetectVerses: process.env.DISCORD_AUTO_DETECT !== 'false',
  welcomeDmEnabled: process.env.WELCOME_DM !== 'false',
  topicReminderInterval: parseInt(process.env.TOPIC_REMINDER_MINUTES) || 15,
};

const customConfig = loadConfig();
const botName = process.env.BOT_NAME || 'Forge Bible Bot';

// ========================================
// VALIDATION
// ========================================

function validateConfig() {
  const errors = [];

  if (!config.discordToken || config.discordToken === 'YOUR_DISCORD_BOT_TOKEN') {
    errors.push('DISCORD_BOT_TOKEN is not set in .env');
  }
  if (!config.discordClientId || config.discordClientId === 'YOUR_DISCORD_CLIENT_ID') {
    errors.push('DISCORD_CLIENT_ID is not set in .env');
  }
  if (!config.esvApiKey || config.esvApiKey === 'YOUR_ESV_API_KEY_HERE') {
    console.warn('⚠️  ESV_API_KEY not set — ESV lookups will fall back to bible-api.com (WEB translation)');
    config.esvApiKey = null;
  }

  if (errors.length > 0) {
    console.error('');
    console.error('❌ Discord Bot Configuration Errors:');
    errors.forEach(err => console.error(`   • ${err}`));
    console.error('');
    console.error('Run "npm run setup" for a guided configuration wizard!');
    process.exit(1);
  }
}

// ========================================
// SLASH COMMAND DEFINITIONS
// ========================================

const slashCommands = [
  new SlashCommandBuilder()
    .setName('verse')
    .setDescription('Look up a Bible verse (supports ranges, commas, semicolons!)')
    .addStringOption(opt =>
      opt.setName('reference')
        .setDescription('Bible reference (e.g., John 3:16, Romans 8:28-30)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('translation')
        .setDescription('Bible translation')
        .setRequired(false)
        .addChoices(
          { name: 'ESV', value: 'esv' },
          { name: 'KJV', value: 'kjv' },
          { name: 'NKJV', value: 'nkjv' },
          { name: 'NLT', value: 'nlt' },
          { name: 'NASB', value: 'nasb' },
          { name: 'NIV', value: 'niv' },
          { name: 'WEB', value: 'web' },
        )),

  new SlashCommandBuilder()
    .setName('random')
    .setDescription('Get a random encouraging verse'),

  new SlashCommandBuilder()
    .setName('votd')
    .setDescription('Get today\'s Verse of the Day (builds your streak!)'),

  new SlashCommandBuilder()
    .setName('read')
    .setDescription('Read a full chapter or passage')
    .addStringOption(opt =>
      opt.setName('reference')
        .setDescription('Chapter to read (e.g., Psalm 23, Romans 8)')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('translation')
        .setDescription('Bible translation')
        .setRequired(false)
        .addChoices(
          { name: 'ESV', value: 'esv' },
          { name: 'KJV', value: 'kjv' },
          { name: 'NKJV', value: 'nkjv' },
          { name: 'NLT', value: 'nlt' },
          { name: 'WEB', value: 'web' },
        )),

  new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for verses by keyword')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Search term (e.g., grace, forgiveness, hope)')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('xref')
    .setDescription('Get cross-references for a verse')
    .addStringOption(opt =>
      opt.setName('reference')
        .setDescription('Bible reference (leave blank to use last verse)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('save')
    .setDescription('Bookmark a verse to your favorites')
    .addStringOption(opt =>
      opt.setName('reference')
        .setDescription('Verse to save (leave blank to save your last looked-up verse)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('saved')
    .setDescription('View your saved/bookmarked verses'),

  new SlashCommandBuilder()
    .setName('topic')
    .setDescription('Set or view the stream scripture topic')
    .addStringOption(opt =>
      opt.setName('reference')
        .setDescription('Scripture reference for the topic (or "clear" to reset)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Start a Bible trivia question!')
    .addStringOption(opt =>
      opt.setName('difficulty')
        .setDescription('Question difficulty')
        .setRequired(false)
        .addChoices(
          { name: '🟢 Easy', value: 'easy' },
          { name: '🟡 Medium', value: 'medium' },
          { name: '🔴 Hard', value: 'hard' },
        )),

  new SlashCommandBuilder()
    .setName('streak')
    .setDescription('View your VOTD daily streak'),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the Bible trivia leaderboard'),

  new SlashCommandBuilder()
    .setName('gospel')
    .setDescription('Share the Gospel message')
    .addStringOption(opt =>
      opt.setName('language')
        .setDescription('Language')
        .setRequired(false)
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'Español', value: 'es' },
        )),

  new SlashCommandBuilder()
    .setName('prayer')
    .setDescription('Submit a prayer request or get prayer info')
    .addStringOption(opt =>
      opt.setName('request')
        .setDescription('Your prayer request (optional — leave blank for info)')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('translation')
    .setDescription('Set your preferred Bible translation (saved permanently!)')
    .addStringOption(opt =>
      opt.setName('version')
        .setDescription('Translation code')
        .setRequired(false)
        .addChoices(
          { name: 'ESV (English Standard Version)', value: 'esv' },
          { name: 'KJV (King James Version)', value: 'kjv' },
          { name: 'NKJV (New King James Version)', value: 'nkjv' },
          { name: 'NLT (New Living Translation)', value: 'nlt' },
          { name: 'NASB (New American Standard)', value: 'nasb' },
          { name: 'NIV (New International Version)', value: 'niv' },
          { name: 'WEB (World English Bible)', value: 'web' },
        )),

  new SlashCommandBuilder()
    .setName('about')
    .setDescription('About this community and bot'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available bot commands'),
];

// Conditionally register testimony command
if (customConfig.testimony?.enabled) {
  slashCommands.push(
    new SlashCommandBuilder()
      .setName('testimony')
      .setDescription('Read the testimony')
  );
}

// Conditionally register custom ministry command
if (customConfig.ministry?.enabled) {
  const cmdName = (customConfig.ministry.command_name || 'ministry').toLowerCase();
  slashCommands.push(
    new SlashCommandBuilder()
      .setName(cmdName)
      .setDescription(customConfig.ministry.title || 'Learn about our ministry')
  );
}

// Conditionally register support command
if (customConfig.support?.enabled) {
  slashCommands.push(
    new SlashCommandBuilder()
      .setName('support')
      .setDescription('Support this ministry')
  );
}

// ========================================
// STARTUP
// ========================================

console.log('');
console.log('══════════════════════════════════════════');
console.log(`  ⚒️  ${botName} — Discord`);
console.log('  ✝️  Jesus is Lord!');
console.log('══════════════════════════════════════════');
console.log('');

validateConfig();

const storage = new Storage();
const bibleService = new BibleService(config.esvApiKey);
const triviaGame = new TriviaGame(storage);

// OBS overlay is handled by the Twitch bot only.
let obsOverlay = null;

const commandHandler = new DiscordCommandHandler(bibleService, config, storage, triviaGame, obsOverlay);

// Curated welcome verses for new member DMs
const WELCOME_VERSES = [
  'Jeremiah 29:11', 'Isaiah 41:10', 'John 3:16', 'Romans 8:28',
  'Psalm 23:1', 'Philippians 4:13', 'Joshua 1:9', '2 Corinthians 5:17',
  'Psalm 46:1', 'Proverbs 3:5-6', 'Romans 15:13', 'Isaiah 40:31',
];

// ========================================
// DISCORD CLIENT
// ========================================

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// ========================================
// REGISTER SLASH COMMANDS
// ========================================

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  try {
    console.log('📝 Registering slash commands...');

    if (config.discordGuildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId),
        { body: slashCommands.map(cmd => cmd.toJSON()) }
      );
      console.log(`✅ Registered ${slashCommands.length} commands to guild ${config.discordGuildId}`);
    } else {
      await rest.put(
        Routes.applicationCommands(config.discordClientId),
        { body: slashCommands.map(cmd => cmd.toJSON()) }
      );
      console.log(`✅ Registered ${slashCommands.length} global commands (may take up to 1hr to appear)`);
    }
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error.message);
  }
}

// ========================================
// EVENT HANDLERS
// ========================================

discordClient.on('clientReady', async () => {
  console.log(`✅ Logged in as ${discordClient.user.tag}`);
  console.log(`📖 Default translation: ${config.defaultTranslation.toUpperCase()}`);
  console.log(`🔑 ESV API: ${config.esvApiKey ? 'Active' : 'Not configured (using fallback)'}`);
  console.log(`👁️  Auto-detect verses: ${config.autoDetectVerses ? 'ON' : 'OFF'}`);
  console.log(`💾 Persistent storage: Active`);
  console.log(`💌 Welcome DM: ${config.welcomeDmEnabled ? 'ON' : 'OFF'}`);
  console.log('');

  discordClient.user.setActivity('for Bible references', { type: ActivityType.Watching });

  // Notify channel when trivia times out
  triviaGame.onExpire = async (channelId, answer, ref) => {
    try {
      const channel = await discordClient.channels.fetch(channelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('⏰ Time\'s Up!')
          .setDescription(`Nobody got it! The answer was **${answer}** (${ref}).\n\nTry again with \`/trivia\`!`)
          .setFooter({ text: `${botName} — Bible Trivia` });
        await channel.send({ embeds: [embed] });
      }
    } catch (err) { /* channel may not be accessible */ }
  };

  await registerCommands();

  // Schedule Verse of the Day
  if (config.votdChannelId) {
    console.log('⏰ VOTD scheduled for 6:00 AM daily');
    cron.schedule('0 6 * * *', () => postVerseOfTheDay(), {
      timezone: 'America/Chicago'
    });
  }

  console.log('');
  console.log(`⚒️  ${botName} is online! Waiting for commands...`);
  console.log('   Press Ctrl+C to shut down.');
  console.log('');
});

// ---- SLASH COMMAND HANDLING ----
discordClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;
  const username = user.username;

  try {
    const deferCommands = ['verse', 'random', 'votd', 'read', 'search', 'xref', 'save'];
    if (deferCommands.includes(commandName)) {
      await interaction.deferReply();
    }

    const result = await commandHandler.handleSlashCommand(interaction);

    if (result) {
      if (result.ephemeral) {
        if (interaction.deferred) {
          await interaction.editReply({ embeds: result.embeds || [result.embed] });
        } else {
          await interaction.reply({ embeds: result.embeds || [result.embed], flags: MessageFlags.Ephemeral });
        }
      } else {
        const embed = result.embed || result;

        if (interaction.deferred) {
          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.reply({ embeds: [embed] });
        }

        if (embed._extraChunks && embed._extraChunks.length > 0) {
          for (const chunk of embed._extraChunks) {
            await interaction.followUp({ embeds: [chunk] });
          }
        }
      }
      logCommand(username, `/${commandName}`, interaction.channel?.name);
    }
  } catch (error) {
    logger.error('SLASH-CMD', `/${commandName} failed`, {
      user: username,
      channel: `#${interaction.channel?.name || 'unknown'}`,
      channelId: interaction.channelId,
      error: error.message,
    });
    const errorMsg = '❌ Something went wrong. Please try again!';
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMsg });
      } else {
        await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral });
      }
    } catch (e) { /* interaction may have timed out */ }
  }
});

// ---- MESSAGE HANDLING (Auto-detect + Trivia answers) ----
discordClient.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content || message.content.trim().length === 0) return;

  const trimmedMessage = message.content.trim();
  const username = message.author.username;
  const channelId = message.channelId;
  const channelName = message.channel?.name || 'unknown';

  if (trimmedMessage.startsWith('/') || trimmedMessage.startsWith('!') || trimmedMessage.startsWith('.')) return;

  // ---- TRIVIA ANSWER CHECK ----
  if (triviaGame.isActive(channelId)) {
    try {
      const result = triviaGame.checkAnswer(channelId, trimmedMessage, username);
      if (result) {
        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('✅ Correct!')
          .setDescription(
            `**${result.winner}** got it right!\n\n` +
            `**Answer:** ${result.answer}\n` +
            `**Reference:** ${result.ref}\n` +
            `**Time:** ${result.elapsed}s\n\n` +
            `📊 ${result.winner}'s score: **${result.score.correct}/${result.score.total}**`
          )
          .setFooter({ text: 'Use /trivia for another question!' });

        await message.reply({ embeds: [embed] });
        return;
      }
    } catch (error) {
      logger.error('TRIVIA', `Failed to process trivia answer`, {
        user: username,
        channel: `#${channelName}`,
        channelId: channelId,
        message: trimmedMessage.substring(0, 100),
        error: error.message,
      });
      return;
    }
  }

  // ---- AUTO VERSE DETECTION ----
  if (!config.autoDetectVerses) return;

  try {
    const detected = findReferenceInMessage(trimmedMessage);
    if (detected) {
      const translation = detected.translation
        || commandHandler.getTranslation(username)
        || config.defaultTranslation;

      const result = await bibleService.getVerse(detected.reference, translation);

      if (result) {
        bibleService.setUserLastVerse(username, detected.reference, translation);

        const embed = commandHandler.formatVerseEmbed(result, username);
        await message.reply({ embeds: [embed] });
        logger.command('DISCORD', username, `[auto-detect] ${detected.reference}`, channelName);
      }
    }
  } catch (error) {
    if (error.message.includes('Missing Permissions') || error.code === 50013) {
      logger.warn('AUTO-DETECT', `Bot lacks permissions to reply`, {
        channel: `#${channelName}`,
        channelId: channelId,
        user: username,
        trigger: trimmedMessage.substring(0, 80),
        fix: 'Grant bot Send Messages + Embed Links in this channel',
      });
    } else {
      logger.error('AUTO-DETECT', `Failed to process auto-detected verse`, {
        user: username,
        channel: `#${channelName}`,
        channelId: channelId,
        trigger: trimmedMessage.substring(0, 80),
        error: error.message,
      });
    }
  }
});

// ---- WELCOME NEW MEMBERS ----
discordClient.on('guildMemberAdd', async (member) => {
  const communityName = process.env.COMMUNITY_NAME || botName;

  // Post welcome in channel
  if (config.welcomeChannelId) {
    try {
      const channel = await discordClient.channels.fetch(config.welcomeChannelId);
      if (channel) {
        const welcomeEmbed = new EmbedBuilder()
          .setColor(0xD4A017)
          .setTitle(`⚒️ Welcome to ${communityName}!`)
          .setDescription(
            `Hey ${member}, welcome! We're glad you're here.\n\n` +
            `✝️ *"Therefore, if anyone is in Christ, he is a new creation."* — 2 Cor 5:17\n\n` +
            `**Getting Started:**\n` +
            `• Try \`/verse John 3:16\` to look up scripture\n` +
            `• Use \`/votd\` for the daily verse\n` +
            `• Check out \`/help\` for all bot commands`
          )
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: customConfig.footer || botName })
          .setTimestamp();

        await channel.send({ embeds: [welcomeEmbed] });
        console.log(`[WELCOME] ${member.user.username} joined ${communityName}`);
      }
    } catch (error) {
      logger.error('WELCOME', `Failed to send welcome message for ${member.user.username}`, {
        error: error.message,
      });
    }
  }

  // Send welcome DM with a personalized verse
  if (config.welcomeDmEnabled) {
    try {
      const randomRef = WELCOME_VERSES[Math.floor(Math.random() * WELCOME_VERSES.length)];
      const verse = await bibleService.getVerse(randomRef, config.defaultTranslation);

      const dmEmbed = new EmbedBuilder()
        .setColor(0xD4A017)
        .setTitle(`⚒️ Welcome to ${communityName}!`)
        .setDescription(
          `Hey ${member.user.username}! Welcome — we're so glad you're here.\n\n` +
          `Here's a verse for you:\n\n` +
          (verse
            ? `📖 *${verse.text}*\n— **${verse.reference}** (${verse.translation})\n\n`
            : '') +
          `**Quick Start:**\n` +
          `• Use \`/verse John 3:16\` to look up any scripture\n` +
          `• Use \`/votd\` for the daily verse (build a streak!)\n` +
          `• Use \`/prayer\` to submit a private prayer request\n` +
          `• Use \`/help\` for the full command list\n\n` +
          `God bless you! 🙏`
        )
        .setFooter({ text: customConfig.footer || botName });

      await member.send({ embeds: [dmEmbed] });
      console.log(`[WELCOME DM] Sent welcome verse to ${member.user.username}: ${randomRef}`);
    } catch (error) {
      if (error.code === 50007) {
        console.log(`[WELCOME DM] ${member.user.username} has DMs disabled — skipped`);
      } else {
        logger.error('WELCOME-DM', `Failed to DM ${member.user.username}`, {
          error: error.message,
        });
      }
    }
  }
});

// ========================================
// AUTOMATED FEATURES
// ========================================

async function postVerseOfTheDay() {
  try {
    const channel = await discordClient.channels.fetch(config.votdChannelId);
    if (!channel) return;

    const result = await bibleService.getVerseOfTheDay(config.defaultTranslation);
    if (!result) return;

    const embed = new EmbedBuilder()
      .setColor(0xD4A017)
      .setTitle('📖 Verse of the Day')
      .setDescription(`*${result.text}*`)
      .addFields({ name: '📍 Reference', value: `**${result.reference}** (${result.translation})`, inline: false })
      .setFooter({ text: `${botName} | New verse every morning` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    console.log(`[VOTD] Posted: ${result.reference}`);
  } catch (error) {
    logger.error('VOTD', `Failed to post verse of the day`, {
      error: error.message,
    });
  }
}

// ========================================
// LOGGING
// ========================================

function logCommand(username, command, channelName) {
  logger.command('DISCORD', username, command, channelName);
}

// ========================================
// CONNECT & SHUTDOWN
// ========================================

process.on('SIGINT', () => {
  console.log('');
  console.log(`🛑 Shutting down ${botName}...`);
  storage.flushAll();
  discordClient.destroy();
  console.log('👋 Disconnected from Discord. God bless!');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error('DISCORD', 'Unhandled promise rejection', {
    error: reason?.message || String(reason),
  });
});

discordClient.login(config.discordToken).catch(err => {
  console.error('❌ Failed to connect to Discord:', err.message);
  console.error('');
  console.error('Common fixes:');
  console.error('  1. Check your DISCORD_BOT_TOKEN in .env');
  console.error('  2. Make sure the bot has been invited to your server');
  console.error('  3. Ensure the bot has the correct intents enabled in Discord Developer Portal');
  console.error('     (SERVER MEMBERS INTENT and MESSAGE CONTENT INTENT must be ON)');
  console.error('');
  console.error('Run "npm run setup" for guided configuration!');
  process.exit(1);
});
