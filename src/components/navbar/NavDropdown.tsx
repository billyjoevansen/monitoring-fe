'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { NavDropdownProps } from '@/types';

export function NavDropdown({
  item,
  isOpen,
  isGroupActive,
  onToggle,
  isActive,
  variant,
  dropdownRef,
  onNavigate,
}: NavDropdownProps) {
  const Icon = item.icon;
  const router = useRouter();
  const activeButtonCls = isGroupActive
    ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/80';

  if (variant === 'desktop') {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={onToggle}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeButtonCls}`}
        >
          <Icon className="w-4 h-4" />
          {item.label}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
          {isGroupActive && (
            <span className="absolute -bottom-3.25 left-3 right-3 h-0.5 bg-green-700 dark:bg-green-400 rounded-full" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 shadow-lg shadow-gray-200/50 dark:shadow-black/30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    isActive(child.href)
                      ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30 font-medium'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ChildIcon className="w-4 h-4" />
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Mobile variant
  return (
    <div ref={dropdownRef} className="space-y-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeButtonCls}`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4" />
          {item.label}
        </div>

        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4 border-l border-gray-300 dark:border-slate-700 space-y-1">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return (
              <button
                key={child.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(child.href);
                  onToggle();
                  onNavigate?.();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                  isActive(child.href)
                    ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30 font-medium'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <ChildIcon className="w-4 h-4" />
                {child.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
