'use client';

import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useState, useCallback } from 'react';
import { Fuel, Star, Navigation, Clock } from 'lucide-react';
import { FUEL_TYPES, type GasStation, type FuelStatus } from '@/types';
import { timeAgo } from '@/lib/utils';

interface StationMarkerProps {
  station: GasStation;
  onReport: (station: GasStation) => void;
}

const statusColor: Record<FuelStatus, string> = {
  available: '#22c55e',
  low: '#eab308',
  empty: '#ef4444',
  unknown: '#6b7280',
};

const brandIcon: Record<string, string> = {
  PTT: '⛽',
  Shell: '🐚',
  Bangchak: '🌿',
  Esso: '🔴',
  Caltex: '⭐',
  Other: '⛽',
};

export function StationMarker({ station, onReport }: StationMarkerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleClick = useCallback(() => setShowInfo(true), []);
  const handleClose = useCallback(() => setShowInfo(false), []);

  const hasReports = station.fuelReports && station.fuelReports.length > 0;
  const hasEmpty = station.fuelReports?.some((f) => f.status === 'empty');
  const isOpen = station.opening_hours?.open_now;

  // Marker color based on status
  const markerBg = !isOpen && isOpen !== undefined
    ? '#6b7280' // closed = gray
    : hasEmpty
    ? '#ef4444' // has empty fuel = red
    : hasReports
    ? '#22c55e' // has reports, all available = green
    : '#f97316'; // no reports = orange

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: station.latitude, lng: station.longitude }}
        onClick={handleClick}
        title={station.name}
      >
        <div className="relative cursor-pointer group">
          {/* Marker pin */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: markerBg }}
          >
            <span>{brandIcon[station.brand || 'Other']}</span>
            {station.distance && <span>{station.distance}km</span>}
          </div>
          {/* Pulse if has empty fuel */}
          {hasEmpty && (
            <div className="absolute -inset-1 rounded-full animate-ping opacity-30" style={{ backgroundColor: markerBg }} />
          )}
        </div>
      </AdvancedMarker>

      {showInfo && marker && (
        <InfoWindow anchor={marker} onCloseClick={handleClose} maxWidth={320}>
          <div className="p-1 min-w-[260px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {station.brand && (
                    <span className="text-[10px] font-bold uppercase bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">
                      {station.brand}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isOpen ? 'เปิด' : isOpen === false ? 'ปิด' : '—'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{station.name}</h3>
                <p className="text-xs text-gray-500">{station.vicinity}</p>
              </div>
              <div className="text-right shrink-0">
                {station.distance && (
                  <div className="flex items-center gap-1 text-orange-600 text-xs font-bold">
                    <Navigation className="w-3 h-3" />
                    {station.distance} km
                  </div>
                )}
                {station.rating && (
                  <div className="flex items-center gap-0.5 text-xs text-gray-500 mt-0.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    {station.rating}
                  </div>
                )}
              </div>
            </div>

            {/* Fuel reports */}
            {hasReports && (
              <div className="border-t pt-2 mt-2">
                <div className="grid grid-cols-2 gap-1">
                  {station.fuelReports!.map((fuel) => {
                    const info = FUEL_TYPES.find((f) => f.key === fuel.fuelType);
                    return (
                      <div key={fuel.fuelType} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                        <span className="text-[11px] text-gray-600 truncate">{info?.label || fuel.fuelType}</span>
                        <div className="flex items-center gap-1">
                          {fuel.price && (
                            <span className="text-[11px] font-bold text-gray-800">฿{fuel.price}</span>
                          )}
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusColor[fuel.status] }}
                            title={fuel.status}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {station.lastReportAt && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1.5">
                    <Clock className="w-3 h-3" />
                    อัปเดต {timeAgo(new Date(station.lastReportAt))} • {station.totalReports} รายงาน
                  </div>
                )}
              </div>
            )}

            {/* Report CTA */}
            <button
              onClick={() => {
                handleClose();
                onReport(station);
              }}
              className="w-full mt-2 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {hasReports ? '📝 อัปเดตรายงาน' : '📝 รายงานสถานะน้ำมัน'}
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
