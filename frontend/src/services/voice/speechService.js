/**
 * Client-side Text-To-Speech (TTS) engine using Web Speech API
 * Supports Hindi (hi-IN), English (en-IN), Marathi (mr-IN), Tamil (ta-IN), Gujarati (gu-IN), Kannada (kn-IN)
 */

const LANG_TAG_MAP = {
  hi: "hi-IN",
  en: "en-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  kn: "kn-IN",
};

// Fallbacks if regional voice not installed on phone/browser
const LANG_FALLBACKS = {
  mr: ["mr-IN", "hi-IN", "en-IN"],
  gu: ["gu-IN", "hi-IN", "en-IN"],
  kn: ["kn-IN", "en-IN"],
  ta: ["ta-IN", "en-IN"],
  hi: ["hi-IN", "en-IN"],
  en: ["en-IN", "en-US", "en-GB"],
};

class SpeechService {
  constructor() {
    this.synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
    this.voices = [];
    this.activeUtterance = null;
    this.initVoices();
  }

  isSupported() {
    return Boolean(this.synth);
  }

  initVoices() {
    if (!this.synth) return;
    const load = () => {
      try {
        this.voices = this.synth.getVoices() || [];
      } catch (_) {
        this.voices = [];
      }
    };
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  getBestVoice(langCode) {
    if (!this.voices.length) {
      this.initVoices();
    }
    const candidates = LANG_FALLBACKS[langCode] || [LANG_TAG_MAP[langCode] || langCode];

    for (const tag of candidates) {
      const match = this.voices.find(
        (v) => v.lang && (v.lang.toLowerCase() === tag.toLowerCase() || v.lang.toLowerCase().startsWith(tag.split("-")[0].toLowerCase()))
      );
      if (match) return match;
    }
    return this.voices[0] || null;
  }

  stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.activeUtterance = null;
    } catch (_) {}
  }

  isSpeaking() {
    return Boolean(this.synth && (this.synth.speaking || this.synth.pending));
  }

  speak(text, options = {}) {
    if (!this.synth || !text) return false;

    const {
      lang = "hi",
      rate = 0.95,
      pitch = 1.0,
      onStart,
      onEnd,
      onError,
    } = options;

    // Cancel any ongoing speech
    this.stop();

    try {
      const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (!cleanText) return false;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetTag = LANG_TAG_MAP[lang] || lang;
      utterance.lang = targetTag;

      const voice = this.getBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onstart = () => {
        this.activeUtterance = utterance;
        onStart?.();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        this.activeUtterance = null;
        // ignore 'canceled' or 'interrupted' events
        if (e.error !== "canceled" && e.error !== "interrupted") {
          onError?.(e);
        } else {
          onEnd?.();
        }
      };

      this.activeUtterance = utterance;

      // Chrome/Android bug workaround: resume if paused
      if (this.synth.paused) {
        this.synth.resume();
      }

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      onError?.(err);
      return false;
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
