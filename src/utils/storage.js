export const STORAGE_KEYS = {
  rate: 'speek_rate',
  voiceName: 'speek_voice_name',
  bookmarks: 'speek_bookmarks',
  selectedCategory: 'speek_selected_category',
  activeSituation: 'speek_active_situation',
  masteredCards: 'speek_mastered_cards',
};

export function getItem(key, defaultValue = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const val = window.localStorage.getItem(key);
    if (val === null || val === undefined) {
      return defaultValue;
    }
    return JSON.parse(val);
  } catch (e) {
    return defaultValue;
  }
}

export function setItem(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    // ignore quota/security exceptions in restricted contexts
  }
}

export function removeItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // ignore
  }
}
