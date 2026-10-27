import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock, FastForward as Fast } from 'lucide-react';

interface TimeTravelSliderProps {
  isBengali: boolean;
  currentTime: Date;
  isSimulating: boolean;
  isPlaying: boolean;
  simSpeed: number;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onSliderChange: (hourFraction: number) => void;
  onResetTime: () => void;
}

export const TimeTravelSlider: React.FC<TimeTravelSliderProps> = ({
  isBengali,
  currentTime,
  isSimulating,
  isPlaying,
  simSpeed,
  onTogglePlay,
  onSpeedChange,
  onSliderChange,
  onResetTime,
}) => {
  // Current time as fraction 0 to 24
  const hourFraction = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;

  const speeds = [
    { label: '1x', val: 1 },
    { label: '60x', val: 60 },
    { label: '300x', val: 300 },
    { label: '1200x', val: 1200 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070d1e] p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Play / Pause / Reset buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-md transition ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>
              {isPlaying
                ? (isBengali ? 'বিরতি (Pause)' : 'Pause')
                : (isBengali ? 'সিমুলেশন চালান' : 'Simulate')}
            </span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
            {speeds.map((s) => (
              <button
                key={s.val}
                onClick={() => onSpeedChange(s.val)}
                className={`px-2 py-1 rounded-lg font-mono transition ${
                  simSpeed === s.val
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Reset to live button */}
          {isSimulating && (
            <button
              onClick={onResetTime}
              className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 border border-slate-700 transition"
              title={isBengali ? 'বর্তমান লাইভ সময়ে ফিরুন' : 'Return to Real Time'}
            >
              <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isBengali ? 'বর্তমান সময়' : 'Live Now'}</span>
            </button>
          )}
        </div>

        {/* Current Time Display */}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-4 w-4 text-cyan-400" />
          <span className="text-slate-400">{isBengali ? 'সিমুলেটেড সময়:' : 'Simulated Time:'}</span>
          <span className="font-mono text-sm font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="mt-3">
        <input
          type="range"
          min="0"
          max="24"
          step="0.1"
          value={hourFraction}
          onChange={(e) => onSliderChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
          <span>00:00 (রাত)</span>
          <span>06:00 (ভোর)</span>
          <span>12:00 (দুপুর)</span>
          <span>18:00 (সন্ধ্যা)</span>
          <span>24:00 (মধ্যরাত)</span>
        </div>
      </div>
    </div>
  );
};
