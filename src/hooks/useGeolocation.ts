'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MapPosition } from '@/types';

// Default: กรุงเทพฯ
const DEFAULT_POSITION: MapPosition = { lat: 13.7563, lng: 100.5018 };

export function useGeolocation() {
  const [position, setPosition] = useState<MapPosition>(DEFAULT_POSITION);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { position, error, loading, refresh: getCurrentPosition };
}
