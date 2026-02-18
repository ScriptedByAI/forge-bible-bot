// ============================================
// discord-commands.js — Discord slash command handler
// ============================================
//
// "Let the word of Christ dwell in you richly"
// — Colossians 3:16 (ESV)

const { EmbedBuilder } = require('discord.js');
const { parseReference, parseMultiReference, TRANSLATIONS } = require('./verse-parser');
const { loadConfig } = require('./custom-config');

// Embed color palette
const COLORS = {
  verse: 0x4A90D9,
  gospel: 0xCC3333,
  prayer: 0x9B59B6,
  info: 0xD4A017,
  iron: 0x708090,
  success: 0x2ECC71,
  error: 0xE74C3C,
  votd: 0xF39C12,
  search: 0x3498DB,
  trivia: 0xE67E22,
  streak: 0xFF6B35,
  topic: 0x1ABC9C,
  bookmark: 0x9B59B6,
};

class DiscordCommandHandler {
  constructor(bibleService, config, storage, trivia, obsOverlay) {
    this.bible = bibleService;
    this.config = config;
    this.storage = storage;
    this.trivia = trivia;
    this.obsOverlay = obsOverlay;
    this.custom = loadConfig();
    this.currentTopic = null;
    this.cooldowns = new Map();
  }

  getTranslation(username) {
    const saved = this.storage?.getTranslation(username);
    return saved || this.config.defaultTranslation || 'esv';
  }

  get footerText() {
    return this.custom.footer || 'Forge Bible Bot | Jesus is Lord!';
  }

  async handleSlashCommand(interaction) {
    const { commandName, user, options } = interaction;
    const username = user.username;

    const ministryCmd = this.custom.ministry?.command_name?.toLowerCase() || 'ministry';

    switch (commandName) {
      case 'verse':
        return this.cmdVerse(options.getString('reference'), options.getString('translation'), username);
      case 'random':
        return this.cmdRandom(username);
      case 'votd':
        return this.cmdVOTD(username);
      case 'read':
        return this.cmdRead(options.getString('reference'), options.getString('translation'), username, interaction);
      case 'search':
        return this.cmdSearch(options.getString('query'), username);
      case 'xref':
        return this.cmdCrossRef(options.getString('reference'), username);
      case 'save':
        return this.cmdSave(options.getString('reference'), username);
      case 'saved':
        return this.cmdSaved(username);
      case 'topic':
        return this.cmdTopic(options.getString('reference'), null, username);
      case 'trivia':
        return this.cmdTrivia(options.getString('difficulty'), username, interaction);
      case 'streak':
        return this.cmdStreak(username);
      case 'leaderboard':
        return this.cmdLeaderboard();
      case 'gospel':
        return this.cmdGospel(options.getString('language') || 'en');
      case 'prayer':
        return this.cmdPrayer(options.getString('request'), username, interaction);
      case 'translation':
        return this.cmdTranslation(options.getString('version'), username);
      case 'about':
        return this.cmdAbout();
      case 'testimony':
        return this.custom.testimony?.enabled ? this.cmdTestimony() : this.cmdAbout();
      case 'support':
        return this.custom.support?.enabled ? this.cmdSupport() : null;
      case 'help':
        return this.cmdHelp();
      default:
        if (commandName === ministryCmd) return this.cmdMinistry();
        return null;
    }
  }

  // ========================================
  // BIBLE COMMANDS
  // ========================================

