'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  normal: number;
  tidakNormal: number;
  size?: number;
}

const GRADIENTS = [
  { id: 'grad-normal', from: '#22c55e', to: '#10b981' },
  { id: 'grad-tidak-normal', from: '#ef4444', to: '#f43f5e' },
] as const;

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { percent: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: data.name === 'Normal' ? '#22c55e' : '#ef4444' }}
        />
        <span className="text-xs font-bold text-foreground">{data.name}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">
        {data.value} petani
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {(data.payload.percent * 100).toFixed(1)}% dari total
      </p>
    </div>
  );
}

export default function DonutChart({ normal, tidakNormal, size = 180 }: DonutChartProps) {
  const total = normal + tidakNormal;
  if (total === 0) return null;

  const data = [
    { name: 'Normal', value: normal, percent: normal / total },
    { name: 'Tidak Normal', value: tidakNormal, percent: tidakNormal / total },
  ];

  const normalPct = ((normal / total) * 100).toFixed(1);
  const tidakNormalPct = ((tidakNormal / total) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative transition-transform duration-300 ease-out hover:scale-105"
        style={{ width: size, height: size }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {GRADIENTS.map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.35}
              outerRadius={size * 0.47}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
              stroke="none"
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={`url(#${GRADIENTS[index].id})`} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute w-20 h-20 rounded-full bg-green-500/5 dark:bg-green-500/10 blur-xl" />
          <span className="relative text-2xl font-bold text-foreground">{total}</span>
          <span className="relative text-[10px] text-muted-foreground uppercase tracking-wide">Petani</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6">
        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Normal</p>
            <p className="text-lg font-medium text-foreground leading-none">
              {normalPct}%
            </p>
          </div>
        </div>

        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Tidak Normal</p>
            <p className="text-lg font-medium text-foreground leading-none">
              {tidakNormalPct}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
