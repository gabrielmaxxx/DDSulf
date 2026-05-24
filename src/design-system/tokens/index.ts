/**
 * DDSulf High-Contrast Design System Tokens
 */

import { VisualTokens } from '../types';

export const NordicLightThemeTokens: VisualTokens = {
  colors: {
    primary: '#111827', // Obsidian Gray
    background: '#FAFAf9', // Clean Off-White
    surface: '#FFFFFF', // Pure White
    accent: '#4F46E5', // Nordic Indigo
    border: '#E5E7EB', // Fine Gray Border
    text: '#111827', // Jet Black
    muted: '#6B7280' // Neutral Muted
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  radius: {
    none: '0px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    full: '9999px'
  },
  shadows: {
    flat: 'none',
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    elevation: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    premium: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
  },
  transitions: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 400ms cubic-bezier(0.175, 0.885, 0.32, 1.1)'
  }
};

export const ObsidianDarkThemeTokens: VisualTokens = {
  colors: {
    primary: '#F9FAFB',
    background: '#09090B',
    surface: '#18181B',
    accent: '#6366F1',
    border: '#27272A',
    text: '#F3F4F6',
    muted: '#A1A1AA'
  },
  spacing: NordicLightThemeTokens.spacing,
  radius: NordicLightThemeTokens.radius,
  shadows: {
    flat: 'none',
    subtle: 'none',
    elevation: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    premium: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  transitions: NordicLightThemeTokens.transitions
};
