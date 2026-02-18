// ============================================
// obs-overlay.js — OBS Browser Source Overlay Server
// ============================================
// Serves an HTML page that displays Bible verses in real-time
// as an OBS Browser Source overlay on your stream.
//
// HOW IT WORKS:
// 1. This starts a tiny web server on localhost:3000
// 2. In OBS, add a Browser Source pointing to http://localhost:3000
// 3. Whenever someone looks up a verse (Twitch or Discord), it
//    gets pushed to the overlay via Server-Sent Events (SSE)
// 4. The verse appears on screen with a smooth animation, stays
//    for a few seconds, then fades out
//
// "Let the word of Christ dwell in you richly"
// — Colossians 3:16 (ESV)

const express = require('express');
const path = require('path');

class OBSOverlay {
  constructor(port = 3000) {
    this.port = port;
    this.app = express();
    this.clients = []; // SSE connected clients
    this.server = null;
    this.currentTopic = null;

    this.setupRoutes();
  }

  setupRoutes() {
    // Serve the overlay HTML
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'overlay', 'index.html'));
    });

    // SSE endpoint — OBS Browser Source connects here
    this.app.get('/events', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Send a heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        res.write(':heartbeat\n\n');
      }, 15000);

      // Add to connected clients
      this.clients.push(res);
      console.log(`[OBS Overlay] Client connected (${this.clients.length} total)`);

      // Send current topic if one is set
      if (this.currentTopic) {
        res.write(`event: topic\ndata: ${JSON.stringify(this.currentTopic)}\n\n`);
      }

      // Remove on disconnect
      req.on('close', () => {
        clearInterval(heartbeat);
        this.clients = this.clients.filter(c => c !== res);
        console.log(`[OBS Overlay] Client disconnected (${this.clients.length} total)`);
      });
    });

    // Health check / status
    this.app.get('/status', (req, res) => {
      res.json({
        status: 'ok',
        clients: this.clients.length,
        topic: this.currentTopic,
      });
    });
  }

  /**
   * Send a verse to all connected overlay clients
   */
  sendVerse(reference, text, translation, username) {
    const data = {
      type: 'verse',
      reference,
      text,
      translation,
      username,
      timestamp: Date.now(),
    };

    this.broadcast('verse', data);
  }

  /**
   * Send a topic update to all connected overlay clients
   */
  sendTopic(reference, description) {
    this.currentTopic = { reference, description };
    this.broadcast('topic', this.currentTopic);
  }

  /**
   * Clear the topic
   */
  clearTopic() {
    this.currentTopic = null;
    this.broadcast('topic_clear', {});
  }

  /**
   * Broadcast an SSE event to all connected clients
   */
  broadcast(event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.write(message);
      } catch (e) {
        // Client may have disconnected
      }
    });
  }

  /**
   * Start the overlay server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`📺 OBS Overlay server running at http://localhost:${this.port}`);
          console.log(`   Add as Browser Source in OBS → http://localhost:${this.port}`);
          resolve();
        });

        this.server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️  OBS Overlay port ${this.port} is in use — overlay disabled`);
            console.warn(`   Change OBS_OVERLAY_PORT in .env or stop the other process`);
            resolve(); // Don't crash the bot over this
          } else {
            reject(err);
          }
        });
      } catch (err) {
        console.error('[OBS Overlay] Failed to start:', err.message);
        resolve(); // Don't crash the bot
      }
    });
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('[OBS Overlay] Server stopped');
    }
  }
}

module.exports = OBSOverlay;
