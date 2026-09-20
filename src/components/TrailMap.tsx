import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Trail, MountainPeak, RefugeOrSpring } from '../types';
import {
  Locate,
  Mountain,
  Droplets,
  Eye,
  Maximize2,
  Navigation,
  Loader2,
  Compass,
} from 'lucide-react';
import { GpsNavigationPanel } from './GpsNavigationPanel';

interface TrailMapProps {
  trails: Trail[];
  selectedTrail: Trail | null;
  onSelectTrail: (trail: Trail) => void;
  peaks: MountainPeak[];
  refugesAndSprings: RefugeOrSpring[];
  isNavigating?: boolean;
  onStartNavigation?: (trail: Trail) => void;
  onStopNavigation?: () => void;
}

type MapLayerType = 'opentopo' | 'esri-topo' | 'osm' | 'satellite' | 'outdoors';

export function TrailMap({
  trails,
  selectedTrail,
  onSelectTrail,
  peaks,
  refugesAndSprings,
  isNavigating: externalNavigating = false,
  onStartNavigation,
  onStopNavigation,
}: TrailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerRef = useRef<L.FeatureGroup | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const breadcrumbPolylineRef = useRef<L.Polyline | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('opentopo');
  const [showPeaks, setShowPeaks] = useState<boolean>(true);
  const [showRefuges, setShowRefuges] = useState<boolean>(true);
  const [showAllTrails, setShowAllTrails] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTilesLoading, setIsTilesLoading] = useState<boolean>(false);

  // Internal Navigation State
  const [internalNavigating, setInternalNavigating] = useState<boolean>(false);
  const isNavigationActive = externalNavigating || internalNavigating;
  const [breadcrumbPoints, setBreadcrumbPoints] = useState<[number, number][]>([]);

  // Initialize Leaflet Map with Ultra-Fast CDN Tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Monte Pollino massif
    const map = L.map(mapContainerRef.current, {
      center: [39.9160, 16.1950],
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default layer: OpenTopoMap with official contour lines, hillshading & hiking topography
    const opentopoLayer = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 17,
        subdomains: 'abc',
        attribution: 'Mappa: &copy; OpenTopoMap (CC-BY-SA), &copy; OpenStreetMap contributors | CAI Pollino',
      }
    );

    opentopoLayer.on('loading', () => setIsTilesLoading(true));
    opentopoLayer.on('load', () => setIsTilesLoading(false));
    opentopoLayer.on('tileerror', () => {
      setIsTilesLoading(false);
    });

    opentopoLayer.addTo(map);
    tileLayerRef.current = opentopoLayer;

    // Layer groups for polylines & markers
    const polylinesGroup = L.featureGroup().addTo(map);
    const markersGroup = L.featureGroup().addTo(map);
    polylinesLayerRef.current = polylinesGroup;
    markersLayerRef.current = markersGroup;

    // Breadcrumbs polyline for GPS navigation
    const breadcrumbs = L.polyline([], {
      color: '#06b6d4', // Vibrant Cyan
      weight: 4,
      dashArray: '4, 6',
      opacity: 0.95,
    }).addTo(map);
    breadcrumbPolylineRef.current = breadcrumbs;

    mapInstanceRef.current = map;

    // Invalidate size to ensure clean render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Layer Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    let attribution = 'Mappa: &copy; OpenTopoMap (CC-BY-SA), &copy; OpenStreetMap | CAI Pollino';
    let subdomains: string | string[] = 'abc';
    let maxZoom = 17;

    if (activeLayer === 'esri-topo') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Topografia & Rilievi';
      subdomains = 'abc';
      maxZoom = 18;
    } else if (activeLayer === 'osm') {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      subdomains = 'abc';
      maxZoom = 18;
    } else if (activeLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Immagini Satellitari HD';
      subdomains = 'abc';
      maxZoom = 18;
    } else if (activeLayer === 'outdoors') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CartoDB &copy; OpenStreetMap';
      subdomains = 'abcd';
      maxZoom = 18;
    }

    const newLayer = L.tileLayer(url, {
      maxZoom,
      subdomains,
      attribution,
    });

    newLayer.on('loading', () => setIsTilesLoading(true));
    newLayer.on('load', () => setIsTilesLoading(false));
    newLayer.on('tileerror', () => setIsTilesLoading(false));

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Render Trails Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = polylinesLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!showAllTrails && !selectedTrail) return;

    trails.forEach((trail) => {
      const isSelected = selectedTrail?.id === trail.id;

      // Color mapping by CAI difficulty
      let color = '#10b981'; // E (green)
      if (trail.difficulty === 'T') color = '#38bdf8'; // T (sky)
      if (trail.difficulty === 'EE') color = '#f59e0b'; // EE (amber)
      if (trail.difficulty === 'EEA') color = '#ef4444'; // EEA (red)

      if (isSelected) {
        color = '#ec4899'; // Pink highlight
      }

      const polyline = L.polyline(trail.coordinates, {
        color: color,
        weight: isSelected ? 5.5 : 3.5,
        opacity: isSelected ? 0.95 : selectedTrail ? 0.45 : 0.85,
        dashArray: trail.difficulty === 'EE' ? '6, 4' : undefined,
      });

      // Interactive popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-stone-900';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-stone-900 leading-tight">
          ${trail.caiNumber ? `<span class="bg-red-700 text-white text-[10px] px-1.5 py-0.5 rounded font-mono mr-1">${trail.caiNumber}</span>` : ''}
          ${trail.name}
        </div>
        <div class="text-xs text-stone-600 mt-1">${trail.subtitle}</div>
        <div class="flex items-center gap-3 text-xs font-medium mt-2 pt-2 border-t border-stone-200">
          <span class="text-emerald-700 font-bold">▲ +${trail.elevationGain}m</span>
          <span>↔ ${trail.lengthKm} km</span>
          <span class="bg-stone-100 text-stone-800 px-1.5 rounded font-bold">${trail.difficulty}</span>
        </div>
      `;

      polyline.bindPopup(popupContent);

      polyline.on('click', () => {
        onSelectTrail(trail);
      });

      polyline.on('mouseover', function () {
        if (!isSelected) {
          polyline.setStyle({ weight: 5, opacity: 1 });
        }
      });
      polyline.on('mouseout', function () {
        if (!isSelected) {
          polyline.setStyle({
            weight: 3.5,
            opacity: selectedTrail ? 0.45 : 0.85,
          });
        }
      });

      group.addLayer(polyline);

      // Start trailhead marker
      const startHtml = `
        <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-white ${
          isSelected ? 'bg-pink-600 text-white scale-125' : 'bg-stone-900 text-white'
        }">
          ${trail.caiNumber?.replace('CAI ', '') || 'P'}
        </div>
      `;
      const startIcon = L.divIcon({
        html: startHtml,
        className: 'custom-trail-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const startMarker = L.marker(trail.startCoords, { icon: startIcon });
      startMarker.bindTooltip(`${trail.name} (Partenza: ${trail.startPoint})`, {
        direction: 'top',
      });
      startMarker.on('click', () => onSelectTrail(trail));
      group.addLayer(startMarker);
    });

    // If selected trail, zoom to its bounds
    if (selectedTrail) {
      const bounds = L.latLngBounds(selectedTrail.coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [trails, selectedTrail, showAllTrails, onSelectTrail]);

  // Render Markers (Peaks, Refuges, Springs)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Render Peaks
    if (showPeaks) {
      peaks.forEach((peak) => {
        const peakHtml = `
          <div class="group relative flex flex-col items-center">
            <div class="w-7 h-7 rounded-full bg-amber-600 text-white border-2 border-white flex items-center justify-center shadow-lg hover:bg-amber-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
            </div>
            <div class="bg-stone-900/90 text-[10px] font-bold text-amber-300 px-1.5 py-0.5 rounded shadow whitespace-nowrap mt-0.5 border border-amber-500/30">
              ${peak.altitude}m
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: peakHtml,
          className: 'peak-div-icon',
          iconSize: [40, 48],
          iconAnchor: [20, 24],
        });

        const marker = L.marker([peak.lat, peak.lng], { icon });
        marker.bindPopup(`
          <div class="p-1 font-sans text-stone-900">
            <div class="font-bold text-sm text-amber-900 flex items-center gap-1">
              ⛰️ ${peak.name} (${peak.altitude} m s.l.m.)
            </div>
            <div class="text-xs text-stone-700 mt-1">${peak.description}</div>
            <div class="text-[11px] font-medium text-stone-500 mt-1">Vetta #${peak.rank} del Massiccio del Pollino</div>
          </div>
        `);
        group.addLayer(marker);
      });
    }

    // Render Refuges and Springs
    if (showRefuges) {
      refugesAndSprings.forEach((item) => {
        const isSpring = item.type === 'spring';
        const isMon = item.type === 'monument';

        const bgClass = isSpring
          ? 'bg-cyan-600'
          : isMon
          ? 'bg-purple-600'
          : 'bg-emerald-700';

        const symbol = isSpring ? '💧' : isMon ? '⛪' : '🛖';

        const itemHtml = `
          <div class="w-6 h-6 rounded-full ${bgClass} text-white border-2 border-white flex items-center justify-center text-xs shadow-md">
            ${symbol}
          </div>
        `;

        const icon = L.divIcon({
          html: itemHtml,
          className: 'poi-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([item.lat, item.lng], { icon });
        marker.bindPopup(`
          <div class="p-1 font-sans text-stone-900">
            <div class="font-bold text-sm text-stone-900 flex items-center gap-1">
              ${symbol} ${item.name} (${item.altitude} m)
            </div>
            <div class="text-xs text-stone-600 mt-0.5">${item.location}</div>
            <div class="text-xs text-stone-800 mt-1.5 bg-stone-100 p-1.5 rounded">${item.note}</div>
          </div>
        `);
        group.addLayer(marker);
      });
    }
  }, [peaks, refugesAndSprings, showPeaks, showRefuges]);

  // Handle GPS Navigation Live Position Updates
  const handleNavigationUpdate = (
    coords: [number, number],
    heading: number,
    isOff: boolean
  ) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Append to breadcrumbs
    setBreadcrumbPoints((prev) => {
      const updated = [...prev, coords];
      if (breadcrumbPolylineRef.current) {
        breadcrumbPolylineRef.current.setLatLngs(updated);
      }
      return updated;
    });

    // Update user marker with direction arrow and pulsing beacon
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(coords);
      // Update heading arrow rotation
      const arrowElem = document.getElementById('hiker-heading-arrow');
      if (arrowElem) {
        arrowElem.style.transform = `rotate(${heading}deg)`;
      }
    } else {
      const userNavIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <!-- Pulsing Beacon -->
            <div class="absolute w-10 h-10 ${isOff ? 'bg-amber-400/40' : 'bg-emerald-400/40'} rounded-full animate-ping"></div>
            <!-- Heading Beam / Arrow -->
            <div id="hiker-heading-arrow" class="absolute -top-3 w-4 h-4 text-emerald-300 transition-transform duration-300 origin-bottom" style="transform: rotate(${heading}deg);">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 drop-shadow">
                <polygon points="12,2 22,22 12,18 2,22" />
              </svg>
            </div>
            <!-- Central Marker Pin -->
            <div class="w-5 h-5 ${isOff ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full border-2 border-white shadow-xl z-20 flex items-center justify-center text-[10px]">
              🥾
            </div>
          </div>
        `,
        className: 'user-nav-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker(coords, { icon: userNavIcon, zIndexOffset: 2000 });
      marker.addTo(map);
      userMarkerRef.current = marker;
    }
  };

  const handleCenterOnHiker = () => {
    const map = mapInstanceRef.current;
    if (!map || !userMarkerRef.current) return;
    const pos = userMarkerRef.current.getLatLng();
    map.panTo(pos, { animate: true, duration: 0.8 });
  };

  // Instant Locate Me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('La geolocalizzazione non è supportata dal browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          map.removeLayer(userMarkerRef.current);
        }

        const userIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10"></div>
              <div class="absolute w-8 h-8 bg-blue-400/40 rounded-full animate-ping"></div>
            </div>
          `,
          className: 'user-location-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 2000 });
        marker.bindTooltip('La tua posizione GPS attuale', { permanent: true, direction: 'top' });
        marker.addTo(map);
        userMarkerRef.current = marker;

        map.setView([latitude, longitude], 13);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(`GPS: ${error.message}`);
        setTimeout(() => setLocationError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([39.9160, 16.1950], 12);
  };

  const startNavigationMode = () => {
    if (selectedTrail) {
      setInternalNavigating(true);
      if (onStartNavigation) onStartNavigation(selectedTrail);
    }
  };

  const stopNavigationMode = () => {
    setInternalNavigating(false);
    setBreadcrumbPoints([]);
    if (breadcrumbPolylineRef.current) {
      breadcrumbPolylineRef.current.setLatLngs([]);
    }
    if (userMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (onStopNavigation) onStopNavigation();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-xl flex flex-col">
      {/* Tile Loading Indicator */}
      {isTilesLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-stone-900/90 text-stone-300 text-xs px-3 py-1.5 rounded-full border border-stone-700 shadow-lg flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span>Caricamento mappa topografica...</span>
        </div>
      )}

      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        {/* Layer Switcher */}
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/70 rounded-xl p-1 shadow-lg flex items-center gap-1 text-xs">
          <button
            id="map-layer-opentopo-btn"
            onClick={() => setActiveLayer('opentopo')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'opentopo'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title="OpenTopoMap: curve di livello, isoipse a 10m e stile cartografico CAI classico"
          >
            Topografica CAI
          </button>
          <button
            id="map-layer-satellite-btn"
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'satellite'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            Satellite
          </button>
          <button
            id="map-layer-esri-btn"
            onClick={() => setActiveLayer('esri-topo')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'esri-topo'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title="Rilievi orografici Esri World Topo"
          >
            Rilievi
          </button>
          <button
            id="map-layer-osm-btn"
            onClick={() => setActiveLayer('osm')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'osm'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            Stradale
          </button>
        </div>

        {/* POI Toggles */}
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/70 rounded-xl p-1 shadow-lg flex items-center gap-1 text-xs">
          <button
            id="toggle-peaks-btn"
            onClick={() => setShowPeaks(!showPeaks)}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              showPeaks
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Mostra / Nascondi Vette del Pollino"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vette ({peaks.length})</span>
          </button>

          <button
            id="toggle-refuges-btn"
            onClick={() => setShowRefuges(!showRefuges)}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              showRefuges
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Mostra / Nascondi Rifugi e Fonti d'Acqua"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rifugi & Acqua</span>
          </button>

          <button
            id="toggle-trails-btn"
            onClick={() => setShowAllTrails(!showAllTrails)}
            className={`px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              showAllTrails
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Mostra tutte le tracce"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tracce ({trails.length})</span>
          </button>
        </div>
      </div>

      {/* Right Map Actions (Locate & Reset) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          id="locate-gps-btn"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="w-9 h-9 bg-stone-900/90 backdrop-blur-md border border-stone-700/70 text-stone-200 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-lg"
          title="Trova la mia posizione GPS attuale"
        >
          <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        <button
          id="reset-map-view-btn"
          onClick={handleResetView}
          className="w-9 h-9 bg-stone-900/90 backdrop-blur-md border border-stone-700/70 text-stone-200 rounded-xl flex items-center justify-center hover:bg-stone-800 transition shadow-lg"
          title="Ripristina vista panoramica Massiccio Pollino"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Location Error alert if any */}
      {locationError && (
        <div className="absolute top-16 left-3 z-[1000] bg-rose-950/90 border border-rose-600 text-rose-200 text-xs px-3 py-1.5 rounded-lg shadow-lg">
          {locationError}
        </div>
      )}

      {/* Live GPS Navigation HUD Panel */}
      {isNavigationActive && selectedTrail && (
        <GpsNavigationPanel
          trail={selectedTrail}
          onClose={stopNavigationMode}
          onUpdatePosition={handleNavigationUpdate}
          onCenterMap={handleCenterOnHiker}
        />
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-stone-950/85 backdrop-blur-md border border-stone-800 p-2.5 rounded-xl shadow-lg text-[11px] text-stone-300 hidden md:block">
        <div className="font-semibold text-stone-200 mb-1.5 flex items-center gap-1.5">
          <span>Legenda Difficoltà CAI:</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> T (Turistico)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> E (Escursionistico)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> EE (Esperti)
          </span>
        </div>
      </div>

      {/* Selected Trail Floating Card in Map with "Avvia Navigazione GPS" */}
      {selectedTrail && !isNavigationActive && (
        <div className="absolute bottom-3 right-3 sm:right-14 z-[1000] bg-stone-900/95 backdrop-blur-md border border-pink-500/50 p-3 rounded-2xl shadow-2xl max-w-sm text-xs animate-fade-in">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold text-pink-400 bg-pink-950/70 px-2 py-0.5 rounded border border-pink-500/30">
              Sentiero Selezionato
            </span>
            <span className="font-mono text-[11px] text-stone-400 font-bold">
              {selectedTrail.caiNumber || ''}
            </span>
          </div>

          <p className="font-bold text-stone-100 text-sm mt-1.5 leading-snug">
            {selectedTrail.name}
          </p>

          <div className="flex items-center gap-2.5 mt-2 text-stone-300 text-xs">
            <span className="text-emerald-400 font-bold">+{selectedTrail.elevationGain}m</span>
            <span>•</span>
            <span>{selectedTrail.lengthKm} km</span>
            <span>•</span>
            <span>{selectedTrail.estimatedTime}</span>
          </div>

          {/* Quick Action Button: Avvia Navigazione GPS */}
          <button
            id="start-gps-navigation-map-btn"
            onClick={startNavigationMode}
            className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            Avvia Navigazione GPS in Tempo Reale
          </button>
        </div>
      )}

      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />
    </div>
  );
}
