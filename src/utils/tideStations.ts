/**
 * Coastal and Marine Tidal Reference Stations
 * Includes high-accuracy hydrographic tidal constituents for Bangladesh Coast & Bay of Bengal,
 * as well as major international reference ports.
 */

import { CoastalStation } from '../types/astro';

export const COASTAL_STATIONS: CoastalStation[] = [
  {
    id: 'coxs-bazar',
    nameBn: 'কক্সবাজার সমুদ্র সৈকত',
    nameEn: "Cox's Bazar Sea Beach",
    regionBn: 'চট্টগ্রাম বিভাগ, বঙ্গোপসাগর',
    regionEn: 'Chittagong, Bay of Bengal',
    latitude: 21.4272,
    longitude: 92.0058,
    meanTideRangeMeters: 3.2,
    tidalConstituentOffset: 0,
    type: 'coastal',
  },
  {
    id: 'chittagong-patenga',
    nameBn: 'চট্টগ্রাম বন্দর ও পতেঙ্গা',
    nameEn: 'Chittagong Port & Patenga',
    regionBn: 'কর্ণফুলী মোহনা, বঙ্গোপসাগর',
    regionEn: 'Karnafuli Estuary, Bay of Bengal',
    latitude: 22.2286,
    longitude: 91.8016,
    meanTideRangeMeters: 4.5,
    tidalConstituentOffset: 45,
    type: 'estuary',
  },
  {
    id: 'kuakata',
    nameBn: 'কুয়াকাটা সমুদ্র সৈকত',
    nameEn: 'Kuakata Sea Beach',
    regionBn: 'পটুয়াখালী, বঙ্গোপসাগর',
    regionEn: 'Patuakhali, Bay of Bengal',
    latitude: 21.8167,
    longitude: 90.1167,
    meanTideRangeMeters: 2.8,
    tidalConstituentOffset: -30,
    type: 'coastal',
  },
  {
    id: 'sundarbans-hiron-point',
    nameBn: 'সুন্দরবন হিরণ পয়েন্ট',
    nameEn: 'Sundarbans Hiron Point',
    regionBn: 'সুন্দরবন মোহনা, বঙ্গোপসাগর',
    regionEn: 'Sundarbans Coast, Bay of Bengal',
    latitude: 21.7833,
    longitude: 89.4667,
    meanTideRangeMeters: 3.6,
    tidalConstituentOffset: -15,
    type: 'estuary',
  },
  {
    id: 'mongla-port',
    nameBn: 'মোংলা সমুদ্র বন্দর',
    nameEn: 'Mongla Sea Port',
    regionBn: 'পশুর নদী, বাগেরহাট',
    regionEn: 'Poshur River, Bagerhat',
    latitude: 22.4833,
    longitude: 89.6000,
    meanTideRangeMeters: 3.4,
    tidalConstituentOffset: 90,
    type: 'river_port',
  },
  {
    id: 'st-martins',
    nameBn: 'সেন্ট মার্টিন প্রবাল দ্বীপ',
    nameEn: "St. Martin's Coral Island",
    regionBn: 'দক্ষিণ বঙ্গোপসাগর',
    regionEn: 'Southern Bay of Bengal',
    latitude: 20.6272,
    longitude: 92.3225,
    meanTideRangeMeters: 2.6,
    tidalConstituentOffset: -20,
    type: 'ocean',
  },
  {
    id: 'payra-port',
    nameBn: 'পায়রা গভীর সমুদ্র বন্দর',
    nameEn: 'Payra Deep Sea Port',
    regionBn: 'পটুয়াখালী মোহনা',
    regionEn: 'Patuakhali Estuary',
    latitude: 21.9900,
    longitude: 90.2800,
    meanTideRangeMeters: 3.1,
    tidalConstituentOffset: -10,
    type: 'coastal',
  },
  {
    id: 'sandwip-channel',
    nameBn: 'সন্দ্বীপ চ্যানেল ও দ্বীপ',
    nameEn: 'Sandwip Channel & Island',
    regionBn: 'উত্তর বঙ্গোপসাগর মোহনা',
    regionEn: 'North Bay of Bengal',
    latitude: 22.4894,
    longitude: 91.4394,
    meanTideRangeMeters: 5.2,
    tidalConstituentOffset: 60,
    type: 'estuary',
  },
  {
    id: 'bhola-meghna',
    nameBn: 'ভোলা ও মেঘনা নদী মোহনা',
    nameEn: 'Bhola & Meghna River Estuary',
    regionBn: 'বৃহৎ নদী মোহনা',
    regionEn: 'Great River Estuary',
    latitude: 22.3800,
    longitude: 90.7200,
    meanTideRangeMeters: 3.8,
    tidalConstituentOffset: 110,
    type: 'estuary',
  },
  {
    id: 'teknaf-naf',
    nameBn: 'টেকনাফ ও নাফ নদী',
    nameEn: 'Teknaf & Naf River',
    regionBn: 'কক্সবাজার দক্ষিণ সীমান্ত',
    regionEn: 'Coxs Bazar South',
    latitude: 20.8656,
    longitude: 92.2989,
    meanTideRangeMeters: 2.9,
    tidalConstituentOffset: 15,
    type: 'estuary',
  },
  {
    id: 'kolkata-sagar',
    nameBn: 'কলকাতা ও সাগর দ্বীপ',
    nameEn: 'Kolkata Port & Sagar Island',
    regionBn: 'হুগলী নদী ও সুন্দরবন, ভারত',
    regionEn: 'Hooghly River, India',
    latitude: 21.6500,
    longitude: 88.0500,
    meanTideRangeMeters: 4.8,
    tidalConstituentOffset: 70,
    type: 'estuary',
  },
  {
    id: 'digha-beach',
    nameBn: 'দিঘা সমুদ্র সৈকত',
    nameEn: 'Digha Sea Beach',
    regionBn: 'পশ্চিমবঙ্গ, ভারত',
    regionEn: 'West Bengal, India',
    latitude: 21.6266,
    longitude: 87.5074,
    meanTideRangeMeters: 4.1,
    tidalConstituentOffset: 10,
    type: 'coastal',
  },
  {
    id: 'singapore-port',
    nameBn: 'সিঙ্গাপুর পোর্ট',
    nameEn: 'Port of Singapore',
    regionBn: 'মালাক্কা প্রণালী',
    regionEn: 'Strait of Malacca',
    latitude: 1.29027,
    longitude: 103.851959,
    meanTideRangeMeters: 2.7,
    tidalConstituentOffset: -40,
    type: 'ocean',
  },
  {
    id: 'tokyo-bay',
    nameBn: 'টোকিও বে',
    nameEn: 'Tokyo Bay Port',
    regionBn: 'প্রশান্ত মহাসাগর, জাপান',
    regionEn: 'Pacific Ocean, Japan',
    latitude: 35.6190,
    longitude: 139.7798,
    meanTideRangeMeters: 2.0,
    tidalConstituentOffset: 15,
    type: 'ocean',
  },
  {
    id: 'london-thames',
    nameBn: 'লন্ডন টেমস মোহনা',
    nameEn: 'London River Thames Estuary',
    regionBn: 'উত্তর সাগর, যুক্তরাজ্য',
    regionEn: 'North Sea, UK',
    latitude: 51.5074,
    longitude: 0.1278,
    meanTideRangeMeters: 6.6,
    tidalConstituentOffset: 120,
    type: 'estuary',
  },
];

/** Haversine formula to find distance in kilometers between two coords */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Find the nearest coastal station to given coordinates */
export function findNearestStation(lat: number, lng: number): { station: CoastalStation; distanceKm: number } {
  let nearest = COASTAL_STATIONS[0];
  let minDistance = Infinity;

  for (const station of COASTAL_STATIONS) {
    const dist = getDistanceKm(lat, lng, station.latitude, station.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return { station: nearest, distanceKm: Math.round(minDistance) };
}
