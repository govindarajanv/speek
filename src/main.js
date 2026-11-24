import { SituationsEngine } from './modules/situationsEngine.js';
import SpeechService from './modules/speechService.js';
import { FlashcardDeck } from './modules/flashcards.js';
import { getItem, setItem, STORAGE_KEYS } from './utils/storage.js';

// Application State
const state = {
  currentCategory: getItem(STORAGE_KEYS.selectedCategory, 'all'),
  searchQuery: '',
  showBookmarksOnly: false,
  showPractice: false,
  openSituations: new Set(),
  activePhraseId: null,
};

// Initialize Core Modules
const engine = new SituationsEngine();
const speech = new SpeechService().init();
const flashcards = new FlashcardDeck({ phrases: engine.phrases });

// DOM Elements
const el = {
  versionBadge: document.getElementById('app-version-badge'),
  footerVersionBadge: document.getElementById('footer-version-badge'),
  categoryTabs: document.getElementById('category-tabs'),
  situationsContainer: document.getElementById('situations-container'),
  searchInput: document.getElementById('search-input'),
  searchClearBtn: document.getElementById('btn-search-clear'),
  voiceSelect: document.getElementById('voice-select'),
  rateSlider: document.getElementById('rate-slider'),
  rateDisplay: document.getElementById('rate-display'),
  btnPlayAllVisible: document.getElementById('btn-play-all-visible'),
  btnStopAll: document.getElementById('btn-stop-all'),
  btnExpandAll: document.getElementById('btn-expand-all'),
  btnCollapseAll: document.getElementById('btn-collapse-all'),
  btnToggleBookmarks: document.getElementById('btn-toggle-bookmarks'),
  bookmarksCountBadge: document.getElementById('bookmarks-count-badge'),
  btnTogglePractice: document.getElementById('btn-toggle-practice'),
  playerDock: document.getElementById('player-dock'),
  dockSituation: document.getElementById('dock-situation'),
  dockPhrase: document.getElementById('dock-phrase'),
  btnDockPrev: document.getElementById('btn-dock-prev'),
  btnDockPlay: document.getElementById('btn-dock-play'),
  btnDockNext: document.getElementById('btn-dock-next'),
  btnDockStop: document.getElementById('btn-dock-stop'),
  flashcardsSection: document.getElementById('flashcards-section'),
  btnClosePractice: document.getElementById('btn-close-practice'),
  fcSituationSelect: document.getElementById('fc-situation-select'),
  flashcardContainer: document.getElementById('flashcard-container'),
  flashcardInner: document.getElementById('flashcard-inner'),
  fcFrontCat: document.getElementById('fc-front-cat'),
  fcFrontPhrase: document.getElementById('fc-front-phrase'),
  fcSpeakFront: document.getElementById('fc-speak-front'),
  fcBackSit: document.getElementById('fc-back-sit'),
  fcBackMeaning: document.getElementById('fc-back-meaning'),
  fcBackContext: document.getElementById('fc-back-context'),
  fcSpeakBack: document.getElementById('fc-speak-back'),
  fcBtnPrev: document.getElementById('fc-btn-prev'),
  fcBtnFlip: document.getElementById('fc-btn-flip'),
  fcBtnNext: document.getElementById('fc-btn-next'),
  fcBtnShuffle: document.getElementById('fc-btn-shuffle'),
  fcBtnMaster: document.getElementById('fc-btn-master'),
  fcStats: document.getElementById('fc-stats'),
};

// Set App Version
const APP_VERSION = 'v1.0.1';
if (el.versionBadge) el.versionBadge.textContent = APP_VERSION;
if (el.footerVersionBadge) el.footerVersionBadge.textContent = APP_VERSION;

