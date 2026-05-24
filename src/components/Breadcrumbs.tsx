import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { NAVIGATION_ITEMS, ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const matchedItem = NAVIGATION_ITEMS.find(item => item.path === location.pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <Link
        to={ROUTES.dashboard}
        className="flex items-center gap-1 text-slate-400 hover:text-black transition-colors"
      >
        <Home className="size-3.5" />
      </Link>

      <ChevronRight className="size-3 text-slate-300 shrink-0" />

      {pathnames.length === 0 ? (
        <span className="text-slate-900 font-semibold font-sans">Dashboard</span>
      ) : (
        <>
          <Link
            to={ROUTES.dashboard}
            className="text-slate-400 hover:text-black transition-colors"
          >
            DDSulf
          </Link>
          <ChevronRight className="size-3 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-semibold font-sans truncate capitalize">
            {matchedItem?.title || pathnames[pathnames.length - 1]}
          </span>
        </>
      )}
    </nav>
  );
}
