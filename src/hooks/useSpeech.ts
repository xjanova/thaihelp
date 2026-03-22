'use client';

import { useState, useCallback, useRef } from 'react';
import {
  startListening,
  speak,
  stopSpeaking,
  isSpeechSupported,
  isRecognitionSupported,
  type SpeechRecognitionResult,
} from '@/lib/speech';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const listen = useCallback(() => {
    if (!isRecognitionSupported()) {
      setError('เบราว์เซอร์ไม่รองรับการฟังเสียง');
      return;
    }

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
      },
      () => {
        // onEnd — recognition stopped naturally
        setIsListening(false);
      }
    );

    if (stop) {
      stopRef.current = stop;
      setIsListening(true);
    } else {
      setError('ไม่สามารถเปิดไมค์ได้');
    }
  }, []);

  const stopListening = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setIsListening(false);
  }, []);

  const sayText = useCallback((text: string) => {
    if (!isSpeechSupported()) return;
    setIsSpeaking(true);
    speak(text, () => {
      // onEnd callback — fires when speech actually finishes
      setIsSpeaking(false);
    });
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
    speechSupported: typeof window !== 'undefined' && isSpeechSupported(),
    recognitionSupported: typeof window !== 'undefined' && isRecognitionSupported(),
  };
}
