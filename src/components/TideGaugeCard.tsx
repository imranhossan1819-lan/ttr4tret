import React from 'react';
import { Waves, ArrowUpRight, ArrowDownRight, Compass, ShieldAlert, Sparkles, Clock, Droplets, Info } from 'lucide-react';
import { CoastalStation, TideData } from '../types/astro';

interface TideGaugeCardProps {
  isBengali: boolean;
  tide: TideData;
  station: CoastalStation;
}

export const TideGaugeCard: React.FC<TideGaugeCardProps> = ({ isBengali, tide, station }) => {
  const isRising = tide.state === 'rising';
  const isFalling = tide.state === 'falling';

  // Format countdown
  const hoursToNext = Math.floor(tide.timeToNextMinutes / 60);
  const minsToNext = tide.timeToNextMinutes % 60;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-[#0b1329] to-[#060c1d] p-5 sm:p-6 shadow-2xl">
      {/* Top Banner / Spring-Neap indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{isBengali ? 'জোয়ার-ভাটা পানির স্তর' : 'Live Tidal Water Level'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isBengali ? `${station.nameBn}` : `${station.nameEn}`}
            </p>
          </div>
        </div>

        {/* Spring Tide / Neap Tide Classification Badge */}
        <div className="flex items-center gap-2">
          {tide.isSpringTide && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-500/10 animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{isBengali ? 'ভরা কটাল (Spring Tide)' : 'Spring Tide (Tej Kotal)'}</span>
            </div>
          )}
          {tide.isNeapTide && (
            <div className="flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300">
              <Compass className="h-3.5 w-3.5 text-purple-400" />
              <span>{isBengali ? 'মরা কটাল (Neap Tide)' : 'Neap Tide (Mora Kotal)'}</span>
            </div>
          )}
          {!tide.isSpringTide && !tide.isNeapTide && (
            <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
              {isBengali ? 'স্বাভাবিক কটাল' : 'Moderate Tide'}
            </div>
          )}
        </div>
      </div>

      {/* Main Gauge Body */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Animated Water Level Tank */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[240px] h-64 rounded-2xl border-2 border-cyan-500/30 bg-slate-950/80 p-2 shadow-inner overflow-hidden flex flex-col justify-end">
            {/* Height meter scale markings on side */}
            <div className="absolute top-2 left-2 bottom-2 w-8 flex flex-col justify-between text-[10px] font-mono text-slate-400 z-20 pointer-events-none select-none">
              <span className="text-cyan-300 font-bold">{Math.round(station.meanTideRangeMeters * 1.2)}m</span>
              <span>{Math.round(station.meanTideRangeMeters * 0.9)}m</span>
              <span>{Math.round(station.meanTideRangeMeters * 0.6)}m</span>
              <span>{Math.round(station.meanTideRangeMeters * 0.3)}m</span>
              <span className="text-slate-400">0.0m</span>
            </div>

            {/* High Water Level reference line */}
            <div className="absolute top-8 left-10 right-2 border-b border-dashed border-amber-400/60 z-20 flex justify-end">
              <span className="text-[9px] bg-amber-950/80 text-amber-300 px-1 rounded">
                {isBengali ? 'সর্বোচ্চ স্ফীতি' : 'Max High'}
              </span>
            </div>

            {/* Low Water Level reference line */}
            <div className="absolute bottom-10 left-10 right-2 border-b border-dashed border-slate-600 z-20 flex justify-end">
              <span className="text-[9px] bg-slate-900/90 text-slate-400 px-1 rounded">
                {isBengali ? 'নিম্ন ভাটা' : 'Low Datum'}
              </span>
            </div>

            {/* Water envelope with animated wave crest */}
            <div
              className="relative w-full rounded-b-xl transition-all duration-1000 ease-out overflow-hidden"
              style={{
                height: `${Math.max(15, Math.min(92, tide.percentage))}%`,
                background: 'linear-gradient(180deg, rgba(6,182,212,0.85) 0%, rgba(3,105,161,0.92) 50%, rgba(2,132,199,0.98) 100%)',
              }}
            >
              {/* Animated wave surface effect */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-300 opacity-70 animate-pulse" />
              
              {/* Bubbles / Shimmer */}
              <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
              </div>

              {/* Water percentage label inside tank */}
              <div className="absolute bottom-3 right-3 text-right">
                <span className="text-xl font-mono font-black text-white/90 drop-shadow">
                  {tide.percentage}%
                </span>
                <p className="text-[10px] text-cyan-100 font-medium">
                  {isBengali ? 'জলসীমা' : 'Fullness'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center text-xs text-slate-400">
            {isBengali ? 'জোয়ারের উচ্চতা পরিমাপক' : 'Tide Water Level Gauge'}
          </div>
        </div>

        {/* Right Info: Live Height & State */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {/* Current Tide Reading Big Numbers */}
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                isRising
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isFalling
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {isRising && <ArrowUpRight className="h-4 w-4 text-emerald-400 animate-bounce" />}
                {isFalling && <ArrowDownRight className="h-4 w-4 text-amber-400 animate-bounce" />}
                <span>{isBengali ? tide.stateBn : tide.stateEn}</span>
              </span>

              <span className="text-xs text-slate-400">
                {isRising
                  ? (isBengali ? 'পানি বৃদ্ধি অব্যাহত' : 'Water level rising')
                  : (isBengali ? 'পানি হ্রাস অব্যাহত' : 'Water level receding')}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {tide.currentHeightMeters}
                <span className="text-xl sm:text-2xl font-bold text-cyan-400 ml-1.5">
                  {isBengali ? 'মিটার' : 'm'}
                </span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-semibold text-slate-400">
                / {tide.currentHeightFeet} {isBengali ? 'ফুট' : 'ft'}
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {isBengali
                ? `আজকের পরিসীমা: সর্বনিম্ন ${tide.dayMinHeight} মি. থেকে সর্বোচ্চ ${tide.dayMaxHeight} মি.`
                : `Today's range: Min ${tide.dayMinHeight}m to Max ${tide.dayMaxHeight}m`}
            </p>
          </div>

          {/* Next Tide Event Countdown Box */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300">
                  {isBengali ? 'পরবর্তী পূর্বাভাস:' : 'Next Tide Event:'}
                </span>
              </div>
              <span className="rounded bg-cyan-950 px-2 py-0.5 text-[11px] font-mono font-medium text-cyan-300 border border-cyan-800/60">
                {hoursToNext > 0
                  ? (isBengali ? `${hoursToNext} ঘণ্টা ${minsToNext} মিনিট পর` : `In ${hoursToNext}h ${minsToNext}m`)
                  : (isBengali ? `${minsToNext} মিনিট পর` : `In ${minsToNext}m`)}
              </span>
            </div>

            {tide.nextTideEvent && (
              <div className="mt-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {tide.nextTideEvent.type === 'high' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-amber-400" />
                    )}
                    <span>{isBengali ? tide.nextTideEvent.typeBn : tide.nextTideEvent.typeEn}</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {tide.nextTideEvent.time.toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {tide.nextTideEvent.heightMeters} m
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {tide.nextTideEvent.heightFeet} ft
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gravitational Pull & Astronomical Influence Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3">
              <div className="text-[11px] text-slate-400">{isBengali ? 'চন্দ্র-সূর্য আকর্ষণ শক্তি' : 'Gravitational Pull'}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold font-mono text-white">
                  {tide.gravitationalPullG}x
                </span>
                <span className="text-[10px] text-emerald-400">
                  {tide.gravitationalPullG >= 1.2
                    ? (isBengali ? 'তীব্র আকর্ষণ' : 'Strong')
                    : tide.gravitationalPullG <= 0.8
                    ? (isBengali ? 'মৃদু আকর্ষণ' : 'Weak')
                    : (isBengali ? 'স্বাভাবিক' : 'Normal')}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3">
              <div className="text-[11px] text-slate-400">{isBengali ? 'কক্ষপথীয় কৌণিক অবস্থান' : 'Alignment Angle'}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-base font-bold font-mono text-white">
                  {tide.alignmentAngleDeg}°
                </span>
                <span className="text-[10px] text-slate-400">
                  {tide.alignmentAngleDeg <= 20
                    ? (isBengali ? 'পূর্ণ সমরেখা' : 'Syzygy')
                    : (isBengali ? 'কৌণিক' : 'Quadrature')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
