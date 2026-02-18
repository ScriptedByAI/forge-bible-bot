#!/usr/bin/env node
// ============================================
// setup-wizard.js — Guided setup for Forge Bible Bot
// ============================================
// "Trust in the LORD with all your heart,
//  and do not lean on your own understanding."
// — Proverbs 3:5 (ESV)

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = '') {
  const defaultHint = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`  ${question}${defaultHint}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askYesNo(question, defaultYes = true) {
  const hint = defaultYes ? '(Y/n)' : '(y/N)';
  return new Promise((resolve) => {
    rl.question(`  ${question} ${hint}: `, (answer) => {
      const a = answer.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

async function main() {
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  ⚒️  Forge Bible Bot — Setup Wizard');
  console.log('  ✝️  Let\'s get your Bible bot running!');
  console.log('══════════════════════════════════════════════════════');
  console.log('');
  console.log('  This wizard will help you create your .env config file.');
  console.log('  Press Enter to accept defaults (shown in parentheses).');
  console.log('  You can always edit .env later to change settings.');
  console.log('');

  const config = {};

  // ── Bot Name ──
  console.log('─── Bot Identity ───');
  config.BOT_NAME = await ask('Bot display name', 'Forge Bible Bot');
  config.COMMUNITY_NAME = await ask('Your community name (for welcomes)', '');
  console.log('');

  // ── Twitch ──
  console.log('─── Twitch Bot (optional — press Enter to skip) ───');
  console.log('  Get your OAuth token at: https://twitchapps.com/tmi/');
  config.TWITCH_USERNAME = await ask('Twitch bot username');
  
  if (config.TWITCH_USERNAME) {
    config.TWITCH_OAUTH = await ask('Twitch OAuth token');
    config.TWITCH_CHANNELS = await ask('Channel(s) to join (comma-separated)', config.TWITCH_USERNAME);
  } else {
    config.TWITCH_USERNAME = '';
    config.TWITCH_OAUTH = '';
    config.TWITCH_CHANNELS = '';
  }
  console.log('');

  // ── Discord ──
  console.log('─── Discord Bot (optional — press Enter to skip) ───');
  console.log('  Create a bot at: https://discord.com/developers/applications');
  config.DISCORD_BOT_TOKEN = await ask('Discord bot token');
  
  if (config.DISCORD_BOT_TOKEN) {
    config.DISCORD_CLIENT_ID = await ask('Discord client/application ID');
    config.DISCORD_GUILD_ID = await ask('Your Discord server ID (right-click server → Copy Server ID)', '');
    
    console.log('');
    console.log('  Channel IDs (right-click channel → Copy Channel ID):');
    config.DISCORD_VOTD_CHANNEL_ID = await ask('  Verse of the Day channel ID (optional)');
    config.DISCORD_WELCOME_CHANNEL_ID = await ask('  Welcome channel ID (optional)');
    config.DISCORD_PRAYER_CHANNEL_ID = await ask('  Prayer request channel ID (optional)');
  } else {
    config.DISCORD_BOT_TOKEN = '';
    config.DISCORD_CLIENT_ID = '';
    config.DISCORD_GUILD_ID = '';
    config.DISCORD_VOTD_CHANNEL_ID = '';
    config.DISCORD_WELCOME_CHANNEL_ID = '';
    config.DISCORD_PRAYER_CHANNEL_ID = '';
  }
  console.log('');

  // ── Bible API ──
  console.log('─── Bible API ───');
  console.log('  Free ESV API key: https://api.esv.org/');
  console.log('  (Optional — the bot works without it using a free fallback)');
  config.ESV_API_KEY = await ask('ESV API key (optional)');
  config.DEFAULT_TRANSLATION = await ask('Default Bible translation', 'esv');
  console.log('');

  // ── Settings ──
  console.log('─── Bot Settings ───');
  config.COMMAND_PREFIX = await ask('Command prefix for Twitch', '!');
  config.COMMAND_COOLDOWN = await ask('Cooldown between commands (seconds)', '3');
  
  const autoDetect = await askYesNo('Auto-detect Bible references in Discord messages?', true);
  config.DISCORD_AUTO_DETECT = autoDetect ? 'true' : 'false';

  const welcomeDm = await askYesNo('Send welcome DMs to new Discord members?', true);
  config.WELCOME_DM = welcomeDm ? 'true' : 'false';
  console.log('');

  // ── OBS ──
  console.log('─── OBS Overlay (for Twitch streamers) ───');
  const obsEnabled = await askYesNo('Enable OBS browser source overlay?', true);
  config.OBS_OVERLAY = obsEnabled ? 'true' : 'false';
  config.OBS_OVERLAY_PORT = obsEnabled ? await ask('Overlay port', '3000') : '3000';
  console.log('');

  // ── Ministry Info ──
  console.log('─── Your Ministry (optional) ───');
  config.TWITCH_CHANNEL_URL = await ask('Your Twitch channel URL (optional)');
  config.PRAYER_FORM_URL = await ask('Anonymous prayer form URL (optional)');
  console.log('');

  // ── Validation ──
  if (!config.TWITCH_USERNAME && !config.DISCORD_BOT_TOKEN) {
    console.log('⚠️  Warning: You haven\'t configured either Twitch or Discord.');
    console.log('   The bot needs at least one platform to work!');
    console.log('   You can edit .env later to add credentials.');
    console.log('');
  }

  // ── Write .env file ──
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    const overwrite = await askYesNo('A .env file already exists. Overwrite it?', false);
    if (!overwrite) {
      console.log('');
      console.log('Setup cancelled. Your existing .env was not modified.');
      rl.close();
      return;
    }
  }

  const envContent = `# ══════════════════════════════════════════════════════════════
#  Forge Bible Bot — Configuration
#  Generated by setup wizard on ${new Date().toLocaleDateString()}
# ══════════════════════════════════════════════════════════════

# Bot Identity
BOT_NAME=${config.BOT_NAME}
COMMUNITY_NAME=${config.COMMUNITY_NAME}

# Twitch
TWITCH_USERNAME=${config.TWITCH_USERNAME}
TWITCH_OAUTH=${config.TWITCH_OAUTH}
TWITCH_CHANNELS=${config.TWITCH_CHANNELS}

# Discord
DISCORD_BOT_TOKEN=${config.DISCORD_BOT_TOKEN}
DISCORD_CLIENT_ID=${config.DISCORD_CLIENT_ID}
DISCORD_GUILD_ID=${config.DISCORD_GUILD_ID}
DISCORD_VOTD_CHANNEL_ID=${config.DISCORD_VOTD_CHANNEL_ID}
DISCORD_WELCOME_CHANNEL_ID=${config.DISCORD_WELCOME_CHANNEL_ID}
DISCORD_PRAYER_CHANNEL_ID=${config.DISCORD_PRAYER_CHANNEL_ID}

# Bible API
ESV_API_KEY=${config.ESV_API_KEY}
DEFAULT_TRANSLATION=${config.DEFAULT_TRANSLATION}

# Bot Settings
COMMAND_PREFIX=${config.COMMAND_PREFIX}
COMMAND_COOLDOWN=${config.COMMAND_COOLDOWN}
DISCORD_AUTO_DETECT=${config.DISCORD_AUTO_DETECT}
WELCOME_DM=${config.WELCOME_DM}

# OBS Overlay
OBS_OVERLAY=${config.OBS_OVERLAY}
OBS_OVERLAY_PORT=${config.OBS_OVERLAY_PORT}

# Ministry Info
TWITCH_CHANNEL_URL=${config.TWITCH_CHANNEL_URL}
PRAYER_FORM_URL=${config.PRAYER_FORM_URL}

# Topic reminder interval in minutes (0 to disable)
TOPIC_REMINDER_MINUTES=15
`;

  fs.writeFileSync(envPath, envContent);

  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('  ✅ Setup Complete!');
  console.log('══════════════════════════════════════════════════════');
  console.log('');
  console.log('  Your .env file has been created.');
  console.log('');
  console.log('  Next steps:');
  console.log('');
  console.log('    1. Install dependencies (if you haven\'t already):');
  console.log('       → npm install');
  console.log('');
  console.log('    2. (Optional) Customize bot responses:');
  console.log('       → Edit custom-commands.json');
  console.log('');
  console.log('    3. Start the bot:');
  console.log('       → npm start');
  console.log('');

  if (config.OBS_OVERLAY === 'true') {
    console.log(`    4. Add OBS overlay (optional):');
       → Add Browser Source → URL: http://localhost:${config.OBS_OVERLAY_PORT}/overlay`);
    console.log('');
  }

  console.log('  For full documentation, see README.md');
  console.log('');
  console.log('  God bless your ministry! ✝️');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Setup error:', err.message);
  rl.close();
  process.exit(1);
});
