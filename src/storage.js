// ============================================
// storage.js — Persistent JSON file storage
// ============================================
// Saves user preferences, bookmarks, streaks, etc.
// to JSON files so they survive bot restarts.
//
// "Your word is a lamp to my feet and a light to my path."
// — Psalm 119:105 (ESV)

const fs = require('fs');
const path = require('path');

class Storage {
  constructor(dataDir) {
    this.dataDir = dataDir || path.join(__dirname, '..', 'data');

    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${this.dataDir}`);
    }

    // Load all data files
    this.preferences = this.load('preferences.json');   // { username: { translation: 'esv' } }
    this.bookmarks = this.load('bookmarks.json');        // { username: [{ ref, text, translation, savedAt }] }
    this.streaks = this.load('streaks.json');             // { username: { current: 5, best: 12, lastDate: '2026-02-13' } }
    this.triviaScores = this.load('trivia-scores.json'); // { username: { correct: 10, total: 15 } }
  }

  /**
   * Load a JSON file from the data directory
   */
  load(filename) {
    const filepath = path.join(this.dataDir, filename);
    try {
      if (fs.existsSync(filepath)) {
        const raw = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (error) {
      console.error(`[Storage] Error loading ${filename}:`, error.message);
    }
    return {};
  }

  /**
   * Save data to a JSON file in the data directory.
   * Uses debouncing to avoid excessive disk writes during high activity.
   * Each file gets its own debounce timer (2 second delay).
   */
  save(filename, data) {
    // Initialize pending saves tracker
    if (!this._pendingSaves) {
      this._pendingSaves = new Map();
    }

    // Clear existing timer for this file (debounce)
    if (this._pendingSaves.has(filename)) {
      clearTimeout(this._pendingSaves.get(filename));
    }

    // Schedule the write after a short delay
    const timer = setTimeout(() => {
      this._pendingSaves.delete(filename);
      this._writeFile(filename, data);
    }, 2000);

    this._pendingSaves.set(filename, timer);
  }

  /**
   * Immediately write data to disk (no debounce).
   * Used internally by the debounced save() method.
   */
  _writeFile(filename, data) {
    const filepath = path.join(this.dataDir, filename);
    try {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`[Storage] Error saving ${filename}:`, error.message);
    }
  }

  /**
   * Flush all pending saves immediately (call on shutdown).
   */
  flushAll() {
    if (!this._pendingSaves) return;
    for (const [filename, timer] of this._pendingSaves.entries()) {
      clearTimeout(timer);
      this._pendingSaves.delete(filename);
    }
    // Write current state of all data
    this._writeFile('preferences.json', this.preferences);
    this._writeFile('bookmarks.json', this.bookmarks);
    this._writeFile('streaks.json', this.streaks);
    this._writeFile('trivia-scores.json', this.triviaScores);
  }

  // ========================================
  // USER PREFERENCES
  // ========================================

  getPreference(username, key) {
    const user = this.preferences[username.toLowerCase()];
    return user ? user[key] : undefined;
  }

  setPreference(username, key, value) {
    const uname = username.toLowerCase();
    if (!this.preferences[uname]) {
      this.preferences[uname] = {};
    }
    this.preferences[uname][key] = value;
    this.save('preferences.json', this.preferences);
  }

  getTranslation(username) {
    return this.getPreference(username, 'translation');
  }

  setTranslation(username, translation) {
    this.setPreference(username, 'translation', translation);
  }

  // ========================================
  // BOOKMARKS / FAVORITES
  // ========================================

  getBookmarks(username) {
    return this.bookmarks[username.toLowerCase()] || [];
  }

  addBookmark(username, reference, text, translation) {
    const uname = username.toLowerCase();
    if (!this.bookmarks[uname]) {
      this.bookmarks[uname] = [];
    }

    // Don't duplicate
    const exists = this.bookmarks[uname].some(b => b.reference === reference && b.translation === translation);
    if (exists) return false;

    // Max 50 bookmarks per user
    if (this.bookmarks[uname].length >= 50) {
      this.bookmarks[uname].shift(); // Remove oldest
    }

    this.bookmarks[uname].push({
      reference,
      text: text.substring(0, 200), // Truncate for storage
      translation,
      savedAt: new Date().toISOString()
    });

    this.save('bookmarks.json', this.bookmarks);
    return true;
  }

  removeBookmark(username, index) {
    const uname = username.toLowerCase();
    const bookmarks = this.bookmarks[uname];
    if (!bookmarks || index < 0 || index >= bookmarks.length) return false;

    bookmarks.splice(index, 1);
    this.save('bookmarks.json', this.bookmarks);
    return true;
  }

  // ========================================
  // VOTD STREAKS
  // ========================================

  /**
   * Record that a user checked in with !votd today.
   * Returns the updated streak info.
   */
  recordStreak(username) {
    const uname = username.toLowerCase();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (!this.streaks[uname]) {
      this.streaks[uname] = { current: 0, best: 0, lastDate: null, totalCheckins: 0 };
    }

    const streak = this.streaks[uname];

    // Already checked in today
    if (streak.lastDate === today) {
      return streak;
    }

    // Check if yesterday was the last check-in (continues streak)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastDate === yesterdayStr) {
      streak.current += 1;
    } else {
      streak.current = 1; // Reset streak
    }

    streak.lastDate = today;
    streak.totalCheckins = (streak.totalCheckins || 0) + 1;

    if (streak.current > streak.best) {
      streak.best = streak.current;
    }

    this.save('streaks.json', this.streaks);
    return streak;
  }

  getStreak(username) {
    return this.streaks[username.toLowerCase()] || { current: 0, best: 0, lastDate: null, totalCheckins: 0 };
  }

  // ========================================
  // TRIVIA SCORES
  // ========================================

  recordTriviaAnswer(username, correct) {
    const uname = username.toLowerCase();
    if (!this.triviaScores[uname]) {
      this.triviaScores[uname] = { correct: 0, total: 0 };
    }

    this.triviaScores[uname].total += 1;
    if (correct) {
      this.triviaScores[uname].correct += 1;
    }

    this.save('trivia-scores.json', this.triviaScores);
    return this.triviaScores[uname];
  }

  getTriviaScore(username) {
    return this.triviaScores[username.toLowerCase()] || { correct: 0, total: 0 };
  }

  getTriviaLeaderboard(limit = 10) {
    return Object.entries(this.triviaScores)
      .map(([username, stats]) => ({ username, ...stats }))
      .sort((a, b) => b.correct - a.correct)
      .slice(0, limit);
  }
}

module.exports = Storage;
