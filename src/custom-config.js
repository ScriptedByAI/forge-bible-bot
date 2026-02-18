// ============================================
// custom-config.js — Loads custom bot configuration
// ============================================
// Reads custom-commands.json for personalized bot responses.
// Falls back to sensible defaults if the file is missing or invalid.
//
// "For we are his workmanship, created in Christ Jesus for good works"
// — Ephesians 2:10 (ESV)

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'custom-commands.json');

let _config = null;

/**
 * Load custom commands config. Caches on first read.
 * @returns {object} The custom commands configuration
 */
function loadConfig() {
  if (_config) return _config;

  const defaults = {
    about: {
      title: 'About This Community',
      description: 'A community for faith, fellowship, and the Word of God.\n\nEveryone is welcome here — no matter where you are in your journey.\n\n*"Therefore, if anyone is in Christ, he is a new creation."*\n— **2 Corinthians 5:17 (ESV)**',
      twitch_url: '',
      activities: 'Bible studies, fellowship, and prayer',
    },
    testimony: {
      enabled: false,
      title: 'My Testimony',
      description: 'Want to hear how God changed my life? Ask in chat!',
      link_url: '',
      link_text: 'Read My Testimony',
    },
    ministry: {
      enabled: false,
      command_name: 'ministry',
      title: 'Our Ministry',
      description: 'Learn more about what God is doing through this community.',
      verse: 'As iron sharpens iron, so one man sharpens another.',
      verse_ref: 'Proverbs 27:17 (ESV)',
    },
    prayer: {
      public_channel: '#prayer-requests',
      anonymous_form_url: '',
      crisis_info: "If you're in crisis, please call **988** or text **HOME** to **741741**.",
    },
    support: {
      enabled: true,
      message: 'Forge Bible Bot is free for all Christian ministries. If it\'s been a blessing, consider supporting the project:',
      url: 'https://streamelements.com/forgedbygrace7/tip',
    },
    footer: 'Forge Bible Bot | Jesus is Lord!',
  };

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      const parsed = JSON.parse(raw);

      // Deep merge with defaults (one level)
      _config = { ...defaults };
      for (const key of Object.keys(defaults)) {
        if (parsed[key] && typeof parsed[key] === 'object' && typeof defaults[key] === 'object') {
          _config[key] = { ...defaults[key], ...parsed[key] };
        } else if (parsed[key] !== undefined) {
          _config[key] = parsed[key];
        }
      }

      console.log('📝 Loaded custom-commands.json');
    } else {
      console.log('ℹ️  No custom-commands.json found — using defaults. Run "npm run setup" to customize!');
      _config = defaults;
    }
  } catch (error) {
    console.warn('⚠️  Error reading custom-commands.json:', error.message);
    console.warn('   Using default configuration.');
    _config = defaults;
  }

  return _config;
}

/**
 * Reload config from disk (for hot-reloading if needed)
 */
function reloadConfig() {
  _config = null;
  return loadConfig();
}

module.exports = { loadConfig, reloadConfig };
