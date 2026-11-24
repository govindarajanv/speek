import { describe, it, expect, beforeEach } from 'vitest';
import { FlashcardDeck } from '../src/modules/flashcards.js';

const mockPhrases = [
  { id: '1', phrase: 'Phrase A', meaning: 'Meaning A', category: 'Category 1', situationId: 'sit-1' },
  { id: '2', phrase: 'Phrase B', meaning: 'Meaning B', category: 'Category 1', situationId: 'sit-2' },
  { id: '3', phrase: 'Phrase C', meaning: 'Meaning C', category: 'Category 2', situationId: 'sit-3' },
];

describe('FlashcardDeck', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with given phrases and flips correctly', () => {
    const deck = new FlashcardDeck({ phrases: mockPhrases });
    expect(deck.deck.length).toBe(3);
    expect(deck.getCurrentCard().id).toBe('1');
    expect(deck.isFlipped).toBe(false);

    deck.flip();
    expect(deck.isFlipped).toBe(true);

    deck.flip();
    expect(deck.isFlipped).toBe(false);
  });

  it('navigates next and previous circularly', () => {
    const deck = new FlashcardDeck({ phrases: mockPhrases });
    expect(deck.getCurrentCard().id).toBe('1');

    deck.next();
    expect(deck.getCurrentCard().id).toBe('2');

    deck.next();
    expect(deck.getCurrentCard().id).toBe('3');

    deck.next();
    expect(deck.getCurrentCard().id).toBe('1');

    deck.previous();
    expect(deck.getCurrentCard().id).toBe('3');
  });

  it('filters deck by category and situation', () => {
    const deck = new FlashcardDeck({ phrases: mockPhrases });

    deck.setFilter({ category: 'Category 2', situation: 'all' });
    expect(deck.deck.length).toBe(1);
    expect(deck.getCurrentCard().id).toBe('3');

    deck.setFilter({ category: 'Category 1', situation: 'sit-2' });
    expect(deck.deck.length).toBe(1);
    expect(deck.getCurrentCard().id).toBe('2');
  });

  it('tracks mastered cards', () => {
    const deck = new FlashcardDeck({ phrases: mockPhrases });

    expect(deck.isMastered('1')).toBe(false);
    deck.toggleMastered('1');
    expect(deck.isMastered('1')).toBe(true);

    const stats = deck.getStats();
    expect(stats.mastered).toBe(1);
    expect(stats.total).toBe(3);
  });
});
