'use client';

import Link from 'next/link';
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
}: NavDropdownProps) {
  const Icon = item.icon;
  const activeButtonCls = isGroupActive
    ? 'text-green-700 bg-green-50'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80';

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
            <span className="absolute -bottom-3.25 left-3 right-3 h-0.5 bg-green-700 rounded-full" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                    isActive(child.href)
                      ? 'text-green-700 bg-green-50 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
    <div ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${activeButtonCls}`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4" />
          {item.label}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="ml-6 mt-1 space-y-0.5">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                  isActive(child.href)
                    ? 'text-green-700 bg-green-50 font-medium'
                    : 'text-gray-500 hover:text-gray-800'
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
