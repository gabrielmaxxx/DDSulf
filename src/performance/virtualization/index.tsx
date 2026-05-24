/**
 * DDSulf Extreme High-Performance DOM Virtualization Engine
 * Keeps page DOM node count extremely low when rendering massive logs, pests, tasks or financial records.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  viewportHeight: number;
  overscanCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
}

export function VirtualizedListContainer<T>({
  items,
  itemHeight,
  viewportHeight,
  overscanCount = 4,
  renderItem,
  className = '',
  emptyMessage = 'Nenhum registro encontrado nesta exibição.'
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;

  // Derive visible indexes safely
  const { startIndex, endIndex } = useMemo(() => {
    const rawStart = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, rawStart - overscanCount);
    
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const end = Math.min(items.length - 1, rawStart + visibleCount + overscanCount);

    return { startIndex: start, endIndex: end };
  }, [scrollTop, items.length, itemHeight, viewportHeight, overscanCount]);

  // Translate vertical layout spacer
  const translateY = startIndex * itemHeight;

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, idx) => {
      const actualIndex = startIndex + idx;
      return (
        <div 
          key={actualIndex} 
          style={{ height: `${itemHeight}px` }} 
          className="absolute left-0 right-0"
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [items, startIndex, endIndex, itemHeight, renderItem]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-400">
        <p className="text-xs font-bold uppercase tracking-wider">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto relative rounded-2xl border border-gray-100 bg-white shadow-inner scroller-hidden ${className}`}
      style={{ height: `${viewportHeight}px` }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
        <div
          style={{
            transform: `translate3d(0, ${translateY}px, 0)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            width: '100%'
          }}
        >
          {visibleItems}
        </div>
      </div>
    </div>
  );
}
