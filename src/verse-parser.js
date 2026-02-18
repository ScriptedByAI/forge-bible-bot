// ============================================
// verse-parser.js — Detects Bible references in chat
// ============================================
// Supports: "John 3:16", "1 Cor 13:4-7", "Genesis 1:1 ESV",
//           "Psalm 23", "John 3:16,17", "Romans 8-9",
//           "John 3:16; Romans 8:28"
//
// "Your word is a lamp to my feet and a light to my path."
// — Psalm 119:105 (ESV)

// All 66 books of the Bible with their common abbreviations
const BOOK_NAMES = {
  // Old Testament
  'genesis': 'Genesis', 'gen': 'Genesis', 'ge': 'Genesis',
  'exodus': 'Exodus', 'exod': 'Exodus', 'ex': 'Exodus',
  'leviticus': 'Leviticus', 'lev': 'Leviticus', 'le': 'Leviticus',
  'numbers': 'Numbers', 'num': 'Numbers', 'nu': 'Numbers',
  'deuteronomy': 'Deuteronomy', 'deut': 'Deuteronomy', 'de': 'Deuteronomy', 'dt': 'Deuteronomy',
  'joshua': 'Joshua', 'josh': 'Joshua', 'jos': 'Joshua',
  'judges': 'Judges', 'judg': 'Judges', 'jdg': 'Judges',
  'ruth': 'Ruth', 'ru': 'Ruth',
  '1 samuel': '1 Samuel', '1samuel': '1 Samuel', '1 sam': '1 Samuel', '1sam': '1 Samuel',
  '2 samuel': '2 Samuel', '2samuel': '2 Samuel', '2 sam': '2 Samuel', '2sam': '2 Samuel',
  '1 kings': '1 Kings', '1kings': '1 Kings', '1 kgs': '1 Kings', '1kgs': '1 Kings',
  '2 kings': '2 Kings', '2kings': '2 Kings', '2 kgs': '2 Kings', '2kgs': '2 Kings',
  '1 chronicles': '1 Chronicles', '1chronicles': '1 Chronicles', '1 chr': '1 Chronicles', '1chr': '1 Chronicles', '1 chron': '1 Chronicles',
  '2 chronicles': '2 Chronicles', '2chronicles': '2 Chronicles', '2 chr': '2 Chronicles', '2chr': '2 Chronicles', '2 chron': '2 Chronicles',
  'ezra': 'Ezra', 'ezr': 'Ezra',
  'nehemiah': 'Nehemiah', 'neh': 'Nehemiah', 'ne': 'Nehemiah',
  'esther': 'Esther', 'est': 'Esther', 'esth': 'Esther',
  'job': 'Job', 'jb': 'Job',
  'psalms': 'Psalms', 'psalm': 'Psalms', 'ps': 'Psalms', 'psa': 'Psalms',
  'proverbs': 'Proverbs', 'prov': 'Proverbs', 'pr': 'Proverbs', 'pro': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes', 'eccl': 'Ecclesiastes', 'ecc': 'Ecclesiastes', 'ec': 'Ecclesiastes',
  'song of solomon': 'Song of Solomon', 'song': 'Song of Solomon', 'sos': 'Song of Solomon', 'ss': 'Song of Solomon',
  'isaiah': 'Isaiah', 'isa': 'Isaiah', 'is': 'Isaiah',
  'jeremiah': 'Jeremiah', 'jer': 'Jeremiah', 'je': 'Jeremiah',
  'lamentations': 'Lamentations', 'lam': 'Lamentations', 'la': 'Lamentations',
  'ezekiel': 'Ezekiel', 'ezek': 'Ezekiel', 'eze': 'Ezekiel',
  'daniel': 'Daniel', 'dan': 'Daniel', 'da': 'Daniel',
  'hosea': 'Hosea', 'hos': 'Hosea', 'ho': 'Hosea',
  'joel': 'Joel', 'joe': 'Joel',
  'amos': 'Amos', 'am': 'Amos',
  'obadiah': 'Obadiah', 'obad': 'Obadiah', 'ob': 'Obadiah',
  'jonah': 'Jonah', 'jon': 'Jonah',
  'micah': 'Micah', 'mic': 'Micah',
  'nahum': 'Nahum', 'nah': 'Nahum', 'na': 'Nahum',
  'habakkuk': 'Habakkuk', 'hab': 'Habakkuk',
  'zephaniah': 'Zephaniah', 'zeph': 'Zephaniah', 'zep': 'Zephaniah',
  'haggai': 'Haggai', 'hag': 'Haggai', 'hg': 'Haggai',
  'zechariah': 'Zechariah', 'zech': 'Zechariah', 'zec': 'Zechariah',
  'malachi': 'Malachi', 'mal': 'Malachi',
  // New Testament
  'matthew': 'Matthew', 'matt': 'Matthew', 'mat': 'Matthew', 'mt': 'Matthew',
  'mark': 'Mark', 'mk': 'Mark', 'mr': 'Mark',
  'luke': 'Luke', 'lk': 'Luke', 'lu': 'Luke',
  'john': 'John', 'jn': 'John', 'joh': 'John',
  'acts': 'Acts', 'act': 'Acts', 'ac': 'Acts',
  'romans': 'Romans', 'rom': 'Romans', 'ro': 'Romans',
  '1 corinthians': '1 Corinthians', '1corinthians': '1 Corinthians', '1 cor': '1 Corinthians', '1cor': '1 Corinthians',
  '2 corinthians': '2 Corinthians', '2corinthians': '2 Corinthians', '2 cor': '2 Corinthians', '2cor': '2 Corinthians',
  'galatians': 'Galatians', 'gal': 'Galatians', 'ga': 'Galatians',
  'ephesians': 'Ephesians', 'eph': 'Ephesians',
  'philippians': 'Philippians', 'phil': 'Philippians', 'php': 'Philippians',
  'colossians': 'Colossians', 'col': 'Colossians',
  '1 thessalonians': '1 Thessalonians', '1thessalonians': '1 Thessalonians', '1 thess': '1 Thessalonians', '1thess': '1 Thessalonians', '1 thes': '1 Thessalonians',
  '2 thessalonians': '2 Thessalonians', '2thessalonians': '2 Thessalonians', '2 thess': '2 Thessalonians', '2thess': '2 Thessalonians', '2 thes': '2 Thessalonians',
  '1 timothy': '1 Timothy', '1timothy': '1 Timothy', '1 tim': '1 Timothy', '1tim': '1 Timothy',
  '2 timothy': '2 Timothy', '2timothy': '2 Timothy', '2 tim': '2 Timothy', '2tim': '2 Timothy',
  'titus': 'Titus', 'tit': 'Titus',
  'philemon': 'Philemon', 'phlm': 'Philemon', 'phm': 'Philemon',
  'hebrews': 'Hebrews', 'heb': 'Hebrews',
  'james': 'James', 'jas': 'James', 'jm': 'James',
  '1 peter': '1 Peter', '1peter': '1 Peter', '1 pet': '1 Peter', '1pet': '1 Peter', '1 pe': '1 Peter',
  '2 peter': '2 Peter', '2peter': '2 Peter', '2 pet': '2 Peter', '2pet': '2 Peter', '2 pe': '2 Peter',
  '1 john': '1 John', '1john': '1 John', '1 jn': '1 John', '1jn': '1 John',
  '2 john': '2 John', '2john': '2 John', '2 jn': '2 John', '2jn': '2 John',
  '3 john': '3 John', '3john': '3 John', '3 jn': '3 John', '3jn': '3 John',
  'jude': 'Jude', 'jud': 'Jude',
  'revelation': 'Revelation', 'rev': 'Revelation', 're': 'Revelation',
};

