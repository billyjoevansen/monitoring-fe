import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-client';
import { hasPermission } from '@/config/rbac';
import { NAV_ITEMS } from '@/config/navConfig';
import type { User } from '@/types';

type DropdownKey = 'arsip' | 'arsip-dokumen' | 'train' | 'profile';

export function useNavbar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    closeDropdown();
  }, [pathname, closeDropdown]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    closeDropdown();
  };

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    setLogoutLoading(true);
    try {
      await logout();
      sessionStorage.clear();
      router.refresh();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setLogoutLoading(false);
    }
    // Keep logoutLoading=true until the page unmounts/redirects
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user.role, item.permission),
  );

  const isActive = (href: string) => {
    if (href.startsWith('/')) {
      return pathname === href;
    }

    if (href.startsWith('#')) {
      const slug = href.replace('#', '');
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
    logoutDialogOpen,
    setLogoutDialogOpen,
    handleLogoutClick,
    confirmLogout,
    logoutLoading,
  };
}
