/**
 * Touch Gesture Hook for Mobile SaaS
 * Captures touch phases, calculating swipes left/right with custom sensitivity and fluid thresholds.
 */

import { useState } from 'react';
import { TouchGestureState } from '../types';

export interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
}

export function useTouchGestures(options?: GestureOptions) {
  const threshold = options?.swipeThreshold || 50;

  const [state, setState] = useState<TouchGestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    deltaX: 0,
    deltaY: 0
  });

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
      deltaX: 0,
      deltaY: 0
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!state.isSwiping) return;

    const touch = e.touches[0];
    const dX = touch.clientX - state.startX;
    const dY = touch.clientY - state.startY;

    setState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: dX,
      deltaY: dY
    }));
  };

  const onTouchEnd = () => {
    if (!state.isSwiping) return;

    const { deltaX, deltaY } = state;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        // Horizontal Swipes
        if (deltaX > 0) {
          options?.onSwipeRight?.();
        } else {
          options?.onSwipeLeft?.();
        }
      } else {
        // Vertical Swipes
        if (deltaY > 0) {
          options?.onSwipeDown?.();
        } else {
          options?.onSwipeUp?.();
        }
      }
    }

    setState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false,
      deltaX: 0,
      deltaY: 0
    });
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    deltaX: state.deltaX,
    deltaY: state.deltaY,
    isSwiping: state.isSwiping
  };
}

export default useTouchGestures;
