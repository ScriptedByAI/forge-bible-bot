// ============================================
// bible-service.js — Fetches scripture from APIs
// ============================================
// Primary:  ESV API (https://api.esv.org) — best quality, needs free API key
// Fallback: bible-api.com — no key needed, limited translations
//
// "All Scripture is breathed out by God and profitable for teaching,
//  for reproof, for correction, and for training in righteousness"
//  — 2 Timothy 3:16 (ESV)

const axios = require('axios');

// Curated cross-reference database for popular passages
const CROSS_REFERENCES = {
  'john 3:16': ['Romans 5:8', '1 John 4:9-10', 'Romans 8:32', 'Ephesians 2:4-5', 'John 3:36'],
  'romans 8:28': ['Genesis 50:20', 'Jeremiah 29:11', 'Ephesians 1:11', 'Romans 8:35-39', 'Philippians 1:6'],
  'jeremiah 29:11': ['Romans 8:28', 'Proverbs 3:5-6', 'Psalm 33:11', 'Isaiah 55:8-9', 'Psalm 139:16'],
  'philippians 4:13': ['2 Corinthians 12:9-10', 'Isaiah 40:31', 'Ephesians 6:10', 'John 15:5', 'Colossians 1:11'],
  'proverbs 3:5-6': ['Jeremiah 29:11', 'Psalm 37:5', 'Isaiah 55:8-9', 'Proverbs 16:9', 'Psalm 32:8'],
  'psalm 23': ['John 10:11', 'Isaiah 40:11', 'Psalm 100:3', 'Ezekiel 34:11-12', 'Revelation 7:17'],
  'isaiah 41:10': ['Deuteronomy 31:6', 'Joshua 1:9', 'Psalm 46:1', '2 Timothy 1:7', 'Psalm 27:1'],
  'romans 5:8': ['John 3:16', '1 John 4:10', 'Ephesians 2:4-5', '1 Peter 3:18', 'Romans 8:32'],
  'ephesians 2:8-9': ['Romans 3:24', 'Titus 3:5', 'Romans 4:5', 'Galatians 2:16', '2 Timothy 1:9'],
  '2 corinthians 5:17': ['Galatians 6:15', 'Ephesians 4:22-24', 'Romans 6:4', 'Ezekiel 36:26', 'Colossians 3:9-10'],
  'romans 6:23': ['James 1:15', 'Romans 3:23', 'John 3:16', 'Ephesians 2:8-9', '1 John 5:11'],
  'romans 3:23': ['Romans 6:23', 'Ecclesiastes 7:20', 'Isaiah 53:6', '1 John 1:8', 'Psalm 14:3'],
  'romans 10:9': ['Acts 16:31', 'John 3:16', 'Romans 10:13', 'Acts 2:21', '1 Corinthians 12:3'],
  'galatians 2:20': ['Philippians 1:21', 'Romans 6:6', 'Colossians 3:3-4', '2 Corinthians 5:15', 'Romans 14:8'],
  'joshua 1:9': ['Deuteronomy 31:6', 'Isaiah 41:10', 'Psalm 27:1', 'Psalm 46:1-2', '2 Timothy 1:7'],
  'psalm 46:1': ['Psalm 91:2', 'Proverbs 18:10', 'Isaiah 41:10', 'Deuteronomy 33:27', 'Nahum 1:7'],
  'matthew 11:28-30': ['John 14:27', 'Psalm 55:22', '1 Peter 5:7', 'Isaiah 40:31', 'Psalm 62:1'],
  'romans 8:38-39': ['John 10:28-29', 'Romans 8:28', 'Ephesians 3:18-19', 'Deuteronomy 31:6', 'Hebrews 13:5'],
  'isaiah 40:31': ['Philippians 4:13', 'Psalm 27:14', '2 Corinthians 12:9', 'Habakkuk 3:19', 'Nehemiah 8:10'],
  'psalm 34:18': ['Psalm 147:3', 'Isaiah 61:1', 'Psalm 51:17', 'Matthew 5:4', 'Isaiah 57:15'],
  'psalm 139:14': ['Ephesians 2:10', 'Genesis 1:27', 'Psalm 139:13', 'Jeremiah 1:5', 'Isaiah 43:1'],
  '1 peter 5:7': ['Psalm 55:22', 'Philippians 4:6-7', 'Matthew 6:25-27', 'Psalm 37:5', 'Matthew 11:28'],
  'philippians 4:6-7': ['1 Peter 5:7', 'Matthew 6:25-27', 'Colossians 3:15', 'Isaiah 26:3', 'Psalm 55:22'],
  'hebrews 12:1-2': ['1 Corinthians 9:24', 'Philippians 3:13-14', 'Galatians 5:7', 'Acts 20:24', '2 Timothy 4:7'],
  'james 1:2-4': ['Romans 5:3-5', '1 Peter 1:6-7', 'Romans 8:28', 'Hebrews 12:11', '2 Corinthians 4:17'],
  '2 timothy 1:7': ['Isaiah 41:10', 'Joshua 1:9', 'Romans 8:15', '1 John 4:18', 'Psalm 27:1'],
  'proverbs 27:17': ['Ecclesiastes 4:9-10', 'Hebrews 10:24-25', 'Galatians 6:1-2', 'Colossians 3:16', '1 Thessalonians 5:11'],
  'ephesians 6:10-11': ['2 Corinthians 10:4', '1 Peter 5:8-9', 'James 4:7', 'Romans 13:12', 'Ephesians 6:13-18'],
  'micah 6:8': ['Deuteronomy 10:12', 'James 1:27', 'Isaiah 1:17', 'Hosea 6:6', 'Matthew 23:23'],
  'psalm 119:105': ['Proverbs 6:23', '2 Peter 1:19', 'Psalm 19:8', 'Psalm 43:3', 'John 8:12'],
  'lamentations 3:22-23': ['Psalm 30:5', 'Psalm 36:5', 'Numbers 23:19', 'Hebrews 10:23', 'Isaiah 54:10'],
  'john 14:6': ['Acts 4:12', 'John 10:9', '1 Timothy 2:5', 'Hebrews 10:19-20', 'John 11:25'],
  'matthew 28:19': ['Mark 16:15', 'Acts 1:8', 'Romans 10:14-15', 'Luke 24:47', '2 Corinthians 5:20'],
  'colossians 3:23-24': ['Ephesians 6:7', '1 Corinthians 10:31', 'Ecclesiastes 9:10', 'Romans 12:11', 'Galatians 6:9'],
  'matthew 6:33': ['Luke 12:31', 'Psalm 37:4', 'Proverbs 3:9-10', '1 Kings 3:13', 'Romans 14:17'],
  'genesis 1:1': ['John 1:1-3', 'Hebrews 11:3', 'Psalm 33:6', 'Colossians 1:16', 'Isaiah 45:18'],
  'psalm 51': ['1 John 1:9', '2 Samuel 12:13', 'Psalm 32:5', 'Isaiah 1:18', 'Micah 7:18-19'],
  'romans 12:2': ['Ephesians 4:23', '1 John 2:15', 'Colossians 3:2', 'Philippians 4:8', '1 Peter 1:14'],
  'john 10:10': ['Romans 6:23', 'John 14:6', 'John 6:35', '1 John 5:12', 'John 17:3'],
  '2 corinthians 12:9': ['Philippians 4:13', 'Isaiah 40:29', '2 Corinthians 4:7', 'Hebrews 4:16', '1 Corinthians 1:27'],
  'revelation 21:4': ['Isaiah 25:8', 'Isaiah 65:19', 'Psalm 30:5', '1 Corinthians 15:26', 'Revelation 7:17'],
};

