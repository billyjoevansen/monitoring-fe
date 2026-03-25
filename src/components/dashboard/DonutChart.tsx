'use client';

interface DonutChartProps {
  normal: number;
  tidakNormal: number;
  size?: number;
}

export default function DonutChart({ normal, tidakNormal, size = 180 }: DonutChartProps) {
  const total = normal + tidakNormal;
  if (total === 0) return null;

  const normalPct = (normal / total) * 100;
  const tidakNormalPct = (tidakNormal / total) * 100;

  const radius = 70;
  const strokeWidth = 28;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const normalLength = (normalPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {/* Tidak Normal arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-700 ease-out"
          />
          {/* Normal arc (on top) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeDasharray={`${normalLength} ${circumference - normalLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-[10px] text-foreground uppercase tracking-wide">Petani</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <div>
            <p className="text-xs text-foreground">Normal</p>
            <p className="text-sm font-bold text-foreground">
              {normal}{' '}
              <span className="text-xs font-normal text-gray-400">({normalPct.toFixed(1)}%)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <div>
            <p className="text-xs text-foreground">Tidak Normal</p>
            <p className="text-sm font-bold text-foreground">
              {tidakNormal}{' '}
              <span className="text-xs font-normal text-gray-400">
                ({tidakNormalPct.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
