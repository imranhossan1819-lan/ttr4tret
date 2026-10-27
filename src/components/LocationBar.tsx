import React from 'react';
import { Navigation2, MapPin, Compass, LocateFixed, Anchor, Radio, AlertCircle } from 'lucide-react';
import { CoastalStation, Coordinates } from '../types/astro';
import { COASTAL_STATIONS } from '../utils/tideStations';

interface LocationBarProps {
  isBengali: boolean;
  coords: Coordinates;
  isLiveTracking: boolean;
  isLoading: boolean;
  error: string | null;
  activeStation: CoastalStation;
  distanceToStationKm: number;
  deviceHeading: number | null;
  placeName: string | null;
  useLiveGps: boolean;
  onStartTracking: () => void;
  onSelectStation: (station: CoastalStation) => void;
}

export const LocationBar: React.FC<LocationBarProps> = ({
  isBengali,
  coords,
  isLiveTracking,
  isLoading,
  error,
  activeStation,
  distanceToStationKm,
  deviceHeading,
  placeName,
  useLiveGps,
  onStartTracking,
  onSelectStation,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#091124]/90 p-3 sm:p-4 shadow-xl shadow-cyan-950/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Live GPS Action & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={onStartTracking}
            disabled={isLoading}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition shadow-md ${
              useLiveGps
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            {isLoading ? (
              <Radio className="h-4 w-4 animate-spin text-cyan-400" />
            ) : (
              <LocateFixed className={`h-4 w-4 ${useLiveGps ? 'text-white animate-pulse' : 'text-cyan-400'}`} />
            )}
            <span>
              {isLoading
                ? (isBengali ? 'জিপিএস অবস্থান খোঁজা হচ্ছে...' : 'Locating GPS...')
                : useLiveGps
                ? (isBengali ? 'লাইভ জিপিএস সক্রিয়' : 'Live GPS Active')
                : (isBengali ? 'আমার লাইভ লোকেশন চালু করুন' : 'Track My Live Location')}
            </span>
          </button>

          {/* Coordinates readout */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1.5 border border-slate-800 text-xs">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">{isBengali ? 'স্থানাঙ্ক:' : 'Coord:'}</span>
            <span className="font-mono text-cyan-200 font-medium">
              {coords.latitude.toFixed(4)}°N, {coords.longitude.toFixed(4)}°E
            </span>
            {coords.accuracy && (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                ±{Math.round(coords.accuracy)}m
              </span>
            )}
          </div>

          {/* Compass / Orientation readout if available */}
          {deviceHeading !== null && (
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 px-2.5 py-1.5 border border-slate-800 text-xs">
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">{isBengali ? 'কম্পাস:' : 'Heading:'}</span>
              <span className="font-mono text-emerald-300 font-medium">{deviceHeading}°</span>
            </div>
          )}
        </div>

        {/* Right Side: Coastal Station Selector */}
        <div className="flex items-center gap-2 self-start lg:self-center w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <Anchor className="h-4 w-4 text-sky-400" />
            <span>{isBengali ? 'জোয়ার স্টেশন:' : 'Tidal Station:'}</span>
          </div>

          <select
            value={activeStation.id}
            onChange={(e) => {
              const selected = COASTAL_STATIONS.find((s) => s.id === e.target.value);
              if (selected) onSelectStation(selected);
            }}
            className="w-full lg:w-64 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
          >
            {COASTAL_STATIONS.map((station) => (
              <option key={station.id} value={station.id}>
                {isBengali ? `${station.nameBn} (${station.meanTideRangeMeters}m)` : `${station.nameEn} (${station.meanTideRangeMeters}m)`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Place name & coastal proximity info bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2 text-[11px] sm:text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Navigation2 className="h-3 w-3 text-cyan-400" />
          <span>
            {placeName || (isBengali ? activeStation.nameBn : activeStation.nameEn)}
          </span>
          {distanceToStationKm > 0 && useLiveGps && (
            <span className="rounded bg-sky-950/70 px-1.5 py-0.5 text-sky-300 font-mono text-[10px]">
              {isBengali
                ? `রেফারেন্স স্টেশন হতে ${distanceToStationKm} কি.মি. দূরত্ব`
                : `${distanceToStationKm} km from reference tide station`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            {isBengali ? 'গড় জোয়ারের বিস্তার:' : 'Mean Tidal Range:'}{' '}
            <strong className="text-slate-200 font-mono">{activeStation.meanTideRangeMeters} মি. ({Math.round(activeStation.meanTideRangeMeters * 3.28)} ফুট)</strong>
          </span>
          <span className="hidden sm:inline-block text-slate-600">•</span>
          <span className="text-cyan-400 font-medium">
            {isBengali ? 'অর্ধ-দৈনিক জোয়ার (Semi-diurnal M2/S2)' : 'Semi-diurnal Tide'}
          </span>
        </div>
      </div>

      {/* Error alert if location failed */}
      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-800/50 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
