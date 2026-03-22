'use client';

import { useState, useCallback, useRef } from 'react';
import { startListening, speak, stopSpeaking, type SpeechRecognitionResult } from '@/lib/speech';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const listen = useCallback(() => {
    setError(null);
    setTranscript('');

    const stop = startListening(
      (result: SpeechRecognitionResult) => {
        setTranscript(result.transcript);
        if (result.isFinal) {
          setIsListening(false);
        }
      },
      (err: string) => {
        setError(err);
        setIsListening(false);
      }
    );

    if (stop) {
      stopRef.current = stop;
      setIsListening(true);
    } else {
      setError('Speech recognition not available');
    }
  }, []);

  const stopListening = useCallback(() => {
    stopRef.current?.();
    setIsListening(false);
  }, []);

  const sayText = useCallback((text: string) => {
    setIsSpeaking(true);
    speak(text);
    // Approximate end of speech
    const duration = Math.max(2000, text.length * 80);
    setTimeout(() => setIsSpeaking(false), duration);
  }, []);

  const stopTalking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    listen,
    stopListening,
    sayText,
    stopTalking,
  };
}