class BibleService {
  constructor(esvApiKey) {
    this.esvApiKey = esvApiKey;

    // Cache to avoid hitting APIs for the same verse repeatedly
    // Key: "translation:reference" -> Value: { text, reference }
    this.cache = new Map();

    // Track the last verse looked up per user (for !next / !previous)
    // Key: username -> Value: { book, chapter, verse, translation }
    this.userLastVerse = new Map();
  }

  /**
   * Look up a Bible verse. Tries ESV API first, falls back to bible-api.com
   * 
   * @param {string} reference - e.g., "John 3:16" or "Romans 8:28-30"
   * @param {string} translation - e.g., "esv", "kjv", "web"
   * @returns {Promise<{text: string, reference: string, translation: string}|null>}
   */
  async getVerse(reference, translation = 'esv') {
    const cacheKey = `${translation}:${reference}`.toLowerCase();

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let result = null;

    // Try ESV API if that's the requested translation and we have a key
    if (translation.toLowerCase() === 'esv' && this.esvApiKey) {
      result = await this.fetchFromESV(reference);
    }

    // If ESV didn't work or different translation requested, try bible-api.com
    if (!result) {
      result = await this.fetchFromBibleApi(reference, translation);
    }

    // Cache successful results
    if (result) {
      this.cache.set(cacheKey, result);

      // Keep cache from growing forever (max 500 entries)
      if (this.cache.size > 500) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
    }

    return result;
  }

