export type Difficulty = 'T' | 'E' | 'EE' | 'EEA';

export type Versante = 'lucano' | 'calabro' | 'centrale';

export interface Waypoint {
  id: string;
  name: string;
  altitude: number; // in meters
  lat: number;
  lng: number;
  type: 'start' | 'peak' | 'spring' | 'refuge' | 'scenic' | 'pine' | 'pass';
  description?: string;
}

export interface ElevationPoint {
  distKm: number;
  altitude: number;
  label?: string;
}

export interface Trail {
  id: string;
  caiNumber?: string;
  name: string;
  subtitle: string;
  difficulty: Difficulty;
  versante: Versante;
  lengthKm: number;
  elevationGain: number; // Dislivello positivo (m)
  elevationLoss: number; // Dislivello negativo (m)
  estimatedTime: string; // e.g. "5h 30m"
  minAltitude: number;
  maxAltitude: number;
  isLoop: boolean;
  startPoint: string;
  endPoint: string;
  startCoords: [number, number]; // [lat, lng]
  coordinates: [number, number][]; // Path coordinates
  elevationProfile: ElevationPoint[];
  hasWater: boolean;
  hasRefuge: boolean;
  hasPinoLoricato: boolean;
  isPeakOver2000: boolean;
  isFamilyFriendly: boolean;
  description: string;
  itinerary: string[];
  equipmentNeeded: string[];
  bestSeason: string;
  waterSourcesDescription: string;
  floraFauna: string;
  cautions: string;
}

export interface MountainPeak {
  id: string;
  name: string;
  altitude: number;
  lat: number;
  lng: number;
  rank: number;
  description: string;
}

export interface RefugeOrSpring {
  id: string;
  name: string;
  type: 'refuge' | 'spring' | 'monument';
  altitude: number;
  lat: number;
  lng: number;
  location: string;
  status: 'active' | 'seasonal' | 'shelter_only';
  note: string;
}

export type LengthFilter = 'all' | 'short' | 'medium' | 'long' | '<5' | '5-10' | '10-15' | '>15';

export interface GpsNavigationState {
  isActive: boolean;
  isSimulating: boolean;
  simulationSpeed: number; // 1, 2, 5, 10
  currentCoords: [number, number] | null;
  heading: number | null; // in degrees 0-360
  altitude: number | null; // in meters
  speed: number | null; // in km/h
  distanceTraveledKm: number;
  distanceRemainingKm: number;
  progressPercent: number;
  offTrackDistanceMeters: number;
  isOffTrack: boolean;
  nextWaypointName: string;
  nextWaypointDistanceKm: number;
  breadcrumbs: [number, number][];
}

export interface FilterState {
  search: string;
  difficulty: Difficulty | 'all';
  lengthFilter: LengthFilter;
  versante: Versante | 'all';
  onlyPeaks2000: boolean;
  onlyPinoLoricato: boolean;
  onlyWater: boolean;
  onlyFamily: boolean;
  maxDistance: number;
  maxElevationGain: number;
  favoritesOnly: boolean;
}
