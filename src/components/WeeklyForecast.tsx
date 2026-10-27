import React from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight, Moon, Sparkles } from 'lucide-react';
import { DayForecast } from '../types/astro';

interface WeeklyForecastProps {
  isBengali: boolean;
  forecast: DayForecast[];
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ isBengali, forecast }) => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#091124] p-5 sm:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isBengali ? '৭ দিনের জোয়ার-ভাটা ও চন্দ্রকলার পূর্বাভাস' : '7-Day Tide & Lunar Phase Forecast'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBengali ? 'জেলে, নৌযান ও পর্যটকদের জন্য দৈনিক পূর্বাভাস তালিকা' : 'Daily Tide Heights & Times for Marine Activities'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {forecast.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl border p-3 flex flex-col justify-between transition ${
                isToday
                  ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-cyan-300' : 'text-white'}`}>
                    {isToday ? (isBengali ? 'আজ' : 'Today') : (isBengali ? day.dayNameBn : day.dayNameEn)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {day.date.getDate()}/{day.date.getMonth() + 1}
                  </span>
                </div>

                {/* Moon Phase & Illumination */}
                <div className="mt-2.5 flex items-center justify-between rounded-xl bg-slate-950/60 p-2 border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-sky-400" />
                    <span className="text-[10px] text-slate-300 font-medium truncate max-w-[85px]">
                      {isBengali ? day.moonPhaseBn.split(' ')[0] : day.moonPhaseEn}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-300">
                    {day.illumination}%
                  </span>
                </div>

                {/* Tide Category Tag */}
                <div className="mt-1.5">
                  <span
                    className={`inline-block w-full text-center rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      day.categoryBn.includes('ভরা')
                        ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                        : day.categoryBn.includes('মরা')
                        ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isBengali ? day.categoryBn.split(' ')[0] : day.categoryEn.split(' ')[0]}
                  </span>
                </div>

                {/* Daily Tides Events list */}
                <div className="mt-3 space-y-1.5">
                  {day.events.slice(0, 4).map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className="flex items-center justify-between text-[11px] font-mono py-0.5 border-b border-slate-800/50 last:border-0"
                    >
                      <span className="flex items-center gap-1 text-slate-400">
                        {ev.type === 'high' ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-amber-400" />
                        )}
                        <span>{ev.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span className={`font-semibold ${ev.type === 'high' ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {ev.heightMeters}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
