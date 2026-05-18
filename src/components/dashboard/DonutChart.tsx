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
          {/* Background */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />

          {/* Tidak Normal */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />

          {/* Normal */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#22c55e"
            strokeWidth={strokeWidth}
            strokeDasharray={`${normalLength} ${circumference - normalLength}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-[10px] text-foreground uppercase tracking-wide">Petani</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Normal</p>
            <p className="text-lg font-medium text-foreground leading-none">
              {normalPct.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-200" />

        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tidak Normal</p>
            <p className="text-lg font-medium text-foreground leading-none">
              {tidakNormalPct.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
