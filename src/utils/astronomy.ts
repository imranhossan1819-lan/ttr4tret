/**
 * Astronomical Calculation Algorithms
 * Grounded in Jean Meeus "Astronomical Algorithms" and Astronomical Almanac approximations.
 * Computes exact positions of Sun, Moon, and Earth relative to an observer's latitude & longitude.
 */

import { MoonPosition, SunPosition } from '../types/astro';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/** Convert Date to Julian Date */
export function getJulianDate(date: Date): number {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

/** Julian centuries since J2000.0 */
export function getJulianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/** Normalize angle to 0 - 360 degrees */
export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/** Normalize angle to -180 to +180 degrees */
export function normalizeDeg180(deg: number): number {
  let d = normalizeDeg(deg);
  if (d > 180) d -= 360;
  return d;
}

/** Greenwich Mean Sidereal Time in degrees */
export function getGMST(jd: number): number {
  const T = getJulianCenturies(jd);
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalizeDeg(gmst);
}

/** Local Sidereal Time in degrees */
export function getLST(jd: number, longitude: number): number {
  return normalizeDeg(getGMST(jd) + longitude);
}

/**
 * Calculate Sun Position & Ephemeris
 */
export function calculateSun(date: Date, lat: number, lng: number): SunPosition {
  const jd = getJulianDate(date);
  const T = getJulianCenturies(jd);

  // Geometric mean longitude of the Sun
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);

  // Sun mean anomaly
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * DEG2RAD;

  // Sun equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // Sun true longitude
  const sunTrueLon = L0 + C;

  // Obliquity of the ecliptic
  const eps0 = 23.43929111 - 0.013004167 * T - 0.00000016389 * T * T;
  const epsRad = eps0 * DEG2RAD;

  // Right Ascension and Declination
  const lambdaRad = sunTrueLon * DEG2RAD;
  const sinAlpha = Math.sin(lambdaRad) * Math.cos(epsRad);
  const cosAlpha = Math.cos(lambdaRad);
  const alpha = normalizeDeg(Math.atan2(sinAlpha, cosAlpha) * RAD2DEG);

  const sinDelta = Math.sin(epsRad) * Math.sin(lambdaRad);
  const delta = Math.asin(sinDelta) * RAD2DEG;

  // Distance to Sun in km (approx 1 AU ± eccentricity)
  const e = 0.016708634 - 0.000042037 * T;
  const v = M + C;
  const R_AU = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(v * DEG2RAD));
  const distanceKm = R_AU * 149597870.7;

  // Local Hour Angle
  const lst = getLST(jd, lng);
  const H = normalizeDeg(lst - alpha);
  const Hrad = H * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const deltaRad = delta * DEG2RAD;

  // Altitude
  const sinAlt =
    Math.sin(latRad) * Math.sin(deltaRad) +
    Math.cos(latRad) * Math.cos(deltaRad) * Math.cos(Hrad);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;

  // Azimuth
  const cosAz =
    (Math.sin(deltaRad) - Math.sin(latRad) * sinAlt) /
    (Math.cos(latRad) * Math.cos(altitude * DEG2RAD));
  const sinAz = (-Math.cos(deltaRad) * Math.sin(Hrad)) / Math.cos(altitude * DEG2RAD);
  let azimuth = Math.atan2(sinAz, cosAz) * RAD2DEG;
  azimuth = normalizeDeg(azimuth);

  // Sunrise, Sunset and Solar Noon approximations
  // Solar noon occurs when H = 0
  const noonMinutesApprox = (720 - 4 * lng - getEquationOfTimeMinutes(date) + (date.getTimezoneOffset() * -1)) % 1440;
  const noonHour = Math.floor(noonMinutesApprox / 60);
  const noonMin = Math.floor(noonMinutesApprox % 60);
  const solarNoonStr = `${String((noonHour + 24) % 24).padStart(2, '0')}:${String(noonMin).padStart(2, '0')}`;

  // Hour angle for sunrise/sunset (sun zenith = 90.833° with refraction)
  const zenithCos = Math.cos(90.833 * DEG2RAD);
  const cosH0 =
    (zenithCos - Math.sin(latRad) * Math.sin(deltaRad)) /
    (Math.cos(latRad) * Math.cos(deltaRad));

  let dayLengthHours = 12;
  let dayLengthMinutes = 0;
  let sunriseStr = '06:00';
  let sunsetStr = '18:00';

  if (cosH0 >= 1) {
    // Polar night
    dayLengthHours = 0;
    dayLengthMinutes = 0;
    sunriseStr = '--:--';
    sunsetStr = '--:--';
  } else if (cosH0 <= -1) {
    // Midnight sun
    dayLengthHours = 24;
    dayLengthMinutes = 0;
    sunriseStr = '--:--';
    sunsetStr = '--:--';
  } else {
    const H0 = Math.acos(cosH0) * RAD2DEG;
    const halfDayMinutes = H0 * 4;
    const totalDayMin = halfDayMinutes * 2;
    dayLengthHours = Math.floor(totalDayMin / 60);
    dayLengthMinutes = Math.floor(totalDayMin % 60);

    const riseMin = (noonMinutesApprox - halfDayMinutes + 1440) % 1440;
    const setMin = (noonMinutesApprox + halfDayMinutes + 1440) % 1440;

    sunriseStr = `${String(Math.floor(riseMin / 60)).padStart(2, '0')}:${String(Math.floor(riseMin % 60)).padStart(2, '0')}`;
    sunsetStr = `${String(Math.floor(setMin / 60)).padStart(2, '0')}:${String(Math.floor(setMin % 60)).padStart(2, '0')}`;
  }

  return {
    altitude,
    azimuth,
    distanceKm,
    solarNoon: solarNoonStr,
    sunrise: sunriseStr,
    sunset: sunsetStr,
    dayLengthHours,
    dayLengthMinutes,
    isAboveHorizon: altitude > -0.833,
    declinationDeg: delta,
  };
}

