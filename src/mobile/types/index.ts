/**
 * DDSulf Operational Mobile & PWA Architectural Types
 * Full type coverage for safe navigation, gestures, touch targets, and install prompt flows.
 */

export type MobileTab = 'dashboard' | 'calculator' | 'workflow' | 'financial' | 'pops';

export interface ViewportBoundaries {
  width: number;
  height: number;
  isMobile: boolean;
  hasNotch: boolean;
  statusBarHeight: number;
  bottomBarHeight: number;
}

export type GestureType = 'swipe-left' | 'swipe-right' | 'pull-to-refresh' | 'pinch' | 'tap-hold';

export interface TouchGestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
  deltaX: number;
  deltaY: number;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  promptDeferred: any | null; // BeforeInstallPromptEvent
}

export interface MobileWorkflowStep<T = any> {
  id: string;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
  data: T;
}

export interface MobileNavigationState {
  activeTab: MobileTab;
  history: MobileTab[];
  canGoBack: boolean;
}
