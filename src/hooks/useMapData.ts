'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GasStation, Incident, MapPosition, OilProducer } from '@/types';

interface MapData {
  stations: GasStation[];
  incidents: Incident[];
  oilProducers: OilProducer[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useMapData(position: MapPosition, autoRefreshMs = 30000): MapData {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [oilProducers, setOilProducers] = useState<OilProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Destructure lat/lng so the callback only re-creates when the actual
  // coordinate values change, not when the position object reference changes.
  const { lat, lng } = position;

  const fetchData = useCallback(async () => {
    // Use refreshing (not loading) for subsequent fetches so the UI doesn't
    // flash a full loading state on every auto-refresh tick.
    setRefreshing(true);
    try {
      const [stationsRes, incidentsRes, oilRes] = await Promise.all([
        fetch(`/api/stations?lat=${lat}&lng=${lng}&radius=15000`),
        fetch(`/api/incidents?lat=${lat}&lng=${lng}`),
        fetch(`/api/oil-producers?lat=${lat}&lng=${lng}`),
      ]);

      const stationsData = await stationsRes.json();
      const incidentsData = await incidentsRes.json();
      const oilData = await oilRes.json();

      if (stationsData.success) setStations(stationsData.data);
      if (incidentsData.success) setIncidents(incidentsData.data || []);
      if (oilData.success) setOilProducers(oilData.data || []);

      setError(null);
      setLastUpdated(new Date());
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchData();

    // Auto-refresh
    intervalRef.current = setInterval(fetchData, autoRefreshMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, autoRefreshMs]);

  return { stations, incidents, oilProducers, loading, refreshing, error, lastUpdated, refresh: fetchData };
}
