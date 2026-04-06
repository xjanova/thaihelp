'use client';

import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { useState, useCallback } from 'react';
import { Phone, Navigation, Clock, Leaf } from 'lucide-react';
import { OIL_TYPES, type OilProducer } from '@/types';
import { timeAgo } from '@/lib/utils';

interface OilProducerMarkerProps {
  producer: OilProducer;
}

export function OilProducerMarker({ producer }: OilProducerMarkerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleClick = useCallback(() => setShowInfo(true), []);
  const handleClose = useCallback(() => setShowInfo(false), []);

  const oilInfo = OIL_TYPES.find((o) => o.key === producer.oilType);
  const displayName = producer.oilType === 'other' && producer.oilTypeCustom
    ? producer.oilTypeCustom
    : oilInfo?.label || producer.oilType;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: producer.latitude, lng: producer.longitude }}
        onClick={handleClick}
        title={producer.shopName}
      >
        <div className="relative cursor-pointer group">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: '#10B981' }}
          >
            <span>{oilInfo?.emoji || '🫙'}</span>
            {producer.distance !== undefined && <span>{producer.distance}km</span>}
          </div>
          {/* Subtle pulse */}
          <div className="absolute -inset-1 rounded-full animate-pulse opacity-20" style={{ backgroundColor: '#10B981' }} />
        </div>
      </AdvancedMarker>

      {showInfo && marker && (
        <InfoWindow anchor={marker} onCloseClick={handleClose} maxWidth={320}>
          <div className="p-1 min-w-[260px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: oilInfo?.color || '#6b7280' }}
                  >
                    {oilInfo?.emoji} {displayName}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{producer.shopName}</h3>
                {producer.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{producer.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                {producer.distance !== undefined && (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <Navigation className="w-3 h-3" />
                    {producer.distance} km
                  </div>
                )}
              </div>
            </div>

            {/* Price & Details */}
            <div className="border-t pt-2 mt-2 space-y-1.5">
              <div className="flex items-center justify-between bg-emerald-50 rounded px-2 py-1.5">
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-500" />
                  ราคา
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  ฿{producer.price.toFixed(2)} <span className="text-[10px] font-normal text-gray-500">/{producer.priceUnit || 'ลิตร'}</span>
                </span>
              </div>

              {/* Phone */}
              <a
                href={`tel:${producer.phone}`}
                className="flex items-center justify-between bg-blue-50 rounded px-2 py-1.5 hover:bg-blue-100 transition-colors"
              >
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-500" />
                  โทร
                </span>
                <span className="text-xs font-bold text-blue-700">{producer.phone}</span>
              </a>

              {/* Owner */}
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <span>โดย {producer.ownerName}</span>
              </div>

              {producer.createdAt && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  ลงทะเบียน {timeAgo(new Date(producer.createdAt))}
                </div>
              )}
            </div>

            {/* Navigate CTA */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${producer.latitude},${producer.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-2 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors text-center"
            >
              🗺️ นำทางไปร้าน
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
