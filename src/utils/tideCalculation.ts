/**
 * Comprehensive Tidal Calculation Engine
 * Based on harmonic tidal constituent analysis (M2, S2, N2, K1, O1)
 * aligned with astronomical celestial coordinates of Moon and Sun.
 */

import { CoastalStation, DayForecast, TideCategory, TideData, TideEvent, TideState } from '../types/astro';
import { calculateMoon, calculateSun, getJulianCenturies, getJulianDate, normalizeDeg } from './astronomy';

// Tidal constituents speeds (degrees per hour)
const SPEED_M2 = 28.9841042; // Principal lunar semi-diurnal (12.4206 hrs)
const SPEED_S2 = 30.0000000; // Principal solar semi-diurnal (12.0000 hrs)
const SPEED_N2 = 28.4397295; // Larger lunar elliptic (12.6583 hrs)
const SPEED_K1 = 15.0410686; // Lunar/solar diurnal (23.9345 hrs)
const SPEED_O1 = 13.9430356; // Principal lunar diurnal (25.8193 hrs)

/**
 * Calculates instantaneous tidal height in meters at an arbitrary Date
 */
export function calculateInstantaneousTideHeight(
  date: Date,
  station: CoastalStation,
  lat: number,
  lng: number
): number {
  const jd = getJulianDate(date);
  const T = getJulianCenturies(jd);
  
  // Hours from J2000.0 epoch
  const hoursFromEpoch = (jd - 2451545.0) * 24;

  // Local longitude phase effect + station specific estuary propagation lag
  const localLagMinutes = (lng * 4) + station.tidalConstituentOffset;
  const localLagHours = localLagMinutes / 60;
  const t = hoursFromEpoch + localLagHours;

  // Base range scale from station
  const baseRange = station.meanTideRangeMeters;
  const halfRange = baseRange / 2;

  // Constituent relative amplitudes
  const ampM2 = halfRange * 0.65;
  const ampS2 = halfRange * 0.28;
  const ampN2 = halfRange * 0.12;
  const ampK1 = halfRange * 0.10;
  const ampO1 = halfRange * 0.08;

  // Mean elongation D for astronomical phase synchronization
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T) * (Math.PI / 180);
  // Moon distance correction (perigee enhances tide, apogee diminishes)
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T) * (Math.PI / 180);
  const distanceFactor = 1.0 + 0.16 * Math.cos(Mp);

  // Compute harmonic sum
  const radM2 = (t * SPEED_M2 * Math.PI) / 180;
  const radS2 = (t * SPEED_S2 * Math.PI) / 180;
  const radN2 = (t * SPEED_N2 * Math.PI) / 180;
  const radK1 = (t * SPEED_K1 * Math.PI) / 180;
  const radO1 = (t * SPEED_O1 * Math.PI) / 180;

  const hM2 = ampM2 * distanceFactor * Math.cos(radM2);
  const hS2 = ampS2 * Math.cos(radS2);
  const hN2 = ampN2 * Math.cos(radN2);
  const hK1 = ampK1 * Math.cos(radK1);
  const hO1 = ampO1 * Math.cos(radO1);

  // Mean sea level (h0)
  const h0 = halfRange * 1.05;

  let totalHeight = h0 + hM2 + hS2 + hN2 + hK1 + hO1;

  // Avoid negative water level
  return Math.max(0.1, parseFloat(totalHeight.toFixed(2)));
}

/**
 * Determine Tide Category: ভরা কটাল (Spring), মরা কটাল (Neap), or স্বাভাবিক (Moderate)
 */
