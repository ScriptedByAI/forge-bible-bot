// ============================================
// index.js — Forge Bible Bot (Twitch)
// ============================================
// "Every good gift and every perfect gift is from above, 
//  coming down from the Father of lights."
// — James 1:17 (ESV)

require('dotenv').config();
const tmi = require('tmi.js');
const BibleService = require('./bible-service');
const CommandHandler = require('./commands');
const Storage = require('./storage');
const TriviaGame = require('./trivia');
const OBSOverlay = require('./obs-overlay');
const { findReferenceInMessage } = require('./verse-parser');
const logger = require('./logger');

// ========================================
// CONFIGURATION
// ========================================

const config = {
  // Twitch credentials
  twitchUsername: process.env.TWITCH_USERNAME,
  twitchOAuth: process.env.TWITCH_OAUTH,
  twitchChannels: (process.env.TWITCH_CHANNELS || '')
    .split(',')
    .map(ch => ch.trim().toLowerCase())
    .filter(ch => ch.length > 0),

  // ESV API
  esvApiKey: process.env.ESV_API_KEY,

  // Bot settings
  commandPrefix: process.env.COMMAND_PREFIX || '!',
  defaultTranslation: (process.env.DEFAULT_TRANSLATION || 'esv').toLowerCase(),
  commandCooldown: parseInt(process.env.COMMAND_COOLDOWN) || 3,

  // OBS Overlay
  obsOverlayEnabled: process.env.OBS_OVERLAY !== 'false',
  obsOverlayPort: parseInt(process.env.OBS_OVERLAY_PORT) || 3000,

  // Topic reminder interval (minutes, 0 to disable)
  topicReminderInterval: parseInt(process.env.TOPIC_REMINDER_MINUTES) || 15,
};

// ========================================
// VALIDATION
// ========================================

function validateConfig() {
  const errors = [];

  if (!config.twitchUsername || config.twitchUsername === 'YOUR_TWITCH_USERNAME') {
    errors.push('TWITCH_USERNAME is not set in .env');
  }
  if (!config.twitchOAuth || config.twitchOAuth === 'oauth:YOUR_TOKEN_HERE') {
    errors.push('TWITCH_OAUTH is not set in .env — Get yours at https://twitchapps.com/tmi/');
  }
  if (config.twitchChannels.length === 0) {
    errors.push('TWITCH_CHANNELS is not set in .env');
  }
  if (!config.esvApiKey || config.esvApiKey === 'YOUR_ESV_API_KEY_HERE') {
    console.warn('⚠️  ESV_API_KEY not set — ESV lookups will fall back to bible-api.com (WEB translation)');
    console.warn('   Get a free ESV API key at: https://api.esv.org/');
    console.warn('');
    config.esvApiKey = null;
  }

  if (errors.length > 0) {
    console.error('');
    console.error('❌ Configuration errors:');
    errors.forEach(err => console.error(`   • ${err}`));
    console.error('');
    console.error('📋 Run "npm run setup" for guided configuration!');
    process.exit(1);
  }
}

// ========================================
// STARTUP
// ========================================

const botName = process.env.BOT_NAME || 'Forge Bible Bot';

console.log('');
console.log('══════════════════════════════════════════');
console.log(`  ⚒️  ${botName} — Twitch`);
console.log('  ✝️  Jesus is Lord!');
console.log('══════════════════════════════════════════');
console.log('');

validateConfig();

// Initialize services
const storage = new Storage();
const bibleService = new BibleService(config.esvApiKey);
const triviaGame = new TriviaGame(storage);

// Initialize OBS overlay (optional)
let obsOverlay = null;
if (config.obsOverlayEnabled) {
  obsOverlay = new OBSOverlay(config.obsOverlayPort);
  obsOverlay.start().catch(err => {
    console.warn('⚠️  OBS Overlay failed to start:', err.message);
    obsOverlay = null;
  });
}

const commandHandler = new CommandHandler(bibleService, config, storage, triviaGame, obsOverlay);

// Notify chat when trivia times out
triviaGame.onExpire = (channel, answer, ref) => {
  client.say(channel, `⏰ Time's up! The answer was "${answer}" (${ref}). Try again with !trivia!`).catch(() => {});
};
// ========================================
// TWITCH CLIENT
// ========================================

const client = new tmi.Client({
  options: {
    debug: false,
    messagesLogLevel: 'info'
  },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: config.twitchUsername,
    password: config.twitchOAuth
  },
  channels: config.twitchChannels
});

// ========================================
// EVENT HANDLERS
// ========================================

