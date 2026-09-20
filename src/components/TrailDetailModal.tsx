import { Trail } from '../types';
import { ElevationProfile } from './ElevationProfile';
import { downloadGpxFile } from '../utils/gpxGenerator';
import {
  X,
  Mountain,
  Clock,
  Navigation,
  Droplets,
  AlertTriangle,
  Trees,
  Download,
  CheckCircle2,
  Heart,
  Share2,
  Compass,
  Layers,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';

interface TrailDetailModalProps {
  trail: Trail | null;
  onClose: () => void;
  onFocusOnMap: (trail: Trail) => void;
  onStartNavigation?: (trail: Trail) => void;
  isFavorite: boolean;
  isCompleted: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export function TrailDetailModal({
  trail,
  onClose,
  onFocusOnMap,
  onStartNavigation,
  isFavorite,
  isCompleted,
  onToggleFavorite,
  onToggleCompleted,
}: TrailDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!trail) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${trail.name} - Sentieri del Pollino`,
        text: `${trail.subtitle}. Dislivello: +${trail.elevationGain}m, Lunghezza: ${trail.lengthKm}km.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `${trail.name} (${trail.caiNumber || 'Pollino'})\nDislivello: +${trail.elevationGain}m | Lunghezza: ${trail.lengthKm} km\n${window.location.href}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        id="trail-detail-modal"
        className="bg-stone-900 border border-stone-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-950/60 flex items-start justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {trail.caiNumber && (
                <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-red-900/60 border border-red-700/60 text-red-200">
                  {trail.caiNumber}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-700/50 text-emerald-300">
                Difficoltà: {trail.difficulty}
              </span>
              <span className="text-xs text-stone-400 capitalize">
                Versante {trail.versante}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 leading-tight">
              {trail.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              {trail.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(trail.id)}
              className={`p-2 rounded-xl border transition ${
                isFavorite
                  ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title="Salva nei preferiti"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              onClick={() => onToggleCompleted(trail.id)}
              className={`p-2 rounded-xl border transition ${
                isCompleted
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
              title="Segna come completato"
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-400 text-stone-900' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-stone-200 transition"
              title="Condividi sentiero"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              id="close-detail-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-400 hover:text-white transition"
              title="Chiudi scheda"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-300 text-sm">
          {copiedLink && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl text-xs flex items-center justify-between">
              <span>Dettagli del sentiero copiati negli appunti!</span>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Lunghezza
              </span>
              <span className="text-lg font-bold text-stone-100">
                {trail.lengthKm} km
              </span>
              <span className="text-[11px] text-stone-400 block">
                {trail.isLoop ? 'Percorso ad anello' : 'Andata e ritorno'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Dislivello + / -
              </span>
              <span className="text-lg font-bold text-emerald-400">
                +{trail.elevationGain}m
              </span>
              <span className="text-[11px] text-amber-400 block">
                -{trail.elevationLoss}m
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Quota Min / Max
              </span>
              <span className="text-lg font-bold text-stone-100">
                {trail.maxAltitude}m
              </span>
              <span className="text-[11px] text-stone-400 block">
                Min: {trail.minAltitude}m s.l.m.
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Tempo Stimato
              </span>
              <span className="text-lg font-bold text-stone-100 flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                {trail.estimatedTime}
              </span>
              <span className="text-[11px] text-stone-400 block">
                Passo escursionistico
              </span>
            </div>
          </div>

          {/* Elevation Profile Chart */}
          <div>
            <ElevationProfile
              points={trail.elevationProfile}
              minAltitude={trail.minAltitude}
              maxAltitude={trail.maxAltitude}
              elevationGain={trail.elevationGain}
              elevationLoss={trail.elevationLoss}
              lengthKm={trail.lengthKm}
            />
          </div>

          {/* Trail Description */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Descrizione del Percorso
            </h4>
            <p className="leading-relaxed text-stone-300 text-sm bg-stone-950/40 p-4 rounded-xl border border-stone-800/80">
              {trail.description}
            </p>
          </div>

          {/* Step-by-Step Itinerary */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" /> Tappe & Itinerario Dettagliato
            </h4>
            <div className="space-y-2">
              {trail.itinerary.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-stone-950/30 p-3 rounded-lg border border-stone-800/60"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-600/50 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Start & End Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Punto di Partenza
                </span>
                <span className="text-xs sm:text-sm font-semibold text-stone-200">
                  {trail.startPoint}
                </span>
                <span className="text-[11px] text-stone-400 font-mono block mt-0.5">
                  GPS: {trail.startCoords[0].toFixed(4)}°N, {trail.startCoords[1].toFixed(4)}°E
                </span>
              </div>
            </div>

            <div className="bg-stone-950/40 p-3.5 rounded-xl border border-stone-800 flex items-start gap-2.5">
              <Mountain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Punto di Arrivo / Meta
                </span>
                <span className="text-xs sm:text-sm font-semibold text-stone-200">
                  {trail.endPoint}
                </span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  Stagione consigliata: <strong className="text-stone-300">{trail.bestSeason}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Water, Flora, Fauna & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Water */}
            <div className="bg-cyan-950/20 border border-cyan-800/40 p-3.5 rounded-xl">
              <h5 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                <Droplets className="w-3.5 h-3.5" /> Fonti e Punti d'Acqua
              </h5>
              <p className="text-xs text-stone-300 leading-relaxed">
                {trail.waterSourcesDescription}
              </p>
            </div>

            {/* Flora and Fauna */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-xl">
              <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                <Trees className="w-3.5 h-3.5" /> Flora & Fauna del Parco
              </h5>
              <p className="text-xs text-stone-300 leading-relaxed">
                {trail.floraFauna}
              </p>
            </div>

            {/* Cautions */}
            <div className="bg-amber-950/20 border border-amber-800/40 p-3.5 rounded-xl">
              <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Avvertenze & Sicurezza
              </h5>
              <p className="text-xs text-stone-300 leading-relaxed">
                {trail.cautions}
              </p>
            </div>
          </div>

          {/* Equipment list */}
          <div className="bg-stone-950/40 p-4 rounded-xl border border-stone-800">
            <h5 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2">
              Equipaggiamento Consigliato
            </h5>
            <div className="flex flex-wrap gap-2">
              {trail.equipmentNeeded.map((eq, i) => (
                <span
                  key={i}
                  className="bg-stone-800/80 text-stone-300 text-xs px-2.5 py-1 rounded-lg border border-stone-700/60"
                >
                  ✓ {eq}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-2">
            <button
              id="focus-trail-map-btn"
              onClick={() => {
                onFocusOnMap(trail);
                onClose();
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              Mappa
            </button>

            {onStartNavigation && (
              <button
                id="modal-start-gps-btn"
                onClick={() => {
                  onStartNavigation(trail);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950"
              >
                <Compass className="w-4 h-4 fill-white" />
                Avvia Navigatore GPS
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              id="download-gpx-detail-btn"
              onClick={() => downloadGpxFile(trail)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-850 border border-stone-750 hover:bg-stone-700 text-stone-300 hover:text-white transition flex items-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              Scarica GPX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
