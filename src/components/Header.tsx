import React from 'react';
import { Waves, Volume2, VolumeX, Download, Clock, Globe2, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  isBengali: boolean;
  setIsBengali: (val: boolean) => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
  currentTime: Date;
  isSimulating: boolean;
  onResetTime: () => void;
  onOpenApkModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isBengali,
  setIsBengali,
  isPlayingAudio,
  onToggleAudio,
  currentTime,
  isSimulating,
  onResetTime,
  onOpenApkModal,
}) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();

  const formattedTime = currentTime.toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060b18]/90 backdrop-blur-md px-3 sm:px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Waves className="h-6 w-6 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-slate-900" title="Sun" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                {isBengali ? 'জোয়ার-ভাটা ও মহাজাগতিক ট্র্যাকার' : 'Tide & Celestial Observatory'}
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-cyan-950 px-2 py-0.5 text-[11px] font-medium text-cyan-400 ring-1 ring-cyan-800">
                PRO APK
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5">
              <span>{isBengali ? 'চাঁদ, সূর্য ও পৃথিবীর অবস্থান সহ লাইভ ট্র্যাকিং' : 'Moon, Sun & Earth Position with Live Tracking'}</span>
              <span className="inline-block h-1 w-1 rounded-full bg-cyan-400" />
              <span className="font-mono text-cyan-300 font-semibold">{formattedTime}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Time simulation status indicator */}
          {isSimulating && (
            <button
              onClick={onResetTime}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition animate-pulse"
              title={isBengali ? 'বর্তমান লাইভ সময়ে ফিরুন' : 'Return to Real Time'}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{isBengali ? 'সিমুলেশন চলছে (রিসেট)' : 'Simulating (Reset)'}</span>
              <span className="md:hidden">{isBengali ? 'রিসেট' : 'Reset'}</span>
            </button>
          )}

          {/* Ocean Waves Ambient Audio Toggle */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              isPlayingAudio
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
            title={isBengali ? 'সাগর ঢেউয়ের শব্দ চালু/বন্ধ' : 'Toggle Ocean Waves Audio'}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="h-4 w-4 text-cyan-400 animate-bounce" />
                <span className="hidden lg:inline">{isBengali ? 'সাগর ধ্বনি চালু' : 'Surf Audio ON'}</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-400" />
                <span className="hidden lg:inline">{isBengali ? 'সাগর ধ্বনি' : 'Surf Audio'}</span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setIsBengali(!isBengali)}
            className="flex items-center gap-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700/60 transition"
            title="Switch Language"
          >
            <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>{isBengali ? 'English' : 'বাংলা'}</span>
          </button>

          {/* APK / PWA Install Button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-400 transition ring-1 ring-emerald-300/40"
            title={isBengali ? 'মোবাইল APK ডাউনলোড ও ইনস্টল' : 'Download and Install Mobile APK'}
          >
            <Smartphone className="h-3.5 w-3.5 animate-bounce" />
            <span>{isBengali ? 'APK ডাউনলোড / ইনস্টল' : 'APK Install'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