/** Equation of time in minutes */
function getEquationOfTimeMinutes(date: Date): number {
  const jd = getJulianDate(date);
  const T = getJulianCenturies(jd);
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T) * DEG2RAD;
  const M = normalizeDeg(357.52911 + 35999.05029 * T) * DEG2RAD;
  const e = 0.016708634 - 0.000042037 * T;
  const eps = (23.43929111 - 0.013004167 * T) * DEG2RAD;
  const y = Math.tan(eps / 2) * Math.tan(eps / 2);

  const Etime =
    y * Math.sin(2 * L0) -
    2 * e * Math.sin(M) +
    4 * e * y * Math.sin(M) * Math.cos(2 * L0) -
    0.5 * y * y * Math.sin(4 * L0) -
    1.25 * e * e * Math.sin(2 * M);

  return Etime * RAD2DEG * 4;
}

/**
 * Calculate Moon Position, Phase, Illumination, Distance
 */
export function calculateMoon(date: Date, lat: number, lng: number): MoonPosition {
  const jd = getJulianDate(date);
  const T = getJulianCenturies(jd);

  // Lunar fundamental arguments (Meeus Ch. 47)
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T); // Moon mean longitude
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T); // Mean elongation
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T); // Sun mean anomaly
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T); // Moon mean anomaly
  const F = normalizeDeg(93.272095 + 483202.0175233 * T); // Moon argument of latitude

  const Drad = D * DEG2RAD;
  const Mrad = M * DEG2RAD;
  const Mprad = Mp * DEG2RAD;
  const Frad = F * DEG2RAD;

  // Major periodic terms for lunar longitude
  let SigmaL =
    6288774 * Math.sin(Mprad) +
    1274027 * Math.sin(2 * Drad - Mprad) +
    658314 * Math.sin(2 * Drad) +
    213618 * Math.sin(2 * Mprad) -
    185116 * Math.sin(Mrad) -
    114332 * Math.sin(2 * Frad) +
    58793 * Math.sin(2 * Drad - 2 * Mprad) +
    57066 * Math.sin(2 * Drad - Mrad - Mprad) +
    53322 * Math.sin(2 * Drad + Mprad) +
    45758 * Math.sin(2 * Drad - Mrad) -
    40923 * Math.sin(Mrad - Mprad) -
    34720 * Math.sin(Drad) -
    30383 * Math.sin(Mrad + Mprad);

  // Major periodic terms for lunar latitude
  let SigmaB =
    5128122 * Math.sin(Frad) +
    280602 * Math.sin(Mprad + Frad) +
    277693 * Math.sin(Mprad - Frad) +
    173237 * Math.sin(2 * Drad - Frad) +
    55413 * Math.sin(2 * Drad - Mprad + Frad) +
    46271 * Math.sin(2 * Drad - Mprad - Frad) +
    32573 * Math.sin(2 * Drad + Frad);

  // Major periodic terms for lunar distance (meters)
  let SigmaR =
    -20905355 * Math.cos(Mprad) -
    3699111 * Math.cos(2 * Drad - Mprad) -
    2955968 * Math.cos(2 * Drad) -
    569925 * Math.cos(2 * Mprad) +
    48888 * Math.cos(Mrad) -
    3149 * Math.cos(2 * Frad);

  const lambdaMoon = normalizeDeg(Lp + SigmaL / 1000000);
  const betaMoon = SigmaB / 1000000;
  const distanceKm = 385000.56 + SigmaR / 1000;

  // Fraction between perigee (~356,500 km) and apogee (~406,700 km)
  const distanceFraction = Math.max(0, Math.min(1, (distanceKm - 356500) / 50200));

  // Convert ecliptic to equatorial coordinates
  const eps = (23.43929111 - 0.013004167 * T) * DEG2RAD;
  const lamRad = lambdaMoon * DEG2RAD;
  const betRad = betaMoon * DEG2RAD;

  const sinDelta =
    Math.sin(betRad) * Math.cos(eps) +
    Math.cos(betRad) * Math.sin(eps) * Math.sin(lamRad);
  const deltaMoon = Math.asin(sinDelta) * RAD2DEG;

  const sinAlpha =
    Math.sin(lamRad) * Math.cos(eps) -
    Math.tan(betRad) * Math.sin(eps);
  const cosAlpha = Math.cos(lamRad);
  const alphaMoon = normalizeDeg(Math.atan2(sinAlpha, cosAlpha) * RAD2DEG);

  // Local Altitude and Azimuth
  const lst = getLST(jd, lng);
  const H = normalizeDeg(lst - alphaMoon);
  const Hrad = H * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const deltaRad = deltaMoon * DEG2RAD;

  const sinAlt =
    Math.sin(latRad) * Math.sin(deltaRad) +
    Math.cos(latRad) * Math.cos(deltaRad) * Math.cos(Hrad);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;

  const cosAz =
    (Math.sin(deltaRad) - Math.sin(latRad) * sinAlt) /
    (Math.cos(latRad) * Math.cos(altitude * DEG2RAD));
  const sinAz = (-Math.cos(deltaRad) * Math.sin(Hrad)) / Math.cos(altitude * DEG2RAD);
  let azimuth = Math.atan2(sinAz, cosAz) * RAD2DEG;
  azimuth = normalizeDeg(azimuth);

  // Lunar Phase: Elongation angle
  // D = elongation from Sun (0 = New Moon, 180 = Full Moon)
  // Phase fraction (0.0 to 1.0)
  const phaseAngle = normalizeDeg(lambdaMoon - (Lp - D)); // approximate elongation
  const moonPhaseFraction = normalizeDeg(D) / 360;
  
  // Illumination percentage (0 to 100%)
  const illuminationPercent = Math.round(((1 - Math.cos(Drad)) / 2) * 100);

  // Phase Name and Tithi in Bengali & English
  const ageDays = (normalizeDeg(D) / 360) * 29.53058867;
  const { nameBn, nameEn } = getMoonPhaseDetails(normalizeDeg(D));

  // Zodiac Constellation
  const { zodiacBn, zodiacEn } = getZodiac(lambdaMoon);

  // Moonrise and Moonset rough estimates
  const moonrise = estimateMoonrise(date, lng, lat, alphaMoon, deltaMoon);
  const moonset = estimateMoonset(date, lng, lat, alphaMoon, deltaMoon);

  return {
    altitude,
    azimuth,
    distanceKm: Math.round(distanceKm),
    distanceFraction,
    phaseFraction: moonPhaseFraction,
    phaseNameBn: nameBn,
    phaseNameEn: nameEn,
    illuminationPercent,
    moonrise,
    moonset,
    isAboveHorizon: altitude > 0,
    ageDays: parseFloat(ageDays.toFixed(1)),
    zodiacBn,
    zodiacEn,
  };
}

