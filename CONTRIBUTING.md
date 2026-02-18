# Contributing to Forge Bible Bot

Thanks for your interest in contributing! This project exists to serve Christian content creators and online ministries, and community contributions help make it better for everyone.

## Ways to Contribute

**No coding required:**
- Submit new Bible trivia questions (use the Trivia Questions issue template)
- Report bugs you encounter
- Suggest features that would help your ministry
- Improve documentation or fix typos

**Code contributions:**
- Fix open issues
- Add new features
- Improve answer matching for trivia
- Add support for new Bible translations

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/forge-bible-bot.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure (see README)
5. Create a branch: `git checkout -b your-feature-name`
6. Make your changes
7. Test with `npm start`
8. Commit and push
9. Open a Pull Request

## Guidelines

- **Keep it Christ-centered.** This is a ministry tool. All content should be biblically sound and edifying.
- **Test your changes.** Make sure the bot starts and your feature works on whichever platform it applies to.
- **No API keys or tokens in code.** All secrets go in `.env` (which is gitignored).
- **Keep Twitch messages under 500 characters.** That's the platform limit.
- **Trivia questions need references.** Every answer should be verifiable in Scripture.

## Code Style

- Use `const` and `let`, not `var`
- Use single quotes for strings
- Descriptive variable names over comments where possible
- Keep functions focused — one job per function

## Questions?

Open a Discussion or Issue and we'll help you out.
