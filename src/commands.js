// ============================================
// commands.js — All Twitch bot commands
// ============================================
// Each command returns a string (the reply) or null (no reply).
//
// "Go therefore and make disciples of all nations"
// — Matthew 28:19 (ESV)

const { parseReference, parseMultiReference, TRANSLATIONS } = require('./verse-parser');
const { loadConfig } = require('./custom-config');

class CommandHandler {
  constructor(bibleService, config, storage, trivia, obsOverlay) {
    this.bible = bibleService;
    this.config = config;
    this.storage = storage;
    this.trivia = trivia;
    this.obsOverlay = obsOverlay;

    // Load custom command configuration
    this.custom = loadConfig();

    // In-memory topic for the stream session
    this.currentTopic = null;
    this.topicInterval = null;

    // Cooldown tracking to prevent spam
    this.cooldowns = new Map();
  }

  isOnCooldown(username) {
    const lastUse = this.cooldowns.get(username.toLowerCase());
    if (!lastUse) return false;
    const cooldownMs = (this.config.commandCooldown || 3) * 1000;
    return (Date.now() - lastUse) < cooldownMs;
  }

  setCooldown(username) {
    this.cooldowns.set(username.toLowerCase(), Date.now());
  }

  getTranslation(username) {
    const saved = this.storage?.getTranslation(username);
    return saved || this.config.defaultTranslation || 'esv';
  }

  async handleCommand(command, args, username, channel) {
    const noCooldownCommands = ['!help', '!about', '!commands'];
    if (!noCooldownCommands.includes(command) && this.isOnCooldown(username)) {
      return null;
    }
    this.setCooldown(username);

    // Resolve custom ministry command name
    const ministryCmd = this.custom.ministry?.enabled
      ? `!${(this.custom.ministry.command_name || 'ministry').toLowerCase()}`
      : null;

    switch (command) {
      case '!verse':
      case '!v':
      case '!scripture':
        return this.cmdVerse(args, username);

      case '!random':
      case '!r':
        return this.cmdRandom(username);

      case '!votd':
        return this.cmdVOTD(username);

      case '!read':
      case '!chapter':
        return this.cmdRead(args, username);

      case '!search':
        return this.cmdSearch(args, username);

      case '!xref':
      case '!crossref':
      case '!cross':
        return this.cmdCrossRef(args, username);

      case '!save':
      case '!bookmark':
        return this.cmdSave(args, username);

      case '!saved':
      case '!bookmarks':
      case '!favorites':
        return this.cmdSaved(args, username);

      case '!topic':
        return this.cmdTopic(args, username, channel);

      case '!trivia':
        return this.cmdTrivia(args, username, channel);

      case '!streak':
        return this.cmdStreak(username);

      case '!score':
      case '!triviascore':
        return this.cmdTriviaScore(args, username);

      case '!leaderboard':
      case '!lb':
        return this.cmdLeaderboard();

      case '!gospel':
        return this.cmdGospel();

      case '!evangelio':
        return this.cmdGospelSpanish();

      case '!prayer':
      case '!pray':
        return this.cmdPrayer(args, username);

      case '!translation':
      case '!trans':
      case '!version':
        return this.cmdTranslation(args, username);

      case '!about':
        return this.cmdAbout();

      case '!testimony':
        return this.custom.testimony?.enabled ? this.cmdTestimony() : null;

      case '!support':
      case '!donate':
        return this.custom.support?.enabled ? this.cmdSupport() : null;

      case '!help':
      case '!commands':
        return this.cmdHelp();

      default:
        // Check if it matches the custom ministry command
        if (ministryCmd && command === ministryCmd) {
          return this.cmdMinistry();
        }
        return null;
    }
  }

  // ========================================
  // BIBLE COMMANDS
  // ========================================

