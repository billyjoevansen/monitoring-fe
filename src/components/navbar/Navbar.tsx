'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/rbac';
import { NavDropdown } from '@/components/navbar/NavDropdown';
import { ProfileDropdown, ProfileActions } from '@/components/navbar/ProfileDropdown';
import { useNavbar } from '@/hooks/useNavbar';
import type { User } from '@/types';

function getDropdownKey(href: string): 'arsip' | 'train' {
  return href === '#training' ? 'train' : 'arsip';
}

export default function Navbar({ user }: { user: User }) {
  const {
    visibleItems,
    isActive,
    isGroupActive,
    mobileOpen,
    setMobileOpen,
    openDropdown,
    toggleDropdown,
    setRef,
    handleLogout,
  } = useNavbar({ user });

  return (
    <>
      <nav className="fixed top-3 left-1 right-1 z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/60 rounded-md outline-2 outline-black">
        <div className="max-w-400 mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/Logo_Kota_Serang.webp"
                alt="Simpubes Serang"
                width={55}
                height={55}
                className="object-contain"
              />
              <span className="text-base font-bold text-gray-900 tracking-tight sm:block">
                Simpubes Serang
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {visibleItems.map((item) => {
                if (item.children) {
                  const key = getDropdownKey(item.href);
                  return (
                    <NavDropdown
                      key={item.href}
                      item={item}
                      variant="desktop"
                      isOpen={openDropdown === key}
                      isGroupActive={isGroupActive(item.href)}
                      onToggle={() => toggleDropdown(key)}
                      isActive={isActive}
                      dropdownRef={setRef(key)}
                    />
                  );
                }

                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-3.25 left-3 right-3 h-0.5 bg-green-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <ProfileDropdown
                user={user}
                isOpen={openDropdown === 'profile'}
                onToggle={() => toggleDropdown('profile')}
                onLogout={handleLogout}
                dropdownRef={setRef('profile')}
              />

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-200 hover:bg-gray-100/80 transition-colors"
              >
                <div
                  className={`transition-all duration-300 ${mobileOpen ? 'rotate-90' : 'rotate-0'}`}
                >
                  {mobileOpen ? (
                    <X className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-700" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-1 right-1 bg-white border-b border-gray-200 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-800 rounded-sm">
            <div className="p-4 space-y-1">
              {/* User info */}
              <div className="px-3 py-3 mb-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">{user.nama}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${ROLE_COLORS[user.role]}`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>

              {/* Nav items */}
              {visibleItems.map((item) => {
                if (item.children) {
                  const key = getDropdownKey(item.href);
                  return (
                    <NavDropdown
                      key={item.href}
                      item={item}
                      variant="mobile"
                      isOpen={openDropdown === key}
                      isGroupActive={isGroupActive(item.href)}
                      onToggle={() => toggleDropdown(key)}
                      isActive={isActive}
                    />
                  );
                }

                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(item.href)
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile profile actions */}
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                <ProfileActions onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
