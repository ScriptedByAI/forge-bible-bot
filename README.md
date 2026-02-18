# Forge Bible Bot

**A free, open-source Bible bot for Twitch & Discord — built for Christian content creators and online ministries.**

Forge Bible Bot brings Scripture into your community with verse lookups, Bible trivia, daily devotionals, prayer requests, OBS stream overlays, and more. It's completely free, fully customizable, and built to help you share the Word wherever God has placed you.

> *"Let the word of Christ dwell in you richly."* — Colossians 3:16 (ESV)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

| Feature | Twitch | Discord | Description |
|---------|--------|---------|-------------|
| **Verse Lookup** | `!verse John 3:16` | `/verse John 3:16` | Look up any Bible verse, range, or multi-reference |
| **Auto-Detect** | ✅ | ✅ | Type "John 3:16" naturally and the bot responds |
| **Chapter Reading** | `!read Psalm 23` | `/read Psalm 23` | Read full chapters with smart pagination |
| **Keyword Search** | `!search grace` | `/search grace` | Search the Bible by keyword (ESV API) |
| **Cross-References** | `!xref` | `/xref` | Find related passages for deeper study |
| **Verse of the Day** | `!votd` | `/votd` | Daily verse with streak tracking |
| **Daily Streaks** | `!streak` | `/streak` | Track consecutive VOTD check-ins |
| **Bookmarks** | `!save` / `!saved` | `/save` / `/saved` | Save favorite verses permanently |
| **Bible Trivia** | `!trivia` | `/trivia` | 190 questions (easy/medium/hard) with leaderboard |
| **The Gospel** | `!gospel` | `/gospel` | Clear Gospel presentation (English + Spanish) |
| **Prayer Requests** | `!prayer` | `/prayer` | Public, private, and anonymous prayer options |
| **Stream Topic** | `!topic` | `/topic` | Set a study focus with auto-reminders |
| **OBS Overlay** | ✅ | — | Beautiful on-screen verse display for streams |
| **Welcome DMs** | — | ✅ | Greet new members with a personal verse |
| **Scheduled VOTD** | — | ✅ | Auto-post Verse of the Day every morning |
| **7 Translations** | ✅ | ✅ | ESV, KJV, NKJV, NLT, NASB, NIV, WEB |

---

## Quick Start (5 Minutes)

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A Twitch account** and/or **Discord server** (you need at least one)

### Step 1: Download

```bash
git clone https://github.com/ScriptedByAI/forge-bible-bot.git
cd forge-bible-bot
npm install
```

### Step 2: Configure

**Option A — Setup Wizard (recommended):**
```bash
npm run setup
```
The wizard walks you through everything interactively.

