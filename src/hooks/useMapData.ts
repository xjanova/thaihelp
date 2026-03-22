'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GasStation, Incident, MapPosition } from '@/types';

interface MapData {
  stations: GasStation[];
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useMapData(position: MapPosition, autoRefreshMs = 30000): MapData {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [stationsRes, incidentsRes] = await Promise.all([
        fetch(`/api/stations?lat=${position.lat}&lng=${position.lng}&radius=15000`),
        fetch(`/api/incidents?lat=${position.lat}&lng=${position.lng}`),
      ]);

      const stationsData = await stationsRes.json();
      const incidentsData = await incidentsRes.json();

      if (stationsData.success) setStations(stationsData.data);
      if (incidentsData.success) setIncidents(incidentsData.data || []);

      setError(null);
      setLastUpdated(new Date());
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [position]);

  useEffect(() => {
    fetchData();

    // Auto-refresh
    intervalRef.current = setInterval(fetchData, autoRefreshMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, autoRefreshMs]);

  return { stations, incidents, loading, error, lastUpdated, refresh: fetchData };
}
