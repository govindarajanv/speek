# Speek (AGENTS.md)

This repository contains **Speek**, an interactive, client-side **Situational Spoken English** learning web application (see [README.md](file:///home/cloud_user/workspace/speek/README.md)). It helps learners master spoken English words and phrases organized by practical, real-world situations and categories.

---

## Key Architectural Differences from `business_english`

Unlike `business_english` (which used a flat "Phrase Bank" table with random batch generation buttons):
- **No Random Phrase Bank**: Speek does not use random phrase extraction or batch generation.
- **Category & Situation Organization**: Content is maintained by **high-level categories** and **situational groups** (e.g., Greetings & Social, Work & Professional, Opinions & Discussion, etc.).
- **Playable by Situation**: All words and phrases for any given situation or category can be played individually or sequentially with synchronized visual feedback.

---

## Reference Sources & Data Links

The situational dataset is compiled from the following reference materials:
1. **[Espresso English: 500 Real English Phrases (PDF)](https://www.espressoenglish.net/wp-content/uploads/free/500-Real-English-Phrases.pdf)** — Core situational topics across Beginner, Intermediate, and Advanced levels.
2. **[Medium: 100 Essential English Phrases for Everyday Conversations](https://medium.com/@mahtabmalik79/100-essential-english-phrases-for-everyday-conversations-fa7cf92d19aa)** (Mahtab Malik) — Conversational small talk, expressing opinions, polite etiquette, making plans, and business discussions.
3. **[PlanetSpark: 1000 English Phrases with Meanings](https://www.planetspark.in/spoken-english/1000-english-phrases-with-meanings)** — Daily conversational phrases, office conversation expressions, and common spoken idioms.
4. *Reference for future versions*: **[650 English Phrases for Everyday Speaking (PDF)](https://learningenglandblog.wordpress.com/wp-content/uploads/2018/04/650_english_phrases_for_everyday_speaking.pdf)**.

---

## Core Categories & Situations

Content in [src/data/phrases.js](file:///home/cloud_user/workspace/speek/src/data/phrases.js) currently comprises **87 situations** and **920+ phrases** across 7 primary categories:

1. **Greetings & Social** (14 situations):
   - Saying Hello and Goodbye, Informal Yes/No, Asking How Someone Is, Introductions, Everyday Small Talk, Making Plans, Ending Conversations Politely.
2. **Gratitude & Apologies** (7 situations):
   - Saying Thank You, Responding to Thank You, Apologizing, Responding to Apologies, Polite Everyday Phrases, Asking for Help, Asking Someone to Do Something.
3. **Opinions & Discussion** (7 situations):
   - Asking for Opinions, Giving Opinions, Expressing Opinions in Discussion, Agreeing, Disagreeing, Asking for Clarification, Checking Understanding.
4. **Work & Professional** (12 situations):
   - Workplace & Office Discussions, Telephone Calls, Asking & Talking About Jobs, Statistics & Data, Decisions, Encouraging Someone, Avoiding Answering.
5. **Daily Life & Errands** (11 situations):
   - Shopping & Prices, Food & Dining, Airport & Travel, Weather (Hot, Cold, Rain), TV & Entertainment, Excuses for Being Late.
6. **Feelings & Relationships** (8 situations):
   - Describing Relationships, Complaining, Good/Bad News, Worries & Relief, Expressing Fatigue & Tiredness, Disappointment.
7. **Idioms & Fluency Expressions** (28 situations):
   - Saying Something is Easy/Difficult, Expressions of Age, Being Rich & Poor, Talent & Intelligence, Good/Bad Luck, Certainty & Probability, Comparative Idioms.

---

## Implemented Requirements & UI Features

- **Playable Audio (Web Speech API)**:
  - Individual 🔊 speaker icon next to each phrase and example sentence.
  - **▶ Play Situation** button on each situation card to play all phrases in that situation in sequence.
  - **▶ Play Category** and **▶ Play All Visible** buttons for batch listening.
  - **Sticky Player Dock**: Controller with Pause/Resume, Previous, Next, and Stop buttons, synchronized with row highlighting and automatic scrolling.
  - **Voice & Speed Controls**: Prioritizes US English voices (`en-US`), with speed slider (0.5x to 2.0x), persisted in `localStorage`.
- **Category Tabs & Navigation**: Filter by category pills with live situation and phrase count badges.
- **Accordion Situation Cards**: Expand/collapse individual cards, plus **⊞ Expand All** and **⊟ Collapse All** controls.
- **Live Search**: Instant client-side search across phrases, meanings, context, situation titles, and categories, with a clear (✕) button.
- **Favorites & Bookmarks**: Star ⭐ any phrase to save it to `localStorage`; toggle **⭐ Bookmarks** to view and play starred phrases.
- **Situational Practice Flashcards**: 3D flip card deck with category and situation filtering, front/back audio playback, Previous/Next/Shuffle, and mastery tracking.
- **Branding & Responsive Design**: "Speek" inline-SVG audio wave logo, high-contrast readable typography, accessibility attributes, and mobile-friendly layouts.

---

## Project Structure & File Links

- [index.html](file:///home/cloud_user/workspace/speek/index.html) — Main application markup, header, controls, sticky dock, and flashcards container.
- [package.json](file:///home/cloud_user/workspace/speek/package.json) — Project configuration, dependencies, and SemVer version.
- [vite.config.js](file:///home/cloud_user/workspace/speek/vite.config.js) — Vite build configuration with relative base (`./`) for GitHub Pages compatibility.
- [src/main.js](file:///home/cloud_user/workspace/speek/src/main.js) — Application bootstrapper, DOM event wiring, search filter, and player state synchronization.
- [src/style.css](file:///home/cloud_user/workspace/speek/src/style.css) — Custom styles, responsive grid, 3D card flip transitions, and playback pulse animations.
- [src/data/phrases.js](file:///home/cloud_user/workspace/speek/src/data/phrases.js) — The master dataset exporting `SITUATIONS` and `PHRASES`.
- [src/modules/speechService.js](file:///home/cloud_user/workspace/speek/src/modules/speechService.js) — Web Speech API wrapper handling voice prioritization, single playback, and sequential queue management.
- [src/modules/situationsEngine.js](file:///home/cloud_user/workspace/speek/src/modules/situationsEngine.js) — Categorization engine, situation lookup, multi-field search, and bookmarks store.
- [src/modules/flashcards.js](file:///home/cloud_user/workspace/speek/src/modules/flashcards.js) — 3D flashcard deck controller with shuffle and mastery tracking.
- [src/utils/storage.js](file:///home/cloud_user/workspace/speek/src/utils/storage.js) — Safe `localStorage` getter/setter utility.
- [tests/speechService.test.js](file:///home/cloud_user/workspace/speek/tests/speechService.test.js) — Unit tests for speech synthesis and sequential queue.
- [tests/situationsEngine.test.js](file:///home/cloud_user/workspace/speek/tests/situationsEngine.test.js) — Unit tests for categorization, filtering, and search.
- [tests/flashcards.test.js](file:///home/cloud_user/workspace/speek/tests/flashcards.test.js) — Unit tests for the practice flashcard deck.
- [tests/storage.test.js](file:///home/cloud_user/workspace/speek/tests/storage.test.js) — Unit tests for local storage serialization.
- [.github/workflows/deploy.yml](file:///home/cloud_user/workspace/speek/.github/workflows/deploy.yml) — GitHub Actions CI/CD deploying `dist/` to GitHub Pages.
- [Jenkinsfile](file:///home/cloud_user/workspace/speek/Jenkinsfile) — Jenkins CI pipeline for build, test, and deployment.

---

## Guidelines for Future Agent Development

When adding or updating content in this repository:
1. **Maintain Categorization**: Group new phrases under an existing category or create a well-defined new situation with a clear title, category, and level.
2. **Data Structure**: Each phrase object in [src/data/phrases.js](file:///home/cloud_user/workspace/speek/src/data/phrases.js) must provide:
   ```javascript
   {
     id: "situation-slug-number",
     phrase: "Display phrase text",
     meaning: "Clear explanation of meaning",
     context: "Example or usage note",
     formality: "neutral" | "formal" | "informal" | "slang",
     audioText: "Clean pronounceable text without brackets or ellipses",
     situationId: "situation-slug",
     situation: "Human-readable Situation Title",
     category: "Category Name",
     level: "Beginner" | "Intermediate" | "Advanced" | "Daily Practice"
   }
   ```
3. **Verify Tests & Build**: Always run:
   ```bash
   npm test
   npm run build
   ```
4. **Follow Semantic Versioning**: Increment the version in [package.json](file:///home/cloud_user/workspace/speek/package.json), [index.html](file:///home/cloud_user/workspace/speek/index.html), and [src/main.js](file:///home/cloud_user/workspace/speek/src/main.js) following SemVer `v[major].[minor].[patch]` for every commit, and tag the release commit.