  /**
   * Fetch verse from the ESV API (primary source)
   * Docs: https://api.esv.org/docs/
   */
  async fetchFromESV(reference) {
    try {
      const response = await axios.get('https://api.esv.org/v3/passage/text/', {
        params: {
          q: reference,
          'include-headings': false,
          'include-footnotes': false,
          'include-verse-numbers': true,
          'include-short-copyright': false,
          'include-passage-references': true,
          'indent-paragraphs': 0,
          'indent-poetry': false,
          'wrapping-column': 0  // No line wrapping
        },
        headers: {
          'Authorization': `Token ${this.esvApiKey}`
        },
        timeout: 5000  // 5 second timeout
      });

      const data = response.data;

      if (data.passages && data.passages.length > 0) {
        // Clean up the text (remove extra whitespace, newlines)
        let text = data.passages[0]
          .replace(/\n\s*/g, ' ')  // Replace newlines with spaces
          .replace(/\s+/g, ' ')     // Collapse multiple spaces
          .trim();

        if (text && text !== '') {
          return {
            text: text,
            reference: data.canonical || reference,
            translation: 'ESV'
          };
        }
      }

      return null;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('[ESV API] Invalid API key! Check your ESV_API_KEY in .env');
      } else if (error.response?.status === 429) {
        console.error('[ESV API] Rate limited — too many requests');
      } else {
        console.error('[ESV API] Error:', error.message);
      }
      return null;
    }
  }

  /**
   * Fetch verse from bible-api.com (fallback, no API key needed)
   * Supports: web (World English Bible), kjv, and others
   * Docs: https://bible-api.com/
   */
  async fetchFromBibleApi(reference, translation = 'web') {
    try {
      // bible-api.com uses lowercase translation codes
      const translationCode = translation.toLowerCase();

      // Map some common names to what bible-api.com expects
      const translationMap = {
        'esv': 'web',     // ESV not available here, fall back to WEB
        'nlt': 'web',     // NLT not available here, fall back to WEB
        'nasb': 'web',    // NASB not available here, fall back to WEB
        'nkjv': 'kjv',    // NKJV not available, fall back to KJV
        'niv': 'web',     // NIV not available, fall back to WEB
        'csb': 'web',     // CSB not available, fall back to WEB
        'amp': 'web',     // AMP not available, fall back to WEB
      };

      const apiTranslation = translationMap[translationCode] || translationCode;
      const requestedTranslation = translationCode.toUpperCase();
      const isFallback = translationMap.hasOwnProperty(translationCode) && translationMap[translationCode] !== translationCode;

      const url = `https://bible-api.com/${encodeURIComponent(reference)}`;
      const response = await axios.get(url, {
        params: { translation: apiTranslation },
        timeout: 5000
      });

      const data = response.data;

      if (data.text) {
        // Clean up the text
        let text = data.text
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          text: text,
          reference: data.reference || reference,
          translation: requestedTranslation,
          fallbackFrom: isFallback ? apiTranslation.toUpperCase() : null
        };
      }

      return null;
    } catch (error) {
      console.error('[bible-api.com] Error:', error.message);
      return null;
    }
  }

  // ========================================
  // CROSS-REFERENCES
  // ========================================

  /**
   * Get cross-references for a passage.
   * Uses a curated database of well-known cross-references,
   * with a keyword-based ESV search as fallback.
   * 
   * @param {string} reference - e.g., "John 3:16"
   * @returns {Promise<string[]>} - Array of cross-reference strings
   */
  async getCrossReferences(reference) {
    // Normalize reference for lookup (lowercase, collapse spaces)
    const normalized = reference.toLowerCase().replace(/\s+/g, ' ').trim();

    // Check curated cross-reference database first
    for (const [key, refs] of Object.entries(CROSS_REFERENCES)) {
      if (normalized.includes(key.toLowerCase())) {
        return refs.slice(0, 5);
      }
    }

    // Fallback: fetch the verse text, then search for a key phrase
    if (this.esvApiKey) {
      try {
        const verse = await this.getVerse(reference, 'esv');
        if (verse && verse.text) {
          // Extract a distinctive phrase (first ~4 words after verse numbers)
          const cleanText = verse.text.replace(/\[\d+\]\s*/g, '').trim();
          const words = cleanText.split(/\s+/).slice(0, 4).join(' ');
          
          if (words.length > 8) {
            const searchResult = await this.searchVerses(words, 5);
            if (searchResult.results && searchResult.results.length > 0) {
              // Filter out the original verse itself
              return searchResult.results
                .map(r => r.reference)
                .filter(r => !r.toLowerCase().includes(normalized.split(':')[0]))
                .slice(0, 5);
            }
          }
        }
      } catch (error) {
        console.error('[Cross-ref] Fallback search error:', error.message);
      }
    }

    return [];
  }

  // ========================================
  // KEYWORD SEARCH (ESV API)
  // ========================================

  /**
   * Search for verses containing a keyword or phrase.
   * Uses the ESV API search endpoint.
   * 
   * @param {string} query - Search terms (e.g., "grace", "forgiveness")
   * @param {number} limit - Max results (default 5)
   * @returns {Promise<{results: Array, total: number}>}
   */
  async searchVerses(query, limit = 5) {
    if (!this.esvApiKey) {
      return { results: [], total: 0, error: 'ESV API key required for search' };
    }

    try {
      const response = await axios.get('https://api.esv.org/v3/passage/search/', {
        params: {
          q: query,
          'page-size': limit,
          'page': 1
        },
        headers: {
          'Authorization': `Token ${this.esvApiKey}`
        },
        timeout: 8000
      });

      const data = response.data;

      if (data.results && data.results.length > 0) {
        const results = data.results.map(r => ({
          reference: r.reference,
          text: r.content
            .replace(/<[^>]*>/g, '')  // Strip HTML tags
            .replace(/\n\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200)  // Truncate for display
        }));

        return {
          results: results,
          total: data.total_results || results.length,
        };
      }

      return { results: [], total: 0 };
    } catch (error) {
      console.error('[ESV API] Search error:', error.message);
      return { results: [], total: 0, error: error.message };
    }
  }

  // ========================================
  // CHAPTER READING MODE
  // ========================================

  /**
   * Get a full chapter's text, optionally split into chunks for multiple messages.
   * 
   * @param {string} reference - e.g., "Psalm 23", "Romans 8"
   * @param {string} translation - e.g., "esv"
   * @param {number} maxChunkLength - Max characters per chunk (default 1900 for Discord)
   * @returns {Promise<{chunks: string[], reference: string, translation: string}|null>}
   */
  async getChapter(reference, translation = 'esv', maxChunkLength = 1900) {
    // Fetch the full chapter
    const result = await this.getVerse(reference, translation);
    if (!result) return null;

    const text = result.text;
    const chunks = [];

    // Split into chunks that respect sentence/verse boundaries
    if (text.length <= maxChunkLength) {
      chunks.push(text);
    } else {
      let remaining = text;
      while (remaining.length > 0) {
        if (remaining.length <= maxChunkLength) {
          chunks.push(remaining);
          break;
        }

        // Find a good break point (end of verse or sentence)
        let breakPoint = remaining.lastIndexOf('. ', maxChunkLength);
        if (breakPoint < maxChunkLength * 0.5) {
          // If no good sentence break, try a verse number
          breakPoint = remaining.lastIndexOf('] ', maxChunkLength);
        }
        if (breakPoint < maxChunkLength * 0.3) {
          // Last resort: break at a space
          breakPoint = remaining.lastIndexOf(' ', maxChunkLength);
        }
        if (breakPoint <= 0) breakPoint = maxChunkLength;

        chunks.push(remaining.substring(0, breakPoint + 1).trim());
        remaining = remaining.substring(breakPoint + 1).trim();
      }
    }

    return {
      chunks: chunks,
      reference: result.reference,
      translation: result.translation
    };
  }

  // ========================================
  // EXISTING FEATURES
  // ========================================

  /**
   * Get a random verse. Uses a curated list of impactful verses.
   */
  async getRandomVerse(translation = 'esv') {
    const verses = [
      'John 3:16', 'Romans 8:28', 'Jeremiah 29:11', 'Philippians 4:13',
      'Isaiah 41:10', 'Psalm 23:4', 'Romans 8:38-39', '2 Corinthians 5:17',
      'Ephesians 2:8-9', 'Psalm 46:1', 'Proverbs 3:5-6', 'Matthew 11:28-30',
      'Romans 12:2', 'Galatians 2:20', 'Joshua 1:9', 'Psalm 34:18',
      'Isaiah 40:31', 'Psalm 147:3', 'Romans 5:8', '1 Peter 5:7',
      'Lamentations 3:22-23', 'John 16:33', 'Galatians 5:1', 'Psalm 139:14',
      'Hebrews 12:1-2', 'James 1:2-4', '2 Timothy 1:7', 'Philippians 4:6-7',
      'Psalm 91:1-2', 'Isaiah 43:2', 'Romans 15:13', 'Colossians 3:23-24',
      'Micah 6:8', 'Psalm 119:105', '1 John 4:19', 'Matthew 5:14-16',
      'Deuteronomy 31:6', 'Psalm 27:1', 'John 14:27', 'Romans 6:23',
      'Ephesians 6:10-11', '1 Corinthians 10:13', 'Psalm 37:4',
      'Isaiah 54:17', 'John 10:10', 'Psalm 18:2', 'Matthew 6:33',
      '2 Corinthians 12:9', 'Hebrews 4:16', 'Revelation 21:4'
    ];

    const randomRef = verses[Math.floor(Math.random() * verses.length)];
    return this.getVerse(randomRef, translation);
  }

  /**
   * Get the Verse of the Day.
   * Uses a rotating schedule based on the day of the year.
   */
  async getVerseOfTheDay(translation = 'esv') {
    const dailyVerses = [
      // Week 1-2: New beginnings / Identity in Christ
      '2 Corinthians 5:17', 'Ephesians 2:10', 'Galatians 2:20', 'Colossians 3:3',
      '1 Peter 2:9', 'Romans 8:1', 'John 1:12', 'Ephesians 1:4-5',
      'Romans 8:17', 'Psalm 139:14', '2 Corinthians 3:18', 'Jeremiah 1:5',
      'Isaiah 43:1', 'Galatians 3:26',
      // Week 3-4: Grace and Salvation
      'Ephesians 2:8-9', 'Romans 5:8', 'John 3:16', 'Titus 3:5',
      'Romans 6:23', 'Romans 3:23-24', '1 John 1:9', 'Romans 10:9',
      'Acts 16:31', 'John 14:6', 'John 10:28', 'Romans 8:38-39',
      'Hebrews 7:25', 'Ephesians 1:7',
      // Week 5-6: Strength and Courage  
      'Joshua 1:9', 'Isaiah 41:10', 'Philippians 4:13', '2 Timothy 1:7',
      'Deuteronomy 31:6', 'Psalm 27:1', 'Psalm 18:2', 'Isaiah 40:31',
      'Psalm 46:1', 'Nehemiah 8:10', 'Psalm 28:7', 'Ephesians 6:10',
      'Psalm 118:6', '2 Corinthians 12:9',
      // Week 7-8: Hope and Future
      'Jeremiah 29:11', 'Romans 15:13', 'Romans 8:28', 'Proverbs 3:5-6',
      'Psalm 37:4', 'Isaiah 43:18-19', 'Lamentations 3:22-23', 'Psalm 30:5',
      'Hebrews 11:1', 'Romans 5:3-5', 'Psalm 42:11', 'Habakkuk 3:17-18',
      'Psalm 62:5-6', 'Philippians 1:6',
      // Week 9-10: Peace and Comfort
      'John 14:27', 'Philippians 4:6-7', 'Matthew 11:28-30', 'Psalm 23:1-3',
      'Isaiah 26:3', 'Psalm 34:18', '2 Corinthians 1:3-4', 'Romans 8:26',
      '1 Peter 5:7', 'Psalm 55:22', 'Psalm 147:3', 'Isaiah 43:2',
      'John 16:33', 'Psalm 91:1-2'
    ];

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % dailyVerses.length;

    return this.getVerse(dailyVerses[index], translation);
  }

  /**
   * Store the last verse a user looked up (for !next / !previous navigation)
   */
  setUserLastVerse(username, reference, translation) {
    this.userLastVerse.set(username.toLowerCase(), { reference, translation });
  }

  /**
   * Get the last verse a user looked up
   */
  getUserLastVerse(username) {
    return this.userLastVerse.get(username.toLowerCase()) || null;
  }
}

module.exports = BibleService;
