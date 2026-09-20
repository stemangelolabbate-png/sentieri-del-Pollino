// Geodesic math utilities for GPS Navigation on Pollino Trails

/**
 * Calculate distance between two lat/lng pairs in meters using Haversine formula
 */
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
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

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return getDistanceMeters(lat1, lon1, lat2, lon2) / 1000;
}

/**
 * Calculate initial bearing in degrees from point 1 to point 2 (0 - 360)
 */
export function getBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const lambda1 = (lon1 * Math.PI) / 180;
  const lambda2 = (lon2 * Math.PI) / 180;

  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  const theta = Math.atan2(y, x);
  const bearing = ((theta * 180) / Math.PI + 360) % 360;
  return Math.round(bearing);
}

/**
 * Return cardinal text from bearing in degrees (Italian)
 */
export function getCardinalDirection(bearing: number): string {
  const directions = [
    { label: 'Nord', min: 337.5, max: 360 },
    { label: 'Nord', min: 0, max: 22.5 },
    { label: 'Nord-Est', min: 22.5, max: 67.5 },
    { label: 'Est', min: 67.5, max: 112.5 },
    { label: 'Sud-Est', min: 112.5, max: 157.5 },
    { label: 'Sud', min: 157.5, max: 202.5 },
    { label: 'Sud-Ovest', min: 202.5, max: 247.5 },
    { label: 'Ovest', min: 247.5, max: 292.5 },
    { label: 'Nord-Ovest', min: 292.5, max: 337.5 },
  ];

  for (const dir of directions) {
    if (bearing >= dir.min && bearing < dir.max) {
      return dir.label;
    }
  }
  return 'Nord';
}

/**
 * Calculate total trail length in kilometers from an array of coordinates
 */
export function calculateTrailLengthKm(coords: [number, number][]): number {
  let totalMeters = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    totalMeters += getDistanceMeters(
      coords[i][0],
      coords[i][1],
      coords[i + 1][0],
      coords[i + 1][1]
    );
  }
  return Number((totalMeters / 1000).toFixed(2));
}

/**
 * Find closest distance from current position to a polyline, and return:
 * - min distance in meters (off-track distance)
 * - nearest segment index
 * - closest point coordinates
 */
export function findClosestTrailPoint(
  lat: number,
  lng: number,
  trailCoords: [number, number][]
): {
  distanceMeters: number;
  nearestPointIndex: number;
  closestCoords: [number, number];
} {
  if (trailCoords.length === 0) {
    return {
      distanceMeters: 0,
      nearestPointIndex: 0,
      closestCoords: [lat, lng],
    };
  }

  let minDistance = Infinity;
  let nearestIndex = 0;
  let closestCoords: [number, number] = trailCoords[0];

  for (let i = 0; i < trailCoords.length; i++) {
    const d = getDistanceMeters(lat, lng, trailCoords[i][0], trailCoords[i][1]);
    if (d < minDistance) {
      minDistance = d;
      nearestIndex = i;
      closestCoords = trailCoords[i];
    }
  }

  return {
    distanceMeters: Math.round(minDistance),
    nearestPointIndex: nearestIndex,
    closestCoords,
  };
}

/**
 * Calculate progress along a trail in percentage and remaining distance
 */
export function calculateTrailProgress(
  nearestIndex: number,
  trailCoords: [number, number][]
): {
  progressPercent: number;
  distanceTraveledKm: number;
  distanceRemainingKm: number;
} {
  if (trailCoords.length <= 1) {
    return { progressPercent: 0, distanceTraveledKm: 0, distanceRemainingKm: 0 };
  }

  let traveledMeters = 0;
  for (let i = 0; i < nearestIndex; i++) {
    traveledMeters += getDistanceMeters(
      trailCoords[i][0],
      trailCoords[i][1],
      trailCoords[i + 1][0],
      trailCoords[i + 1][1]
    );
  }

  let remainingMeters = 0;
  for (let i = nearestIndex; i < trailCoords.length - 1; i++) {
    remainingMeters += getDistanceMeters(
      trailCoords[i][0],
      trailCoords[i][1],
      trailCoords[i + 1][0],
      trailCoords[i + 1][1]
    );
  }

  const total = traveledMeters + remainingMeters;
  const percent = total > 0 ? Math.min(100, Math.round((traveledMeters / total) * 100)) : 0;

  return {
    progressPercent: percent,
    distanceTraveledKm: Number((traveledMeters / 1000).toFixed(2)),
    distanceRemainingKm: Number((remainingMeters / 1000).toFixed(2)),
  };
}
