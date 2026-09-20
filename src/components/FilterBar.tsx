import { FilterState, Difficulty, Versante, LengthFilter } from '../types';
import { Search, Mountain, Trees, Droplets, Heart, RotateCcw, Ruler } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalTrails: number;
  filteredCount: number;
  savedFavoritesCount: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  totalTrails,
  filteredCount,
  savedFavoritesCount,
}: FilterBarProps) {
  const handleDifficultyChange = (diff: Difficulty | 'all') => {
    onFilterChange({ ...filters, difficulty: diff });
  };

  const handleVersanteChange = (versante: Versante | 'all') => {
    onFilterChange({ ...filters, versante });
  };

  const handleLengthChange = (lengthFilter: LengthFilter) => {
    onFilterChange({ ...filters, lengthFilter });
  };

  const resetFilters = () => {
    onFilterChange({
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
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.difficulty !== 'all' ||
    filters.versante !== 'all' ||
    filters.lengthFilter !== 'all' ||
    filters.onlyPeaks2000 ||
    filters.onlyPinoLoricato ||
    filters.onlyWater ||
    filters.onlyFamily ||
    filters.favoritesOnly;

  return (
    <div className="bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-800 p-4 shadow-lg space-y-3.5">
      {/* Search Input & Results Count */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            id="search-trails-input"
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Cerca per sentiero, numero CAI, cima (es. 901, Dolcedorme, Gaudolino)..."
            className="w-full bg-stone-950/80 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results Counter & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="text-xs text-stone-400">
            <span className="font-bold text-emerald-400">{filteredCount}</span> di {totalTrails} sentieri
          </div>

          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="text-xs text-stone-400 hover:text-emerald-400 flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-stone-800"
            >
              <RotateCcw className="w-3 h-3" />
              Azzera filtri
            </button>
          )}
        </div>
      </div>

      {/* Difficulty, Length and Versante Row */}
      <div className="space-y-2.5 pt-2 border-t border-stone-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Difficulty Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-stone-500 mr-1 uppercase">
              Difficoltà:
            </span>
            {(['all', 'T', 'E', 'EE'] as const).map((diff) => (
              <button
                key={diff}
                id={`filter-diff-${diff}`}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filters.difficulty === diff
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {diff === 'all' ? 'Tutte' : diff}
              </button>
            ))}
          </div>

          {/* Length Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-stone-500 mr-1 uppercase flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Lunghezza:
            </span>
            {(
              [
                { id: 'all', label: 'Tutte' },
                { id: 'short', label: 'Brevi (<7km)' },
                { id: 'medium', label: 'Medi (7-12km)' },
                { id: 'long', label: 'Lunghi (>12km)' },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                id={`filter-length-${l.id}`}
                onClick={() => handleLengthChange(l.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  filters.lengthFilter === l.id
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Versante Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-stone-500 mr-1 uppercase">
            Versante:
          </span>
          {(
            [
              { id: 'all', label: 'Tutti i Versanti' },
              { id: 'centrale', label: 'Massiccio Centrale' },
              { id: 'lucano', label: 'Versante Lucano' },
              { id: 'calabro', label: 'Versante Calabro' },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              id={`filter-versante-${v.id}`}
              onClick={() => handleVersanteChange(v.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filters.versante === v.id
                  ? 'bg-stone-200 text-stone-900 font-semibold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-800/80">
        <button
          id="filter-peaks-btn"
          onClick={() =>
            onFilterChange({ ...filters, onlyPeaks2000: !filters.onlyPeaks2000 })
          }
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ${
            filters.onlyPeaks2000
              ? 'bg-amber-950/70 border-amber-500 text-amber-300 font-semibold'
              : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Mountain className="w-3.5 h-3.5" />
          Vette &gt;2000m
        </button>

        <button
          id="filter-pino-btn"
          onClick={() =>
            onFilterChange({
              ...filters,
              onlyPinoLoricato: !filters.onlyPinoLoricato,
            })
          }
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ${
            filters.onlyPinoLoricato
              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-semibold'
              : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Trees className="w-3.5 h-3.5" />
          Pini Loricati
        </button>

        <button
          id="filter-water-btn"
          onClick={() =>
            onFilterChange({ ...filters, onlyWater: !filters.onlyWater })
          }
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ${
            filters.onlyWater
              ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-semibold'
              : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Con Sorgente
        </button>

        <button
          id="filter-family-btn"
          onClick={() =>
            onFilterChange({ ...filters, onlyFamily: !filters.onlyFamily })
          }
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ${
            filters.onlyFamily
              ? 'bg-purple-950/70 border-purple-500 text-purple-300 font-semibold'
              : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          Per Famiglie
        </button>

        <button
          id="filter-favorites-btn"
          onClick={() =>
            onFilterChange({
              ...filters,
              favoritesOnly: !filters.favoritesOnly,
            })
          }
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition border ml-auto ${
            filters.favoritesOnly
              ? 'bg-rose-950/70 border-rose-500 text-rose-300 font-semibold'
              : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${filters.favoritesOnly ? 'fill-rose-400' : ''}`} />
          Salvati ({savedFavoritesCount})
        </button>
      </div>
    </div>
  );
}
