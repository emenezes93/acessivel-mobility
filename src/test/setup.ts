import '@testing-library/jest-dom';

// Mock para o objeto window.matchMedia que é usado em alguns componentes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock para APIs de geolocalização
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn().mockImplementation(success => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
});

// Mock para APIs de vibração
Object.defineProperty(global.navigator, 'vibrate', {
  value: vi.fn(),
});

// Mock para APIs de síntese de fala
class MockSpeechSynthesisUtterance {
  text: string;
  voice: null;
  pitch: number;
  rate: number;
  volume: number;
  onend: () => void;

  constructor(text: string) {
    this.text = text;
    this.voice = null;
    this.pitch = 1;
    this.rate = 1;
    this.volume = 1;
    this.onend = () => {};
  }
}

class MockSpeechSynthesis {
  speaking: boolean = false;
  pending: boolean = false;
  paused: boolean = false;

  speak(utterance: MockSpeechSynthesisUtterance) {
    this.speaking = true;
    setTimeout(() => {
      this.speaking = false;
      utterance.onend && utterance.onend();
    }, 100);
  }

  cancel() {
    this.speaking = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  getVoices() {
    return [];
  }
}

Object.defineProperty(global, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
});

Object.defineProperty(global, 'speechSynthesis', {
  value: new MockSpeechSynthesis(),
});