export function getTideCategory(date: Date): {
  category: TideCategory;
  categoryBn: string;
  categoryEn: string;
  isSpringTide: boolean;
  isNeapTide: boolean;
  alignmentAngleDeg: number;
  gravitationalPullG: number;
} {
  const jd = getJulianDate(date);
  const T = getJulianCenturies(jd);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T); // Elongation angle

  // Distance from Syzygy (0° or 180°)
  let syzygyOffset = D % 180;
  if (syzygyOffset > 90) syzygyOffset = 180 - syzygyOffset;

  // Alignment angle (0 = New/Full Moon, 90 = Quarter Moon)
  const alignmentAngleDeg = Math.round(syzygyOffset);

  // Gravitational combined factor
  // 1.0 = average, up to ~1.4 for spring, ~0.7 for neap
  const pullFactor = 1.0 + 0.35 * Math.cos((2 * D * Math.PI) / 180);

  let category: TideCategory = 'moderate';
  let categoryBn = 'স্বাভাবিক কটাল (Moderate Tide)';
  let categoryEn = 'Moderate Tide';
  let isSpringTide = false;
  let isNeapTide = false;

  if (syzygyOffset <= 24) {
    category = 'spring';
    categoryBn = 'ভরা কটাল / তেজ কটাল (Spring Tide)';
    categoryEn = 'Spring Tide (Tej Kotal)';
    isSpringTide = true;
  } else if (syzygyOffset >= 66) {
    category = 'neap';
    categoryBn = 'মরা কটাল (Neap Tide)';
    categoryEn = 'Neap Tide (Mora Kotal)';
    isNeapTide = true;
  }

  return {
    category,
    categoryBn,
    categoryEn,
    isSpringTide,
    isNeapTide,
    alignmentAngleDeg,
    gravitationalPullG: parseFloat(pullFactor.toFixed(2)),
  };
}

/**
 * Scan over a time interval to find high tides and low tides
 */
export function findTideEvents(
  startTime: Date,
  hoursDuration: number,
  station: CoastalStation,
  lat: number,
  lng: number,
  stepMinutes: number = 6
): TideEvent[] {
  const events: TideEvent[] = [];
  const totalSteps = Math.floor((hoursDuration * 60) / stepMinutes);

  let prevH = calculateInstantaneousTideHeight(startTime, station, lat, lng);
  let prevSlope = 0;

  for (let i = 1; i <= totalSteps; i++) {
    const tCurrent = new Date(startTime.getTime() + i * stepMinutes * 60000);
    const currH = calculateInstantaneousTideHeight(tCurrent, station, lat, lng);
    const currSlope = currH - prevH;

    // Check inflection point
    if (prevSlope > 0 && currSlope <= 0) {
      // Local maximum = High Tide
      const peakTime = new Date(tCurrent.getTime() - (stepMinutes / 2) * 60000);
      const heightM = calculateInstantaneousTideHeight(peakTime, station, lat, lng);
      events.push({
        time: peakTime,
        heightMeters: heightM,
        heightFeet: parseFloat((heightM * 3.28084).toFixed(1)),
        type: 'high',
        typeBn: 'পূর্ণ জোয়ার (High Tide)',
        typeEn: 'High Tide',
      });
    } else if (prevSlope < 0 && currSlope >= 0) {
      // Local minimum = Low Tide
      const troughTime = new Date(tCurrent.getTime() - (stepMinutes / 2) * 60000);
      const heightM = calculateInstantaneousTideHeight(troughTime, station, lat, lng);
      events.push({
        time: troughTime,
        heightMeters: heightM,
        heightFeet: parseFloat((heightM * 3.28084).toFixed(1)),
        type: 'low',
        typeBn: 'ভাটা / ভাঁটা (Low Tide)',
        typeEn: 'Low Tide',
      });
    }

    prevH = currH;
    prevSlope = currSlope;
  }

  return events;
}

/**
 * Comprehensive calculation for current moment
 */
