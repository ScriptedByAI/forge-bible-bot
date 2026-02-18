# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Forge Bible Bot, please report it responsibly.

**Do NOT open a public issue for security vulnerabilities.**

Instead, please email or DM the maintainer directly with:
- A description of the vulnerability
- Steps to reproduce it
- Any potential impact

We take security seriously, especially since this bot handles prayer requests and connects to people's Discord servers and Twitch channels.

## What Counts as a Security Issue

- Exposure of API keys, tokens, or credentials
- Unauthorized access to prayer requests or private data
- Ability to execute commands as another user
- Vulnerabilities in dependencies

## Best Practices for Users

- **Never commit your `.env` file** — it's gitignored for a reason
- **Keep your bot token private** — if it leaks, regenerate it immediately in the Discord Developer Portal
- **Keep Node.js updated** — run `npm audit` periodically to check for dependency vulnerabilities
- **Use a dedicated bot account** — don't run the bot under your personal Twitch or Discord account
