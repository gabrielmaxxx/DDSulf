import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex gap-4 items-center">
            <Skeleton className="size-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-1/3 bg-slate-100" />
              <Skeleton className="h-3 w-1/2 bg-slate-100" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-slate-100 rounded-lg" />
            <Skeleton className="h-4 w-2/3 bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  );
}
