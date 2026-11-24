import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

function getSpeechSynthesis() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

function getVoices() {
  const synth = getSpeechSynthesis();
  return synth && typeof synth.getVoices === 'function' ? synth.getVoices() : [];
}

export function sortUSVoicesFirst(voices) {
  const isUS = (v) => (v.lang || '').toLowerCase().startsWith('en-us');
  const isEN = (v) => (v.lang || '').toLowerCase().startsWith('en');
  return [...voices].sort((a, b) => {
    if (isUS(b) !== isUS(a)) return Number(isUS(b)) - Number(isUS(a));
    if (isEN(b) !== isEN(a)) return Number(isEN(b)) - Number(isEN(a));
    return (a.name || '').localeCompare(b.name || '');
  });
}

export default class SpeechService {
  constructor() {
    this.voices = [];
    this.selectedVoice = null;
    this.selectedVoiceName = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentContext = null; // metadata e.g. situation info
    this.onVoicesChanged = () => {};
    this.onProgress = () => {};
    this.onComplete = () => {};
    this.onStateChange = () => {};
    this._currentUtterance = null;
    this._voicesHandler = null;
  }

  init() {
    const synth = getSpeechSynthesis();
    if (synth && typeof synth.addEventListener === 'function') {
      this._voicesHandler = () => this._resolveVoices();
      synth.addEventListener('voiceschanged', this._voicesHandler);
    }
    this._resolveVoices();

    const savedRate = getItem(STORAGE_KEYS.rate, null);
    if (typeof savedRate === 'number' && savedRate >= 0.5 && savedRate <= 2) {
      this.rate = savedRate;
    }
    const savedVoice = getItem(STORAGE_KEYS.voiceName, null);
    if (typeof savedVoice === 'string') {
      this.selectedVoiceName = savedVoice;
      this.selectedVoice = this._findVoice(this.selectedVoiceName) || this.voices[0] || null;
    }
    return this;
  }

  _resolveVoices() {
    this.voices = sortUSVoicesFirst(getVoices());
    this.selectedVoice = this._findVoice(this.selectedVoiceName) || this.voices[0] || null;
    if (typeof this.onVoicesChanged === 'function') {
      this.onVoicesChanged(this.voices);
    }
  }

  _findVoice(name) {
    if (!name) return null;
    return this.voices.find((v) => v.name === name) || null;
  }

  setRate(rate) {
    this.rate = Math.min(2, Math.max(0.5, Number(rate) || 1.0));
    setItem(STORAGE_KEYS.rate, this.rate);
    return this.rate;
  }

  setVoice(voiceName) {
    this.selectedVoice = this._findVoice(voiceName);
    this.selectedVoiceName = voiceName;
    setItem(STORAGE_KEYS.voiceName, voiceName);
  }

  isSpeaking() {
    const synth = getSpeechSynthesis();
    return Boolean(synth && (synth.speaking || this.isPlaying));
  }

  _buildUtterance(text, { onStart, onEnd, onError } = {}) {
    const synth = getSpeechSynthesis();
    if (typeof SpeechSynthesisUtterance === 'undefined') {
      if (onEnd) onEnd();
      return null;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = (this.selectedVoice && this.selectedVoice.lang) || 'en-US';

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    this._currentUtterance = utterance;
    if (synth) {
      synth.speak(utterance);
    }
    return utterance;
  }

  speakText(text, { onStart, onEnd, onError } = {}) {
    const synth = getSpeechSynthesis();
    if (synth) {
      synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.notifyState();

    return this._buildUtterance(text, {
      onStart: () => {
        if (onStart) onStart();
      },
      onEnd: () => {
        if (onEnd) onEnd();
      },
      onError: (err) => {
        if (onError) onError(err);
      },
    });
  }

  playSequence(items, context = null) {
    if (!items || !items.length) return;
    this.stop();
    this.queue = [...items];
    this.currentIndex = 0;
    this.currentContext = context;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState();
    this._playNextInQueue();
  }

  _playNextInQueue() {
    if (!this.isPlaying) return;

    if (this.currentIndex >= this.queue.length) {
      this.isPlaying = false;
      this.isPaused = false;
      const completedContext = this.currentContext;
      this.currentContext = null;
      this.notifyState();
      if (typeof this.onComplete === 'function') {
        this.onComplete(completedContext);
      }
      return;
    }

    const currentItem = this.queue[this.currentIndex];
    const textToSpeak = currentItem.audioText || currentItem.phrase || currentItem.text;

    if (typeof this.onProgress === 'function') {
      this.onProgress({
        index: this.currentIndex,
        total: this.queue.length,
        item: currentItem,
        context: this.currentContext,
      });
    }

    this._buildUtterance(textToSpeak, {
      onEnd: () => {
        if (!this.isPlaying || this.isPaused) return;
        this.currentIndex += 1;
        // slight natural breath pause between phrases
        setTimeout(() => {
          if (this.isPlaying && !this.isPaused) {
            this._playNextInQueue();
          }
        }, 550);
      },
      onError: (err) => {
        if (!this.isPlaying) return;
        this.currentIndex += 1;
        this._playNextInQueue();
      },
    });
  }

  pause() {
    const synth = getSpeechSynthesis();
    if (synth && this.isPlaying && !this.isPaused) {
      synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  resume() {
    const synth = getSpeechSynthesis();
    if (synth && this.isPlaying && this.isPaused) {
      synth.resume();
      this.isPaused = false;
      this.notifyState();
      // Workaround for browser bug where resume might stall
      if (!synth.speaking && this.currentIndex < this.queue.length) {
        this._playNextInQueue();
      }
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  next() {
    if (!this.isPlaying || !this.queue.length) return;
    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();
    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex += 1;
      this.isPaused = false;
      this._playNextInQueue();
    } else {
      this.stop();
    }
  }

  previous() {
    if (!this.isPlaying || !this.queue.length) return;
    const synth = getSpeechSynthesis();
    if (synth) synth.cancel();
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.isPaused = false;
    this._playNextInQueue();
  }

  stop() {
    const synth = getSpeechSynthesis();
    if (synth) {
      synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.queue = [];
    this.currentIndex = -1;
    this.currentContext = null;
    this.notifyState();
  }

  notifyState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentIndex: this.currentIndex,
        total: this.queue.length,
        currentItem: this.queue[this.currentIndex] || null,
        context: this.currentContext,
      });
    }
  }
}
