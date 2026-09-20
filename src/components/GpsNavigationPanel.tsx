import { useState, useEffect, useRef } from 'react';
import { Trail } from '../types';
import {
  Compass,
  Navigation,
  Footprints,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  X,
  Gauge,
  Mountain,
  Crosshair,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  getDistanceMeters,
  getBearing,
  getCardinalDirection,
  findClosestTrailPoint,
  calculateTrailProgress,
} from '../utils/geoUtils';

interface GpsNavigationPanelProps {
  trail: Trail;
  onClose: () => void;
  onUpdatePosition: (coords: [number, number], heading: number, isOffTrack: boolean) => void;
  onCenterMap: () => void;
}

export function GpsNavigationPanel({
  trail,
  onClose,
  onUpdatePosition,
  onCenterMap,
}: GpsNavigationPanelProps) {
  // Navigation Mode
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(2); // 1x, 2x, 5x, 10x
  const [simIndex, setSimIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Real GPS state
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(trail.coordinates[0]);
  const [heading, setHeading] = useState<number>(0);
  const [altitude, setAltitude] = useState<number>(trail.minAltitude);
  const [speedKmh, setSpeedKmh] = useState<number>(4.2);

  // Computed Navigation Metrics
  const [offTrackDistance, setOffTrackDistance] = useState<number>(0);
  const [isOffTrack, setIsOffTrack] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [distTraveledKm, setDistTraveledKm] = useState<number>(0);
  const [distRemainingKm, setDistRemainingKm] = useState<number>(trail.lengthKm);
  const [targetWaypointName, setTargetWaypointName] = useState<string>('');
  const [targetWaypointDistMeters, setTargetWaypointDistMeters] = useState<number>(0);

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);

  // Determine current waypoint from trail's elevationProfile or itinerary
  const updateWaypointsAndAltitude = (pointIndex: number, currentCoords: [number, number]) => {
    // Find closest waypoint label from elevation profile
    const profile = trail.elevationProfile;
    if (profile && profile.length > 0) {
      const ratio = pointIndex / Math.max(1, trail.coordinates.length - 1);
      const profileIndex = Math.min(
        profile.length - 1,
        Math.floor(ratio * profile.length)
      );
      setAltitude(profile[profileIndex].altitude);

      // Find next waypoint ahead
      const nextProfile = profile[Math.min(profile.length - 1, profileIndex + 1)];
      if (nextProfile && nextProfile.label) {
        setTargetWaypointName(nextProfile.label);
      } else {
        setTargetWaypointName(trail.endPoint);
      }
    } else {
      setTargetWaypointName(trail.endPoint);
    }

    // Calculate distance to end
    const endCoords = trail.coordinates[trail.coordinates.length - 1];
    const distToEnd = getDistanceMeters(
      currentCoords[0],
      currentCoords[1],
      endCoords[0],
      endCoords[1]
    );
    setTargetWaypointDistMeters(Math.round(distToEnd));
  };

  // Real GPS Geolocation tracking
  useEffect(() => {
    if (isSimulating) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Geolocalizzazione non supportata dal browser');
      setIsSimulating(true);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);

        if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
          setHeading(Math.round(pos.coords.heading));
        }
        if (pos.coords.altitude !== null && !isNaN(pos.coords.altitude)) {
          setAltitude(Math.round(pos.coords.altitude));
        }
        if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
          setSpeedKmh(Number((pos.coords.speed * 3.6).toFixed(1)));
        }

        // Check if on trail
        const closest = findClosestTrailPoint(coords[0], coords[1], trail.coordinates);
        setOffTrackDistance(closest.distanceMeters);
        const off = closest.distanceMeters > 45;
        setIsOffTrack(off);

        const progress = calculateTrailProgress(closest.nearestPointIndex, trail.coordinates);
        setProgressPercent(progress.progressPercent);
        setDistTraveledKm(progress.distanceTraveledKm);
        setDistRemainingKm(progress.distanceRemainingKm);

        // Calculate heading to next point
        const nextIdx = Math.min(trail.coordinates.length - 1, closest.nearestPointIndex + 1);
        const nextCoord = trail.coordinates[nextIdx];
        const calculatedBearing = getBearing(coords[0], coords[1], nextCoord[0], nextCoord[1]);
        if (pos.coords.heading === null) {
          setHeading(calculatedBearing);
        }

        updateWaypointsAndAltitude(closest.nearestPointIndex, coords);
        onUpdatePosition(coords, calculatedBearing, off);
      },
      (err) => {
        setGpsError(`Errore GPS (${err.message}). Attivata simulazione cammino.`);
        setIsSimulating(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 2000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isSimulating, trail]);

  // Simulation loop along trail coordinates
  useEffect(() => {
    if (!isSimulating || !isPlaying) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    const intervalMs = Math.max(250, Math.floor(1800 / simSpeed));

    simIntervalRef.current = setInterval(() => {
      setSimIndex((prev) => {
        const nextIdx = prev + 1;
        if (nextIdx >= trail.coordinates.length) {
          setIsPlaying(false);
          return prev;
        }

        const currentPt = trail.coordinates[nextIdx];
        setUserLocation(currentPt);

        // Heading to next point
        const lookAheadIdx = Math.min(trail.coordinates.length - 1, nextIdx + 1);
        const targetPt = trail.coordinates[lookAheadIdx];
        const bearing = getBearing(currentPt[0], currentPt[1], targetPt[0], targetPt[1]);
        setHeading(bearing);

        // Speed in simulation
        setSpeedKmh(Number((3.8 + Math.random() * 0.8).toFixed(1)));

        // Progress
        const progress = calculateTrailProgress(nextIdx, trail.coordinates);
        setProgressPercent(progress.progressPercent);
        setDistTraveledKm(progress.distanceTraveledKm);
        setDistRemainingKm(progress.distanceRemainingKm);

        setIsOffTrack(false);
        setOffTrackDistance(0);

        updateWaypointsAndAltitude(nextIdx, currentPt);
        onUpdatePosition(currentPt, bearing, false);

        return nextIdx;
      });
    }, intervalMs);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isSimulating, isPlaying, simSpeed, trail]);

  const handleSimulateOffTrack = () => {
    // Add offset to simulate going off-track
    const offsetLat = userLocation[0] + 0.0008; // ~90 meters off
    const offsetLng = userLocation[1] + 0.0008;
    const deviatedCoords: [number, number] = [offsetLat, offsetLng];
    setUserLocation(deviatedCoords);

    const closest = findClosestTrailPoint(deviatedCoords[0], deviatedCoords[1], trail.coordinates);
    setOffTrackDistance(closest.distanceMeters);
    setIsOffTrack(true);

    const bearingBack = getBearing(
      deviatedCoords[0],
      deviatedCoords[1],
      closest.closestCoords[0],
      closest.closestCoords[1]
    );
    setHeading(bearingBack);
    onUpdatePosition(deviatedCoords, bearingBack, true);

    if (soundEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const handleResetSimulation = () => {
    setSimIndex(0);
    const startPt = trail.coordinates[0];
    setUserLocation(startPt);
    setIsPlaying(true);
    setIsOffTrack(false);
    setOffTrackDistance(0);
    setProgressPercent(0);
    setDistTraveledKm(0);
    setDistRemainingKm(trail.lengthKm);
    const bearing = getBearing(
      startPt[0],
      startPt[1],
      trail.coordinates[1][0],
      trail.coordinates[1][1]
    );
    setHeading(bearing);
    onUpdatePosition(startPt, bearing, false);
    onCenterMap();
  };

  const cardinalDir = getCardinalDirection(heading);

  return (
    <div
      id="gps-navigation-panel"
      className="absolute top-16 left-3 right-3 sm:right-auto sm:w-[410px] z-[1100] bg-stone-900/95 backdrop-blur-xl border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden animate-fade-in text-stone-100 flex flex-col"
    >
      {/* Header with Exit and Trail Title */}
      <div className="p-3.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-900/70 border border-red-700 text-red-200">
            {trail.caiNumber || 'GPS'}
          </span>
          <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">
            {trail.name}
          </h4>
        </div>

        <button
          id="exit-navigation-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition"
          title="Termina Navigazione"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Guidance Banner */}
      <div className="p-4 space-y-3.5">
        {/* Off-Track or On-Track Alert Card */}
        {isOffTrack ? (
          <div className="bg-amber-950/70 border border-amber-500/80 p-3 rounded-xl flex items-center gap-3 animate-pulse">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-amber-300">
                Sei a {offTrackDistance}m fuori dal sentiero!
              </div>
              <div className="text-amber-200/90 text-[11px] mt-0.5">
                Punta a <span className="font-bold">{cardinalDir} ({heading}°)</span> per rientrare sulla traccia CAI.
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/50 border border-emerald-600/40 p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sul tracciato ufficiale CAI</span>
            </div>
            <span className="text-[10px] font-mono text-stone-400">
              {progressPercent}% completato
            </span>
          </div>
        )}

        {/* Direction & Compass HUD */}
        <div className="grid grid-cols-2 gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
          {/* Compass Graphic */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full bg-stone-900 border-2 border-stone-700 flex items-center justify-center shadow-inner">
              {/* Compass Needle */}
              <div
                className="w-1.5 h-10 bg-gradient-to-t from-transparent via-red-500 to-red-600 rounded-full transition-transform duration-300 origin-center"
                style={{ transform: `rotate(${heading}deg)` }}
              />
              <div className="absolute w-2 h-2 rounded-full bg-white border border-stone-900 z-10" />
              <span className="absolute top-0.5 text-[8px] font-bold text-stone-400">N</span>
              <span className="absolute bottom-0.5 text-[8px] font-bold text-stone-500">S</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                Bussola / Prua
              </span>
              <span className="font-bold text-base text-stone-100 font-mono">
                {heading}° {cardinalDir}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Direzione consigliata
              </span>
            </div>
          </div>

          {/* Current Target Waypoint */}
          <div className="flex flex-col justify-center border-l border-stone-800 pl-3">
            <span className="text-[10px] uppercase font-semibold text-stone-400">
              Prossimo Obiettivo
            </span>
            <span className="font-bold text-xs text-emerald-300 truncate mt-0.5">
              {targetWaypointName || trail.endPoint}
            </span>
            <span className="text-[11px] text-stone-300 font-mono mt-0.5">
              {targetWaypointDistMeters > 1000
                ? `${(targetWaypointDistMeters / 1000).toFixed(1)} km`
                : `${targetWaypointDistMeters} m`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span>Progresso Sentiero</span>
            <span className="font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-semibold text-stone-500 block">
              Percorsi
            </span>
            <span className="font-bold text-stone-200 text-xs">
              {distTraveledKm} km
            </span>
          </div>

          <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-semibold text-stone-500 block">
              Rimanenti
            </span>
            <span className="font-bold text-stone-200 text-xs">
              {distRemainingKm} km
            </span>
          </div>

          <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-semibold text-stone-500 block">
              Quota
            </span>
            <span className="font-bold text-amber-300 text-xs">
              {altitude}m
            </span>
          </div>

          <div className="bg-stone-950/60 p-2 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-semibold text-stone-500 block">
              Velocità
            </span>
            <span className="font-bold text-stone-200 text-xs">
              {speedKmh} km/h
            </span>
          </div>
        </div>

        {/* Simulation Controls & Mode Selector */}
        <div className="pt-2 border-t border-stone-800/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                id="gps-mode-real-btn"
                onClick={() => setIsSimulating(false)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  !isSimulating
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                GPS Reale
              </button>
              <button
                id="gps-mode-sim-btn"
                onClick={() => setIsSimulating(true)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  isSimulating
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Simulatore
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                id="center-user-map-btn"
                onClick={onCenterMap}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                title="Centra mappa sulla mia posizione"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>

              <button
                id="toggle-sound-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                title={soundEnabled ? 'Disattiva avvisi audio' : 'Attiva avvisi audio'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Simulator Playback Toolbar */}
          {isSimulating && (
            <div className="bg-stone-950/80 border border-stone-800 p-2.5 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  id="sim-play-pause-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  title={isPlaying ? 'Pausa simulazione' : 'Avvia simulazione'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                </button>

                <button
                  id="sim-reset-btn"
                  onClick={handleResetSimulation}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                  title="Ricomincia dal punto di partenza"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Speed Multipliers */}
                <div className="flex items-center gap-1 ml-1">
                  {[1, 2, 5, 10].map((s) => (
                    <button
                      key={s}
                      id={`sim-speed-${s}x`}
                      onClick={() => setSimSpeed(s)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        simSpeed === s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Off-track button */}
              <button
                id="test-off-track-btn"
                onClick={handleSimulateOffTrack}
                className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/60 border border-amber-700/50 px-2 py-1.5 rounded-lg transition"
                title="Simula una deviazione fuori sentiero"
              >
                Test Fuori Pista
              </button>
            </div>
          )}

          {gpsError && (
            <div className="text-[11px] text-rose-300 bg-rose-950/70 p-2 rounded-lg border border-rose-800">
              {gpsError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
