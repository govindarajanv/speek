import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

export class FlashcardDeck {
  constructor({ phrases = [] } = {}) {
    this.allPhrases = phrases;
    this.deck = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.masteredIds = new Set(getItem(STORAGE_KEYS.masteredCards, []));
    this.filterCategory = 'all';
    this.filterSituation = 'all';

    this.rebuildDeck();
  }

  setPhrases(phrases) {
    this.allPhrases = phrases;
    this.rebuildDeck();
  }

  setFilter({ category = 'all', situation = 'all' }) {
    this.filterCategory = category;
    this.filterSituation = situation;
    this.rebuildDeck();
  }

  rebuildDeck() {
    let pool = [...this.allPhrases];
    if (this.filterCategory && this.filterCategory !== 'all') {
      pool = pool.filter((p) => p.category === this.filterCategory);
    }
    if (this.filterSituation && this.filterSituation !== 'all') {
      pool = pool.filter((p) => p.situationId === this.filterSituation);
    }
    this.deck = pool;
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  getCurrentCard() {
    if (!this.deck.length) return null;
    return this.deck[this.currentIndex];
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    return this.isFlipped;
  }

  next() {
    if (!this.deck.length) return null;
    this.currentIndex = (this.currentIndex + 1) % this.deck.length;
    this.isFlipped = false;
    return this.getCurrentCard();
  }

  previous() {
    if (!this.deck.length) return null;
    this.currentIndex = (this.currentIndex - 1 + this.deck.length) % this.deck.length;
    this.isFlipped = false;
    return this.getCurrentCard();
  }

  shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    return this.getCurrentCard();
  }

  toggleMastered(id) {
    const cardId = id || (this.getCurrentCard() && this.getCurrentCard().id);
    if (!cardId) return false;
    if (this.masteredIds.has(cardId)) {
      this.masteredIds.delete(cardId);
    } else {
      this.masteredIds.add(cardId);
    }
    setItem(STORAGE_KEYS.masteredCards, Array.from(this.masteredIds));
    return this.masteredIds.has(cardId);
  }

  isMastered(id) {
    const cardId = id || (this.getCurrentCard() && this.getCurrentCard().id);
    return this.masteredIds.has(cardId);
  }

  getStats() {
    const masteredInDeck = this.deck.filter((c) => this.masteredIds.has(c.id)).length;
    return {
      current: this.deck.length ? this.currentIndex + 1 : 0,
      total: this.deck.length,
      mastered: masteredInDeck,
    };
  }
}
