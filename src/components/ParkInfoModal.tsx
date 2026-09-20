import { X, PhoneCall, ShieldAlert, Trees, Mountain, ThermometerSun, Compass } from 'lucide-react';

interface ParkInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ParkInfoModal({ isOpen, onClose }: ParkInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">
                Guida & Sicurezza nel Parco Nazionale del Pollino
              </h3>
              <p className="text-xs text-stone-400">
                Informazioni ufficiali, soccorso alpino e norme di comportamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-stone-300">
          {/* Emergency Box */}
          <div className="bg-rose-950/30 border border-rose-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base mb-2">
              <PhoneCall className="w-5 h-5" />
              Numeri di Emergenza & Soccorso Alpino (CNSAS)
            </div>
            <p className="text-xs text-stone-300 mb-3 leading-relaxed">
              In caso di infortunio, smarrimento o emergenza in quota nel massiccio del Pollino, contattare immediatamente:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-rose-900/50">
                <span className="text-[10px] text-stone-400 block uppercase">Numero Unico</span>
                <strong className="text-rose-400 text-base font-mono">112</strong>
                <span className="block text-[10px] text-stone-400">Chiedere Soccorso Alpino</span>
              </div>
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-rose-900/50">
                <span className="text-[10px] text-stone-400 block uppercase">Emergenza Sanitaria</span>
                <strong className="text-rose-400 text-base font-mono">118</strong>
                <span className="block text-[10px] text-stone-400">Centrale Operativa</span>
              </div>
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-rose-900/50">
                <span className="text-[10px] text-stone-400 block uppercase">CNSAS Basilicata / Calabria</span>
                <strong className="text-emerald-400 text-xs font-mono">Stazione Pollino</strong>
                <span className="block text-[10px] text-stone-400">Operativi 24/7 su territorio</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-2 italic">
              * Nota: In molte valli e gole del Pollino la copertura della rete cellulare è assente. Pianificate il rientro e comunicate il percorso prescelto a parenti o gestori del rifugio.
            </p>
          </div>

          {/* The 5 Peaks */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-amber-400" /> I 5 Giganti oltre i 2.000 Metri
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800">
                <div className="font-bold text-amber-300">1. Serra Dolcedorme (2.267 m)</div>
                <div className="text-stone-400 text-[11px] mt-0.5">La vetta più alta dell'Appennino Meridionale. Strapiombi a sud verso la Calabria.</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800">
                <div className="font-bold text-amber-300">2. Monte Pollino (2.248 m)</div>
                <div className="text-stone-400 text-[11px] mt-0.5">La cupola simbolo che domina i piani. Vista contemporanea su Mar Ionio e Tirreno.</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800">
                <div className="font-bold text-amber-300">3. Serra del Prete (2.181 m)</div>
                <div className="text-stone-400 text-[11px] mt-0.5">Vasta cresta d'erba e calcare che scende verso Morano Calabro e Rotonda.</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800">
                <div className="font-bold text-amber-300">4. Serra delle Ciavole (2.127 m)</div>
                <div className="text-stone-400 text-[11px] mt-0.5">Culla dei "Patriarchi d'Argento", dove vive il pino millenario Italus (1.230+ anni).</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800 sm:col-span-2">
                <div className="font-bold text-amber-300">5. Serra di Crispo (2.053 m)</div>
                <div className="text-stone-400 text-[11px] mt-0.5">Custode del celeberrimo "Giardino degli Dei", un anfiteatro naturale di sculture vegetali viventi.</div>
              </div>
            </div>
          </div>

          {/* Il Pino Loricato */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
              <Trees className="w-4 h-4" /> Il Pino Loricato (Pinus heldreichii)
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed mb-2">
              È il vero emblema del Parco Nazionale del Pollino. Considerato un fossile vivente risalente all'era glaciale, cresce esclusivamente sulle rupi calcaree oltre i 1.800 metri dove nessun altro albero riesce a sopravvivere. La sua corteccia si spacca in placche trapezoidali che ricordano la <em>lorica</em> (la corazza a piastre dei legionari romani).
            </p>
            <div className="text-[11px] text-emerald-400/90 font-medium">
              ⚠️ Tutela assoluta: è severamente vietato scalare i tronchi, staccare scaglie di corteccia o incidere i rami dei pini loricati viventi e scheletriti.
            </div>
          </div>

          {/* Park Rules */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Regolamento del Parco per gli Escursionisti
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Rifiuti a valle:</strong> Non lasciare alcun rifiuto (inclusi fazzoletti e scarti organici, che alterano l'ecosistema d'alta quota).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Segnavia CAI:</strong> Rimanere sempre sui sentieri tracciati con i segnavia bianco-rossi per prevenire l'erosione del suolo carsico.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Cani al guinzaglio:</strong> Nel parco vige l'obbligo del guinzaglio per salvaguardare la fauna selvatica (caprioli, lupi, lepri).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Divieto di accensione fuochi:</strong> Rischio gravissimo di incendi forestali, specie nelle pinete e faggete.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            Ho capito, grazie
          </button>
        </div>
      </div>
    </div>
  );
}
