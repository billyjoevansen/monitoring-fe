'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ROLE_COLORS, ROLE_LABELS } from '@/config/rbac';
import { NavDropdown } from '@/components/navbar/NavDropdown';
import { ProfileDropdown, ProfileActions } from '@/components/navbar/ProfileDropdown';
import { useNavbar } from '@/hooks/useNavbar';
import { RouteChangeOverlay } from '@/components/ui/RouteChangeOverlay';
import type { NavItem, User } from '@/types';
import DarkModeToggle from './DarkModeToggle';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function getDropdownKey(href: string): 'arsip' | 'train' {
  return href === '#training' ? 'train' : 'arsip';
}

interface NavbarClientProps {
  user: User;
  visibleItems: NavItem[];
}

export default function NavbarClient({ user, visibleItems }: NavbarClientProps) {
  const {
    isActive,
    isGroupActive,
    mobileOpen,
    setMobileOpen,
    openDropdown,
    toggleDropdown,
    setRef,
    logoutDialogOpen,
    setLogoutDialogOpen,
    handleLogoutClick,
    confirmLogout,
    logoutLoading,
  } = useNavbar({ user });

  return (
    <>
      {/* Logout full-screen overlay */}
      <RouteChangeOverlay visible={logoutLoading} message="Keluar dari sistem..." />

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
                  ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {isActive(item.href) && (
                <span className="absolute -bottom-3.25 left-3 right-3 h-0.5 bg-green-700 dark:bg-green-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right side: dark mode toggle + profile + mobile hamburger */}
      <div className="flex items-center gap-2">
        <DarkModeToggle />
        <ProfileDropdown
          user={user}
          isOpen={openDropdown === 'profile'}
          onToggle={() => toggleDropdown('profile')}
          onLogout={handleLogoutClick}
          dropdownRef={setRef('profile')}
        />

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-100/80 dark:hover:bg-slate-600 transition-colors"
        >
          <div
            className={`transition-all duration-300 ${mobileOpen ? 'rotate-90' : 'rotate-0'}`}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-slate-300" />
            )}
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-1 right-1 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-800 rounded-sm">
            <div className="p-4 space-y-1">
              {/* User info */}
              <div className="px-3 py-3 mb-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.nama}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
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
                        ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile profile actions */}
              <div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2 space-y-1">
                <ProfileActions onLogout={handleLogoutClick} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Sistem?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan keluar dari akun <span className="font-semibold">{user.nama}</span>. Yakin
              ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogoutDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
