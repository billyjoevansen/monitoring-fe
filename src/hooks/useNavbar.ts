import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { hasPermission } from '@/config/rbac';
import { NAV_ITEMS } from '@/config/navConfig';
import type { User } from '@/types';

type DropdownKey = 'arsip' | 'train' | 'profile';

export function useNavbar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const dropdownRefs = useRef<Partial<Record<DropdownKey, HTMLDivElement | null>>>({});
  const setRef = useCallback(
    (key: DropdownKey) => (el: HTMLDivElement | null) => {
      dropdownRefs.current[key] = el;
    },
    [],
  );

  const toggleDropdown = useCallback(
    (key: DropdownKey) => setOpenDropdown((prev) => (prev === key ? null : key)),
    [],
  );

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const clickedOutsideAll = Object.values(dropdownRefs.current).every(
        (ref) => !ref?.contains(e.target as Node),
      );
      if (clickedOutsideAll) closeDropdown();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [closeDropdown]);

  useEffect(() => {
    setMobileOpen(false);
    closeDropdown();
  }, [pathname, closeDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.clear();
      router.refresh();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user.role, item.permission),
  );

  const isActive = (href: string) => {
    // 1. Jika href biasa (misal /dashboard)
    if (href.startsWith('/')) {
      return pathname === href;
    }

    // 2. Jika href diawali '#' (misal #training)
    if (href.startsWith('#')) {
      const slug = href.replace('#', ''); // 'training'
      // Cek apakah pathname mengandung kata 'training' (misal /training atau /training/settings)
      return pathname.includes(slug);
    }

    return false;
  };

  const isGroupActive = (groupHref: string) =>
    NAV_ITEMS.find((i) => i.href === groupHref)?.children?.some((c) => pathname === c.href) ??
    false;

  return {
    visibleItems,
    isActive,
    isGroupActive,
    mobileOpen,
    setMobileOpen,
    openDropdown,
    toggleDropdown,
    setRef,
    handleLogout,
  };
}
