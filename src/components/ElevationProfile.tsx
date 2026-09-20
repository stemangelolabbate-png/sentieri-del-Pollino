import { useState } from 'react';
import { ElevationPoint } from '../types';
import { Mountain, TrendingUp, TrendingDown, Navigation } from 'lucide-react';

interface ElevationProfileProps {
  points: ElevationPoint[];
  minAltitude: number;
  maxAltitude: number;
  elevationGain: number;
  elevationLoss: number;
  lengthKm: number;
}

export function ElevationProfile({
  points,
  minAltitude,
  maxAltitude,
  elevationGain,
  elevationLoss,
  lengthKm,
}: ElevationProfileProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ElevationPoint | null>(null);

  if (!points || points.length === 0) return null;

  // Chart dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const altRange = Math.max(maxAltitude - minAltitude, 100);
  const maxDist = points[points.length - 1]?.distKm || lengthKm || 1;

  const getX = (dist: number) => paddingX + (dist / maxDist) * chartWidth;
  const getY = (alt: number) =>
    paddingTop + chartHeight - ((alt - minAltitude) / altRange) * chartHeight;

  // Build SVG path
  const pathD = points.reduce((acc, pt, i) => {
    const x = getX(pt.distKm);
    const y = getY(pt.altitude);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points[points.length - 1].distKm)} ${paddingTop + chartHeight} L ${getX(points[0].distKm)} ${paddingTop + chartHeight} Z`;

  return (
    <div id="elevation-profile-container" className="bg-stone-900/50 rounded-xl p-4 border border-stone-800">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Profilo Altimetrico Interattivo
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +{elevationGain}m
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5" /> -{elevationLoss}m
          </span>
          <span className="text-stone-300">
            Max: <strong className="text-stone-100">{maxAltitude}m</strong>
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minWidth: '320px' }}
        >
          <defs>
            <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#059669" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#44403c"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="#292524"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight}
            x2={width - paddingX}
            y2={paddingTop + chartHeight}
            stroke="#44403c"
            strokeWidth="1"
          />

          {/* Y Axis Altitude Labels */}
          <text
            x={paddingX - 6}
            y={paddingTop + 4}
            textAnchor="end"
            fontSize="10"
            fill="#a8a29e"
          >
            {maxAltitude}m
          </text>
          <text
            x={paddingX - 6}
            y={paddingTop + chartHeight + 4}
            textAnchor="end"
            fontSize="10"
            fill="#a8a29e"
          >
            {minAltitude}m
          </text>

          {/* Area under curve */}
          <path d={areaD} fill="url(#elevationGrad)" />

          {/* Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Waypoint Labels */}
          {points.map((pt, i) => {
            const x = getX(pt.distKm);
            const y = getY(pt.altitude);
            const isHovered = hoveredPoint?.distKm === pt.distKm;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Vertical tick */}
                <line
                  x1={x}
                  y1={paddingTop + chartHeight}
                  x2={x}
                  y2={paddingTop + chartHeight + 5}
                  stroke="#78716c"
                  strokeWidth="1"
                />

                {/* Waypoint circle dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : pt.label ? 4.5 : 3}
                  fill={isHovered ? '#34d399' : pt.label ? '#10b981' : '#a8a29e'}
                  stroke="#1c1917"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* X Axis distance text for first, last and intermediate */}
                {(i === 0 || i === points.length - 1 || pt.label) && (
                  <text
                    x={x}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#78716c"
                  >
                    {pt.distKm.toFixed(1)} km
                  </text>
                )}

                {/* Waypoint label tag above key peaks */}
                {pt.label && (
                  <text
                    x={x}
                    y={Math.max(y - 10, 14)}
                    textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                    fontSize="9"
                    fontWeight="600"
                    fill="#d6d3d1"
                    className="pointer-events-none drop-shadow"
                  >
                    {pt.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-4 bg-stone-950/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs shadow-lg backdrop-blur-sm pointer-events-none"
          >
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Navigation className="w-3 h-3" />
              {hoveredPoint.label || `Km ${hoveredPoint.distKm.toFixed(1)}`}
            </div>
            <div className="text-stone-300 mt-0.5">
              Quota: <strong className="text-white">{hoveredPoint.altitude} m</strong> s.l.m.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