**Option B — Manual Setup:**
```bash
cp .env.example .env
```
Then edit `.env` with your API keys (see [Configuration Guide](#-configuration-guide) below).

### Step 3: Run

```bash
npm start
```

That's it! The bot will start on whichever platforms you configured.

---

## Configuration Guide

### Getting Your API Keys

#### Twitch Bot Setup

1. **Create a Twitch account** for your bot (or use your own)
2. **Get an OAuth token** at [twitchapps.com/tmi](https://twitchapps.com/tmi/) — log in with the bot account
3. Add to `.env`:
   ```
   TWITCH_USERNAME=your_bot_name
   TWITCH_OAUTH=oauth:your_token_here
   TWITCH_CHANNELS=your_channel_name
   ```

#### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → give it a name → click **Bot** in the sidebar
3. Click **Reset Token** → copy the token
4. Enable these **Privileged Gateway Intents**:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
5. Go to **OAuth2** → **URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Embed Links`, `Read Message History`, `Use Slash Commands`
6. Copy the generated URL and open it to invite the bot to your server
7. Add to `.env`:
   ```
   DISCORD_BOT_TOKEN=your_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_GUILD_ID=your_server_id_here
   ```

> **Tip:** Right-click your server icon → Copy Server ID. Enable Developer Mode in Discord Settings → Advanced if you don't see this option.

#### ESV Bible API (Optional but Recommended)

1. Go to [api.esv.org](https://api.esv.org/) and create a free account
2. Request an API key (approved quickly)
3. Add to `.env`:
   ```
   ESV_API_KEY=your_key_here
   ```

> **Without the ESV key**, the bot still works! It falls back to a free API (bible-api.com) which provides the WEB translation. The ESV key unlocks ESV text, keyword search, and cross-references.

### Getting Channel IDs (Discord)

1. Open Discord Settings → Advanced → enable **Developer Mode**
2. Right-click any channel → **Copy Channel ID**
3. Add to `.env`:
   ```
   DISCORD_VOTD_CHANNEL_ID=123456789012345678
   DISCORD_WELCOME_CHANNEL_ID=123456789012345678
   DISCORD_PRAYER_CHANNEL_ID=123456789012345678
   ```

---

## Customization

### custom-commands.json

This file controls all the personal/ministry content in your bot. Edit it to make the bot yours:

```json
{
  "about": {
    "title": "Grace Community Church",
    "description": "A Christ-centered community for faith and fellowship.",
    "twitch_url": "https://twitch.tv/yourchannel",
    "activities": "Bible studies, worship, gaming, and prayer"
  },

  "testimony": {
    "enabled": true,
    "title": "Pastor Dave's Testimony",
    "description": "How God transformed my life from darkness to light.",
    "link_url": "https://yoursite.com/testimony",
    "link_text": "Read the Full Story"
  },

  "ministry": {
    "enabled": true,
    "command_name": "outreach",
    "title": "Community Outreach",
    "description": "Join us every Saturday as we serve our neighbors!",
    "verse": "Let your light shine before others",
    "verse_ref": "Matthew 5:16 (ESV)"
  },

  "prayer": {
    "public_channel": "#prayer-requests",
    "anonymous_form_url": "https://forms.google.com/your-form",
    "crisis_info": "If you're in crisis, call **988** or text **HOME** to **741741**."
  },

  "support": {
    "enabled": true,
    "message": "This bot is free! If it blesses your ministry, consider supporting development:",
    "url": "https://streamelements.com/forgedbygrace7/tip"
  },

  "footer": "Grace Community | Jesus is Lord!"
}
```

**What each section does:**

| Section | Creates Command | Description |
|---------|----------------|-------------|
| `about` | `/about` / `!about` | Your community info |
| `testimony` | `/testimony` / `!testimony` | Your testimony (enable/disable) |
| `ministry` | Custom name! | Your ministry info with custom command name |
| `prayer` | `/prayer` / `!prayer` | Prayer request options |
| `support` | `/support` / `!support` | Donation/support link |
| `footer` | — | Footer text on all Discord embeds |

### .env Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `BOT_NAME` | Forge Bible Bot | Display name in console and messages |
| `COMMUNITY_NAME` | *(BOT_NAME)* | Used in welcome messages |
| `DEFAULT_TRANSLATION` | esv | Default Bible version |
| `COMMAND_PREFIX` | ! | Twitch command prefix |
| `COMMAND_COOLDOWN` | 3 | Seconds between commands per user |
| `DISCORD_AUTO_DETECT` | true | Auto-lookup verse references in Discord |
| `WELCOME_DM` | true | DM new Discord members with a verse |
| `OBS_OVERLAY` | true | Enable OBS browser source |
| `OBS_OVERLAY_PORT` | 3000 | Port for overlay server |
| `TOPIC_REMINDER_MINUTES` | 15 | Repeat topic reminder interval (0 = off) |

---

## 📺 OBS Overlay Setup

The bot includes a built-in overlay for displaying verses on your stream.

1. Make sure `OBS_OVERLAY=true` in your `.env`
2. In OBS, add a **Browser Source**:
   - URL: `http://localhost:3000/overlay`
   - Width: `1920`
   - Height: `1080`
3. When someone looks up a verse in Twitch chat, it appears on screen!

The overlay auto-fades after display. The styling is fully customizable by editing `src/overlay/index.html`.

---

## 📁 Project Structure

```
forge-bible-bot/
├── start.js                  # Unified launcher
├── setup-wizard.js           # Guided first-time setup
├── .env.example              # Configuration template
├── custom-commands.json      # Your personalized bot content
├── package.json
├── LICENSE
│
├── src/
│   ├── index.js              # Twitch bot entry point
│   ├── discord-bot.js        # Discord bot entry point
│   ├── commands.js            # Twitch command handlers
│   ├── discord-commands.js    # Discord slash command handlers
│   ├── bible-service.js       # ESV API + fallback integration
│   ├── verse-parser.js        # Reference detection & parsing
│   ├── trivia.js              # 190-question trivia engine
│   ├── storage.js             # Persistent JSON storage
│   ├── custom-config.js       # Custom commands config loader
│   ├── obs-overlay.js         # SSE overlay server
│   ├── logger.js              # Structured logging
│   └── overlay/
│       └── index.html         # OBS browser source template
│
└── data/                      # Auto-created: user data, scores, preferences
```

---

## Running Options

```bash
# Start all configured bots
npm start

# Start only Twitch
npm run twitch

# Start only Discord
npm run discord

# Run setup wizard
npm run setup
```

---

## Bible Trivia

The bot includes **190 Bible trivia questions** across three difficulty levels:

- 🟢 **Easy** (50 questions) — Great for newcomers
- 🟡 **Medium** (70 questions) — Solid Bible knowledge
- 🔴 **Hard** (70 questions) — Deep-cut questions

Features:
- **Flexible answer matching** — handles typos, partial answers, and common variations
- **No repeat questions** — tracks last 20 asked per channel
- **30-second timer** with automatic expiration
- **Persistent leaderboard** — scores saved across sessions

---

## Contributing

Contributions are welcome! Whether it's adding trivia questions, fixing bugs, improving translations, or suggesting features — all help is appreciated.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/new-trivia-questions`
3. Commit your changes: `git commit -m 'Add 20 new trivia questions'`
4. Push: `git push origin feature/new-trivia-questions`
5. Open a Pull Request

---

## 💛 Support

Forge Bible Bot is **free for all Christian ministries** and always will be.

If this tool has been a blessing to your community, you can support continued development and server costs:

**[Support the Project](https://streamelements.com/forgedbygrace7/tip)**

---

## License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## ✝️ Built by ForgedByGrace7

Marine veteran. Redeemed by Jesus. Building tools for the Kingdom.

*"As iron sharpens iron, so one man sharpens another."* — Proverbs 27:17 (ESV)

**[Twitch](https://twitch.tv/forgedbygrace7)** · **[GitHub](https://github.com/ScriptedByAI)** · **[Discord](https://discord.gg/7bP4p8a2cX)**