/** Get detailed Moon Phase Name */
function getMoonPhaseDetails(elongationDeg: number): { nameBn: string; nameEn: string } {
  if (elongationDeg < 11.25 || elongationDeg >= 348.75) {
    return { nameBn: 'অমাবস্যা (নতুন চাঁদ)', nameEn: 'New Moon' };
  } else if (elongationDeg < 78.75) {
    return { nameBn: 'শুক্লপক্ষ অর্ধচন্দ্র (ক্রমবর্ধমান)', nameEn: 'Waxing Crescent' };
  } else if (elongationDeg < 101.25) {
    return { nameBn: 'শুক্ল অষ্টমী (প্রথম চতুর্থাংশ)', nameEn: 'First Quarter' };
  } else if (elongationDeg < 168.75) {
    return { nameBn: 'শুক্লপক্ষ স্ফীতচন্দ্র', nameEn: 'Waxing Gibbous' };
  } else if (elongationDeg < 191.25) {
    return { nameBn: 'পূর্ণিমা (পূর্ণচন্দ্র)', nameEn: 'Full Moon' };
  } else if (elongationDeg < 258.75) {
    return { nameBn: 'কৃষ্ণপক্ষ স্ফীতচন্দ্র', nameEn: 'Waning Gibbous' };
  } else if (elongationDeg < 281.25) {
    return { nameBn: 'কৃষ্ণ অষ্টমী (শেষ চতুর্থাংশ)', nameEn: 'Last Quarter' };
  } else {
    return { nameBn: 'কৃষ্ণপক্ষ ক্ষীয়মাণ অর্ধচন্দ্র', nameEn: 'Waning Crescent' };
  }
}