// Populate Voices
function updateVoiceSelect(voices) {
  if (!el.voiceSelect) return;
  el.voiceSelect.innerHTML = '';
  if (!voices || !voices.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Default Browser Voice';
    el.voiceSelect.appendChild(opt);
    return;
  }
  for (const v of voices) {
    const opt = document.createElement('option');
    opt.value = v.name;
    const isUS = (v.lang || '').toLowerCase().startsWith('en-us');
    opt.textContent = `${v.name} (${v.lang})${isUS ? ' ★' : ''}`;
    if (speech.selectedVoice && speech.selectedVoice.name === v.name) {
      opt.selected = true;
    }
    el.voiceSelect.appendChild(opt);
  }
}

speech.onVoicesChanged = updateVoiceSelect;
updateVoiceSelect(speech.voices);

// Audio State Handler
speech.onProgress = ({ index, total, item, context }) => {
  state.activePhraseId = item.id;
  updateActivePlaybackRow();
  if (el.playerDock) {
    el.playerDock.hidden = false;
    el.dockSituation.textContent = context && context.title ? context.title : item.situation || 'Speek';
    el.dockPhrase.textContent = `${item.phrase} (${index + 1} of ${total})`;
    el.btnDockPlay.textContent = '⏸';
  }
  if (el.btnStopAll) el.btnStopAll.disabled = false;
};

speech.onStateChange = ({ isPlaying, isPaused, currentItem, context }) => {
  if (!isPlaying) {
    state.activePhraseId = null;
    updateActivePlaybackRow();
    if (el.playerDock) el.playerDock.hidden = true;
    if (el.btnStopAll) el.btnStopAll.disabled = true;
    document.querySelectorAll('.btn-play-sit').forEach((b) => b.classList.remove('playing'));
  } else {
    if (el.playerDock) {
      el.playerDock.hidden = false;
      el.btnDockPlay.textContent = isPaused ? '▶' : '⏸';
    }
    if (el.btnStopAll) el.btnStopAll.disabled = false;
  }
};

speech.onComplete = () => {
  state.activePhraseId = null;
  updateActivePlaybackRow();
};

