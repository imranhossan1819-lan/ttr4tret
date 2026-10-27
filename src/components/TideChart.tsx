import React, { useState } from 'react';
import { Activity, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TideData } from '../types/astro';

interface TideChartProps {
  isBengali: boolean;
  tide: TideData;
  currentTime: Date;
}

export const TideChart: React.FC<TideChartProps> = ({ isBengali, tide, currentTime }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const heights = tide.hourlyHeights;
  if (!heights || heights.length === 0) return null;

  // Compute SVG viewBox dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scale Y
  const minH = Math.max(0, tide.dayMinHeight - 0.3);
  const maxH = tide.dayMaxHeight + 0.4;
  const rangeH = Math.max(0.1, maxH - minH);

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minH) / rangeH) * chartHeight;
  };

  const getX = (hourIdx: number) => {
    return paddingX + (hourIdx / (heights.length - 1)) * chartWidth;
  };

  // Build SVG path
  let pathD = `M ${getX(0)} ${getY(heights[0].height)}`;
  for (let i = 1; i < heights.length; i++) {
    const x0 = getX(i - 1);
    const y0 = getY(heights[i - 1].height);
    const x1 = getX(i);
    const y1 = getY(heights[i].height);
    const midX = (x0 + x1) / 2;
    pathD += ` C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}`;
  }

  // Area under curve
  const areaD = `${pathD} L ${getX(heights.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

  // Current time position (0 to 24)
  const currentFraction = currentTime.getHours() + currentTime.getMinutes() / 60;
  const currentX = paddingX + (currentFraction / 24) * chartWidth;
  const currentY = getY(tide.currentHeightMeters);

  const activePoint = hoverIndex !== null ? heights[hoverIndex] : null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#091124] p-5 sm:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            {isBengali ? '২৪ ঘণ্টার জোয়ার-ভাটার গতিচিত্র' : '24-Hour Tidal Wave Profile'}
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">{isBengali ? 'পানির স্তর (মিটার)' : 'Height (m)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-slate-400">{isBengali ? 'বর্তমান সময়' : 'Current Time'}</span>
          </div>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="tideAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((frac) => {
            const hVal = minH + frac * rangeH;
            const yPos = getY(hVal);
            return (
              <g key={frac}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={width - paddingX}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {hVal.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Shaded Area under tide curve */}
          <path d={areaD} fill="url(#tideAreaGrad)" />

          {/* Main Harmonic Wave Path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current Time Vertical Line */}
          <line
            x1={currentX}
            y1={paddingTop - 10}
            x2={currentX}
            y2={height - paddingBottom}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Current Time Indicator Marker */}
          <circle cx={currentX} cy={currentY} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <circle cx={currentX} cy={currentY} r="11" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.6">
            <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* X Axis Time Labels */}
          {heights.map((pt, idx) => {
            if (idx % 3 !== 0 && idx !== heights.length - 1) return null;
            const xPos = getX(idx);
            return (
              <g key={idx}>
                <line
                  x1={xPos}
                  y1={height - paddingBottom}
                  x2={xPos}
                  y2={height - paddingBottom + 5}
                  stroke="#475569"
                />
                <text
                  x={xPos}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {pt.timeStr}
                </text>
              </g>
            );
          })}

          {/* Interactive invisible hover targets along the curve */}
          {heights.map((pt, idx) => (
            <circle
              key={`target-${idx}`}
              cx={getX(idx)}
              cy={getY(pt.height)}
              r="14"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {/* Hover highlight circle */}
          {hoverIndex !== null && (
            <circle
              cx={getX(hoverIndex)}
              cy={getY(heights[hoverIndex].height)}
              r="6"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {activePoint && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900/95 border border-cyan-500/40 px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm flex items-center gap-2 pointer-events-none"
          >
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-white font-bold">{activePoint.timeStr}:</span>
            <span className="text-cyan-300 font-mono font-semibold">{activePoint.height} m</span>
            <span className="text-slate-400 font-mono">({(activePoint.height * 3.28).toFixed(1)} ft)</span>
          </div>
        )}
      </div>

      {/* High and Low Tide Event Badges */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
        {tide.nextHighTide && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-950/20 border border-emerald-800/30 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-300">
                  {isBengali ? 'পরবর্তী পূর্ণ জোয়ার' : 'Next High Tide'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {tide.nextHighTide.time.toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-emerald-300">
                {tide.nextHighTide.heightMeters}m
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {tide.nextHighTide.heightFeet}ft
              </div>
            </div>
          </div>
        )}

        {tide.nextLowTide && (
          <div className="flex items-center justify-between rounded-xl bg-amber-950/20 border border-amber-800/30 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  {isBengali ? 'পরবর্তী ভাটা' : 'Next Low Tide'}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {tide.nextLowTide.time.toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-amber-300">
                {tide.nextLowTide.heightMeters}m
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {tide.nextLowTide.heightFeet}ft
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