client.on('connected', (address, port) => {
  console.log(`✅ Connected to Twitch IRC at ${address}:${port}`);
  console.log(`📺 Joined channels: ${config.twitchChannels.join(', ')}`);
  console.log(`📖 Default translation: ${config.defaultTranslation.toUpperCase()}`);
  console.log(`🔑 ESV API: ${config.esvApiKey ? 'Active' : 'Not configured (using fallback)'}`);
  console.log(`📺 OBS Overlay: ${obsOverlay ? `Active on port ${config.obsOverlayPort}` : 'Disabled'}`);
  console.log(`💾 Persistent storage: Active`);
  console.log('');
  console.log(`  ${botName} is live! Waiting for messages...`);
  console.log('   Press Ctrl+C to stop the bot.');
  console.log('');

  // Set up topic reminder interval
  if (config.topicReminderInterval > 0) {
    setInterval(() => {
      const topic = commandHandler.getTopic();
      if (topic) {
        config.twitchChannels.forEach(channel => {
          client.say(channel, `📖 Current study topic: ${topic.reference} — Use !read ${topic.reference} to follow along!`);
        });
      }
    }, config.topicReminderInterval * 60 * 1000);
  }

  // Clear topic at midnight
  scheduleTopicReset();
});

client.on('disconnected', (reason) => {
  console.log(`⚠️  Disconnected: ${reason}`);
  console.log('   Attempting to reconnect...');
});

// Incoming chat message
client.on('message', async (channel, tags, message, self) => {
  if (self) return;
  if (!message || message.trim().length === 0) return;

  const username = tags['display-name'] || tags.username || 'Unknown';
  const trimmedMessage = message.trim();

  try {
    // ---- TRIVIA ANSWER CHECK ----
    // Check if there's an active trivia question and this message might be an answer
    if (triviaGame.isActive(channel)) {
      const result = triviaGame.checkAnswer(channel, trimmedMessage, username);
      if (result) {
        await client.say(channel,
          `✅ Correct, @${result.winner}! The answer is "${result.answer}" (${result.ref}). ` +
          `Score: ${result.score.correct}/${result.score.total} — answered in ${result.elapsed}s!`
        );
        return;
      }
    }

    // ---- COMMAND HANDLING ----
    if (trimmedMessage.startsWith(config.commandPrefix)) {
      const parts = trimmedMessage.split(/\s+/);
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      const reply = await commandHandler.handleCommand(command, args, username, channel);

      if (reply) {
        await client.say(channel, reply);
        logCommand(username, command, args, channel);
      }
      return;
    }

    // ---- AUTO VERSE DETECTION ----
    const detected = findReferenceInMessage(trimmedMessage);
    if (detected) {
      const translation = detected.translation
        || commandHandler.getTranslation(username)
        || config.defaultTranslation;

      const result = await bibleService.getVerse(detected.reference, translation);

      if (result) {
        bibleService.setUserLastVerse(username, detected.reference, translation);

        // Push to OBS overlay
        if (obsOverlay) {
          obsOverlay.sendVerse(result.reference, result.text, result.translation, username);
        }

        const reply = commandHandler.formatVerseReply(result, username);
        await client.say(channel, reply);
        logCommand(username, '[auto-detect]', [detected.reference], channel);
      }
    }
  } catch (error) {
    logger.error('TWITCH', `Failed to process message from ${username}`, {
      channel: channel,
      message: trimmedMessage.substring(0, 100),
      error: error.message,
    });
  }
});

// ========================================
// HELPERS
// ========================================

function logCommand(username, command, args, channel) {
  logger.command('TWITCH', username, `${command} ${args.join(' ')}`, channel.replace('#', ''));
}

/**
 * Schedule topic auto-clear at midnight Central time
 */
function scheduleTopicReset() {
  // Use Central timezone for consistency with VOTD schedule
  const nowCentral = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const midnightCentral = new Date(nowCentral);
  midnightCentral.setHours(24, 0, 0, 0);

  // Calculate ms until midnight Central
  const msUntilMidnight = midnightCentral.getTime() - nowCentral.getTime();

  setTimeout(() => {
    console.log('[TOPIC] Auto-clearing topic at midnight Central');
    commandHandler.clearTopic();
    // Schedule next reset every 24h
    setInterval(() => {
      commandHandler.clearTopic();
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

// ========================================
// CONNECT & SHUTDOWN
// ========================================

process.on('SIGINT', () => {
  console.log('');
  console.log(`🛑 Shutting down ${botName}...`);
  storage.flushAll(); // Save any pending data before exit
  if (obsOverlay) obsOverlay.stop();
  client.disconnect().then(() => {
    console.log('👋 Disconnected from Twitch. God bless!');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('TWITCH', 'Unhandled promise rejection', {
    error: reason?.message || String(reason),
  });
});

client.connect().catch(err => {
  console.error('❌ Failed to connect to Twitch:', err.message);
  console.error('');
  console.error('Common fixes:');
  console.error('  1. Check your TWITCH_OAUTH token — it may have expired');
  console.error('     Get a new one at: https://twitchapps.com/tmi/');
  console.error('  2. Check your TWITCH_USERNAME is correct');
  console.error('  3. Make sure you have an internet connection');
  console.error('');
  console.error('Run "npm run setup" for guided configuration!');
  process.exit(1);
});
