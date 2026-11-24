import { describe, it, expect, beforeEach } from 'vitest';
import { SituationsEngine } from '../src/modules/situationsEngine.js';

const mockSituations = [
  { id: 'greetings', title: 'Saying Hello', category: 'Greetings & Social', level: 'Beginner', phraseCount: 2 },
  { id: 'meetings', title: 'Work Meetings', category: 'Work & Professional', level: 'Intermediate', phraseCount: 1 },
];

const mockPhrases = [
  { id: 'g-1', phrase: 'Hello', meaning: 'Standard greeting', context: 'Everyday', situationId: 'greetings', situation: 'Saying Hello', category: 'Greetings & Social' },
  { id: 'g-2', phrase: 'How are you?', meaning: 'Inquire well-being', context: 'Casual', situationId: 'greetings', situation: 'Saying Hello', category: 'Greetings & Social' },
  { id: 'm-1', phrase: 'Let us schedule a sync', meaning: 'Plan discussion', context: 'Office', situationId: 'meetings', situation: 'Work Meetings', category: 'Work & Professional' },
];

describe('SituationsEngine', () => {
  let engine;

  beforeEach(() => {
    window.localStorage.clear();
    engine = new SituationsEngine({
      situations: mockSituations,
      phrases: mockPhrases,
    });
  });

  it('correctly aggregates categories and counts', () => {
    const cats = engine.getCategories();
    expect(cats.length).toBe(2);
    expect(cats.find((c) => c.name === 'Greetings & Social').situationCount).toBe(1);
    expect(cats.find((c) => c.name === 'Work & Professional').situationCount).toBe(1);
  });

  it('filters situations by category', () => {
    expect(engine.getSituations('all').length).toBe(2);
    expect(engine.getSituations('Greetings & Social').length).toBe(1);
    expect(engine.getSituations('Greetings & Social')[0].id).toBe('greetings');
  });

  it('retrieves phrases for a given situation', () => {
    const phrases = engine.getPhrasesForSituation('greetings');
    expect(phrases.length).toBe(2);
    expect(phrases[0].phrase).toBe('Hello');
  });

  it('performs live text search across phrases, meanings and situations', () => {
    const res1 = engine.search('greeting');
    expect(res1.matchingPhrases.length).toBe(1);
    expect(res1.matchingPhrases[0].phrase).toBe('Hello');

    const res2 = engine.search('schedule');
    expect(res2.matchingPhrases.length).toBe(1);
    expect(res2.matchingSituations[0].id).toBe('meetings');

    const emptyRes = engine.search('xyzrandomquery');
    expect(emptyRes.matchingPhrases.length).toBe(0);
    expect(emptyRes.matchingSituations.length).toBe(0);
  });

  it('manages bookmarks / favorites state', () => {
    expect(engine.isBookmarked('g-1')).toBe(false);

    engine.toggleBookmark('g-1');
    expect(engine.isBookmarked('g-1')).toBe(true);
    expect(engine.getBookmarkedPhrases().length).toBe(1);

    engine.toggleBookmark('g-1');
    expect(engine.isBookmarked('g-1')).toBe(false);
    expect(engine.getBookmarkedPhrases().length).toBe(0);
  });
});
