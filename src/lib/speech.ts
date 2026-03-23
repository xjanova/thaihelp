'use client';

// === Text-to-Speech ===

let voicesLoaded = false;
let thaiVoice: SpeechSynthesisVoice | null = null;

function loadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Prefer female/child Thai voice for "น้องหญิง" character
    const thaiVoices = voices.filter((v) => v.lang.startsWith('th'));
    const femaleVoice = thaiVoices.find(
      (v) => v.name.toLowerCase().includes('female') || v.name.includes('หญิง') || v.name.includes('woman')
    );
    thaiVoice = femaleVoice || thaiVoices[0] || null;
    voicesLoaded = true;
  }
}

// Chrome requires onvoiceschanged event to load voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  // Ensure voices are loaded
  if (!voicesLoaded) loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = 0.9;   // พูดช้าลงนิดหน่อย — ฟังสบายกว่า
  utterance.pitch = 1.15;  // เสียงสาวๆ — ไม่สูงเหมือนเด็ก

  if (thaiVoice) {
    utterance.voice = thaiVoice;
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  // Chrome bug: speechSynthesis stops after ~15 seconds
  // Workaround: resume periodically
  const resumeInterval = setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      clearInterval(resumeInterval);
      return;
    }
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 10000);

  utterance.onend = () => {
    clearInterval(resumeInterval);
    onEnd?.();
  };
  utterance.onerror = () => {
    clearInterval(resumeInterval);
    onEnd?.();
  };
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// === Speech Recognition ===

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export function isRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  );
}

export function startListening(
  onResult: (result: SpeechRecognitionResult) => void,
  onError?: (error: string) => void,
  onEnd?: () => void
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognitionClass =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    onError?.('Speech recognition not supported');
    return null;
  }

  const recognition = new (SpeechRecognitionClass as new () => SpeechRecognitionInstance)();
  recognition.lang = 'th-TH';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.results[event.results.length - 1];
    onResult({
      transcript: last[0].transcript,
      isFinal: last.isFinal,
    });
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    // 'no-speech' and 'aborted' are not real errors
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      onError?.(event.error);
    }
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();

  return () => {
    try {
      recognition.stop();
    } catch {
      // already stopped
    }
  };
}

// Type declarations for Web Speech API
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
