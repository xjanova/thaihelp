'use client';

export function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to find Thai voice
  const voices = window.speechSynthesis.getVoices();
  const thaiVoice = voices.find((v) => v.lang.startsWith('th'));
  if (thaiVoice) {
    utterance.voice = thaiVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export function startListening(
  onResult: (result: SpeechRecognitionResult) => void,
  onError?: (error: string) => void
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported');
    return null;
  }

  const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
  recognition.lang = 'th-TH';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.results[event.results.length - 1];
    onResult({
      transcript: last[0].transcript,
      isFinal: last.isFinal,
    });
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onError?.(event.error);
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
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
