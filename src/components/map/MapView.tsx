'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { GasStation, Incident } from '@/types';
import { StationMarker } from './StationMarker';
import { IncidentMarker } from './IncidentMarker';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface MapViewProps {
  stations?: GasStation[];
  incidents?: Incident[];
  showStations?: boolean;
  showIncidents?: boolean;
  onStationReport?: (station: GasStation) => void;
  children?: React.ReactNode;
}

export function MapView({
  stations = [],
  incidents = [],
  showStations = true,
  showIncidents = true,
  onStationReport,
  children,
}: MapViewProps) {
  const { position, loading } = useGeolocation();

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-800 text-slate-400">
        <div className="text-center p-8">
          <p className="text-lg mb-2">กรุณาตั้งค่า Google Maps API Key</p>
          <code className="text-sm bg-slate-700 px-3 py-1 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_KEY}>
      <Map
        defaultCenter={position}
        defaultZoom={14}
        mapId="thaihelp-map"
        className="w-full h-full"
        gestureHandling="greedy"
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
      >
        {/* Current location */}
        {!loading && (
          <AdvancedMarker position={position}>
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping" />
            </div>
          </AdvancedMarker>
        )}

        {/* Station markers */}
        {showStations &&
          stations.map((station) => (
            <StationMarker
              key={station.place_id}
              station={station}
              onReport={onStationReport || (() => {})}
            />
          ))}

        {/* Incident markers */}
        {showIncidents &&
          incidents.map((incident) => (
            <IncidentMarker key={incident.id} incident={incident} />
          ))}

        {children}
      </Map>
    </APIProvider>
  );
}