  async cmdVerse(args, username) {
    if (args.length === 0) {
      return `@${username} Usage: !verse <reference> — Example: !verse John 3:16 or !verse John 3:16; Romans 8:28`;
    }

    const referenceText = args.join(' ');

    if (referenceText.includes(';')) {
      return this.cmdMultiVerse(referenceText, username);
    }

    const parsed = parseReference(referenceText);
    if (!parsed) {
      return `@${username} I couldn't understand that reference. Try: !verse John 3:16 or !verse Romans 8:28-30`;
    }

    const translation = parsed.translation || this.getTranslation(username);
    const result = await this.bible.getVerse(parsed.reference, translation);

    if (result) {
      this.bible.setUserLastVerse(username, parsed.reference, translation);
      if (this.obsOverlay) {
        this.obsOverlay.sendVerse(result.reference, result.text, result.translation, username);
      }
      return this.formatVerseReply(result, username);
    }

    return `@${username} Sorry, I couldn't find that verse. Double-check the reference?`;
  }

  async cmdMultiVerse(referenceText, username) {
    const refs = parseMultiReference(referenceText);
    if (refs.length === 0) {
      return `@${username} I couldn't parse those references. Try: !verse John 3:16; Romans 8:28`;
    }

    const toFetch = refs.slice(0, 3);
    const results = [];

    for (const parsed of toFetch) {
      const translation = parsed.translation || this.getTranslation(username);
      const result = await this.bible.getVerse(parsed.reference, translation);
      if (result) results.push(result);
    }

    if (results.length === 0) {
      return `@${username} Couldn't find any of those verses. Double-check the references?`;
    }

    const parts = results.map(r => {
      const shortText = r.text.length > 120 ? r.text.substring(0, 117) + '...' : r.text;
      return `${r.reference}: ${shortText}`;
    });

    const reply = `📖 ${parts.join(' | ')} (${results[0].translation})`;
    return reply.length > 490 ? reply.substring(0, 487) + '...' : reply;
  }

  async cmdRandom(username) {
    const translation = this.getTranslation(username);
    const result = await this.bible.getRandomVerse(translation);
    if (result) {
      this.bible.setUserLastVerse(username, result.reference, translation);
      if (this.obsOverlay) {
        this.obsOverlay.sendVerse(result.reference, result.text, result.translation, username);
      }
      return this.formatVerseReply(result, username);
    }
    return `@${username} Couldn't fetch a verse right now, please try again!`;
  }

  async cmdVOTD(username) {
    const translation = this.getTranslation(username);
    const result = await this.bible.getVerseOfTheDay(translation);

    if (result) {
      let streakMsg = '';
      if (this.storage) {
        const streak = this.storage.recordStreak(username);
        if (streak.current >= 3) {
          streakMsg = ` 🔥 ${streak.current}-day streak!`;
        } else if (streak.current === 1 && streak.totalCheckins > 1) {
          streakMsg = ' ✨ New streak started!';
        }
      }
      return `📖 Verse of the Day: ${result.text} — ${result.reference} (${result.translation})${streakMsg}`;
    }

    return `@${username} Couldn't fetch the verse of the day right now, try again shortly!`;
  }

  async cmdRead(args, username) {
    if (args.length === 0) {
      return `@${username} Usage: !read <chapter> — Example: !read Psalm 23`;
    }

    const referenceText = args.join(' ');
    const parsed = parseReference(referenceText);
    if (!parsed) {
      return `@${username} I couldn't understand that reference. Try: !read Psalm 23 or !read Romans 8`;
    }

    const translation = parsed.translation || this.getTranslation(username);
    const result = await this.bible.getVerse(parsed.reference, translation);

    if (result) {
      const suffix = ` — ${result.reference} (${result.translation})`;
      const maxLen = 480 - suffix.length;
      let text = result.text;

      if (text.length > maxLen) {
        text = text.substring(0, maxLen - 25) + '... [Use /read in Discord for full text]';
      }

      if (this.obsOverlay) {
        this.obsOverlay.sendVerse(result.reference, result.text, result.translation, username);
      }

      return `📖 ${text}${suffix}`;
    }

    return `@${username} Couldn't find that chapter. Double-check the reference?`;
  }