/** Get Zodiac constellation name */
function getZodiac(eclipticLon: number): { zodiacBn: string; zodiacEn: string } {
  const signs = [
    { bn: 'মেষ রাশি (Aries)', en: 'Aries' },
    { bn: 'বৃষ রাশি (Taurus)', en: 'Taurus' },
    { bn: 'মিথুন রাশি (Gemini)', en: 'Gemini' },
    { bn: 'কর্কট রাশি (Cancer)', en: 'Cancer' },
    { bn: 'সিংহ রাশি (Leo)', en: 'Leo' },
    { bn: 'কন্যা রাশি (Virgo)', en: 'Virgo' },
    { bn: 'তুলা রাশি (Libra)', en: 'Libra' },
    { bn: 'বৃশ্চিক রাশি (Scorpio)', en: 'Scorpio' },
    { bn: 'ধনু রাশি (Sagittarius)', en: 'Sagittarius' },
    { bn: 'মকর রাশি (Capricorn)', en: 'Capricorn' },
    { bn: 'কুম্ভ রাশি (Aquarius)', en: 'Aquarius' },
    { bn: 'মীন রাশি (Pisces)', en: 'Pisces' },
  ];
  const idx = Math.floor(eclipticLon / 30) % 12;
  return { zodiacBn: signs[idx].bn, zodiacEn: signs[idx].en };
}

function estimateMoonrise(date: Date, lng: number, lat: number, alpha: number, delta: number): string {
  // Approximate moon transit & rise
  const d = new Date(date);
  const jd = getJulianDate(d);
  const lst = getLST(jd, lng);
  const latRad = lat * DEG2RAD;
  const deltaRad = delta * DEG2RAD;

  const cosH0 = (-Math.sin(0.125 * DEG2RAD) - Math.sin(latRad) * Math.sin(deltaRad)) / (Math.cos(latRad) * Math.cos(deltaRad));
  if (Math.abs(cosH0) > 1) return '--:--';

  const H0 = Math.acos(cosH0) * RAD2DEG;
  const riseLST = normalizeDeg(alpha - H0);
  const diffDeg = normalizeDeg(riseLST - lst);
  const diffHours = diffDeg / 15;

  const riseTime = new Date(date.getTime() + diffHours * 3600000);
  const hh = String(riseTime.getHours()).padStart(2, '0');
  const mm = String(riseTime.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function estimateMoonset(date: Date, lng: number, lat: number, alpha: number, delta: number): string {
  const d = new Date(date);
  const jd = getJulianDate(d);
  const lst = getLST(jd, lng);
  const latRad = lat * DEG2RAD;
  const deltaRad = delta * DEG2RAD;

  const cosH0 = (-Math.sin(0.125 * DEG2RAD) - Math.sin(latRad) * Math.sin(deltaRad)) / (Math.cos(latRad) * Math.cos(deltaRad));
  if (Math.abs(cosH0) > 1) return '--:--';

  const H0 = Math.acos(cosH0) * RAD2DEG;
  const setLST = normalizeDeg(alpha + H0);
  const diffDeg = normalizeDeg(setLST - lst);
  const diffHours = diffDeg / 15;

  const setTime = new Date(date.getTime() + diffHours * 3600000);
  const hh = String(setTime.getHours()).padStart(2, '0');
  const mm = String(setTime.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Calculate Sun-Earth-Moon orbital alignment angle (0° to 180°) */
export function getSyzygyAngleDeg(date: Date): number {
  const jd = getJulianDate(date);
  const T = getJulianCenturies(jd);
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T);
  // Phase angle from Syzygy (0° or 180° is maximum spring tide)
  let angleFromSyzygy = D % 180;
  if (angleFromSyzygy > 90) angleFromSyzygy = 180 - angleFromSyzygy;
  return angleFromSyzygy;
}