// Known translation abbreviations
const TRANSLATIONS = ['esv', 'kjv', 'web', 'nlt', 'nasb', 'nkjv', 'niv', 'asv', 'amp', 'csb', 'msg'];

/**
 * Parse a single Bible reference from text.
 * 
 * Handles:
 *   "John 3:16"          → single verse
 *   "John 3:16-18"       → verse range
 *   "John 3:16,17"       → comma-separated verses
 *   "Psalm 23"           → full chapter
 *   "Romans 8-9"         → chapter range
 *   "Gen 1:1 ESV"        → with translation
 *   "1 Cor 13:4-7 KJV"   → numbered book + range + translation
 * 
 * @param {string} text - The text to parse
 * @returns {object|null} - { book, chapter, verses, reference, translation } or null
 */
function parseReference(text) {
  if (!text || text.length < 3) return null;

  const input = text.trim();

  // Main regex — supports:
  //   Book Chapter:Verse(s)    — "John 3:16", "John 3:16-18", "John 3:16,17,18"
  //   Book Chapter-Chapter     — "Romans 8-9" (chapter range)
  //   Book Chapter             — "Psalm 23" (full chapter)
  //   ...optionally followed by translation
  //
  // Groups:
  //   1: Book name (with optional leading number)
  //   2: Chapter (or start chapter)
  //   3: Verse part (e.g., "16", "16-18", "16,17,18") — optional
  //   4: End chapter for chapter ranges (e.g., the "9" in "Romans 8-9") — optional
  //   5: Translation — optional
  const regex = /^((?:[123]\s*)?[a-zA-Z]+(?:\s+of\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+(?:\s*[-–—,]\s*\d+)*))?(?:\s*[-–—]\s*(\d+))?(?:\s+([a-zA-Z]+))?$/i;

  const match = input.match(regex);
  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase();
  const chapter = match[2];
  const verses = match[3] ? match[3].replace(/\s/g, '').replace(/[–—]/g, '-') : null;
  const endChapter = match[4] || null;
  const rawTranslation = match[5] ? match[5].toLowerCase() : null;

  // Look up the book name
  const bookName = BOOK_NAMES[rawBook];
  if (!bookName) return null;

  // Check if the last part is a valid translation
  let translation = null;
  if (rawTranslation && TRANSLATIONS.includes(rawTranslation)) {
    translation = rawTranslation;
  }

  // Build the reference string
  let reference;

  if (endChapter && !verses) {
    // Chapter range: "Romans 8-9"
    reference = `${bookName} ${chapter}-${endChapter}`;
  } else if (verses) {
    // Has verses: "John 3:16", "John 3:16-18", "John 3:16,17"
    reference = `${bookName} ${chapter}:${verses}`;
  } else {
    // Chapter only: "Psalm 23"
    reference = `${bookName} ${chapter}`;
  }

  return {
    book: bookName,
    chapter: parseInt(chapter),
    endChapter: endChapter ? parseInt(endChapter) : null,
    verses: verses,
    reference: reference,
    translation: translation
  };
}