  async cmdVerse(referenceText, translationOpt, username) {
    if (!referenceText) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`Usage: \`/verse John 3:16\` or \`/verse Romans 8:28-30\``)
        .setFooter({ text: this.footerText });
    }

    if (referenceText.includes(';')) {
      return this.cmdMultiVerse(referenceText, username);
    }

    const parsed = parseReference(referenceText);
    if (!parsed) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`I couldn't understand that reference. Try: \`/verse John 3:16\``)
        .setFooter({ text: this.footerText });
    }

    const translation = translationOpt || parsed.translation || this.getTranslation(username);
    const result = await this.bible.getVerse(parsed.reference, translation);

    if (result) {
      this.bible.setUserLastVerse(username, parsed.reference, translation);
      return this.formatVerseEmbed(result, username);
    }

    return new EmbedBuilder()
      .setColor(COLORS.error)
      .setDescription('Sorry, I couldn\'t find that verse. Double-check the reference?')
      .setFooter({ text: this.footerText });
  }

  async cmdMultiVerse(referenceText, username) {
    const refs = parseMultiReference(referenceText);
    if (refs.length === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('I couldn\'t parse those references. Try: `/verse John 3:16; Romans 8:28`')
        .setFooter({ text: this.footerText });
    }

    const toFetch = refs.slice(0, 3);
    const results = [];

    for (const parsed of toFetch) {
      const translation = parsed.translation || this.getTranslation(username);
      const result = await this.bible.getVerse(parsed.reference, translation);
      if (result) results.push(result);
    }

    if (results.length === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('Couldn\'t find any of those verses.')
        .setFooter({ text: this.footerText });
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.verse)
      .setTitle('📖 Multiple Verses')
      .setTimestamp()
      .setFooter({ text: `${results[0].translation} | Requested by ${username} | ${this.footerText}` });

    for (const r of results) {
      const shortText = r.text.length > 1024 ? r.text.substring(0, 1021) + '...' : r.text;
      embed.addFields({ name: r.reference, value: `*${shortText}*` });
    }

    return embed;
  }

  async cmdRandom(username) {
    const translation = this.getTranslation(username);
    const result = await this.bible.getRandomVerse(translation);

    if (result) {
      this.bible.setUserLastVerse(username, result.reference, translation);
      return this.formatVerseEmbed(result, username);
    }

    return new EmbedBuilder()
      .setColor(COLORS.error)
      .setDescription('Couldn\'t fetch a verse right now. Try again!')
      .setFooter({ text: this.footerText });
  }

  async cmdVOTD(username) {
    const translation = this.getTranslation(username);
    const result = await this.bible.getVerseOfTheDay(translation);

    if (result) {
      let streakMsg = '';
      if (this.storage) {
        const streak = this.storage.recordStreak(username);
        if (streak.current >= 7) streakMsg = `\n\n🔥🔥🔥 **${streak.current}-day VOTD streak!** Keep it up!`;
        else if (streak.current >= 3) streakMsg = `\n\n🔥 **${streak.current}-day VOTD streak!**`;
        else if (streak.current === 1 && streak.totalCheckins > 1) streakMsg = '\n\n✨ New streak started!';
      }

      return new EmbedBuilder()
        .setColor(COLORS.votd)
        .setTitle('📖 Verse of the Day')
        .setDescription(`*${result.text}*\n\n— **${result.reference}** (${result.translation})${streakMsg}`)
        .setTimestamp()
        .setFooter({ text: `Use /votd daily to build a streak! | ${this.footerText}` });
    }

    return new EmbedBuilder()
      .setColor(COLORS.error)
      .setDescription('Couldn\'t fetch the Verse of the Day right now. Try again shortly!')
      .setFooter({ text: this.footerText });
  }

  async cmdRead(referenceText, translationOpt, username, interaction) {
    if (!referenceText) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('Usage: `/read Psalm 23` or `/read Romans 8`')
        .setFooter({ text: this.footerText });
    }

    const parsed = parseReference(referenceText);
    if (!parsed) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('I couldn\'t understand that reference. Try: `/read Psalm 23`')
        .setFooter({ text: this.footerText });
    }

    const translation = translationOpt || parsed.translation || this.getTranslation(username);
    const chapter = await this.bible.getChapter(parsed.reference, translation, 1900);

    if (!chapter) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('Couldn\'t find that chapter.')
        .setFooter({ text: this.footerText });
    }

    // Send first chunk as reply
    const firstEmbed = new EmbedBuilder()
      .setColor(COLORS.verse)
      .setTitle(`📖 ${chapter.reference}`)
      .setDescription(chapter.chunks[0])
      .setFooter({ text: `${chapter.translation} | Part 1/${chapter.chunks.length} | ${this.footerText}` });

    // Send subsequent chunks as follow-up messages
    if (chapter.chunks.length > 1 && interaction?.channel) {
      setTimeout(async () => {
        for (let i = 1; i < chapter.chunks.length; i++) {
          const followUp = new EmbedBuilder()
            .setColor(COLORS.verse)
            .setDescription(chapter.chunks[i])
            .setFooter({ text: `${chapter.translation} | Part ${i + 1}/${chapter.chunks.length}` });

          try {
            await interaction.channel.send({ embeds: [followUp] });
          } catch (err) {
            console.error('[Discord] Failed to send chapter chunk:', err.message);
            break;
          }
        }
      }, 500);
    }

    return firstEmbed;
  }

  async cmdSearch(query, username) {
    if (!query) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('Usage: `/search grace` or `/search forgiveness`')
        .setFooter({ text: this.footerText });
    }

    const result = await this.bible.searchVerses(query, 5);

    if (result.error) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('Search requires the ESV API key. Check your .env configuration!')
        .setFooter({ text: this.footerText });
    }

    if (result.results.length === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.search)
        .setDescription(`No results found for "${query}". Try a different keyword?`)
        .setFooter({ text: this.footerText });
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.search)
      .setTitle(`🔍 Search Results: "${query}"`)
      .setDescription(`Found ${result.total} result${result.total !== 1 ? 's' : ''}:`)
      .setFooter({ text: `ESV | ${this.footerText}` });

    for (const r of result.results) {
      const shortText = r.text.length > 200 ? r.text.substring(0, 197) + '...' : r.text;
      embed.addFields({ name: r.reference, value: `*${shortText}*` });
    }

    return embed;
  }

  async cmdCrossRef(referenceText, username) {
    let reference;

    if (referenceText) {
      const parsed = parseReference(referenceText);
      if (!parsed) {
        return new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription('I couldn\'t understand that reference. Try: `/xref John 3:16`')
          .setFooter({ text: this.footerText });
      }
      reference = parsed.reference;
    } else {
      const last = this.bible.getUserLastVerse(username);
      if (!last) {
        return new EmbedBuilder()
          .setColor(COLORS.error)
          .setDescription('Look up a verse first, then use `/xref` — or `/xref John 3:16`')
          .setFooter({ text: this.footerText });
      }
      reference = last.reference;
    }

    const crossRefs = await this.bible.getCrossReferences(reference);

    if (crossRefs.length === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`No cross-references found for ${reference}.`)
        .setFooter({ text: this.footerText });
    }

    const refLinks = crossRefs.map(r => `**${r}**`).join('\n');
    return new EmbedBuilder()
      .setColor(COLORS.verse)
      .setTitle(`✝️ Cross-References: ${reference}`)
      .setDescription(`Related passages:\n\n${refLinks}\n\nUse \`/verse <reference>\` to look any of these up!`)
      .setFooter({ text: this.footerText });
  }

  async cmdSave(referenceText, username) {
    if (!this.storage) {
      return new EmbedBuilder().setColor(COLORS.error).setDescription('Bookmarks aren\'t available right now.');
    }

    let reference, translation;

    if (referenceText) {
      const parsed = parseReference(referenceText);
      if (parsed) {
        reference = parsed.reference;
        translation = parsed.translation || this.getTranslation(username);
      } else {
        return new EmbedBuilder().setColor(COLORS.error).setDescription('I couldn\'t understand that reference.');
      }
    } else {
      const last = this.bible.getUserLastVerse(username);
      if (!last) {
        return new EmbedBuilder().setColor(COLORS.error).setDescription('Look up a verse first, then use `/save`!');
      }
      reference = last.reference;
      translation = last.translation;
    }

    const result = await this.bible.getVerse(reference, translation);
    if (!result) {
      return new EmbedBuilder().setColor(COLORS.error).setDescription('Couldn\'t save that verse.');
    }

    const added = this.storage.addBookmark(username, result.reference, result.text, result.translation);

    if (added) {
      const count = this.storage.getBookmarks(username).length;
      return new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(`✅ Saved **${result.reference}** to your favorites! (${count} total)\n\nUse \`/saved\` to view all your bookmarks.`)
        .setFooter({ text: this.footerText });
    }

    return new EmbedBuilder().setColor(COLORS.info).setDescription(`**${result.reference}** is already in your favorites!`);
  }

  async cmdSaved(username) {
    if (!this.storage) {
      return new EmbedBuilder().setColor(COLORS.error).setDescription('Bookmarks aren\'t available right now.');
    }

    const bookmarks = this.storage.getBookmarks(username);

    if (bookmarks.length === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.bookmark)
        .setDescription('No saved verses yet! Look up a verse and use `/save` to bookmark it.')
        .setFooter({ text: this.footerText });
    }

    const recent = bookmarks.slice(-10).reverse();
    const list = recent.map((b, i) => `${i + 1}. **${b.reference}** (${b.translation})`).join('\n');

    return new EmbedBuilder()
      .setColor(COLORS.bookmark)
      .setTitle(`📚 ${username}'s Saved Verses`)
      .setDescription(`${list}\n\n**${bookmarks.length}** total bookmarks. Use \`/verse <reference>\` to look one up!`)
      .setFooter({ text: this.footerText });
  }

  // ========================================
  // STREAM / ENGAGEMENT
  // ========================================

  async cmdTopic(referenceText, description, username) {
    if (!referenceText) {
      if (this.currentTopic) {
        return new EmbedBuilder()
          .setColor(COLORS.topic)
          .setTitle('📖 Current Stream Topic')
          .setDescription(`**${this.currentTopic.reference}**${this.currentTopic.description ? '\n\n' + this.currentTopic.description : ''}\n\nUse \`/read ${this.currentTopic.reference}\` to follow along!`)
          .setFooter({ text: `Set by ${this.currentTopic.setBy} | ${this.footerText}` });
      }
      return new EmbedBuilder()
        .setColor(COLORS.topic)
        .setDescription('No stream topic set. Use `/topic <reference>` to set one!')
        .setFooter({ text: this.footerText });
    }

    if (referenceText.toLowerCase() === 'clear' || referenceText.toLowerCase() === 'reset') {
      this.currentTopic = null;
      return new EmbedBuilder().setColor(COLORS.success).setDescription('✅ Stream topic cleared!');
    }

    const parsed = parseReference(referenceText);
    if (!parsed) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('Couldn\'t understand that reference. Try: `/topic Romans 8`')
        .setFooter({ text: this.footerText });
    }

    this.currentTopic = { reference: parsed.reference, description, setBy: username, setAt: Date.now() };

    return new EmbedBuilder()
      .setColor(COLORS.topic)
      .setTitle('📖 Stream Topic Set!')
      .setDescription(`**${parsed.reference}**\n\nUse \`/read ${parsed.reference}\` to see the full passage!`)
      .setFooter({ text: this.footerText });
  }

  async cmdTrivia(difficulty, username, interaction) {
    if (!this.trivia) {
      return new EmbedBuilder().setColor(COLORS.error).setDescription('Trivia isn\'t available right now.');
    }

    const channelId = interaction?.channelId;
    if (!channelId) return null;

    const validDifficulties = ['easy', 'medium', 'hard'];
    const diff = validDifficulties.includes(difficulty) ? difficulty : null;

    const question = this.trivia.startQuestion(channelId, diff);
    if (!question) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription('A trivia question is already active! Answer it first!')
        .setFooter({ text: this.footerText });
    }

    const diffEmoji = { easy: '🟢', medium: '🟡', hard: '🔴' };
    const diffColor = { easy: 0x2ECC71, medium: 0xF39C12, hard: 0xE74C3C };

    return new EmbedBuilder()
      .setColor(diffColor[question.twitchText.includes('easy') ? 'easy' : question.twitchText.includes('hard') ? 'hard' : 'medium'] || COLORS.trivia)
      .setTitle(`${diffEmoji[diff] || '❓'} Bible Trivia`)
      .setDescription(question.text.replace(/^[🟢🟡🔴❓]\s*\*\*Bible Trivia\*\*\s*\([^)]+\):\s*/, ''))
      .addFields({ name: 'Difficulty', value: diff || 'Random', inline: true }, { name: 'Time Limit', value: '30 seconds', inline: true })
      .setFooter({ text: 'Type your answer in chat!' });
  }

  async cmdStreak(username) {
    if (!this.storage) return null;

    const streak = this.storage.getStreak(username);

    if (streak.totalCheckins === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.streak)
        .setDescription(`You haven't started a VOTD streak yet! Use \`/votd\` daily to build one. 🔥`)
        .setFooter({ text: this.footerText });
    }

    let fireEmoji = '';
    if (streak.current >= 7) fireEmoji = ' 🔥🔥🔥';
    else if (streak.current >= 3) fireEmoji = ' 🔥';

    return new EmbedBuilder()
      .setColor(COLORS.streak)
      .setTitle(`📊 ${username}'s VOTD Streak${fireEmoji}`)
      .addFields(
        { name: 'Current Streak', value: `${streak.current} day${streak.current !== 1 ? 's' : ''}`, inline: true },
        { name: 'Best Streak', value: `${streak.best} days`, inline: true },
        { name: 'Total Check-ins', value: `${streak.totalCheckins}`, inline: true },
      )
      .setFooter({ text: `Use /votd daily! | ${this.footerText}` });
  }

  async cmdLeaderboard() {
    if (!this.storage) return null;
    const leaders = this.storage.getTriviaLeaderboard(10);

    if (leaders.length === 0) {
      return new EmbedBuilder()
        .setColor(COLORS.trivia)
        .setDescription('🏆 No trivia scores yet! Be the first — try `/trivia`')
        .setFooter({ text: this.footerText });
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const list = leaders.map((l, i) => {
      const pct = Math.round((l.correct / l.total) * 100);
      return `${medals[i]} **${l.username}** — ${l.correct}/${l.total} (${pct}%)`;
    }).join('\n');

    return new EmbedBuilder()
      .setColor(COLORS.trivia)
      .setTitle('🏆 Bible Trivia Leaderboard')
      .setDescription(list)
      .setFooter({ text: `Use /trivia to play! | ${this.footerText}` });
  }

  // ========================================
  // PERSONAL / MINISTRY COMMANDS
  // ========================================

  cmdGospel(language) {
    if (language === 'es') {
      return new EmbedBuilder()
        .setColor(COLORS.gospel)
        .setTitle('✝️ El Evangelio — Las Buenas Nuevas')
        .setDescription(
          '**Todos hemos pecado** y estamos lejos de la gloria de Dios.\n— *Romanos 3:23*\n\n' +
          '**La paga del pecado es muerte**, pero el regalo de Dios es vida eterna en Cristo Jesús nuestro Señor.\n— *Romanos 6:23*\n\n' +
          'Dios muestra Su amor por nosotros en que, **siendo aún pecadores, Cristo murió por nosotros.**\n— *Romanos 5:8*\n\n' +
          'Si confiesas con tu boca que **Jesús es el Señor** y crees en tu corazón que Dios lo levantó de los muertos, **serás salvo.**\n— *Romanos 10:9*'
        )
        .setFooter({ text: this.footerText });
    }

    return new EmbedBuilder()
      .setColor(COLORS.gospel)
      .setTitle('✝️ The Gospel — The Good News')
      .setDescription(
        '**All have sinned** and fall short of the glory of God.\n— *Romans 3:23*\n\n' +
        '**The wages of sin is death**, but the free gift of God is eternal life in Christ Jesus our Lord.\n— *Romans 6:23*\n\n' +
        'God shows His love for us in that **while we were still sinners, Christ died for us.**\n— *Romans 5:8*\n\n' +
        'If you confess with your mouth that **Jesus is Lord** and believe in your heart that God raised Him from the dead, **you will be saved.**\n— *Romans 10:9*'
      )
      .setFooter({ text: this.footerText });
  }

  cmdPrayer(request, username, interaction) {
    if (request) {
      const prayerChannelId = this.config.prayerChannelId;
      if (prayerChannelId && interaction?.client) {
        try {
          const channel = interaction.client.channels.cache.get(prayerChannelId);
          if (channel) {
            const prayerEmbed = new EmbedBuilder()
              .setColor(COLORS.prayer)
              .setTitle('🙏 Prayer Request')
              .setDescription(request)
              .setFooter({ text: `Submitted by ${username} via /prayer` })
              .setTimestamp();
            channel.send({ embeds: [prayerEmbed] }).catch(() => {});
          }
        } catch (e) { /* silently fail */ }
      }

      return {
        embeds: [new EmbedBuilder()
          .setColor(COLORS.prayer)
          .setTitle('🙏 Prayer Request Received')
          .setDescription(
            'Your prayer request has been sent **privately** to the prayer team. ' +
            'No one else can see what you submitted.\n\n' +
            'We are lifting you up right now.\n\n' +
            '*"The prayer of a righteous person has great power as it is working."*\n— **James 5:16 (ESV)**'
          )
          .setFooter({ text: `Praying for you, ${username}` })
          .setTimestamp()],
        ephemeral: true
      };
    }

    const formUrl = this.custom.prayer?.anonymous_form_url;
    const formLine = formUrl ? `\n\n🕊️ **Anonymous** — [Prayer Form](${formUrl})\nCompletely anonymous — even the prayer team won't know who submitted it.` : '';
    const crisis = this.custom.prayer?.crisis_info || '';
    const crisisLine = crisis ? `\n\n*${crisis}*` : '';
    const prayerChannel = this.custom.prayer?.public_channel || '#prayer-requests';

    return new EmbedBuilder()
      .setColor(COLORS.prayer)
      .setTitle('🙏 Prayer Requests')
      .setDescription(
        'Need prayer? We\'ve got you. Here are your options:\n\n' +
        '🔒 **Private** — `/prayer Your request here`\nOnly the prayer team sees your request.\n\n' +
        `📢 **Public** — Post in **${prayerChannel}**\nShare openly with the community.` +
        formLine +
        '\n\nEvery single request gets prayed over. You are not alone.' +
        crisisLine
      )
      .setFooter({ text: this.footerText });
  }

  async cmdTranslation(version, username) {
    if (!version) {
      const current = this.getTranslation(username);
      return new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle('📖 Your Bible Translation')
        .setDescription(`Current: **${current.toUpperCase()}**\n\nUse \`/translation <version>\` to change it.\nYour preference is saved permanently!`)
        .setFooter({ text: this.footerText });
    }

    const available = ['esv', 'kjv', 'web', 'nlt', 'nasb', 'nkjv', 'niv', 'asv', 'amp'];
    const requested = version.toLowerCase();

    if (!available.includes(requested)) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`Unknown translation. Available: ${available.map(t => t.toUpperCase()).join(', ')}`)
        .setFooter({ text: this.footerText });
    }

    if (this.storage) this.storage.setTranslation(username, requested);

    return new EmbedBuilder()
      .setColor(COLORS.success)
      .setDescription(`✅ Translation set to **${requested.toUpperCase()}**! This is saved for all future lookups.${requested !== 'esv' ? '\n\n*Note: ESV has the best support. Other translations use a backup API.*' : ''}`)
      .setFooter({ text: this.footerText });
  }

  cmdAbout() {
    const about = this.custom.about || {};
    const name = process.env.BOT_NAME || 'Forge Bible Bot';
    const twitchUrl = about.twitch_url || process.env.TWITCH_CHANNEL_URL;

    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle(`⚒️ ${about.title || name}`)
      .setDescription(about.description || 'A community for faith, fellowship, and the Word of God.');

    const fields = [];
    if (twitchUrl) fields.push({ name: '🎮 Twitch', value: `[Watch Live](${twitchUrl})`, inline: true });
    if (about.activities) fields.push({ name: '📖 What We Do', value: about.activities, inline: true });
    if (fields.length > 0) embed.addFields(fields);

    embed.setFooter({ text: this.footerText });
    return embed;
  }

  cmdTestimony() {
    const t = this.custom.testimony || {};
    const linkLine = t.link_url ? `\n\n**[${t.link_text || 'Read My Testimony'}](${t.link_url})**` : '';

    return new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle(`📜 ${t.title || 'My Testimony'}`)
      .setDescription((t.description || 'Want to hear how God changed my life? Ask in chat!') + linkLine)
      .setFooter({ text: this.footerText });
  }

  cmdMinistry() {
    const m = this.custom.ministry || {};
    return new EmbedBuilder()
      .setColor(COLORS.iron)
      .setTitle(`⚔️ ${m.title || 'Our Ministry'}`)
      .setDescription(
        (m.description || '') +
        (m.verse ? `\n\n*"${m.verse}"*\n— **${m.verse_ref || ''}**` : '')
      )
      .setFooter({ text: this.footerText });
  }

  cmdSupport() {
    const s = this.custom.support || {};
    return new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle('💛 Support This Ministry')
      .setDescription(
        (s.message || 'Thank you for your support!') +
        (s.url ? `\n\n**[Support Here](${s.url})**` : '')
      )
      .setFooter({ text: this.footerText });
  }

  cmdHelp() {
    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle('⚒️ Forge Bible Bot — Commands')
      .setDescription('Here\'s everything I can do:')
      .addFields(
        {
          name: '📖 Bible',
          value:
            '`/verse <reference>` — Look up a verse\n' +
            '`/read <chapter>` — Read a full chapter\n' +
            '`/search <keyword>` — Search verses by keyword\n' +
            '`/xref [reference]` — Cross-references\n' +
            '`/random` — Random encouraging verse\n' +
            '`/votd` — Verse of the Day',
          inline: false
        },
        {
          name: '⭐ Favorites & Streaks',
          value:
            '`/save [reference]` — Bookmark a verse\n' +
            '`/saved` — View your saved verses\n' +
            '`/streak` — Your VOTD streak\n' +
            '`/translation` — Set your Bible version',
          inline: false
        },
        {
          name: '🎮 Fun & Engagement',
          value:
            '`/trivia [difficulty]` — Bible trivia game\n' +
            '`/leaderboard` — Trivia leaderboard\n' +
            '`/topic [reference]` — Stream scripture topic',
          inline: false
        },
      );

    // Dynamic ministry section
    let ministryValue = '`/gospel` — The Gospel message\n`/prayer` — Prayer requests\n`/about` — About this community';
    if (this.custom.testimony?.enabled) ministryValue += '\n`/testimony` — Read the testimony';
    if (this.custom.ministry?.enabled) ministryValue += `\n\`/${this.custom.ministry.command_name || 'ministry'}\` — ${this.custom.ministry.title || 'Our Ministry'}`;
    if (this.custom.support?.enabled) ministryValue += '\n`/support` — Support this ministry';

    embed.addFields(
      { name: '✝️ Ministry', value: ministryValue, inline: false },
      { name: '🔍 Auto-Detect', value: 'Just type a Bible reference like `John 3:16` in any channel!', inline: false }
    );

    embed.setFooter({ text: this.footerText });
    return embed;
  }

  // ========================================
  // HELPERS
  // ========================================

  formatVerseEmbed(result, username) {
    const { text, reference, translation, fallbackFrom } = result;

    const embed = new EmbedBuilder()
      .setColor(COLORS.verse)
      .setTitle(`📖 ${reference}`)
      .setDescription(`*${text}*`)
      .setTimestamp();

    let footerText = `${translation} | Requested by ${username} | ${this.footerText}`;
    if (fallbackFrom) {
      footerText = `${translation} (via ${fallbackFrom}) | Requested by ${username} | ${this.footerText}`;
    }
    embed.setFooter({ text: footerText });

    return embed;
  }
}

module.exports = DiscordCommandHandler;
