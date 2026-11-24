import { describe, it, expect, beforeEach, vi } from 'vitest';
import SpeechService, { sortUSVoicesFirst } from '../src/modules/speechService.js';

class MockUtterance {
  constructor(text) {
    this.text = text;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.lang = '';
    this.voice = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

const US_VOICE = { name: 'Google US English', lang: 'en-US' };
const UK_VOICE = { name: 'UK English Male', lang: 'en-GB' };
const FR_VOICE = { name: 'French Voice', lang: 'fr-FR' };

function setupMockSpeech() {
  const utterances = [];
  const synth = {
    speaking: false,
    paused: false,
    speak: vi.fn((u) => {
      utterances.push(u);
      if (u.onstart) u.onstart();
      if (u.onEndAsync !== false && u.onend) {
        setTimeout(() => u.onend(), 10);
      }
    }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => [FR_VOICE, UK_VOICE, US_VOICE]),
    addEventListener: vi.fn(),
  };
  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = MockUtterance;
  return { synth, utterances };
}

beforeEach(() => {
  delete window.speechSynthesis;
  delete window.SpeechSynthesisUtterance;
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('SpeechService', () => {
  it('sorts and prioritizes US English voices', () => {
    const sorted = sortUSVoicesFirst([FR_VOICE, UK_VOICE, US_VOICE]);
    expect(sorted[0].lang).toBe('en-US');
    expect(sorted[1].lang).toBe('en-GB');
  });

  it('initializes speech synthesis and selects default US voice', () => {
    const { synth } = setupMockSpeech();
    const service = new SpeechService().init();

    expect(synth.getVoices).toHaveBeenCalled();
    expect(service.voices.length).toBe(3);
    expect(service.selectedVoice.name).toBe('Google US English');
  });

  it('clamps and updates speech rate', () => {
    setupMockSpeech();
    const service = new SpeechService().init();

    service.setRate(1.5);
    expect(service.rate).toBe(1.5);

    service.setRate(3.0);
    expect(service.rate).toBe(2.0);

    service.setRate(0.2);
    expect(service.rate).toBe(0.5);
  });

  it('speaks individual text using Web Speech API', () => {
    const { synth, utterances } = setupMockSpeech();
    const service = new SpeechService().init();

    service.speakText('Hello there!');
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalled();
    expect(utterances.length).toBe(1);
    expect(utterances[0].text).toBe('Hello there!');
  });

  it('handles playSequence, pause, resume, and stop', () => {
    const { synth } = setupMockSpeech();
    const service = new SpeechService().init();

    const items = [
      { id: '1', phrase: 'Phrase 1' },
      { id: '2', phrase: 'Phrase 2' },
    ];

    service.playSequence(items, { title: 'Test Context' });
    expect(service.isPlaying).toBe(true);
    expect(service.queue.length).toBe(2);

    service.pause();
    expect(service.isPaused).toBe(true);
    expect(synth.pause).toHaveBeenCalled();

    service.resume();
    expect(service.isPaused).toBe(false);
    expect(synth.resume).toHaveBeenCalled();

    service.stop();
    expect(service.isPlaying).toBe(false);
    expect(synth.cancel).toHaveBeenCalled();
  });
});
