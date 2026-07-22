'use client';

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ActivityLog {
  id: number;
  action: string;
  created_at: string;
}

interface ActivityChartProps {
  activities: ActivityLog[];
  userRole: string;
  loading?: boolean;
}

type ViewMode = 'daily' | 'hourly';

const ACTION_CONFIG: Record<string, { label: string; color: string; gradientTo: string }> = {
  upload_document: { label: 'Upload', color: '#3b82f6', gradientTo: '#60a5fa' },
  delete_document: { label: 'Hapus', color: '#ef4444', gradientTo: '#f87171' },
  edit_document: { label: 'Edit', color: '#f97316', gradientTo: '#fb923c' },
  reconcile: { label: 'Rekonsiliasi', color: '#22c55e', gradientTo: '#4ade80' },
  classify: { label: 'Klasifikasi', color: '#a855f7', gradientTo: '#c084fc' },
  login: { label: 'Login', color: '#64748b', gradientTo: '#94a3b8' },
  logout: { label: 'Logout', color: '#94a3b8', gradientTo: '#cbd5e1' },
  create_user: { label: 'Buat User', color: '#f59e0b', gradientTo: '#fbbf24' },
  update_user: { label: 'Update User', color: '#f97316', gradientTo: '#fb923c' },
};

const BPP_ALLOWED_ACTIONS = ['reconcile', 'upload_document', 'delete_document', 'edit_document'];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function padZero(n: number) {
  return String(n).padStart(2, '0');
}

function groupByDay(activities: ActivityLog[]) {
  const grouped: Record<string, { actions: Record<string, number>; sortKey: string }> = {};

  activities.forEach(({ action, created_at }) => {
    const date = new Date(created_at);
    const day = date.getDate();
    const month = date.getMonth();
    const sortKey = `${date.getFullYear()}${padZero(month + 1)}${padZero(day)}`;

    if (!grouped[sortKey]) {
      grouped[sortKey] = { actions: {}, sortKey };
    }

    grouped[sortKey].actions[action] = (grouped[sortKey].actions[action] || 0) + 1;
  });

  return Object.values(grouped)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ actions, sortKey }) => {
      const month = parseInt(sortKey.slice(4, 6)) - 1;
      const day = parseInt(sortKey.slice(6, 8));
      const entry: Record<string, string | number> = { date: `${day} ${MONTH_NAMES[month]}` };

      Object.keys(ACTION_CONFIG).forEach((action) => {
        entry[action] = actions[action] || 0;
      });

      return entry;
    });
}

function groupByHour(activities: ActivityLog[]) {
  const grouped: Record<string, { actions: Record<string, number>; sortKey: string; dateLabel: string }> = {};

  activities.forEach(({ action, created_at }) => {
    const date = new Date(created_at);
    const day = date.getDate();
    const month = date.getMonth();
    const hour = date.getHours();
    const sortKey = `${date.getFullYear()}${padZero(month + 1)}${padZero(day)}${padZero(hour)}`;

    if (!grouped[sortKey]) {
      grouped[sortKey] = { actions: {}, sortKey, dateLabel: `${day} ${MONTH_NAMES[month]}` };
    }

    grouped[sortKey].actions[action] = (grouped[sortKey].actions[action] || 0) + 1;
  });

  const result: Array<Record<string, string | number>> = [];
  Object.values(grouped)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .forEach(({ actions, sortKey }) => {
      const hour = parseInt(sortKey.slice(8, 10));
      const entry: Record<string, string | number> = {
        date: `${padZero(hour)}:00`,
      };
      Object.keys(ACTION_CONFIG).forEach((action) => {
        entry[action] = actions[action] || 0;
      });
      result.push(entry);
    });
  return result;
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, item) => sum + item.value, 0);
  const nonZero = payload.filter((item) => item.value > 0);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl px-4 py-3 min-w-45">
      <p className="text-xs font-bold text-foreground mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
        {label}
      </p>
      <div className="space-y-1.5">
        {nonZero.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-xs font-bold text-foreground">{total}</span>
      </div>
    </div>
  );
}

export default function ActivityChart({
  activities,
  userRole,
  loading = false,
}: ActivityChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('hourly');

  const activeActions = useMemo(() => {
    if (!activities.length) return [];

    const usedActions = new Set(activities.map(({ action }) => action));
    return Object.entries(ACTION_CONFIG)
      .filter(([action]) => {
        if (!usedActions.has(action)) return false;
        if (userRole === 'bpp') return BPP_ALLOWED_ACTIONS.includes(action);
        return true;
      })
      .map(([action, config]) => ({ action, ...config }));
  }, [activities, userRole]);

  const chartData = useMemo(() => {
    if (!activities.length) return [];
    const allowedActions = new Set(activeActions.map((a) => a.action));
    const data = viewMode === 'daily' ? groupByDay(activities) : groupByHour(activities);
    return data.map((entry) => {
      const filtered: Record<string, string | number> = { date: entry.date };
      Object.keys(entry).forEach((key) => {
        if (key === 'date' || allowedActions.has(key)) {
          filtered[key] = entry[key];
        }
      });
      return filtered;
    });
  }, [activities, viewMode, activeActions]);

  const totalActivities = activities.length;

  const hourlyDateRange = useMemo(() => {
    if (viewMode !== 'hourly' || !activities.length) return null;
    const dates = activities.map((a) => new Date(a.created_at));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
    return `${earliest.getDate()} ${MONTH_NAMES[earliest.getMonth()]} — ${latest.getDate()} ${MONTH_NAMES[latest.getMonth()]}`;
  }, [activities, viewMode]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Monitor Aktivitas</h3>
            <p className="text-xs text-muted-foreground">{totalActivities} aktivitas tercatat</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {activeActions.map(({ action, label, color }) => {
                const count = activities.filter((a) => a.action === action).length;
                return (
                  <div key={action} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <span className="text-[11px] font-semibold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Per Hari
          </button>
          <button
            onClick={() => setViewMode('hourly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              viewMode === 'hourly'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Per Jam
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Belum ada aktivitas tercatat
        </div>
      ) : (
        <div>
          {viewMode === 'hourly' && hourlyDateRange && (
            <p className="text-xs text-muted-foreground mb-2 text-center">
              {hourlyDateRange}
            </p>
          )}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                barCategoryGap={viewMode === 'hourly' ? '15%' : '20%'}
              >
                <defs>
                  {activeActions.map(({ action, color, gradientTo }) => (
                    <linearGradient
                      key={`grad-${action}`}
                      id={`grad-${action}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={gradientTo} />
                      <stop offset="100%" stopColor={color} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: viewMode === 'hourly' ? 11 : 12,
                    fill: '#9ca3af',
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickMargin={8}
                  interval={viewMode === 'hourly' ? 'preserveStartEnd' : 0}
                  angle={viewMode === 'hourly' ? -45 : 0}
                  textAnchor={viewMode === 'hourly' ? 'end' : 'middle'}
                  height={viewMode === 'hourly' ? 50 : 30}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tickMargin={4}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.06)', radius: 8 }}
                />
                {activeActions.map(({ action, label }, index) => (
                  <Bar
                    key={action}
                    dataKey={action}
                    name={label}
                    stackId="a"
                    fill={`url(#grad-${action})`}
                    radius={index === activeActions.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    cursor="pointer"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
