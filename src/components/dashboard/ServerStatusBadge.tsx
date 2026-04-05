'use client';

import { useState } from 'react';
import type { ServerStatus } from '@/hooks/useDashboard';

const STATUS_DOT_COLOR: Record<ServerStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-red-500',
  loading: 'bg-yellow-500',
};

interface ServerStatusBadgeProps {
  status: ServerStatus;
}

export default function ServerStatusBadge({ status }: ServerStatusBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className={`flex items-center cursor-pointer overflow-hidden transition-all duration-300 ease-in-out bg-black/90 dark:bg-slate-700 backdrop-blur-md border border-white/10 shadow-2xl hover:bg-black ${expanded ? 'p-2 rounded-full' : 'p-2 rounded-xl'}`}
      >
        <div className="relative flex h-2.5 w-3.5 shrink-0">
          {status === 'online' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex ml-0.5 rounded-full h-2.5 w-2.5 ${STATUS_DOT_COLOR[status]}`}
          />
        </div>
        <div
          className={`flex items-center transition-all duration-300 ease-in-out ${expanded ? 'ml-3 opacity-100 max-w-50' : 'ml-0 opacity-0 max-w-0'}`}
        >
          <span className="text-[11px] font-bold tracking-wider text-white/90 font-mono whitespace-nowrap uppercase">
            {status === 'loading' ? 'Syncing...' : `API ${status}`}
          </span>
        </div>
      </div>
    </div>
  );
}
