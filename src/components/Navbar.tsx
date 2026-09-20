import { Mountain, Trees, ShieldAlert, Heart, Map, List, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenInfo: () => void;
  favoritesCount: number;
  completedCount: number;
  onToggleFavoritesOnly: () => void;
  favoritesOnly: boolean;
  viewMode: 'split' | 'map' | 'list';
  onViewModeChange: (mode: 'split' | 'map' | 'list') => void;
}

export function Navbar({
  onOpenInfo,
  favoritesCount,
  completedCount,
  onToggleFavoritesOnly,
  favoritesOnly,
  viewMode,
  onViewModeChange,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-[1500] bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/30">
            <Trees className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-stone-100 tracking-tight leading-none">
                Sentieri del Pollino
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/40 text-emerald-400">
                Parco Nazionale
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 hidden sm:block">
              Guida topografica, vette &gt;2000m e tracce GPX
            </p>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* View mode switcher (Mobile/Desktop friendly) */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-1 flex items-center gap-1 text-xs">
            <button
              id="view-mode-split-btn"
              onClick={() => onViewModeChange('split')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium hidden md:flex ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Vista divisa Mappa e Lista"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mappa & Lista</span>
            </button>

            <button
              id="view-mode-list-btn"
              onClick={() => onViewModeChange('list')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Solo Elenco Sentieri"
            >
              <List className="w-3.5 h-3.5" />
              <span>Sentieri</span>
            </button>

            <button
              id="view-mode-map-btn"
              onClick={() => onViewModeChange('map')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition font-medium ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Solo Mappa Topografica"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Mappa</span>
            </button>
          </div>

          {/* Favorites Button */}
          <button
            id="navbar-favorites-btn"
            onClick={onToggleFavoritesOnly}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              favoritesOnly
                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
            title="Mostra solo sentieri salvati"
          >
            <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-rose-400 text-rose-400' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">Salvati</span>
            {favoritesCount > 0 && (
              <span className="bg-rose-900/60 text-rose-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Info & Safety Button */}
          <button
            id="navbar-info-btn"
            onClick={onOpenInfo}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:border-emerald-500/50 hover:text-emerald-300 transition text-xs font-semibold flex items-center gap-1.5"
            title="Guida Parco, Soccorso Alpino e Regolamento"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Sicurezza & Parco</span>
          </button>
        </div>
      </div>
    </header>
  );
}
