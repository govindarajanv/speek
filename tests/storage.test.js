import { describe, it, expect, beforeEach } from 'vitest';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../src/utils/storage.js';

describe('Storage utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and retrieves serialized data', () => {
    setItem(STORAGE_KEYS.rate, 1.2);
    expect(getItem(STORAGE_KEYS.rate)).toBe(1.2);

    setItem(STORAGE_KEYS.bookmarks, ['phrase-1', 'phrase-2']);
    expect(getItem(STORAGE_KEYS.bookmarks)).toEqual(['phrase-1', 'phrase-2']);
  });

  it('returns default value when key does not exist', () => {
    expect(getItem('non_existent_key', 'fallback')).toBe('fallback');
  });

  it('removes item from storage', () => {
    setItem(STORAGE_KEYS.rate, 1.5);
    removeItem(STORAGE_KEYS.rate);
    expect(getItem(STORAGE_KEYS.rate)).toBeNull();
  });
});