/**
 * Parse multiple references separated by semicolons.
 * 
 * Example: "John 3:16; Romans 8:28; Psalm 23 KJV"
 * Returns an array of parsed references.
 * 
 * @param {string} text - The text to parse
 * @returns {object[]} - Array of parsed references (may be empty)
 */
function parseMultiReference(text) {
  if (!text) return [];

  // Split by semicolons
  const parts = text.split(';').map(p => p.trim()).filter(p => p.length > 0);
  const results = [];

  for (const part of parts) {
    const parsed = parseReference(part);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Try to find a Bible reference anywhere in a chat message.
 * This is used for auto-detection (when someone just types "John 3:16" in chat).
 * 
 * Now also detects references embedded in longer messages.
 * 
 * @param {string} message - The full chat message
 * @returns {object|null} - Parsed reference or null
 */
function findReferenceInMessage(message) {
  if (!message) return null;

  // Don't try to parse messages that start with commands
  if (message.startsWith('!') || message.startsWith('/')) return null;

  const trimmed = message.trim();

  // Try to parse the entire message as a reference first
  const result = parseReference(trimmed);
  if (result) return result;

  // Try to find a reference embedded in a longer message
  // Build a regex pattern from all book names to search within messages
  const bookPatterns = Object.keys(BOOK_NAMES)
    .filter(k => k.length >= 3) // Skip very short abbreviations for auto-detect to reduce false positives
    .sort((a, b) => b.length - a.length); // Longest first

  for (const bookKey of bookPatterns) {
    // Look for this book name followed by chapter/verse numbers
    const escapedBook = bookKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(?:^|\\s)(${escapedBook})\\s+(\\d+)(?::(\\d+(?:\\s*[-–—,]\\s*\\d+)*))?(?:\\s*[-–—]\\s*(\\d+))?(?:\\s+(${TRANSLATIONS.join('|')}))?(?:\\s|$|[.,!?;])`,
      'i'
    );

    const match = trimmed.match(pattern);
    if (match) {
      // Reconstruct the reference text from the match
      let refText = match[1] + ' ' + match[2];
      if (match[3]) refText += ':' + match[3];
      if (match[4] && !match[3]) refText += '-' + match[4];
      if (match[5]) refText += ' ' + match[5];

      const parsed = parseReference(refText.trim());
      if (parsed) return parsed;
    }
  }

  return null;
}

module.exports = { parseReference, parseMultiReference, findReferenceInMessage, TRANSLATIONS, BOOK_NAMES };
