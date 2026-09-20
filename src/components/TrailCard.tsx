import { Trail } from '../types';
import {
  Mountain,
  Clock,
  ArrowUpRight,
  Droplets,
  Heart,
  Trees,
  CheckCircle2,
  Navigation,
  Compass,
  Download,
} from 'lucide-react';
import { downloadGpxFile } from '../utils/gpxGenerator';

interface TrailCardProps {
  trail: Trail;
  isSelected: boolean;
  isFavorite: boolean;
  isCompleted: boolean;
  onSelect: (trail: Trail) => void;
  onOpenDetails: (trail: Trail) => void;
  onStartNavigation?: (trail: Trail) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export function TrailCard({
  trail,
  isSelected,
  isFavorite,
  isCompleted,
  onSelect,
  onOpenDetails,
  onStartNavigation,
  onToggleFavorite,
  onToggleCompleted,
}: TrailCardProps) {
  const getDifficultyBadge = (diff: Trail['difficulty']) => {
    switch (diff) {
      case 'T':
        return {
          bg: 'bg-sky-950/70 border-sky-600/40 text-sky-300',
          label: 'T - Turistico',
        };
      case 'E':
        return {
          bg: 'bg-emerald-950/70 border-emerald-600/40 text-emerald-300',
          label: 'E - Escursionistico',
        };
      case 'EE':
        return {
          bg: 'bg-amber-950/70 border-amber-600/40 text-amber-300',
          label: 'EE - Esperti',
        };
      case 'EEA':
        return {
          bg: 'bg-rose-950/70 border-rose-600/40 text-rose-300',
          label: 'EEA - Attrezzato',
        };
    }
  };

  const diffBadge = getDifficultyBadge(trail.difficulty);

  return (
    <div
      id={`trail-card-${trail.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${
        isSelected
          ? 'bg-stone-900 border-emerald-500 ring-1 ring-emerald-500 shadow-xl'
          : 'bg-stone-900/80 border-stone-800/90 hover:border-stone-700 hover:bg-stone-900 shadow-md'
      }`}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {trail.caiNumber ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide bg-red-900/60 border border-red-700/50 text-red-200">
                {trail.caiNumber}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-800 text-stone-300">
                Sentiero
              </span>
            )}

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${diffBadge.bg}`}
            >
              {diffBadge.label}
            </span>

            {trail.isPeakOver2000 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/60 border border-amber-600/40 text-amber-300 flex items-center gap-1">
                <Mountain className="w-3 h-3" /> &gt;2000m
              </span>
            )}
          </div>

          {/* Quick Actions (Favorite / Completed) */}
          <div className="flex items-center gap-1">
            <button
              id={`fav-btn-${trail.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(trail.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-rose-400 bg-rose-950/50 hover:bg-rose-900/50'
                  : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
              }`}
              title={isFavorite ? 'Rimuovi dai preferiti' : 'Salva nei preferiti'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              id={`completed-btn-${trail.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompleted(trail.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isCompleted
                  ? 'text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/50'
                  : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800'
              }`}
              title={isCompleted ? 'Contrassegnato come percorso completato' : 'Segna come completato'}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-400 text-stone-900' : ''}`} />
            </button>
          </div>
        </div>

        {/* Trail Title & Subtitle */}
        <h3
          onClick={() => onSelect(trail)}
          className="text-base font-bold text-stone-100 hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
        >
          {trail.name}
        </h3>
        <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
          {trail.subtitle}
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-stone-800/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">
              Distanza
            </span>
            <span className="font-semibold text-stone-200 text-sm">
              {trail.lengthKm} km
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">
              Dislivello
            </span>
            <span className="font-semibold text-emerald-400 text-sm">
              +{trail.elevationGain}m
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 block">
              Tempo
            </span>
            <span className="font-semibold text-stone-200 text-sm flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              {trail.estimatedTime}
            </span>
          </div>
        </div>

        {/* Highlights Tags */}
        <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px] text-stone-400">
          {trail.hasPinoLoricato && (
            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              <Trees className="w-3 h-3" /> Pini Loricati
            </span>
          )}
          {trail.hasWater && (
            <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              <Droplets className="w-3 h-3" /> Sorgente
            </span>
          )}
          {trail.isFamilyFriendly && (
            <span className="inline-flex items-center gap-1 text-stone-300 bg-stone-800 px-2 py-0.5 rounded">
              Per tutti
            </span>
          )}
          <span className="text-stone-500 text-[10px] ml-auto font-mono">
            {trail.isLoop ? 'Percorso ad anello' : 'Andata e Ritorno'}
          </span>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-stone-800/60">
        <button
          id={`view-map-btn-${trail.id}`}
          onClick={() => onSelect(trail)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            isSelected
              ? 'bg-emerald-600 text-white'
              : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
          }`}
          title="Mostra tracciato su mappa"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mappa</span>
        </button>

        {onStartNavigation && (
          <button
            id={`nav-gps-btn-${trail.id}`}
            onClick={() => onStartNavigation(trail)}
            className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition flex items-center justify-center gap-1.5 shadow-sm"
            title="Avvia navigazione GPS passo-passo"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            Naviga GPS
          </button>
        )}

        <button
          id={`open-details-btn-${trail.id}`}
          onClick={() => onOpenDetails(trail)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition flex items-center justify-center gap-1"
        >
          Scheda
        </button>

        <button
          id={`download-gpx-card-btn-${trail.id}`}
          onClick={(e) => {
            e.stopPropagation();
            downloadGpxFile(trail);
          }}
          className="p-2 rounded-xl text-stone-400 bg-stone-800/60 hover:text-emerald-300 hover:bg-stone-800 transition"
          title="Scarica traccia GPX per GPS"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
