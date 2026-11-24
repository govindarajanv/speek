import { SITUATIONS, PHRASES } from '../data/phrases.js';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

export class SituationsEngine {
  constructor({ situations = SITUATIONS, phrases = PHRASES } = {}) {
    this.situations = situations;
    this.phrases = phrases;
    this.bookmarks = new Set(getItem(STORAGE_KEYS.bookmarks, []));
    this.phrasesBySituation = new Map();
    this.situationsById = new Map();

    this._indexData();
  }

  _indexData() {
    for (const sit of this.situations) {
      this.situationsById.set(sit.id, sit);
      this.phrasesBySituation.set(sit.id, []);
    }
    for (const phrase of this.phrases) {
      const list = this.phrasesBySituation.get(phrase.situationId);
      if (list) {
        list.push(phrase);
      } else {
        this.phrasesBySituation.set(phrase.situationId, [phrase]);
      }
    }
  }

  getCategories() {
    const categoriesMap = new Map();
    for (const sit of this.situations) {
      if (!categoriesMap.has(sit.category)) {
        categoriesMap.set(sit.category, {
          name: sit.category,
          situationCount: 0,
          phraseCount: 0,
        });
      }
      const entry = categoriesMap.get(sit.category);
      entry.situationCount += 1;
      entry.phraseCount += sit.phraseCount || (this.phrasesBySituation.get(sit.id) || []).length;
    }
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getSituations(categoryFilter = null) {
    if (!categoryFilter || categoryFilter === 'all') {
      return this.situations;
    }
    return this.situations.filter((s) => s.category === categoryFilter);
  }

  getSituationById(id) {
    return this.situationsById.get(id) || null;
  }

  getPhrasesForSituation(situationId) {
    return this.phrasesBySituation.get(situationId) || [];
  }

  getPhrasesByCategory(category) {
    if (!category || category === 'all') {
      return this.phrases;
    }
    return this.phrases.filter((p) => p.category === category);
  }

  search(query, categoryFilter = null) {
    if (!query || !query.trim()) {
      return {
        query: '',
        matchingSituations: this.getSituations(categoryFilter),
        matchingPhrases: [],
        totalMatches: 0,
      };
    }

    const q = query.trim().toLowerCase();
    const candidatePhrases = categoryFilter && categoryFilter !== 'all'
      ? this.getPhrasesByCategory(categoryFilter)
      : this.phrases;

    const matchedPhrases = candidatePhrases.filter((p) => {
      return (
        p.phrase.toLowerCase().includes(q) ||
        (p.meaning && p.meaning.toLowerCase().includes(q)) ||
        (p.context && p.context.toLowerCase().includes(q))
      );
    });

    const matchingSituationIds = new Set(matchedPhrases.map((p) => p.situationId));
    // Also include situations whose title matches query
    const candidateSituations = this.getSituations(categoryFilter);
    for (const sit of candidateSituations) {
      if (sit.title.toLowerCase().includes(q)) {
        matchingSituationIds.add(sit.id);
      }
    }

    const matchingSituations = candidateSituations.filter((s) => matchingSituationIds.has(s.id));

    return {
      query: q,
      matchingSituations,
      matchingPhrases: matchedPhrases,
      totalMatches: matchedPhrases.length,
    };
  }

  isBookmarked(phraseId) {
    return this.bookmarks.has(phraseId);
  }

  toggleBookmark(phraseId) {
    if (this.bookmarks.has(phraseId)) {
      this.bookmarks.delete(phraseId);
    } else {
      this.bookmarks.add(phraseId);
    }
    this._persistBookmarks();
    return this.bookmarks.has(phraseId);
  }

  getBookmarkedPhrases() {
    return this.phrases.filter((p) => this.bookmarks.has(p.id));
  }

  _persistBookmarks() {
    setItem(STORAGE_KEYS.bookmarks, Array.from(this.bookmarks));
  }
}
