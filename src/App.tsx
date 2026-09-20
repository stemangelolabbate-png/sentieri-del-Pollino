import { useState, useMemo, useEffect } from 'react';
import { Trail, FilterState } from './types';
import { POLLINO_TRAILS, MOUNTAIN_PEAKS, REFUGES_AND_SPRINGS } from './data/pollinoData';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { TrailMap } from './components/TrailMap';
import { TrailCard } from './components/TrailCard';
import { TrailDetailModal } from './components/TrailDetailModal';
import { ParkInfoModal } from './components/ParkInfoModal';
import {
  Mountain,
  Compass,
  Trees,
  Droplets,
  MapPin,
  Flame,
  CheckCircle2,
  Heart,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  // State for Trails & Selections
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(POLLINO_TRAILS[0]);
  const [activeModalTrail, setActiveModalTrail] = useState<Trail | null>(null);
  const [isParkInfoOpen, setIsParkInfoOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Local Storage for Favorites and Completed
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pollino_favorites');
      return saved ? JSON.parse(saved) : ['cai-901-monte-pollino', 'cai-922-giardino-degli-dei'];
    } catch {
      return ['cai-901-monte-pollino', 'cai-922-giardino-degli-dei'];
    }
  });

  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pollino_completed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pollino_favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('pollino_completed', JSON.stringify(completed));
    } catch {}
  }, [completed]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCompleted = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    difficulty: 'all',
    versante: 'all',
    lengthFilter: 'all',
    onlyPeaks2000: false,
    onlyPinoLoricato: false,
    onlyWater: false,
    onlyFamily: false,
    maxDistance: 25,
    maxElevationGain: 1200,
    favoritesOnly: false,
  });

  // GPS Navigation State
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const handleStartNavigation = (trail: Trail) => {
    setSelectedTrail(trail);
    setIsNavigating(true);
    setViewMode('split');
    // Scroll smoothly to map
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
  };

  // Filtered Trails
  const filteredTrails = useMemo(() => {
    return POLLINO_TRAILS.filter((trail) => {
      // Search
      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matchesName = trail.name.toLowerCase().includes(query);
        const matchesSub = trail.subtitle.toLowerCase().includes(query);
        const matchesCai = trail.caiNumber?.toLowerCase().includes(query) || false;
        const matchesItinerary = trail.itinerary.some((item) =>
          item.toLowerCase().includes(query)
        );
        const matchesDesc = trail.description.toLowerCase().includes(query);
        if (!matchesName && !matchesSub && !matchesCai && !matchesItinerary && !matchesDesc) {
          return false;
        }
      }

      // Difficulty
      if (filters.difficulty !== 'all' && trail.difficulty !== filters.difficulty) {
        return false;
      }

      // Versante
      if (filters.versante !== 'all' && trail.versante !== filters.versante) {
        return false;
      }

      // Length
      if (filters.lengthFilter === 'short' && trail.lengthKm >= 7) {
        return false;
      }
      if (filters.lengthFilter === 'medium' && (trail.lengthKm < 7 || trail.lengthKm > 12)) {
        return false;
      }
      if (filters.lengthFilter === 'long' && trail.lengthKm <= 12) {
        return false;
      }

      // Quick tags
      if (filters.onlyPeaks2000 && !trail.isPeakOver2000) return false;
      if (filters.onlyPinoLoricato && !trail.hasPinoLoricato) return false;
      if (filters.onlyWater && !trail.hasWater) return false;
      if (filters.onlyFamily && !trail.isFamilyFriendly) return false;
      if (filters.favoritesOnly && !favorites.includes(trail.id)) return false;

      return true;
    });
  }, [filters, favorites]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white notranslate" translate="no">
      {/* Header / Navbar */}
      <Navbar
        onOpenInfo={() => setIsParkInfoOpen(true)}
        favoritesCount={favorites.length}
        completedCount={completed.length}
        favoritesOnly={filters.favoritesOnly}
        onToggleFavoritesOnly={() =>
          setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-5">
        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="bg-stone-900/70 border border-stone-800/80 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
              {POLLINO_TRAILS.length}
            </div>
            <div>
              <span className="font-bold text-stone-200 block">Sentieri Ufficiali</span>
              <span className="text-[11px] text-stone-400">Tracce & GPX CAI</span>
            </div>
          </div>

          <div className="bg-stone-900/70 border border-stone-800/80 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-bold">
              {MOUNTAIN_PEAKS.length}
            </div>
            <div>
              <span className="font-bold text-stone-200 block">Vette & Rilievi</span>
              <span className="text-[11px] text-stone-400">Dolcedorme 2.267m</span>
            </div>
          </div>

          <div className="bg-stone-900/70 border border-stone-800/80 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-200 block">Pini Loricati</span>
              <span className="text-[11px] text-stone-400">Patriarchi millenari</span>
            </div>
          </div>

          <div className="bg-stone-900/70 border border-stone-800/80 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-stone-200 block">Navigatore GPS</span>
              <span className="text-[11px] text-stone-400">Bussola & Real-time</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          totalTrails={POLLINO_TRAILS.length}
          filteredCount={filteredTrails.length}
          savedFavoritesCount={favorites.length}
        />

        {/* Dynamic Layout Based on View Mode */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Interactive Map (5 or 6 cols) */}
            <div className="lg:col-span-6 sticky top-20 h-[520px] lg:h-[680px]">
              <TrailMap
                trails={filteredTrails}
                selectedTrail={selectedTrail}
                onSelectTrail={(t) => setSelectedTrail(t)}
                peaks={MOUNTAIN_PEAKS}
                refugesAndSprings={REFUGES_AND_SPRINGS}
                isNavigating={isNavigating}
                onStartNavigation={handleStartNavigation}
                onStopNavigation={handleStopNavigation}
              />
            </div>

            {/* Right Column: Scrollable List of Trails */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                  Elenco Sentieri ({filteredTrails.length})
                </h3>
                {selectedTrail && (
                  <span className="text-xs text-stone-500">
                    Selezionato: <strong className="text-emerald-400">{selectedTrail.name}</strong>
                  </span>
                )}
              </div>

              {filteredTrails.length === 0 ? (
                <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
                  <Compass className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  <p className="font-semibold text-stone-300">Nessun sentiero corrisponde ai filtri selezionati</p>
                  <p className="text-xs text-stone-500 mt-1">Prova a reimpostare i criteri di ricerca, difficoltà o lunghezza.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {filteredTrails.map((trail) => (
                    <TrailCard
                      key={trail.id}
                      trail={trail}
                      isSelected={selectedTrail?.id === trail.id}
                      isFavorite={favorites.includes(trail.id)}
                      isCompleted={completed.includes(trail.id)}
                      onSelect={(t) => setSelectedTrail(t)}
                      onOpenDetails={(t) => setActiveModalTrail(t)}
                      onStartNavigation={handleStartNavigation}
                      onToggleFavorite={toggleFavorite}
                      onToggleCompleted={toggleCompleted}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="w-full h-[760px] relative">
            <TrailMap
              trails={filteredTrails}
              selectedTrail={selectedTrail}
              onSelectTrail={(t) => setSelectedTrail(t)}
              peaks={MOUNTAIN_PEAKS}
              refugesAndSprings={REFUGES_AND_SPRINGS}
              isNavigating={isNavigating}
              onStartNavigation={handleStartNavigation}
              onStopNavigation={handleStopNavigation}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Tutti i Sentieri del Pollino ({filteredTrails.length})
              </h3>
            </div>

            {filteredTrails.length === 0 ? (
              <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-10 text-center text-stone-400">
                <Compass className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                <p className="font-semibold text-stone-300">Nessun sentiero trovato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrails.map((trail) => (
                  <TrailCard
                    key={trail.id}
                    trail={trail}
                    isSelected={selectedTrail?.id === trail.id}
                    isFavorite={favorites.includes(trail.id)}
                    isCompleted={completed.includes(trail.id)}
                    onSelect={(t) => {
                      setSelectedTrail(t);
                      setViewMode('split');
                    }}
                    onOpenDetails={(t) => setActiveModalTrail(t)}
                    onStartNavigation={handleStartNavigation}
                    onToggleFavorite={toggleFavorite}
                    onToggleCompleted={toggleCompleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Sentieri del Parco Nazionale del Pollino &copy; {new Date().getFullYear()} — Mappe Topografiche e Tracce GPS CAI.
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={() => setIsParkInfoOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Soccorso Alpino (118 / 112)
            </button>
            <span>•</span>
            <span className="text-stone-500">Dati cartografici &copy; OpenTopoMap & OpenStreetMap</span>
          </div>
        </div>
      </footer>

      {/* Modal for Trail Details */}
      <TrailDetailModal
        trail={activeModalTrail}
        onClose={() => setActiveModalTrail(null)}
        onFocusOnMap={(trail) => {
          setSelectedTrail(trail);
          setViewMode('split');
        }}
        onStartNavigation={handleStartNavigation}
        isFavorite={activeModalTrail ? favorites.includes(activeModalTrail.id) : false}
        isCompleted={activeModalTrail ? completed.includes(activeModalTrail.id) : false}
        onToggleFavorite={toggleFavorite}
        onToggleCompleted={toggleCompleted}
      />

      {/* Modal for Park Information and Safety */}
      <ParkInfoModal
        isOpen={isParkInfoOpen}
        onClose={() => setIsParkInfoOpen(false)}
      />
    </div>
  );
}
