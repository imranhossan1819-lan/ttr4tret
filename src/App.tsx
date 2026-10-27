/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { LocationBar } from './components/LocationBar';
import { TideGaugeCard } from './components/TideGaugeCard';
import { TideChart } from './components/TideChart';
import { SpaceOrbitView } from './components/SpaceOrbitView';
import { SkyRadarView } from './components/SkyRadarView';
import { CelestialCards } from './components/CelestialCards';
import { WeeklyForecast } from './components/WeeklyForecast';
import { TimeTravelSlider } from './components/TimeTravelSlider';
import { ApkGuideModal } from './components/ApkGuideModal';
import { useLocation } from './hooks/useLocation';
import { calculateMoon, calculateSun } from './utils/astronomy';
import { getFullTideData, getWeeklyForecast } from './utils/tideCalculation';
import { oceanAudio } from './utils/audio';
import { WifiOff, Orbit, Compass, Radio } from 'lucide-react';

export default function App() {
  const [isBengali, setIsBengali] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [simSpeed, setSimSpeed] = useState(60); // 60x default simulation
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orbit' | 'radar'>('orbit');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const location = useLocation();

  // Monitor online / offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time clock update (when not simulating)
  useEffect(() => {
    if (isSimulating && !isPlayingSim) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (isSimulating && isPlayingSim) {
          // Advance time by simSpeed seconds per real-time second tick
          return new Date(prev.getTime() + simSpeed * 1000);
        } else if (!isSimulating) {
          return new Date();
        }
        return prev;
      });
    }, isSimulating ? 500 : 1000);

    return () => clearInterval(interval);
  }, [isSimulating, isPlayingSim, simSpeed]);

  // Audio Toggle
  const handleToggleAudio = () => {
    const active = oceanAudio.toggle();
    setIsPlayingAudio(active);
  };

  // Reset to live current time
  const handleResetTime = () => {
    setCurrentTime(new Date());
    setIsSimulating(false);
    setIsPlayingSim(false);
  };

  // Slider change (scrub hour 0 to 24)
  const handleSliderChange = (hourFraction: number) => {
    setIsSimulating(true);
    setIsPlayingSim(false);
    const newDate = new Date(currentTime);
    const h = Math.floor(hourFraction);
    const m = Math.floor((hourFraction - h) * 60);
    const s = Math.floor(((hourFraction - h) * 60 - m) * 60);
    newDate.setHours(h, m, s, 0);
    setCurrentTime(newDate);
  };

  // Astronomical & Tidal calculations derived for current state
  const lat = location.coords.latitude;
  const lng = location.coords.longitude;
  const station = location.activeStation;

  const sunData = useMemo(() => calculateSun(currentTime, lat, lng), [currentTime, lat, lng]);
  const moonData = useMemo(() => calculateMoon(currentTime, lat, lng), [currentTime, lat, lng]);
  const tideData = useMemo(() => getFullTideData(currentTime, station, lat, lng), [currentTime, station, lat, lng]);
  const weeklyForecast = useMemo(() => getWeeklyForecast(currentTime, station, lat, lng), [currentTime, station, lat, lng]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-['Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
      {/* Header with App Title, Language, Ocean Audio, and Install APK */}
      <Header
        isBengali={isBengali}
        setIsBengali={setIsBengali}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={handleToggleAudio}
        currentTime={currentTime}
        isSimulating={isSimulating}
        onResetTime={handleResetTime}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 py-4 space-y-6">
        {/* Offline notification badge */}
        {!isOnline && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-950/70 border border-amber-600/40 px-3 py-2 text-xs text-amber-200">
            <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              {isBengali
                ? 'অফলাইন মোড সক্রিয়: স্থানীয় মহাজাগতিক ও জোয়ার-ভাটা অ্যালগরিদম ১০০% অফলাইনে কাজ করছে।'
                : 'Offline Mode Active: Local astronomical algorithms working 100% offline.'}
            </span>
          </div>
        )}

        {/* Live GPS Location Bar & Coastal Station Selector */}
        <LocationBar
          isBengali={isBengali}
          coords={location.coords}
          isLiveTracking={location.isLiveTracking}
          isLoading={location.isLoading}
          error={location.error}
          activeStation={location.activeStation}
          distanceToStationKm={location.distanceToStationKm}
          deviceHeading={location.deviceHeading}
          placeName={location.placeName}
          useLiveGps={location.useLiveGps}
          onStartTracking={location.startLiveTracking}
          onSelectStation={location.selectStation}
        />

        {/* Time Travel & Simulation Control Bar */}
        <TimeTravelSlider
          isBengali={isBengali}
          currentTime={currentTime}
          isSimulating={isSimulating}
          isPlaying={isPlayingSim}
          simSpeed={simSpeed}
          onTogglePlay={() => {
            setIsSimulating(true);
            setIsPlayingSim(!isPlayingSim);
          }}
          onSpeedChange={(speed) => setSimSpeed(speed)}
          onSliderChange={handleSliderChange}
          onResetTime={handleResetTime}
        />

        {/* Primary Row: Tide Level Gauge & 24h Harmonic Wave Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <TideGaugeCard
              isBengali={isBengali}
              tide={tideData}
              station={station}
            />
          </div>
          <div className="lg:col-span-6">
            <TideChart
              isBengali={isBengali}
              tide={tideData}
              currentTime={currentTime}
            />
          </div>
        </div>

        {/* Celestial Visual Observatories (Orbit View & 360° Sky Radar) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isBengali ? 'মহাজাগতিক পর্যবেক্ষণ কক্ষ (Celestial Observatories)' : 'Celestial Observatories'}
              </h2>
            </div>

            {/* Toggle Tab */}
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
              <button
                onClick={() => setActiveTab('orbit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'orbit'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Orbit className="h-3.5 w-3.5" />
                <span>{isBengali ? 'কক্ষপথ ও পানির স্ফীতি' : 'Orbit & Bulge'}</span>
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === 'radar'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>{isBengali ? '৩৬০° আকাশ রাডার' : '360° Sky Radar'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: Space Orbit View */}
            <div className={activeTab === 'orbit' ? 'block' : 'hidden lg:block'}>
              <SpaceOrbitView
                isBengali={isBengali}
                moon={moonData}
                sun={sunData}
                coords={location.coords}
                currentTime={currentTime}
                isSpringTide={tideData.isSpringTide}
                isNeapTide={tideData.isNeapTide}
              />
            </div>

            {/* Right side: 360° Sky Sphere Radar */}
            <div className={activeTab === 'radar' ? 'block' : 'hidden lg:block'}>
              <SkyRadarView
                isBengali={isBengali}
                sun={sunData}
                moon={moonData}
                deviceHeading={location.deviceHeading}
              />
            </div>
          </div>
        </div>

        {/* Detailed Astronomical Ephemeris Cards (Moon, Sun, Earth) */}
        <CelestialCards
          isBengali={isBengali}
          moon={moonData}
          sun={sunData}
          coords={location.coords}
          currentTime={currentTime}
        />

        {/* 7-Day Tidal & Lunar Forecast */}
        <WeeklyForecast
          isBengali={isBengali}
          forecast={weeklyForecast}
        />

        {/* Prominent Quick APK Download & Mobile Install Banner */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isBengali ? 'মোবাইল APK ইনস্টল ও ডাউনলোড' : 'Mobile APK Download & Install'}
                </h3>
                <span className="rounded bg-emerald-900/80 px-2 py-0.5 text-[11px] font-mono text-emerald-300 border border-emerald-700">
                  ANDROID & IOS
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                {isBengali
                  ? 'প্রিভিউ ফ্রেমের কারণে সরাসরি ওপেন না হলে ক্রোম ব্রাউজারে খুলুন অথবা নিচের বাটনে চাপ দিয়ে অফলাইন লাউঞ্চার ডাউনলোড করুন।'
                  : 'Open directly in Chrome to trigger WebAPK install, or download the offline launcher.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <a
                href="https://ais-pre-7qtmfoo73i2cwmmuyvje2t-358553668221.asia-southeast1.run.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-400 hover:to-teal-500 transition"
              >
                <span>{isBengali ? 'ক্রোমে খুলুন (APK ইনস্টল)' : 'Open in Chrome (Install)'}</span>
              </a>

              <button
                onClick={() => setIsApkModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition"
              >
                <span>{isBengali ? 'সবগুলো APK অপশন' : 'All APK Options'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-800/80 bg-[#040816] py-6 px-4 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {isBengali
              ? 'জোয়ার-ভাটা পর্যবেক্ষণ ও মহাজাগতিক ট্র্যাকার | Jean Meeus অ্যাস্ট্রোনমিক্যাল ও M2/S2 টাইডাল হারমোনিক মডেল'
              : 'Tide & Celestial Observatory | Jean Meeus Astronomical & M2/S2 Harmonic Tide Model'}
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded bg-slate-900 px-2 py-0.5 text-cyan-400 font-mono text-[11px] border border-slate-800">
              HTML5 • CSS3 • TS • Node.js PWA
            </span>
          </div>
        </div>
      </footer>

      {/* Android WebAPK / PWA Installation Modal */}
      <ApkGuideModal
        isOpen={isApkModalOpen}
        isBengali={isBengali}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
