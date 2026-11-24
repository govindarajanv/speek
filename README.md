# Speek — Situational Spoken English

An interactive, client-side **Situational Spoken English** learning web application. It helps you discover, listen to, and master real-world English words and phrases grouped by everyday situations and categories.

Unlike a random phrase bank, **Speek** maintains structured categories and situations so you can immediately find and practice the exact expressions needed for any scenario—from daily greetings and casual small talk to workplace meetings, telephone conversations, giving opinions, dining out, and travel.

---

## Live Site (GitHub Pages)

The live application is hosted on GitHub Pages:

👉 **[https://govindarajanv.github.io/speek/](https://govindarajanv.github.io/speek/)**

> The site is automatically built and published via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.

---

## Key Features

- **Categorized & Grouped by Situation**:
  - Organized into 7 core categories:
    - **Greetings & Social** (Saying Hello & Goodbye, Introductions, Small Talk, Ending Conversations Politely, Making Plans)
    - **Gratitude & Apologies** (Saying Thank You, Responding to Thank You, Apologizing, Asking for Help)
    - **Opinions & Discussion** (Asking for Opinions, Giving Opinions, Agreeing, Disagreeing, Asking for Clarification)
    - **Work & Professional** (Work Meetings, Telephone Calls, Asking/Talking About Jobs, Statistics, Decisions)
    - **Daily Life & Errands** (Shopping & Prices, Food & Dining, Airport & Travel, Weather & Rain, Excuses for Being Late)
    - **Feelings & Relationships** (Describing Relationships, Complaining, Good/Bad News, Relief & Worries)
    - **Idioms & Fluency Expressions** (Everyday Idioms, Expressions of Age, Wealth, Luck, Certainty)
  - Contains **87 distinct situations** and **920+ playable expressions**.

- **Playable Audio (Web Speech API)**:
  - 🔊 **Individual Phrase Audio**: Click the speaker button on any phrase or usage example to hear natural pronunciation.
  - ▶ **Play Situation**: Listen to every phrase within a given situation in sequence.
  - ▶ **Play Category / Play All Visible**: Play through entire categories or current search/filter results.
  - **Sticky Player Dock**: Controls for Pause/Resume, Next, Previous, and Stop with active row highlighting and auto-scroll.
  - **Voice & Speed Settings**: Prioritizes US English voices with speed control (0.5x to 2.0x), persisted in local storage.

- **Practice Flashcards**:
  - 3D flip card deck for interactive review and spaced recall.
  - Filter flashcards by category or individual situation.
  - Flip to reveal meaning and context, listen to audio on both sides, shuffle, and mark phrases as Mastered.

- **Live Search & Filter**:
  - Instant search across phrases, meanings, situations, and usage notes.
  - Filter by category tabs with live phrase and situation count badges.

- **Favorites / Bookmarks**:
  - Star ⭐ any phrase to save it to your bookmarks list.
  - Toggle Bookmarks view in the header to review your personal study list.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- `npm`

### Installation & Commands

```bash
# Clone the repository
git clone https://github.com/govindarajanv/speek.git
cd speek

# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Run unit tests (Vitest + JSDOM)
npm test

# Build production static bundle (dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/)
- **Frontend**: Vanilla JavaScript (ES modules), HTML5, CSS3
- **Audio**: Native Web Speech API (`window.speechSynthesis`)
- **State & Storage**: `localStorage` for voice settings, rate, bookmarks, and mastered cards
- **Testing**: [Vitest](https://vitest.dev/) with `jsdom` environment
- **CI/CD**: GitHub Actions (`deploy.yml`) for GitHub Pages deployment and `Jenkinsfile` for pipeline builds

---

## Versioning

Follows **Semantic Versioning** (`v[major].[minor].[patch]`), starting at **v1.0.0**. The active version is displayed in the header badge and footer, and matches `package.json` and git tags.

---

## References

1. [Espresso English: 500 Real English Phrases (PDF)](https://www.espressoenglish.net/wp-content/uploads/free/500-Real-English-Phrases.pdf)
2. [Medium: 100 Essential English Phrases for Everyday Conversations](https://medium.com/@mahtabmalik79/100-essential-english-phrases-for-everyday-conversations-fa7cf92d19aa)
3. [PlanetSpark: 1000 English Phrases with Meanings](https://www.planetspark.in/spoken-english/1000-english-phrases-with-meanings)
4. *Reference for future versions*: [650 English Phrases for Everyday Speaking](https://learningenglandblog.wordpress.com/wp-content/uploads/2018/04/650_english_phrases_for_everyday_speaking.pdf)