function updateActivePlaybackRow() {
  document.querySelectorAll('tr.active-playing').forEach((row) => {
    row.classList.remove('active-playing');
  });
  if (state.activePhraseId) {
    const activeRow = document.getElementById(`row-${state.activePhraseId}`);
    if (activeRow) {
      activeRow.classList.add('active-playing');
      activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

// Render Categories Tabs
function renderCategoryTabs() {
  if (!el.categoryTabs) return;
  const categories = engine.getCategories();
  const totalSituations = engine.situations.length;

  el.categoryTabs.innerHTML = '';

  // All Tab
  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = `cat-tab ${state.currentCategory === 'all' && !state.showBookmarksOnly ? 'active' : ''}`;
  allBtn.innerHTML = `All Categories <span class="cat-tab-count">${totalSituations}</span>`;
  allBtn.addEventListener('click', () => {
    state.currentCategory = 'all';
    state.showBookmarksOnly = false;
    setItem(STORAGE_KEYS.selectedCategory, 'all');
    renderCategoryTabs();
    renderSituations();
    syncPracticeCardFilter();
  });
  el.categoryTabs.appendChild(allBtn);

  for (const cat of categories) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cat-tab ${state.currentCategory === cat.name && !state.showBookmarksOnly ? 'active' : ''}`;
    btn.innerHTML = `${cat.name} <span class="cat-tab-count">${cat.situationCount}</span>`;
    btn.addEventListener('click', () => {
      state.currentCategory = cat.name;
      state.showBookmarksOnly = false;
      setItem(STORAGE_KEYS.selectedCategory, cat.name);
      renderCategoryTabs();
      renderSituations();
      syncPracticeCardFilter();
    });
    el.categoryTabs.appendChild(btn);
  }
}

// Render Situations Grouped by Category
function renderSituations() {
  if (!el.situationsContainer) return;
  el.situationsContainer.innerHTML = '';

  let situationsToRender = [];
  let phrasesToRender = [];

  if (state.showBookmarksOnly) {
    phrasesToRender = engine.getBookmarkedPhrases();
    const sitIds = new Set(phrasesToRender.map((p) => p.situationId));
    situationsToRender = engine.situations.filter((s) => sitIds.has(s.id));
  } else if (state.searchQuery.trim()) {
    const searchRes = engine.search(state.searchQuery, state.currentCategory);
    situationsToRender = searchRes.matchingSituations;
    phrasesToRender = searchRes.matchingPhrases;
  } else {
    situationsToRender = engine.getSituations(state.currentCategory);
    phrasesToRender = state.currentCategory === 'all'
      ? engine.phrases
      : engine.getPhrasesByCategory(state.currentCategory);
  }

  // Handle Empty State
  if (!situationsToRender.length) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.innerHTML = `
      <div class="empty-state-icon">🔍</div>
      <h3>No situations or phrases found</h3>
      <p>${state.showBookmarksOnly ? 'You haven’t starred any phrases yet. Click ⭐ next to any phrase to save it.' : 'Try adjusting your search query or selecting another category.'}</p>
    `;
    el.situationsContainer.appendChild(emptyDiv);
    return;
  }

  // Group situations by Category
  const grouped = new Map();
  for (const sit of situationsToRender) {
    if (!grouped.has(sit.category)) {
      grouped.set(sit.category, []);
    }
    grouped.get(sit.category).push(sit);
  }

  for (const [categoryName, sitList] of grouped.entries()) {
    // Category Header
    const catHeader = document.createElement('div');
    catHeader.className = 'category-group-header';
    catHeader.innerHTML = `
      <div class="cat-title-wrap">
        <h2 class="cat-group-title">${categoryName}</h2>
        <span class="cat-group-stats">${sitList.length} situations</span>
      </div>
      <button class="btn btn-ghost btn-play-category" type="button" title="Play all phrases in ${categoryName}">
        ▶ Play Category
      </button>
    `;

    const playCatBtn = catHeader.querySelector('.btn-play-category');
    playCatBtn.addEventListener('click', () => {
      const phrasesInCat = engine.getPhrasesByCategory(categoryName);
      speech.playSequence(phrasesInCat, { title: `${categoryName} (All)` });
    });

    el.situationsContainer.appendChild(catHeader);

    // Situations Grid
    const grid = document.createElement('div');
    grid.className = 'situations-grid';

    for (const sit of sitList) {
      let phrases = engine.getPhrasesForSituation(sit.id);
      if (state.showBookmarksOnly) {
        phrases = phrases.filter((p) => engine.isBookmarked(p.id));
      } else if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        phrases = phrases.filter((p) => {
          return (
            p.phrase.toLowerCase().includes(q) ||
            (p.meaning && p.meaning.toLowerCase().includes(q)) ||
            (p.context && p.context.toLowerCase().includes(q)) ||
            sit.title.toLowerCase().includes(q)
          );
        });
      }

      const card = createSituationCard(sit, phrases);
      grid.appendChild(card);
    }

    el.situationsContainer.appendChild(grid);
  }

  updateBookmarksBadge();
}

function getBadgeLevelClass(level) {
  const l = (level || '').toLowerCase();
  if (l.includes('beginner')) return 'badge-beginner';
  if (l.includes('intermediate')) return 'badge-intermediate';
  if (l.includes('advanced')) return 'badge-advanced';
  return 'badge-daily';
}

function createSituationCard(situation, phrases) {
  const card = document.createElement('article');
  const isOpen = state.openSituations.has(situation.id) || Boolean(state.searchQuery.trim());
  card.className = `situation-card ${isOpen ? 'open' : ''}`;
  card.id = `situation-card-${situation.id}`;

  const levelClass = getBadgeLevelClass(situation.level);

  // Situation Header
  const header = document.createElement('div');
  header.className = 'situation-header';
  header.innerHTML = `
    <div class="situation-header-left">
      <span class="situation-chevron">▶</span>
      <h3 class="situation-title">${situation.title}</h3>
      <span class="badge ${levelClass}">${situation.level}</span>
      <span class="badge-count-pill">${phrases.length} phrases</span>
    </div>
    <div class="situation-header-actions" onclick="event.stopPropagation();">
      <button class="btn-play-sit" type="button" aria-label="Play all phrases in ${situation.title}">
        ▶ Play Situation
      </button>
    </div>
  `;

  // Toggle accordion on header click
  header.addEventListener('click', () => {
    if (state.openSituations.has(situation.id)) {
      state.openSituations.delete(situation.id);
      card.classList.remove('open');
    } else {
      state.openSituations.add(situation.id);
      card.classList.add('open');
    }
  });

  // Play Situation Button
  const playBtn = header.querySelector('.btn-play-sit');
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (speech.isPlaying && speech.currentContext && speech.currentContext.id === situation.id) {
      speech.stop();
      playBtn.classList.remove('playing');
    } else {
      document.querySelectorAll('.btn-play-sit').forEach((b) => b.classList.remove('playing'));
      playBtn.classList.add('playing');
      // Ensure the card is open
      state.openSituations.add(situation.id);
      card.classList.add('open');
      speech.playSequence(phrases, { id: situation.id, title: situation.title });
    }
  });

  // Situation Body
  const body = document.createElement('div');
  body.className = 'situation-body';

  const desc = document.createElement('p');
  desc.className = 'situation-desc';
  desc.textContent = situation.description || `Everyday practical expressions for ${situation.title}.`;
  body.appendChild(desc);

  // Table
  const table = document.createElement('table');
  table.className = 'phrases-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th class="col-actions" scope="col">Listen</th>
        <th scope="col">Phrase / Word</th>
        <th scope="col">Meaning / Nuance</th>
        <th scope="col">Context / Example</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');
  for (const phrase of phrases) {
    const tr = document.createElement('tr');
    tr.id = `row-${phrase.id}`;
    if (state.activePhraseId === phrase.id) {
      tr.classList.add('active-playing');
    }

    const isStarred = engine.isBookmarked(phrase.id);
    const formalityTag = phrase.formality && phrase.formality !== 'neutral'
      ? `<span class="formality-tag formality-${phrase.formality}">${phrase.formality}</span>`
      : '';

    tr.innerHTML = `
      <td class="col-actions">
        <div class="action-btns-cell">
          <button class="btn-icon btn-bookmark ${isStarred ? 'bookmarked' : ''}" type="button" aria-label="Bookmark ${phrase.phrase}" title="Bookmark this phrase">
            ${isStarred ? '★' : '☆'}
          </button>
          <button class="btn-icon btn-audio-speak" type="button" aria-label="Play audio for ${phrase.phrase}" title="Listen to phrase">
            🔊
          </button>
        </div>
      </td>
      <td class="phrase-cell">
        <span>${phrase.phrase}</span>
        ${formalityTag}
      </td>
      <td class="meaning-cell">${phrase.meaning || 'Everyday expression'}</td>
      <td class="context-cell">
        <span>${phrase.context || ''}</span>
        ${phrase.context ? '<button class="btn-icon context-example-speaker" type="button" title="Listen to example">🔊</button>' : ''}
      </td>
    `;

    // Bookmark Toggle
    const starBtn = tr.querySelector('.btn-bookmark');
    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const starred = engine.toggleBookmark(phrase.id);
      starBtn.classList.toggle('bookmarked', starred);
      starBtn.textContent = starred ? '★' : '☆';
      updateBookmarksBadge();
      if (state.showBookmarksOnly) {
        renderSituations();
      }
    });

    // Speak Phrase Button
    const speakBtn = tr.querySelector('.btn-audio-speak');
    speakBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.activePhraseId = phrase.id;
      updateActivePlaybackRow();
      speech.speakText(phrase.audioText || phrase.phrase, {
        onEnd: () => {
          if (!speech.isPlaying) {
            state.activePhraseId = null;
            updateActivePlaybackRow();
          }
        },
      });
    });

    // Speak Example Button (if present)
    const speakExBtn = tr.querySelector('.context-example-speaker');
    if (speakExBtn) {
      speakExBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speech.speakText(phrase.context);
      });
    }

    tbody.appendChild(tr);
  }

  body.appendChild(table);
  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function updateBookmarksBadge() {
  const count = engine.bookmarks.size;
  if (el.bookmarksCountBadge) {
    if (count > 0) {
      el.bookmarksCountBadge.hidden = false;
      el.bookmarksCountBadge.textContent = count;
    } else {
      el.bookmarksCountBadge.hidden = true;
    }
  }
}

// Flashcards Controller
function syncPracticeCardFilter() {
  if (!el.fcSituationSelect) return;
  el.fcSituationSelect.innerHTML = '<option value="all">All Situations in Current Category</option>';
  const sits = engine.getSituations(state.currentCategory);
  for (const s of sits) {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.title;
    el.fcSituationSelect.appendChild(opt);
  }
  flashcards.setFilter({
    category: state.currentCategory,
    situation: el.fcSituationSelect.value,
  });
  renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
  const card = flashcards.getCurrentCard();
  const stats = flashcards.getStats();

  if (!card) {
    if (el.fcFrontPhrase) el.fcFrontPhrase.textContent = 'No phrases in this selection';
    if (el.fcBackMeaning) el.fcBackMeaning.textContent = 'Select another category or situation';
    if (el.fcStats) el.fcStats.textContent = '0 of 0';
    return;
  }

  if (el.flashcardInner) {
    if (flashcards.isFlipped) {
      el.flashcardInner.classList.add('flipped');
    } else {
      el.flashcardInner.classList.remove('flipped');
    }
  }

  if (el.fcFrontCat) el.fcFrontCat.textContent = `${card.category} · ${card.level}`;
  if (el.fcFrontPhrase) el.fcFrontPhrase.textContent = card.phrase;
  if (el.fcBackSit) el.fcBackSit.textContent = card.situation;
  if (el.fcBackMeaning) el.fcBackMeaning.textContent = card.meaning || 'Everyday expression';
  if (el.fcBackContext) el.fcBackContext.textContent = card.context || '';

  const isMastered = flashcards.isMastered(card.id);
  if (el.fcBtnMaster) {
    el.fcBtnMaster.textContent = isMastered ? '✓ Mastered' : 'Mark Mastered';
    el.fcBtnMaster.className = isMastered ? 'btn btn-primary' : 'btn btn-secondary';
  }

  if (el.fcStats) {
    el.fcStats.textContent = `Card ${stats.current} of ${stats.total} (${stats.mastered} mastered)`;
  }
}

// Flashcards Event Listeners
if (el.flashcardContainer) {
  el.flashcardContainer.addEventListener('click', () => {
    flashcards.flip();
    renderCurrentFlashcard();
  });
}
if (el.fcBtnFlip) {
  el.fcBtnFlip.addEventListener('click', (e) => {
    e.stopPropagation();
    flashcards.flip();
    renderCurrentFlashcard();
  });
}
if (el.fcBtnNext) {
  el.fcBtnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    flashcards.next();
    renderCurrentFlashcard();
  });
}
if (el.fcBtnPrev) {
  el.fcBtnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    flashcards.previous();
    renderCurrentFlashcard();
  });
}
if (el.fcBtnShuffle) {
  el.fcBtnShuffle.addEventListener('click', (e) => {
    e.stopPropagation();
    flashcards.shuffle();
    renderCurrentFlashcard();
  });
}
if (el.fcBtnMaster) {
  el.fcBtnMaster.addEventListener('click', (e) => {
    e.stopPropagation();
    flashcards.toggleMastered();
    renderCurrentFlashcard();
  });
}
if (el.fcSpeakFront) {
  el.fcSpeakFront.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = flashcards.getCurrentCard();
    if (card) speech.speakText(card.audioText || card.phrase);
  });
}
if (el.fcSpeakBack) {
  el.fcSpeakBack.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = flashcards.getCurrentCard();
    if (card) speech.speakText(card.audioText || card.phrase);
  });
}
if (el.fcSituationSelect) {
  el.fcSituationSelect.addEventListener('change', (e) => {
    flashcards.setFilter({
      category: state.currentCategory,
      situation: e.target.value,
    });
    renderCurrentFlashcard();
  });
}

// Toggle Practice Mode
if (el.btnTogglePractice) {
  el.btnTogglePractice.addEventListener('click', () => {
    state.showPractice = !state.showPractice;
    el.btnTogglePractice.classList.toggle('active', state.showPractice);
    if (el.flashcardsSection) {
      el.flashcardsSection.hidden = !state.showPractice;
      if (state.showPractice) {
        syncPracticeCardFilter();
        el.flashcardsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}
if (el.btnClosePractice) {
  el.btnClosePractice.addEventListener('click', () => {
    state.showPractice = false;
    if (el.btnTogglePractice) el.btnTogglePractice.classList.remove('active');
    if (el.flashcardsSection) el.flashcardsSection.hidden = true;
  });
}

// Header Bookmarks Toggle
if (el.btnToggleBookmarks) {
  el.btnToggleBookmarks.addEventListener('click', () => {
    state.showBookmarksOnly = !state.showBookmarksOnly;
    el.btnToggleBookmarks.classList.toggle('active', state.showBookmarksOnly);
    renderCategoryTabs();
    renderSituations();
  });
}

// Search Input Listener
if (el.searchInput) {
  el.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (el.searchClearBtn) {
      el.searchClearBtn.hidden = !state.searchQuery;
    }
    renderSituations();
  });
}

if (el.searchClearBtn) {
  el.searchClearBtn.addEventListener('click', () => {
    state.searchQuery = '';
    el.searchInput.value = '';
    el.searchClearBtn.hidden = true;
    renderSituations();
  });
}

// Speech Controls Listeners
if (el.voiceSelect) {
  el.voiceSelect.addEventListener('change', (e) => {
    speech.setVoice(e.target.value);
  });
}
if (el.rateSlider) {
  el.rateSlider.value = speech.rate;
  if (el.rateDisplay) el.rateDisplay.textContent = `${Number(speech.rate).toFixed(1)}x`;
  el.rateSlider.addEventListener('input', (e) => {
    const val = speech.setRate(e.target.value);
    if (el.rateDisplay) el.rateDisplay.textContent = `${Number(val).toFixed(1)}x`;
  });
}

// Global Play Visible & Stop Buttons
if (el.btnPlayAllVisible) {
  el.btnPlayAllVisible.addEventListener('click', () => {
    let phrasesToPlay = [];
    if (state.showBookmarksOnly) {
      phrasesToPlay = engine.getBookmarkedPhrases();
    } else if (state.searchQuery.trim()) {
      phrasesToPlay = engine.search(state.searchQuery, state.currentCategory).matchingPhrases;
    } else {
      phrasesToPlay = engine.getPhrasesByCategory(state.currentCategory);
    }
    if (phrasesToPlay.length) {
      // Expand open cards to see active playing row
      speech.playSequence(phrasesToPlay, { title: 'Visible Phrases Sequence' });
    }
  });
}

if (el.btnStopAll) {
  el.btnStopAll.addEventListener('click', () => {
    speech.stop();
  });
}

// Expand / Collapse All
if (el.btnExpandAll) {
  el.btnExpandAll.addEventListener('click', () => {
    const situations = engine.getSituations(state.currentCategory);
    for (const s of situations) {
      state.openSituations.add(s.id);
    }
    renderSituations();
  });
}

if (el.btnCollapseAll) {
  el.btnCollapseAll.addEventListener('click', () => {
    state.openSituations.clear();
    renderSituations();
  });
}

// Sticky Dock Controller Listeners
if (el.btnDockPlay) {
  el.btnDockPlay.addEventListener('click', () => {
    speech.togglePause();
  });
}
if (el.btnDockStop) {
  el.btnDockStop.addEventListener('click', () => {
    speech.stop();
  });
}
if (el.btnDockNext) {
  el.btnDockNext.addEventListener('click', () => {
    speech.next();
  });
}
if (el.btnDockPrev) {
  el.btnDockPrev.addEventListener('click', () => {
    speech.previous();
  });
}

// Initial Boot
renderCategoryTabs();
renderSituations();
syncPracticeCardFilter();
updateBookmarksBadge();