  async cmdSearch(args, username) {
    if (args.length === 0) {
      return `@${username} Usage: !search <keyword> — Example: !search grace or !search forgiveness`;
    }

    const query = args.join(' ');
    const result = await this.bible.searchVerses(query, 3);

    if (result.error) {
      return `@${username} Search requires the ESV API. Set up an ESV API key for this feature!`;
    }

    if (result.results.length === 0) {
      return `@${username} No results found for "${query}". Try a different keyword?`;
    }

    const parts = result.results.slice(0, 3).map(r => {
      const shortText = r.text.length > 80 ? r.text.substring(0, 77) + '...' : r.text;
      return `${r.reference}: ${shortText}`;
    });

    let reply = `🔍 Results for "${query}" (${result.total} found): ${parts.join(' | ')}`;
    return reply.length > 490 ? reply.substring(0, 487) + '...' : reply;
  }

  async cmdCrossRef(args, username) {
    let reference;

    if (args.length > 0) {
      const parsed = parseReference(args.join(' '));
      if (!parsed) {
        return `@${username} I couldn't understand that reference. Try: !xref John 3:16`;
      }
      reference = parsed.reference;
    } else {
      const last = this.bible.getUserLastVerse(username);
      if (!last) {
        return `@${username} Look up a verse first, then use !xref — or !xref John 3:16`;
      }
      reference = last.reference;
    }

    const crossRefs = await this.bible.getCrossReferences(reference);

    if (crossRefs.length === 0) {
      return `@${username} No cross-references found for ${reference}. (ESV API key required for this feature)`;
    }

    return `✝️ Cross-references for ${reference}: ${crossRefs.join(', ')}`;
  }

  async cmdSave(args, username) {
    if (!this.storage) return `@${username} Bookmarks aren't available right now.`;

    let reference, translation;

    if (args.length > 0) {
      const parsed = parseReference(args.join(' '));
      if (parsed) {
        reference = parsed.reference;
        translation = parsed.translation || this.getTranslation(username);
      } else {
        return `@${username} I couldn't understand that reference. Try: !save John 3:16`;
      }
    } else {
      const last = this.bible.getUserLastVerse(username);
      if (!last) {
        return `@${username} Look up a verse first, then use !save to bookmark it! Or: !save John 3:16`;
      }
      reference = last.reference;
      translation = last.translation;
    }

    const result = await this.bible.getVerse(reference, translation);
    if (!result) return `@${username} Couldn't save that verse. Try looking it up again first.`;

    const added = this.storage.addBookmark(username, result.reference, result.text, result.translation);

    if (added) {
      const count = this.storage.getBookmarks(username).length;
      return `@${username} ✅ Saved "${result.reference}" to your favorites! (${count} saved) — Use !saved to view them`;
    }

    return `@${username} That verse is already in your favorites!`;
  }

  async cmdSaved(args, username) {
    if (!this.storage) return `@${username} Bookmarks aren't available right now.`;

    const bookmarks = this.storage.getBookmarks(username);

    if (bookmarks.length === 0) {
      return `@${username} No saved verses yet! Look up a verse and use !save to bookmark it.`;
    }

    const recent = bookmarks.slice(-5).reverse();
    const list = recent.map((b, i) => b.reference).join(', ');

    return `@${username} 📚 Your saved verses (${bookmarks.length} total): ${list} — Use !verse to look any of them up!`;
  }

  // ========================================
  // STREAM INTEGRATION
  // ========================================

  async cmdTopic(args, username, channel) {
    if (args.length === 0) {
      if (this.currentTopic) {
        return `📖 Current stream topic: ${this.currentTopic.reference}${this.currentTopic.description ? ' — ' + this.currentTopic.description : ''}`;
      }
      return `No stream topic set. Use !topic <reference> to set one (e.g., !topic Romans 8)`;
    }

    if (args[0].toLowerCase() === 'clear' || args[0].toLowerCase() === 'reset') {
      this.clearTopic();
      return '✅ Stream topic cleared!';
    }

    const referenceText = args.join(' ');
    const parsed = parseReference(referenceText);
    if (!parsed) {
      return `@${username} Couldn't understand that reference. Try: !topic Romans 8 or !topic Psalm 23`;
    }

    this.currentTopic = {
      reference: parsed.reference,
      description: null,
      setBy: username,
      setAt: Date.now()
    };

    if (this.obsOverlay) {
      this.obsOverlay.sendTopic(parsed.reference, null);
    }

    return `📖 Stream topic set to: **${parsed.reference}** — Let's dig into the Word together! Use !read ${parsed.reference} to see the passage.`;
  }

