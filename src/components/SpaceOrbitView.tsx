import React, { useRef, useEffect, useState } from 'react';
import { Orbit, Compass, Eye, Maximize2, Sparkles, HelpCircle } from 'lucide-react';
import { MoonPosition, SunPosition, Coordinates } from '../types/astro';

interface SpaceOrbitViewProps {
  isBengali: boolean;
  moon: MoonPosition;
  sun: SunPosition;
  coords: Coordinates;
  currentTime: Date;
  isSpringTide: boolean;
  isNeapTide: boolean;
}

export const SpaceOrbitView: React.FC<SpaceOrbitViewProps> = ({
  isBengali,
  moon,
  sun,
  coords,
  currentTime,
  isSpringTide,
  isNeapTide,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI retina display
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

    // Clear background
    ctx.fillStyle = '#050a18';
    ctx.fillRect(0, 0, w, h);

    // Draw background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const seed = 42;
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5) % w);
      const sy = ((i * 223.7) % h);
      const size = (i % 3 === 0) ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Geometry layout:
    // Earth at center (cx, cy)
    // Sun direction: represented as coming from right (angle = 0) or offset by solar hour angle
    const orbitRadius = Math.min(w, h) * 0.36;

    // Draw Moon Orbit circle
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sun Rays direction (Sun is positioned on the right for clean orbital perspective)
    // Solar light rays beaming from right to left
    const sunAngle = 0; // Sun at angle 0 (east/right)
    const sunGradient = ctx.createLinearGradient(w - 60, cy, cx + 50, cy);
    sunGradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    sunGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.moveTo(w, cy - 100);
    ctx.lineTo(w, cy + 100);
    ctx.lineTo(cx, cy + 40);
    ctx.lineTo(cx, cy - 40);
    ctx.closePath();
    ctx.fill();

    // Sun indicator disc at right edge
    ctx.beginPath();
    ctx.arc(w - 24, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Moon angle relative to Sun: Elongation D
    // moon.phaseFraction goes 0 (New Moon) -> 0.25 (First Q) -> 0.5 (Full) -> 0.75 (Last Q)
    const moonAngleRad = moon.phaseFraction * Math.PI * 2;
    const moonX = cx + Math.cos(moonAngleRad) * orbitRadius;
    const moonY = cy - Math.sin(moonAngleRad) * orbitRadius; // inverted Y for canvas

    // Gravitational Pull Vector Lines from Earth to Moon & Sun
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(moonX, moonY);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(w - 30, cy);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Ocean Tidal Bulge (উপবৃত্তাকার পানির স্ফীতি / Elliptical Water Envelope)
    // The tidal bulge stretches primarily towards the Moon, with secondary component towards the Sun
    const bulgeRadiusX = 52;
    const bulgeRadiusY = 38;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-moonAngleRad); // Aligned with Moon vector
    ctx.beginPath();
    ctx.ellipse(0, 0, bulgeRadiusX, bulgeRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Earth Globe
    const earthRadius = 34;
    // Day side / Night side gradient (Sun light from right)
    const earthGrad = ctx.createLinearGradient(cx - earthRadius, cy, cx + earthRadius, cy);
    earthGrad.addColorStop(0, '#0f172a'); // Night side (left)
    earthGrad.addColorStop(0.5, '#1e3a8a');
    earthGrad.addColorStop(1, '#60a5fa'); // Day side (right)

    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
    ctx.fillStyle = earthGrad;
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Earth Continents sketch
    ctx.fillStyle = '#22c55e';
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 6, 8, 0, Math.PI * 2);
    ctx.arc(cx - 10, cy + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Earth Day/Night Terminator curve
    ctx.beginPath();
    ctx.ellipse(cx, cy, earthRadius * 0.25, earthRadius, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Observer Location Pin on Earth
    // Rotating with Earth's local time
    const dayFraction = (currentTime.getHours() + currentTime.getMinutes() / 60) / 24;
    const observerAngle = dayFraction * Math.PI * 2;
    const obsX = cx + Math.cos(observerAngle) * (earthRadius - 2);
    const obsY = cy + Math.sin(observerAngle) * (earthRadius - 2);

    ctx.beginPath();
    ctx.arc(obsX, obsY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Moon Disc & Phase Rendering
    const moonRadius = 14;
    ctx.save();
    ctx.translate(moonX, moonY);

    // Moon glow
    ctx.beginPath();
    ctx.arc(0, 0, moonRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(248, 250, 252, 0.15)';
    ctx.fill();

    // Base dark moon
    ctx.beginPath();
    ctx.arc(0, 0, moonRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();

    // Illuminated portion (Sun is on the right, so right side of moon is illuminated)
    // Calculate phase illumination
    ctx.beginPath();
    ctx.arc(0, 0, moonRadius, -Math.PI / 2, Math.PI / 2, false);
    const k = Math.cos(moonAngleRad);
    ctx.ellipse(0, 0, moonRadius * Math.abs(k), moonRadius, 0, Math.PI / 2, -Math.PI / 2, k < 0);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    ctx.restore();

    // Labels & Text annotations on Canvas
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    // Earth label
    ctx.fillText(isBengali ? 'পৃথিবী ও জোয়ার স্ফীতি' : 'Earth & Tidal Bulge', cx, cy + 68);

    // Moon label
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${isBengali ? 'চাঁদ' : 'Moon'} (${moon.illuminationPercent}%)`, moonX, moonY - 20);

    // Sun label
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(isBengali ? 'সূর্যের দিক' : 'Sun (Solar Pull)', w - 45, cy + 50);

  }, [moon, sun, coords, currentTime, isBengali]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#070e22] p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Orbit className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isBengali ? 'মহাজাগতিক কক্ষপথ ও পানির স্ফীতি মডেল' : 'Celestial Alignment & Tidal Bulge Model'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBengali ? 'সূর্য, পৃথিবী ও চাঁদের মহাকর্ষীয় অবস্থান' : 'Sun, Earth & Moon Gravitational Alignment'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition border border-slate-700"
        >
          <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isBengali ? 'কেন জোয়ার হয়?' : 'Why Tides Occur?'}</span>
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className="relative mt-4 w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Legend overlays */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] pointer-events-none">
          <span className="flex items-center gap-1 rounded bg-slate-900/80 px-2 py-1 text-slate-300 border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            {isBengali ? 'নীল উপবৃত্ত = জোয়ারের স্ফীতি' : 'Blue ellipse = Tidal Bulge'}
          </span>
          <span className="flex items-center gap-1 rounded bg-slate-900/80 px-2 py-1 text-slate-300 border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {isBengali ? 'লাল বিন্দু = আপনার অবস্থান' : 'Red dot = Your Location'}
          </span>
        </div>

        {/* Spring vs Neap live tag in upper right of canvas */}
        <div className="absolute top-3 right-3 text-right">
          {isSpringTide && (
            <div className="rounded-xl bg-amber-950/80 border border-amber-600/40 px-3 py-1.5 text-xs text-amber-200 backdrop-blur-sm">
              <strong className="block font-bold">
                {isBengali ? 'ভরা কটাল (সমরেখা)' : 'Spring Tide (Syzygy)'}
              </strong>
              <span className="text-[10px] text-amber-300/80">
                {isBengali ? 'সূর্য-চন্দ্র যৌথ আকর্ষণ' : 'Sun & Moon vectors combine'}
              </span>
            </div>
          )}
          {isNeapTide && (
            <div className="rounded-xl bg-purple-950/80 border border-purple-600/40 px-3 py-1.5 text-xs text-purple-200 backdrop-blur-sm">
              <strong className="block font-bold">
                {isBengali ? 'মরা কটাল (কৌণিক)' : 'Neap Tide (Quadrature)'}
              </strong>
              <span className="text-[10px] text-purple-300/80">
                {isBengali ? 'আকর্ষণ বিপরীতমুখী ৯০°' : 'Pull vectors at 90° angle'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Physics Explanation Dropdown */}
      {showExplanation && (
        <div className="mt-4 rounded-2xl bg-slate-900/90 border border-cyan-800/40 p-4 text-xs text-slate-300 space-y-2">
          <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            {isBengali ? 'জোয়ার-ভাটা সৃষ্টির বৈজ্ঞানিক বলবিদ্যা:' : 'Scientific Mechanics of Tides:'}
          </h4>
          <p>
            {isBengali
              ? '১. চাঁদের মহাকর্ষ বল পৃথিবীর সমুদ্রের পানিকে নিজের দিকে টানে (সম্মুখ জোয়ার), এবং বিপরীত পৃষ্ঠে কেন্দ্রাতিগ বলের কারণে আরেকটি স্ফীতি তৈরি হয় (বিপরীত বা গৌণ জোয়ার)।'
              : '1. The Moon’s gravitational pull attracts ocean water facing it, while centrifugal inertia causes an equal tidal bulge on the opposite side.'}
          </p>
          <p>
            {isBengali
              ? '২. অমাবস্যা ও পূর্ণিমায় চাঁদ ও সূর্য পৃথিবীর সাথে একই সরলরেখায় অবস্থান করে (Syzygy), ফলে উভয় আকর্ষণ যুক্ত হয়ে শক্তিশালী "ভরা কটাল" বা তেজ কটাল তৈরি হয়।'
              : '2. During New Moon & Full Moon (Syzygy), Sun and Moon align, reinforcing each other to produce exceptionally high Spring Tides.'}
          </p>
          <p>
            {isBengali
              ? '৩. অষ্টমী তিথিতে চাঁদ ও সূর্য একে অপরের সাথে ৯০ ডিগ্রি কোণে অবস্থান করে, ফলে পানির স্ফীতি হ্রাস পায় এবং "মরা কটাল" ঘটে।'
              : '3. During Quarter Moon (Quadrature), the gravitational vectors cancel partially at 90°, producing low-amplitude Neap Tides.'}
          </p>
        </div>
      )}
    </div>
  );
};
