import React, { useRef, useEffect } from 'react';
import { Compass, Sun, Moon, Eye, Navigation } from 'lucide-react';
import { MoonPosition, SunPosition } from '../types/astro';

interface SkyRadarViewProps {
  isBengali: boolean;
  sun: SunPosition;
  moon: MoonPosition;
  deviceHeading: number | null;
}

export const SkyRadarView: React.FC<SkyRadarViewProps> = ({
  isBengali,
  sun,
  moon,
  deviceHeading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect || rect.width < 30 || rect.height < 30) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.max(20, Math.min(cx, cy) - 28);

    // Clear background
    ctx.fillStyle = '#030816';
    ctx.fillRect(0, 0, w, h);

    // Coordinate conversion function:
    // Azimuth (0° = N, 90° = E, 180° = S, 270° = W)
    // Altitude (90° = Center/Zenith, 0° = Outer rim/Horizon, < 0 = Below horizon)
    const getRadarXY = (azimuthDeg: number, altitudeDeg: number) => {
      // Rotation offset if device heading exists
      const headingOffset = deviceHeading ? deviceHeading : 0;
      const effectiveAzimuth = (azimuthDeg - headingOffset + 360) % 360;

      // Zenith is center (r=0), Horizon is outer ring (r=maxRadius)
      // Clamped if below horizon
      const clampedAlt = Math.max(-10, Math.min(90, altitudeDeg));
      const r = maxRadius * (1 - clampedAlt / 90);

      // In polar radar: 0° Azimuth (North) is UP (-Y), 90° (East) is RIGHT (+X)
      const rad = (effectiveAzimuth - 90) * (Math.PI / 180);
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
        isBelow: altitudeDeg < 0,
      };
    };

    // Draw Altitude Concentric Rings
    const rings = [
      { alt: 0, label: '0° দিগন্ত (Horizon)' },
      { alt: 30, label: '30°' },
      { alt: 60, label: '60°' },
    ];

    rings.forEach((ring) => {
      const r = maxRadius * (1 - ring.alt / 90);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = ring.alt === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = ring.alt === 0 ? 2 : 1;
      ctx.stroke();

      // Ring text
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ring.label, cx, cy - r + 12);
    });

    // Crosshairs (N-S, E-W axes)
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cardinal Direction Labels
    const headingOffset = deviceHeading ? deviceHeading : 0;
    const cardinals = [
      { deg: 0, bn: 'উত্তর (N)', en: 'N', color: '#ef4444' },
      { deg: 90, bn: 'পূর্ব (E)', en: 'E', color: '#94a3b8' },
      { deg: 180, bn: 'দক্ষিণ (S)', en: 'S', color: '#94a3b8' },
      { deg: 270, bn: 'পশ্চিম (W)', en: 'W', color: '#94a3b8' },
    ];

    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    cardinals.forEach((c) => {
      const effDeg = (c.deg - headingOffset + 360) % 360;
      const rad = (effDeg - 90) * (Math.PI / 180);
      const lx = cx + (maxRadius + 16) * Math.cos(rad);
      const ly = cy + (maxRadius + 16) * Math.sin(rad);
      ctx.fillStyle = c.color;
      ctx.fillText(isBengali ? c.bn : c.en, lx, ly);
    });

    // Center Zenith Mark (খ-মধ্য / 90°)
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // 1. Draw Sun on Sky Radar
    const sunPt = getRadarXY(sun.azimuth, sun.altitude);
    ctx.beginPath();
    ctx.arc(sunPt.x, sunPt.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = sunPt.isBelow ? 'rgba(245, 158, 11, 0.25)' : '#f59e0b';
    if (!sunPt.isBelow) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sun Rays Icon lines
    if (!sunPt.isBelow) {
      for (let a = 0; a < 8; a++) {
        const rayAngle = (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(sunPt.x + Math.cos(rayAngle) * 16, sunPt.y + Math.sin(rayAngle) * 16);
        ctx.lineTo(sunPt.x + Math.cos(rayAngle) * 20, sunPt.y + Math.sin(rayAngle) * 20);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Sun Label
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${isBengali ? 'সূর্য' : 'Sun'} (${Math.round(sun.altitude)}°)`,
      sunPt.x,
      sunPt.y + (sunPt.isBelow ? 20 : 22)
    );

    // 2. Draw Moon on Sky Radar
    const moonPt = getRadarXY(moon.azimuth, moon.altitude);
    ctx.beginPath();
    ctx.arc(moonPt.x, moonPt.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = moonPt.isBelow ? 'rgba(148, 163, 184, 0.25)' : '#e2e8f0';
    if (!moonPt.isBelow) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Moon Phase crescent shading inside radar
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(moonPt.x, moonPt.y, 11, -Math.PI / 2, Math.PI / 2, true);
    ctx.fill();

    // Moon Label
    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${isBengali ? 'চাঁদ' : 'Moon'} (${Math.round(moon.altitude)}°)`,
      moonPt.x,
      moonPt.y + (moonPt.isBelow ? 18 : 20)
    );

  }, [sun, moon, deviceHeading, isBengali]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#070e22] p-5 sm:p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isBengali ? '৩৬০° আকাশ গোলক ও দিগংশ রাডার' : '360° Sky Sphere & Azimuth Radar'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBengali ? 'আপনার সাপেক্ষে আকাশমণ্ডলে সূর্য ও চন্দ্রের লাইভ অবস্থান' : 'Live Sun & Moon Altitude/Azimuth from Your Horizon'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deviceHeading !== null && (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 text-xs text-emerald-300 font-mono">
              <Navigation className="h-3 w-3" style={{ transform: `rotate(${deviceHeading}deg)` }} />
              <span>{deviceHeading}°</span>
            </span>
          )}
        </div>
      </div>

      {/* Canvas Radar Container */}
      <div className="relative mt-4 w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Legend */}
        <div className="absolute bottom-2 left-3 flex gap-2 text-[10px] text-slate-400 pointer-events-none">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {isBengali ? 'সূর্য' : 'Sun'}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            {isBengali ? 'চাঁদ' : 'Moon'}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            {isBengali ? 'দিগন্তের নিচে' : 'Below Horizon'}
          </span>
        </div>
      </div>

      {/* Numerical Altitude / Azimuth Readout */}
      <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
        <div className="rounded-xl bg-slate-900/80 border border-amber-900/30 p-3">
          <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Sun className="h-3.5 w-3.5" />
              {isBengali ? 'সূর্য অবস্থান' : 'Sun Position'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {sun.isAboveHorizon ? (isBengali ? 'দিগন্তের উপরে' : 'Visible') : (isBengali ? 'দিগন্তের নিচে' : 'Night')}
            </span>
          </div>
          <div className="flex justify-between text-slate-300 font-mono">
            <span>{isBengali ? 'উন্নতি (Alt):' : 'Alt:'} <strong className="text-white">{sun.altitude.toFixed(1)}°</strong></span>
            <span>{isBengali ? 'দিগংশ (Az):' : 'Az:'} <strong className="text-white">{sun.azimuth.toFixed(1)}°</strong></span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/80 border border-cyan-900/30 p-3">
          <div className="flex items-center justify-between text-cyan-300 font-semibold mb-1">
            <span className="flex items-center gap-1">
              <Moon className="h-3.5 w-3.5" />
              {isBengali ? 'চাঁদ অবস্থান' : 'Moon Position'}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {moon.isAboveHorizon ? (isBengali ? 'আকাশে দৃশ্যমান' : 'Visible') : (isBengali ? 'দিগন্তের নিচে' : 'Set')}
            </span>
          </div>
          <div className="flex justify-between text-slate-300 font-mono">
            <span>{isBengali ? 'উন্নতি (Alt):' : 'Alt:'} <strong className="text-white">{moon.altitude.toFixed(1)}°</strong></span>
            <span>{isBengali ? 'দিগংশ (Az):' : 'Az:'} <strong className="text-white">{moon.azimuth.toFixed(1)}°</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
