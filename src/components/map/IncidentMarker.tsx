'use client';

import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useState, useCallback } from 'react';
import { ThumbsUp, Clock } from 'lucide-react';
import type { Incident, IncidentCategory } from '@/types';
import { timeAgo } from '@/lib/utils';

interface IncidentMarkerProps {
  incident: Incident;
}

const categoryConfig: Record<IncidentCategory, { emoji: string; label: string; color: string }> = {
  accident: { emoji: '🚗', label: 'อุบัติเหตุ', color: '#ef4444' },
  flood: { emoji: '🌊', label: 'น้ำท่วม', color: '#3b82f6' },
  roadblock: { emoji: '🚧', label: 'ถนนปิด', color: '#f97316' },
  checkpoint: { emoji: '👮', label: 'จุดตรวจ', color: '#8b5cf6' },
  construction: { emoji: '🏗️', label: 'ก่อสร้าง', color: '#eab308' },
  other: { emoji: '⚠️', label: 'อื่นๆ', color: '#6b7280' },
};

export function IncidentMarker({ incident }: IncidentMarkerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleClick = useCallback(() => setShowInfo(true), []);
  const handleClose = useCallback(() => setShowInfo(false), []);

  const config = categoryConfig[incident.category] || categoryConfig.other;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: incident.latitude, lng: incident.longitude }}
        onClick={handleClick}
        title={incident.title}
      >
        <div className="relative cursor-pointer group">
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110 border-2 border-white"
            style={{ backgroundColor: config.color }}
          >
            <span className="text-sm">{config.emoji}</span>
            <span className="max-w-[100px] truncate">{incident.title}</span>
          </div>
          {/* Pulse animation */}
          <div
            className="absolute -inset-1 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: config.color }}
          />
        </div>
      </AdvancedMarker>

      {showInfo && marker && (
        <InfoWindow anchor={marker} onCloseClick={handleClose} maxWidth={300}>
          <div className="p-1 min-w-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{config.emoji}</span>
              <div>
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: config.color }}
                >
                  {config.label}
                </span>
                <h3 className="font-bold text-gray-900 text-sm mt-0.5">{incident.title}</h3>
              </div>
            </div>

            {incident.description && (
              <p className="text-xs text-gray-600 mb-2">{incident.description}</p>
            )}

            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t pt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(new Date(incident.createdAt))}
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {incident.upvotes} ยืนยัน
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
