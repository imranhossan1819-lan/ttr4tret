import { useCallback, useEffect, useState } from 'react';
import { CoastalStation, Coordinates } from '../types/astro';
import { COASTAL_STATIONS, findNearestStation } from '../utils/tideStations';

export interface LocationState {
  coords: Coordinates;
  isLiveTracking: boolean;
  isLoading: boolean;
  error: string | null;
  nearestStation: CoastalStation;
  distanceToStationKm: number;
  activeStation: CoastalStation;
  deviceHeading: number | null;
  placeName: string | null;
  useLiveGps: boolean;
}

export function useLocation() {
  // Default fallback location: Cox's Bazar, Bangladesh
  const defaultStation = COASTAL_STATIONS[0];

  const [state, setState] = useState<LocationState>({
    coords: {
      latitude: defaultStation.latitude,
      longitude: defaultStation.longitude,
      altitude: null,
      accuracy: 15,
      heading: null,
      speed: null,
    },
    isLiveTracking: false,
    isLoading: false,
    error: null,
    nearestStation: defaultStation,
    distanceToStationKm: 0,
    activeStation: defaultStation,
    deviceHeading: null,
    placeName: 'কক্সবাজার সমুদ্র সৈকত, বাংলাদেশ',
    useLiveGps: false,
  });

  // Handle Compass Device Heading
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        const handleOrientation = (e: DeviceOrientationEvent) => {
          try {
            let heading: number | null = null;
            // iOS webkitCompassHeading or standard alpha
            if ('webkitCompassHeading' in e && typeof (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
              heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
            } else if (e.alpha !== null) {
              heading = (360 - e.alpha) % 360;
            }
            if (heading !== null) {
              setState((prev) => ({ ...prev, deviceHeading: Math.round(heading) }));
            }
          } catch {
            // Ignore heading errors
          }
        };

        window.addEventListener('deviceorientation', handleOrientation, true);
        return () => {
          window.removeEventListener('deviceorientation', handleOrientation);
        };
      }
    } catch {
      // Ignore orientation permission errors
    }
  }, []);

  // Fetch human readable place name (graceful fallback)
  const fetchPlaceName = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`, {
        headers: { 'Accept-Language': 'bn,en' },
      });
      if (res.ok) {
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || data.address?.state;
        const country = data.address?.country;
        if (city) {
          setState((prev) => ({ ...prev, placeName: `${city}, ${country || ''}` }));
        }
      }
    } catch {
      // Offline or network error: retain local nearest station name
    }
  }, []);

  // Request & watch live GPS position
  const startLiveTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        error: 'আপনার ব্রাউজার বা ডিভাইসে জিপিএস লোকেশন সেবা সমর্থিত নয়।',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy, heading, speed } = pos.coords;
        const { station, distanceKm } = findNearestStation(latitude, longitude);

        setState((prev) => ({
          ...prev,
          coords: { latitude, longitude, altitude, accuracy, heading, speed },
          isLiveTracking: true,
          isLoading: false,
          useLiveGps: true,
          nearestStation: station,
          activeStation: station, // automatically syncs to closest tidal hydrographic station!
          distanceToStationKm: distanceKm,
          error: null,
        }));

        fetchPlaceName(latitude, longitude);
      },
      (err) => {
        let msg = 'জিপিএস অবস্থান পেতে সমস্যা হয়েছে।';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'লোকেশন পারমিশন দেওয়া হয়নি। দয়া করে ব্রাউজারে লোকেশন অনুমতি দিন।';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'বর্তমান জিপিএস সিগন্যাল পাওয়া যাচ্ছে না।';
        } else if (err.code === err.TIMEOUT) {
          msg = 'জিপিএস সংযোগের সময় শেষ হয়েছে। আবার চেষ্টা করুন।';
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLiveTracking: false,
          error: msg,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    // Watch position for live continuous movement updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, altitude, accuracy, heading, speed } = pos.coords;
        const { station, distanceKm } = findNearestStation(latitude, longitude);

        setState((prev) => ({
          ...prev,
          coords: { latitude, longitude, altitude, accuracy, heading, speed },
          nearestStation: station,
          distanceToStationKm: distanceKm,
        }));
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [fetchPlaceName]);

  // Select custom coastal station
  const selectStation = useCallback((station: CoastalStation) => {
    setState((prev) => ({
      ...prev,
      activeStation: station,
      useLiveGps: false,
      coords: {
        latitude: station.latitude,
        longitude: station.longitude,
        accuracy: 10,
        altitude: null,
        heading: null,
        speed: null,
      },
      placeName: `${station.nameBn} (${station.regionBn})`,
      distanceToStationKm: 0,
      error: null,
    }));
  }, []);

  return {
    ...state,
    startLiveTracking,
    selectStation,
  };
}
