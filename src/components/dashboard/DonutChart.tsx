interface DonutChartProps {
  normal: number;
  tidakNormal: number;
}

export default function DonutChart({ normal, tidakNormal }: DonutChartProps) {
  const total = normal + tidakNormal;
  const r = 70;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * r;

  const normalArc = total > 0 ? (normal / total) * circumference : 0;
  const tidakNormalArc = circumference - normalArc;
  const normalPct = total > 0 ? Math.round((normal / total) * 100) : 0;

  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40" aria-label="Diagram distribusi klasifikasi">
      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />

      {/* Tidak Normal segment (red) — drawn first so it appears as the "base" */}
      {total > 0 && tidakNormal > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#fca5a5"
          strokeWidth={strokeWidth}
          strokeDasharray={`${tidakNormalArc} ${circumference}`}
          strokeDashoffset={-normalArc}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Normal segment (green) — drawn on top */}
      {total > 0 && normal > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#4ade80"
          strokeWidth={strokeWidth}
          strokeDasharray={`${normalArc} ${circumference}`}
          strokeDashoffset={0}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Center label */}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#111827" fontSize="20" fontWeight="700">
        {total > 0 ? `${normalPct}%` : '–'}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize="11">
        Normal
      </text>
    </svg>
  );
}
