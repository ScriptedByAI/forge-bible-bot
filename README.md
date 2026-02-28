# Forge Bible Bot

**A free Bible bot for Twitch & Discord — built for Christian content creators and online ministries.**

Forge Bible Bot brings Scripture into your community with verse lookups, Bible trivia, daily devotionals, prayer requests, OBS stream overlays, and more. Completely free, fully customizable, and built to help you share the Word wherever God has placed you.

> *"Let the word of Christ dwell in you richly."* — Colossians 3:16 (ESV)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⚡ Get Started Instantly — No Setup Required

### **[forgebiblebot.com](https://forgebiblebot.com)**

The **hosted version** is the recommended way to use Forge Bible Bot. Sign in with Twitch or Discord, and the bot joins your channel automatically. Free forever — no downloads, no servers, no technical skills needed.

The hosted version is **actively developed** and includes:

- Full web dashboard for managing your bot
- All the latest features, commands, and translations
- Automatic updates — you always have the newest version
- Managed infrastructure — no server maintenance on your end
- Priority support via [The Forge Discord](https://discord.gg/7bP4p8a2cX)

**If you're looking for the best Forge Bible Bot experience, [forgebiblebot.com](https://forgebiblebot.com) is the way to go.**

---

## ⚠️ About This Repository (Self-Hosted Version)

This open-source repo contains a **basic, standalone version** of Forge Bible Bot. It is functional but **does not include many of the advanced features available on the hosted version** and **is not actively maintained or updated** to match the hosted platform.

**What this means for you:**

- This repo reflects an **earlier snapshot** of the bot — it works, but it's limited compared to what's available at [forgebiblebot.com](https://forgebiblebot.com)
- New features, improvements, and bug fixes go to the **hosted version first** (and in most cases, exclusively)
- If you run into issues with the self-hosted version, we may not be able to provide support — our focus is on the hosted platform
- You're welcome to fork and modify this code under the MIT license, but don't expect it to keep pace with the hosted version

**We strongly recommend using the [hosted version](https://forgebiblebot.com) unless you have a specific reason to self-host.**

---

## Self-Hosted Features (This Repo)

| Feature | Twitch | Discord | Description |
|---------|--------|---------|-------------|
| **Verse Lookup** | `!verse John 3:16` | `/verse John 3:16` | Any verse, range, or multi-reference |
| **Auto-Detect** | ✅ | ✅ | Type "John 3:16" naturally and the bot responds |
| **Chapter Reading** | `!read Psalm 23` | `/read Psalm 23` | Full chapters with smart pagination |
| **Keyword Search** | `!search grace` | `/search grace` | Search the Bible by keyword (ESV API) |
| **Cross-References** | `!xref` | `/xref` | Find related passages for deeper study |
| **Verse of the Day** | `!votd` | `/votd` | Daily verse with streak tracking |
| **Bookmarks** | `!save` / `!saved` | `/save` / `/saved` | Save favorite verses permanently |
| **Bible Trivia** | `!trivia` | `/trivia` | 190 questions across 3 difficulties |
| **The Gospel** | `!gospel` | `/gospel` | Gospel presentation (English + Spanish) |
| **Prayer Requests** | `!prayer` | `/prayer` | Public, private, and anonymous options |
| **Stream Topic** | `!topic` | `/topic` | Study focus with auto-reminders |
| **OBS Overlay** | ✅ | — | On-screen verse display for streams |
| **Welcome DMs** | — | ✅ | Greet new Discord members with a verse |
| **Scheduled VOTD** | — | ✅ | Auto-post Verse of the Day daily |
| **7 Translations** | ✅ | ✅ | ESV, KJV, NKJV, NLT, NASB, NIV, WEB |

> **Looking for more?** The [hosted version](https://forgebiblebot.com) has additional features, commands, and integrations not available in this repo.

---

## Quick Start (Self-Hosted)

> **Reminder:** The easiest and most feature-rich way to use Forge Bible Bot is the [hosted version](https://forgebiblebot.com). The instructions below are for those who want to run a basic self-hosted instance.

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **A Twitch account** and/or **Discord server**

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

**Option B — Manual:**
```bash
cp .env.example .env
```
Then edit `.env` with your API keys (see below).

### Step 3: Run

```bash
npm start
```

---

### Getting Your API Keys

#### Twitch Bot Setup

1. Create a Twitch account for your bot (or use your own)
2. Get an OAuth token at [twitchapps.com/tmi](https://twitchapps.com/tmi/)
3. Add to `.env`:
   ```
   TWITCH_USERNAME=your_bot_name
   TWITCH_OAUTH=oauth:your_token_here
   TWITCH_CHANNELS=your_channel_name
   ```

#### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a New Application → click **Bot** → **Reset Token** → copy it
3. Enable **SERVER MEMBERS INTENT** and **MESSAGE CONTENT INTENT**
4. Go to **OAuth2** → **URL Generator**: Scopes: `bot`, `applications.commands`. Permissions: `Send Messages`, `Embed Links`, `Read Message History`, `Use Slash Commands`
5. Open the generated URL to invite the bot to your server
6. Add to `.env`:
   ```
   DISCORD_BOT_TOKEN=your_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_GUILD_ID=your_server_id_here
   ```

> **Tip:** Right-click your server → Copy Server ID. Enable Developer Mode in Discord Settings → Advanced.

#### ESV Bible API (Optional but Recommended)

1. Go to [api.esv.org](https://api.esv.org/) and create a free account
2. Request an API key
3. Add to `.env`:
   ```
   ESV_API_KEY=your_key_here
   ```

> Without the ESV key, the bot falls back to the WEB translation via bible-api.com. The ESV key unlocks ESV text, keyword search, and cross-references.

---

### Customization

#### custom-commands.json

Edit this file to personalize the bot for your ministry:

```json
{
  "about": {
    "title": "Your Community Name",
    "description": "A Christ-centered community for faith and fellowship.",
    "twitch_url": "https://twitch.tv/yourchannel",
    "activities": "Bible studies, worship, gaming, and prayer"
  },
  "testimony": {
    "enabled": true,
    "title": "My Testimony",
    "description": "How God transformed my life.",
    "link_url": "https://yoursite.com/testimony"
  },
  "prayer": {
    "public_channel": "#prayer-requests",
    "anonymous_form_url": "https://forms.google.com/your-form",
    "crisis_info": "If you're in crisis, call **988** or text **HOME** to **741741**."
  },
  "footer": "Your Community | Jesus is Lord!"
}
```

#### .env Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `BOT_NAME` | Forge Bible Bot | Display name |
| `DEFAULT_TRANSLATION` | esv | Default Bible version |
| `COMMAND_PREFIX` | ! | Twitch command prefix |
| `COMMAND_COOLDOWN` | 3 | Seconds between commands per user |
| `DISCORD_AUTO_DETECT` | true | Auto-lookup verse references |
| `WELCOME_DM` | true | DM new Discord members |
| `OBS_OVERLAY` | true | Enable OBS browser source |
| `OBS_OVERLAY_PORT` | 3000 | Port for overlay server |

---

### OBS Overlay Setup

1. Set `OBS_OVERLAY=true` in your `.env`
2. In OBS, add a **Browser Source**: URL `http://localhost:3000/overlay`, 1920x1080
3. Verses appear on-screen when looked up in Twitch chat

---

### Running Options

```bash
npm start           # Start all configured bots
npm run twitch      # Twitch only
npm run discord     # Discord only
npm run setup       # Run setup wizard
```

---

### Project Structure

```
forge-bible-bot/
├── start.js                  # Unified launcher
├── setup-wizard.js           # Guided first-time setup
├── .env.example              # Configuration template
├── custom-commands.json      # Personalized bot content
├── src/
│   ├── index.js              # Twitch bot
│   ├── discord-bot.js        # Discord bot
│   ├── commands.js           # Twitch command handlers
│   ├── discord-commands.js   # Discord slash commands
│   ├── bible-service.js      # ESV API + fallback
│   ├── verse-parser.js       # Reference detection
│   ├── trivia.js             # 190-question trivia engine
│   ├── storage.js            # Persistent storage
│   ├── obs-overlay.js        # SSE overlay server
│   └── overlay/index.html    # OBS browser source
└── data/                     # Auto-created user data
```

---

## Contributing

This repo is open source under the MIT license. You're welcome to fork it, modify it, and use it however serves your ministry. However, please note that pull requests may not be actively reviewed, as development efforts are focused on the [hosted platform](https://forgebiblebot.com).

---

## 💛 Support

Forge Bible Bot is **free for all Christian ministries** and always will be.

If this tool has blessed your community, you can support continued development:

**[❤️ Support the Project](https://streamelements.com/forgedbygrace7/tip)**

---

## Community

- **[📺 Twitch](https://www.twitch.tv/forgedbygrace7)** — Live streams, faith, gaming, and honest conversations
- **[💬 Discord](https://discord.gg/7bP4p8a2cX)** — The Forge — fellowship, prayer, Bible study, and bot support
- **[🌐 Website](https://forgebiblebot.com)** — Hosted version with instant setup

---

## License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

### ✝️ Built by ForgedByGrace7

Marine veteran. Redeemed by Jesus. Building tools for the Kingdom.

*"As iron sharpens iron, so one man sharpens another."* — Proverbs 27:17 (ESV)
