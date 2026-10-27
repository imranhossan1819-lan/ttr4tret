import React from 'react';
import { Moon, Sun, Globe, Sunrise, Sunset, Clock, Sparkles, Compass, Milestone, Flame } from 'lucide-react';
import { MoonPosition, SunPosition, Coordinates } from '../types/astro';

interface CelestialCardsProps {
  isBengali: boolean;
  moon: MoonPosition;
  sun: SunPosition;
  coords: Coordinates;
  currentTime: Date;
}

export const CelestialCards: React.FC<CelestialCardsProps> = ({
  isBengali,
  moon,
  sun,
  coords,
  currentTime,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 1. MOON OBSERVATION CARD */}
      <div className="rounded-3xl border border-slate-800 bg-[#091124] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isBengali ? 'চাঁদের মহাজাগতিক তথ্য' : 'Moon Observation'}
                </h3>
                <p className="text-xs text-sky-400 font-medium">
                  {isBengali ? moon.phaseNameBn : moon.phaseNameEn}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-sky-950 px-2.5 py-1 text-xs font-mono font-bold text-sky-300 border border-sky-800">
              {moon.illuminationPercent}% {isBengali ? 'আলোকিত' : 'Lit'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Moon Distance */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Milestone className="h-4 w-4 text-cyan-400" />
                {isBengali ? 'পৃথিবী হতে দূরত্ব:' : 'Earth-Moon Distance:'}
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">
                  {moon.distanceKm.toLocaleString(isBengali ? 'bn-BD' : 'en-US')} {isBengali ? 'কি.মি.' : 'km'}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {moon.distanceFraction < 0.3
                    ? (isBengali ? 'অনুভূ (পেরিজি - কাছাকাছি)' : 'Perigee (Supermoon)')
                    : moon.distanceFraction > 0.7
                    ? (isBengali ? 'অপভূ (অ্যাপোজি - দূরবর্তী)' : 'Apogee (Micromoon)')
                    : (isBengali ? 'গড় দূরত্ব' : 'Average Distance')}
                </span>
              </div>
            </div>

            {/* Moonrise / Moonset */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400 text-[11px] mb-1">{isBengali ? 'চন্দ্রোদয়' : 'Moonrise'}</div>
                <div className="font-mono font-bold text-cyan-300 text-sm">{moon.moonrise || '--:--'}</div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400 text-[11px] mb-1">{isBengali ? 'চন্দ্রাস্ত' : 'Moonset'}</div>
                <div className="font-mono font-bold text-slate-300 text-sm">{moon.moonset || '--:--'}</div>
              </div>
            </div>

            {/* Lunar Age & Zodiac */}
            <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400">
              <span>
                {isBengali ? 'চন্দ্র বয়স:' : 'Lunar Age:'}{' '}
                <strong className="text-slate-200 font-mono">{moon.ageDays} {isBengali ? 'দিন' : 'days'}</strong>
              </span>
              <span>
                {isBengali ? 'রাশি:' : 'Constellation:'}{' '}
                <strong className="text-indigo-300">{isBengali ? moon.zodiacBn : moon.zodiacEn}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{isBengali ? 'জোয়ার সৃষ্টিতে অবদান:' : 'Tidal Generation Force:'}</span>
          <span className="text-emerald-400 font-bold">~৬৮% (প্রধান চালিকাশক্তি)</span>
        </div>
      </div>

      {/* 2. SUN OBSERVATION CARD */}
      <div className="rounded-3xl border border-slate-800 bg-[#091124] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isBengali ? 'সূর্যের মহাজাগতিক তথ্য' : 'Sun Observation'}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  {sun.isAboveHorizon
                    ? (isBengali ? 'দিবালোক সক্রিয়' : 'Daylight Active')
                    : (isBengali ? 'সূর্যাস্ত পরবর্তী' : 'Night Time')}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-amber-950 px-2.5 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-800">
              {sun.altitude > 0 ? `+${sun.altitude.toFixed(1)}°` : `${sun.altitude.toFixed(1)}°`}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Sunrise / Sunset */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                  <Sunrise className="h-3.5 w-3.5 text-amber-400" />
                  {isBengali ? 'সূর্যোদয়' : 'Sunrise'}
                </div>
                <div className="font-mono font-bold text-amber-300 text-sm">{sun.sunrise}</div>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3">
                <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                  <Sunset className="h-3.5 w-3.5 text-orange-400" />
                  {isBengali ? 'সূর্যাস্ত' : 'Sunset'}
                </div>
                <div className="font-mono font-bold text-orange-300 text-sm">{sun.sunset}</div>
              </div>
            </div>

            {/* Solar Noon & Day Length */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" />
                {isBengali ? 'সৌর মধ্যাহ্ন (Solar Noon):' : 'Solar Noon:'}
              </span>
              <span className="font-mono font-bold text-white">{sun.solarNoon}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400">
              <span>
                {isBengali ? 'দিনের দৈর্ঘ্য:' : 'Day Duration:'}{' '}
                <strong className="text-slate-200 font-mono">
                  {sun.dayLengthHours}h {sun.dayLengthMinutes}m
                </strong>
              </span>
              <span>
                {isBengali ? 'সৌর দূরত্ব:' : 'Distance:'}{' '}
                <strong className="text-slate-200 font-mono">1.0 AU</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{isBengali ? 'জোয়ার সৃষ্টিতে অবদান:' : 'Tidal Generation Force:'}</span>
          <span className="text-amber-400 font-bold">~৩২% (গৌণ চালিকাশক্তি)</span>
        </div>
      </div>

      {/* 3. EARTH & OBSERVER CARD */}
      <div className="rounded-3xl border border-slate-800 bg-[#091124] p-5 sm:p-6 shadow-xl flex flex-col justify-between md:col-span-2 lg:col-span-1">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isBengali ? 'পৃথিবীর গতি ও ঘূর্ণন' : 'Earth Coordinates'}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {isBengali ? 'কক্ষপথীয় অক্ষীয় হেলন ২৩.৪৪°' : 'Axial Tilt: 23.44°'}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-800">
              {isBengali ? 'ঘূর্ণনশীল' : '1,670 km/h'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Observer Latitude & Longitude */}
            <div className="rounded-xl bg-slate-900/80 p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">{isBengali ? 'পর্যবেক্ষকের অক্ষাংশ:' : 'Observer Lat:'}</span>
                <span className="font-mono text-cyan-300 font-bold">{coords.latitude.toFixed(4)}° N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isBengali ? 'পর্যবেক্ষকের দ্রাঘিমাংশ:' : 'Observer Long:'}</span>
                <span className="font-mono text-cyan-300 font-bold">{coords.longitude.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Earth Ocean Bulge dynamics */}
            <div className="rounded-xl bg-slate-900/80 p-3 text-xs">
              <div className="text-slate-400 text-[11px] mb-1">{isBengali ? 'জোয়ার স্ফীতি ঘূর্ণন চক্র' : 'Tidal Rotation Cycle'}</div>
              <div className="text-white font-medium">
                {isBengali
                  ? 'প্রতি ২৪ ঘণ্টা ৫০ মিনিটে দুটি জোয়ার ও দুটি ভাটা সম্পন্ন হয়'
                  : 'Two high and two low tides occur every 24h 50m tidal day'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{isBengali ? 'জোয়ারের পর্যায়কাল:' : 'Lunar Tide Period:'}</span>
          <span className="text-cyan-300 font-mono font-bold">১২ ঘণ্টা ২৪ মিনিট (M2)</span>
        </div>
      </div>
    </div>
  );
};