export function getFullTideData(
  date: Date,
  station: CoastalStation,
  lat: number,
  lng: number
): TideData {
  const currentHeightMeters = calculateInstantaneousTideHeight(date, station, lat, lng);
  const currentHeightFeet = parseFloat((currentHeightMeters * 3.28084).toFixed(1));

  // Determine current slope / state
  const deltaT = 5 * 60000; // 5 minutes
  const pastH = calculateInstantaneousTideHeight(new Date(date.getTime() - deltaT), station, lat, lng);
  const futureH = calculateInstantaneousTideHeight(new Date(date.getTime() + deltaT), station, lat, lng);

  const slope = futureH - pastH;

  let state: TideState = 'rising';
  let stateBn = 'জোয়ার আসছে (Rising Tide)';
  let stateEn = 'Rising Tide (Flood)';

  if (Math.abs(slope) < 0.03) {
    if (currentHeightMeters > station.meanTideRangeMeters * 0.5) {
      state = 'high_slack';
      stateBn = 'পূর্ণ জোয়ারের স্থিতি (High Tide Slack)';
      stateEn = 'High Tide Slack';
    } else {
      state = 'low_slack';
      stateBn = 'ভাটার স্থিতি (Low Tide Slack)';
      stateEn = 'Low Tide Slack';
    }
  } else if (slope > 0) {
    state = 'rising';
    stateBn = 'জোয়ার আসছে (পানি বৃদ্ধি পাচ্ছে)';
    stateEn = 'Rising / Flood Tide';
  } else {
    state = 'falling';
    stateBn = 'ভাটা নামছে (পানি নেমে যাচ্ছে)';
    stateEn = 'Falling / Ebb Tide';
  }

  // Next 28 hours events
  const futureEvents = findTideEvents(date, 28, station, lat, lng);
  const nextHigh = futureEvents.find((e) => e.type === 'high') || null;
  const nextLow = futureEvents.find((e) => e.type === 'low') || null;
  const nextTideEvent = futureEvents[0] || null;

  let timeToNextMinutes = 0;
  if (nextTideEvent) {
    timeToNextMinutes = Math.max(0, Math.round((nextTideEvent.time.getTime() - date.getTime()) / 60000));
  }

  // 24 Hour Curve starting from start of current day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const hourlyHeights: { hour: number; timeStr: string; height: number; isHigh?: boolean; isLow?: boolean }[] = [];
  let dayMin = Infinity;
  let dayMax = -Infinity;

  for (let h = 0; h <= 24; h++) {
    const t = new Date(startOfDay.getTime() + h * 3600000);
    const hM = calculateInstantaneousTideHeight(t, station, lat, lng);
    if (hM < dayMin) dayMin = hM;
    if (hM > dayMax) dayMax = hM;

    const timeStr = `${String(h % 24).padStart(2, '0')}:00`;
    hourlyHeights.push({
      hour: h,
      timeStr,
      height: hM,
    });
  }

  // Calculate percentage within station range
  const minPossible = 0.2;
  const maxPossible = station.meanTideRangeMeters * 1.25;
  const percentage = Math.max(0, Math.min(100, Math.round(((currentHeightMeters - minPossible) / (maxPossible - minPossible)) * 100)));

  const categoryInfo = getTideCategory(date);

  return {
    currentHeightMeters,
    currentHeightFeet,
    percentage,
    state,
    stateBn,
    stateEn,
    ...categoryInfo,
    nextHighTide: nextHigh,
    nextLowTide: nextLow,
    nextTideEvent,
    timeToNextMinutes,
    dayMinHeight: dayMin,
    dayMaxHeight: dayMax,
    hourlyHeights,
  };
}

/**
 * Generate 7-day tide forecast
 */
export function getWeeklyForecast(
  currentDate: Date,
  station: CoastalStation,
  lat: number,
  lng: number
): DayForecast[] {
  const result: DayForecast[] = [];
  const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date(currentDate.getTime() + dayOffset * 86400000);
    dayDate.setHours(0, 0, 0, 0);

    const moon = calculateMoon(new Date(dayDate.getTime() + 12 * 3600000), lat, lng);
    const cat = getTideCategory(new Date(dayDate.getTime() + 12 * 3600000));

    // Find tides for this day (from 00:00 to 24:00)
    const dayEvents = findTideEvents(dayDate, 24, station, lat, lng, 6);

    const dayIdx = dayDate.getDay();
    const dateStr = `${dayDate.getDate()} / ${dayDate.getMonth() + 1} / ${dayDate.getFullYear()}`;

    result.push({
      date: dayDate,
      dayNameBn: bnDays[dayIdx],
      dayNameEn: enDays[dayIdx],
      dateStr,
      moonPhaseFraction: moon.phaseFraction,
      moonPhaseBn: moon.phaseNameBn,
      moonPhaseEn: moon.phaseNameEn,
      illumination: moon.illuminationPercent,
      categoryBn: cat.categoryBn,
      categoryEn: cat.categoryEn,
      events: dayEvents,
    });
  }

  return result;
}
