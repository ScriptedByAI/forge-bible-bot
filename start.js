// ============================================
// start.js — Unified launcher for Forge Bible Bot
// ============================================

const { execSync, fork } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if .env exists
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  ⚒️  Forge Bible Bot — First Run!');
  console.log('══════════════════════════════════════════');
  console.log('');
  console.log('No .env file found. Let\'s get you set up!');
  console.log('');
  console.log('  Option 1: Run the setup wizard');
  console.log('    → npm run setup');
  console.log('');
  console.log('  Option 2: Manual setup');
  console.log('    → Copy .env.example to .env');
  console.log('    → Fill in your API keys and settings');
  console.log('    → Run npm start');
  console.log('');
  process.exit(0);
}

require('dotenv').config();

const botName = process.env.BOT_NAME || 'Forge Bible Bot';
const arg = process.argv[2]?.toLowerCase();

console.log('');
console.log('══════════════════════════════════════════');
console.log(`  ⚒️  ${botName} — Launcher`);
console.log('  ✝️  Jesus is Lord!');
console.log('══════════════════════════════════════════');
console.log('');

const hasTwitch = process.env.TWITCH_USERNAME && process.env.TWITCH_USERNAME !== 'YOUR_TWITCH_USERNAME';
const hasDiscord = process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_TOKEN !== 'YOUR_DISCORD_BOT_TOKEN';

if (arg === 'twitch') {
  if (!hasTwitch) {
    console.error('❌ Twitch credentials not configured. Check your .env file.');
    process.exit(1);
  }
  console.log('🟣 Starting Twitch bot only...');
  console.log('');
  require('./src/index');
} else if (arg === 'discord') {
  if (!hasDiscord) {
    console.error('❌ Discord credentials not configured. Check your .env file.');
    process.exit(1);
  }
  console.log('🟦 Starting Discord bot only...');
  console.log('');
  require('./src/discord-bot');
} else {
  // Default: start whichever bots are configured
  const launching = [];

  if (hasTwitch) launching.push('Twitch');
  if (hasDiscord) launching.push('Discord');

  if (launching.length === 0) {
    console.error('❌ No bot credentials found in .env!');
    console.error('');
    console.error('Configure at least one:');
    console.error('  • Twitch: Set TWITCH_USERNAME, TWITCH_OAUTH, TWITCH_CHANNELS');
    console.error('  • Discord: Set DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID');
    console.error('');
    console.error('Run "npm run setup" for guided configuration!');
    process.exit(1);
  }

  console.log(`🚀 Launching: ${launching.join(' + ')}`);
  console.log('');

  if (hasTwitch && hasDiscord) {
    // Both configured — fork the Discord bot as a child process
    const discordChild = fork(path.join(__dirname, 'src', 'discord-bot.js'), [], {
      stdio: 'inherit'
    });

    discordChild.on('error', (err) => {
      console.error('❌ Discord bot process error:', err.message);
    });

    // Load Twitch in this process
    require('./src/index');
  } else if (hasTwitch) {
    require('./src/index');
  } else {
    require('./src/discord-bot');
  }
}
