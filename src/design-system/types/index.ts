/**
 * DDSulf Advanced Design System & Visual Architecture Types
 */

export type ThemeMode = 'nordic_light' | 'obsidian_dark' | 'industrial_slate';

export type ComponentDensity = 'compact' | 'comfortable' | 'dense_operational';

export interface VisualTokens {
  colors: {
    primary: string;
    background: string;
    surface: string;
    accent: string;
    border: string;
    text: string;
    muted: string;
  };
  spacing: Record<string, string>;
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

export interface CommandShortcut {
  key: string;
  description: string;
  action: () => void;
}