  getTopic() { return this.currentTopic; }

  clearTopic() {
    this.currentTopic = null;
    if (this.obsOverlay) this.obsOverlay.clearTopic();
  }

  // ========================================
  // ENGAGEMENT COMMANDS
  // ========================================

  async cmdTrivia(args, username, channel) {
    if (!this.trivia) return `@${username} Trivia isn't available right now.`;

    const difficulty = args[0]?.toLowerCase();
    const validDifficulties = ['easy', 'medium', 'hard'];
    const diff = validDifficulties.includes(difficulty) ? difficulty : null;

    const question = this.trivia.startQuestion(channel, diff);
    if (!question) return `@${username} A trivia question is already active! Answer it first!`;

    return question.twitchText;
  }

  async cmdStreak(username) {
    if (!this.storage) return `@${username} Streaks aren't available right now.`;

    const streak = this.storage.getStreak(username);
    if (streak.totalCheckins === 0) {
      return `@${username} You haven't started a VOTD streak yet! Use !votd daily to build one. 🔥`;
    }

    let msg = `@${username} 📊 VOTD Streak: Current: ${streak.current} day${streak.current !== 1 ? 's' : ''} | Best: ${streak.best} days | Total check-ins: ${streak.totalCheckins}`;
    if (streak.current >= 7) msg += ' 🔥🔥🔥';
    else if (streak.current >= 3) msg += ' 🔥';
    return msg;
  }

  async cmdTriviaScore(args, username) {
    if (!this.storage) return null;
    const target = args[0] || username;
    const score = this.storage.getTriviaScore(target);

    if (score.total === 0) {
      return `@${username} ${target === username ? 'You haven\'t' : target + ' hasn\'t'} answered any trivia yet! Try !trivia`;
    }

    const pct = Math.round((score.correct / score.total) * 100);
    return `@${username} 📊 ${target}'s trivia score: ${score.correct}/${score.total} correct (${pct}%)`;
  }

  async cmdLeaderboard() {
    if (!this.storage) return null;
    const leaders = this.storage.getTriviaLeaderboard(5);

    if (leaders.length === 0) return '🏆 No trivia scores yet! Be the first — try !trivia';

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    const list = leaders.map((l, i) => `${medals[i]} ${l.username}: ${l.correct}/${l.total}`).join(' | ');
    return `🏆 Trivia Leaderboard: ${list}`;
  }

  // ========================================
  // PERSONAL / MINISTRY COMMANDS
  // ========================================

  async cmdTranslation(args, username) {
    if (args.length === 0) {
      const current = this.getTranslation(username);
      return `@${username} Your current translation: ${current.toUpperCase()}. Available: ESV, KJV, WEB, NLT, NASB, NKJV. Change with: !translation <code>`;
    }

    const requested = args[0].toLowerCase();
    const available = ['esv', 'kjv', 'web', 'nlt', 'nasb', 'nkjv', 'niv', 'asv', 'amp'];

    if (!available.includes(requested)) {
      return `@${username} Unknown translation "${args[0]}". Available: ${available.map(t => t.toUpperCase()).join(', ')}`;
    }

    if (this.storage) this.storage.setTranslation(username, requested);

    if (requested === 'esv') {
      return `@${username} ✅ Translation set to ESV (English Standard Version) — our primary translation with the best formatting! (Saved for next time)`;
    }

    return `@${username} ✅ Translation set to ${requested.toUpperCase()}. Note: ESV has the best support — other translations use a backup API. (Saved for next time)`;
  }

