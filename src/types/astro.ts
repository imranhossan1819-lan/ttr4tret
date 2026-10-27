/**
 * Astronomical and Tidal Data Types
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface CoastalStation {
  id: string;
  nameBn: string;
  nameEn: string;
  regionBn: string;
  regionEn: string;
  latitude: number;
  longitude: number;
  meanTideRangeMeters: number;
  tidalConstituentOffset: number; // minutes phase offset for local water body
  type: 'coastal' | 'estuary' | 'ocean' | 'river_port';
}

export type TideState = 'rising' | 'high_slack' | 'falling' | 'low_slack';
export type TideCategory = 'spring' | 'neap' | 'moderate'; // ভরা কটাল, মরা কটাল, স্বাভাবিক

export interface TideEvent {
  time: Date;
  heightMeters: number;
  heightFeet: number;
  type: 'high' | 'low';
  typeBn: string;
  typeEn: string;
}

export interface TideData {
  currentHeightMeters: number;
  currentHeightFeet: number;
  percentage: number; // 0 to 100% of tidal range
  state: TideState;
  stateBn: string;
  stateEn: string;
  category: TideCategory;
  categoryBn: string;
  categoryEn: string;
  isSpringTide: boolean;
  isNeapTide: boolean;
  alignmentAngleDeg: number;
  gravitationalPullG: number; // Normalized pull factor (1.0 = average)
  nextHighTide: TideEvent | null;
  nextLowTide: TideEvent | null;
  nextTideEvent: TideEvent | null;
  timeToNextMinutes: number;
  dayMinHeight: number;
  dayMaxHeight: number;
  hourlyHeights: { hour: number; timeStr: string; height: number; isHigh?: boolean; isLow?: boolean }[];
}

export interface MoonPosition {
  altitude: number; // Degrees above horizon (-90 to +90)
  azimuth: number; // Degrees from North (0 to 360)
  distanceKm: number;
  distanceFraction: number; // 0 = Perigee, 1 = Apogee
  phaseFraction: number; // 0.0 to 1.0 (0=New, 0.5=Full)
  phaseNameBn: string;
  phaseNameEn: string;
  illuminationPercent: number; // 0 to 100
  moonrise: string | null;
  moonset: string | null;
  isAboveHorizon: boolean;
  ageDays: number;
  zodiacBn: string;
  zodiacEn: string;
}

export interface SunPosition {
  altitude: number; // Degrees above horizon
  azimuth: number; // Degrees from North
  distanceKm: number;
  solarNoon: string;
  sunrise: string;
  sunset: string;
  dayLengthHours: number;
  dayLengthMinutes: number;
  isAboveHorizon: boolean;
  declinationDeg: number;
}

export interface EarthAstroState {
  rotationDeg: number;
  axialTiltDeg: number;
  observerLatitude: number;
  observerLongitude: number;
  dayNightFraction: number;
  tidalBulgeAngleDeg: number; // Angle of primary ocean tidal bulge
}

export interface DayForecast {
  date: Date;
  dayNameBn: string;
  dayNameEn: string;
  dateStr: string;
  moonPhaseFraction: number;
  moonPhaseBn: string;
  moonPhaseEn: string;
  illumination: number;
  categoryBn: string;
  categoryEn: string;
  events: TideEvent[];
}
