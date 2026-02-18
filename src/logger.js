// ============================================
// logger.js — Structured logging for Forge Bot
// ============================================
// "The heart of the discerning acquires knowledge,
//  for the ears of the wise seek it out."
// — Proverbs 18:15 (NIV)

const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURATION
// ========================================

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'bot.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB — rotate when exceeded

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ========================================
// LOG ROTATION
// ========================================

/**
 * Rotate a log file if it exceeds MAX_LOG_SIZE.
 * Keeps one backup (.1) and overwrites on next rotation.
 */
function rotateIfNeeded(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size >= MAX_LOG_SIZE) {
        const backup = filePath + '.1';
        if (fs.existsSync(backup)) fs.unlinkSync(backup);
        fs.renameSync(filePath, backup);
      }
    }
  } catch (err) {
    // Don't let log rotation errors crash the bot
    console.error('[LOGGER] Rotation error:', err.message);
  }
}

// ========================================
// FORMATTING
// ========================================

function timestamp() {
  return new Date().toISOString();
}

/**
 * Format a log line for file output.
 * Example: 2025-02-15T14:30:00.000Z [ERROR] [DISCORD] Auto-detect failed | channel=#general (123456) | trigger="John 3:16" | error=Missing Permissions
 */
function formatLogLine(level, source, message, context = {}) {
  let line = `${timestamp()} [${level}] [${source}] ${message}`;

  // Append context key=value pairs
  const contextParts = Object.entries(context)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${typeof v === 'string' && v.includes(' ') ? `"${v}"` : v}`);

  if (contextParts.length > 0) {
    line += ' | ' + contextParts.join(' | ');
  }

  return line;
}

/**
 * Format a console-friendly version (shorter, with emoji)
 */
function formatConsoleLine(level, source, message, context = {}) {
  const levelEmoji = {
    'INFO': 'ℹ️ ',
    'WARN': '⚠️ ',
    'ERROR': '❌',
    'DEBUG': '🔍',
    'CMD': '📋',
  };

  const time = new Date().toLocaleTimeString();
  let line = `[${time}] ${levelEmoji[level] || '  '} [${source}] ${message}`;

  // Only add context to console for errors/warnings
  if ((level === 'ERROR' || level === 'WARN') && Object.keys(context).length > 0) {
    const contextParts = Object.entries(context)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${v}`);
    if (contextParts.length > 0) {
      line += '\n         ' + contextParts.join(' | ');
    }
  }

  return line;
}

// ========================================
// WRITE TO FILE
// ========================================

function writeToFile(filePath, line) {
  try {
    rotateIfNeeded(filePath);
    fs.appendFileSync(filePath, line + '\n');
  } catch (err) {
    // Silently fail — logging should never crash the bot
  }
}

// ========================================
// PUBLIC API
// ========================================

const logger = {
  /**
   * General info log
   * @param {string} source - Module name (e.g., 'DISCORD', 'TWITCH', 'TRIVIA')
   * @param {string} message - Human-readable description
   * @param {object} context - Optional key-value pairs for context
   */
  info(source, message, context = {}) {
    console.log(formatConsoleLine('INFO', source, message, context));
    writeToFile(LOG_FILE, formatLogLine('INFO', source, message, context));
  },

  /**
   * Warning — something unexpected but not breaking
   */
  warn(source, message, context = {}) {
    console.warn(formatConsoleLine('WARN', source, message, context));
    writeToFile(LOG_FILE, formatLogLine('WARN', source, message, context));
    writeToFile(ERROR_LOG_FILE, formatLogLine('WARN', source, message, context));
  },

  /**
   * Error — something broke
   * @param {string} source - Module name
   * @param {string} message - What went wrong
   * @param {object} context - Rich context (channel, user, trigger, etc.)
   */
  error(source, message, context = {}) {
    console.error(formatConsoleLine('ERROR', source, message, context));
    writeToFile(LOG_FILE, formatLogLine('ERROR', source, message, context));
    writeToFile(ERROR_LOG_FILE, formatLogLine('ERROR', source, message, context));
  },

  /**
   * Command usage log (lighter weight)
   */
  command(source, username, command, channelName) {
    const time = new Date().toLocaleTimeString();
    const line = `[${time}] #${channelName || 'unknown'} | ${username} used ${command}`;
    console.log(line);
    writeToFile(LOG_FILE, `${timestamp()} [CMD] [${source}] ${username} used ${command} in #${channelName || 'unknown'}`);
  },

  /**
   * Raw console output (no file logging) — for banners, startup, etc.
   */
  raw(...args) {
    console.log(...args);
  },
};

module.exports = logger;
