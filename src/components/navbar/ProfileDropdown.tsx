'use client';

import Link from 'next/link';
import { LogOut, KeyRound, ChevronDown } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/config/rbac';
import type { User } from '@/types';

export function ProfileActions({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <Link
        href="/change-password"
        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <KeyRound className="w-4 h-4" />
        Ganti Password
      </Link>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>
    </>
  );
}

interface ProfileDropdownProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  dropdownRef: (el: HTMLDivElement | null) => void;
}

export function ProfileDropdown({
  user,
  isOpen,
  onToggle,
  onLogout,
  dropdownRef,
}: ProfileDropdownProps) {
  return (
    <div ref={dropdownRef} className="relative hidden lg:block">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100/80 transition-colors"
      >
        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-green-700">
            {user.nama?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div className="text-left hidden xl:block">
          <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-30">
            {user.nama}
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">{ROLE_LABELS[user.role]}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-60 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.nama}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span
              className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[user.role]}`}
            >
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <ProfileActions onLogout={onLogout} />
        </div>
      )}
    </div>
  );
}