  cmdGospel() {
    return '✝️ The Gospel: We have all sinned and fall short of God\'s glory (Rom 3:23). The wages of sin is death, but the free gift of God is eternal life in Christ Jesus (Rom 6:23). God shows His love for us in that while we were still sinners, Christ died for us (Rom 5:8). If you confess with your mouth that Jesus is Lord and believe in your heart that God raised Him from the dead, you will be saved (Rom 10:9). ✝️';
  }

  cmdGospelSpanish() {
    return '✝️ El Evangelio: Todos hemos pecado y estamos lejos de la gloria de Dios (Rom 3:23). La paga del pecado es muerte, pero el regalo de Dios es vida eterna en Cristo Jesús (Rom 6:23). Dios muestra Su amor por nosotros en que, siendo aún pecadores, Cristo murió por nosotros (Rom 5:8). Si confiesas con tu boca que Jesús es el Señor y crees en tu corazón que Dios lo levantó de los muertos, serás salvo (Rom 10:9). ✝️';
  }

  cmdPrayer(args, username) {
    if (args.length > 0) {
      console.log(`[PRAYER REQUEST] ${username}: ${args.join(' ')}`);
      return `@${username} 🙏 Your prayer request has been received. We are lifting you up right now. "The prayer of a righteous person has great power" — James 5:16`;
    }

    const formUrl = this.custom.prayer?.anonymous_form_url;
    const formNote = formUrl ? ` or submit privately here: ${formUrl}` : '';
    const crisis = this.custom.prayer?.crisis_info || '';
    const crisisNote = crisis ? ` (Note: ${crisis})` : '';

    return `🙏 Have a prayer request? Drop it in chat${formNote} — Every request gets prayed over.${crisisNote}`;
  }

  cmdAbout() {
    const about = this.custom.about || {};
    const name = process.env.BOT_NAME || 'Forge Bible Bot';
    const community = process.env.COMMUNITY_NAME || about.title || 'Our Community';
    const desc = about.description || 'A community for faith, fellowship, and the Word of God.';

    // Flatten for Twitch's 500-char limit
    let reply = `🔥 ${community} — ${desc.replace(/\n/g, ' ').replace(/\*\*/g, '').replace(/\*/g, '').replace(/\\n/g, ' ')}`;
    if (reply.length > 490) reply = reply.substring(0, 487) + '...';
    return reply;
  }

  cmdTestimony() {
    const t = this.custom.testimony || {};
    const link = t.link_url ? ` Read it here: ${t.link_url}` : '';
    return `📜 ${t.description || 'Want to hear how God changed my life? Ask in chat!'}${link}`;
  }

  cmdMinistry() {
    const m = this.custom.ministry || {};
    return `⚔️ ${m.title || 'Our Ministry'} — ${m.description || ''} "${m.verse || ''}" — ${m.verse_ref || ''}`;
  }

  cmdSupport() {
    const s = this.custom.support || {};
    return `💛 ${s.message || 'Thank you for your support!'} ${s.url || ''}`;
  }

  cmdHelp() {
    let cmds = '📖 Commands: !verse <ref> | !read <chapter> | !search <keyword> | !xref | !random | !votd | !save / !saved | !trivia | !streak | !leaderboard | !topic <ref> | !translation <code> | !gospel | !prayer | !about';

    if (this.custom.testimony?.enabled) cmds += ' | !testimony';
    if (this.custom.ministry?.enabled) cmds += ` | !${this.custom.ministry.command_name || 'ministry'}`;
    if (this.custom.support?.enabled) cmds += ' | !support';

    cmds += ' — Or just type a reference like "John 3:16"!';
    return cmds;
  }

  // ========================================
  // HELPERS
  // ========================================

  formatVerseReply(result, username) {
    const { text, reference, translation, fallbackFrom } = result;
    const translationDisplay = fallbackFrom ? `${translation} via ${fallbackFrom}` : translation;
    const suffix = ` — ${reference} (${translationDisplay})`;
    const maxTextLength = 490 - suffix.length - username.length - 3;

    let displayText = text;
    if (displayText.length > maxTextLength) {
      displayText = displayText.substring(0, maxTextLength - 3) + '...';
    }

    return `📖 ${displayText}${suffix}`;
  }
}

module.exports = CommandHandler;
