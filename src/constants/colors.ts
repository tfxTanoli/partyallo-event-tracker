export const Colors = {
  // PartyAllo brand rainbow (matches logo arc left→right)
  rainbow: ['#E8302A', '#F5A623', '#F7C948', '#4CAF50', '#14b8a6', '#1A3D7C', '#9C27B0'] as const,

  // Brand accent colours (from logo)
  brand: {
    red: '#E8302A',
    orange: '#F5A623',
    yellow: '#F7C948',
    green: '#4CAF50',
    teal: '#14b8a6',
    navy: '#1A3D7C',
    purple: '#9C27B0',
    pink: '#F472B6',
  },

  // Primary (Purple — from the PartyAllo logo rainbow arc)
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Slate (neutrals)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Emerald (success / completed)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },

  // Amber (warning / in progress)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  // Rose (danger / delete)
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
  },

  // Sky (info / planning)
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },

  // Indigo (packing — distinct from the purple primary)
  violet: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    500: '#6366f1',
    600: '#4f46e5',
  },

  // White / Black
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Backgrounds
  background: '#f8f4ff',
  surface: '#ffffff',
  border: '#e2e8f0',
  divider: '#f1f5f9',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',
};

// ─── Theme system ─────────────────────────────────────────────────────────────
// A "theme" swaps the primary/accent ramp + the tinted app background.
// Semantic colours (success/warning/danger/info) stay constant across themes
// so status meaning never changes when a user re-themes the app.

export type Palette = typeof Colors;

type PrimaryRamp = Palette['primary'];

const ramps: Record<string, PrimaryRamp> = {
  purple: Colors.primary,
  ocean: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
    500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
    500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
    500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
  },
  sunset: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
    500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
  },
  midnight: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
    500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
  },
};

function makePalette(primary: PrimaryRamp, background: string): Palette {
  return { ...Colors, primary, background };
}

export interface ThemeOption {
  id: string;
  name: string;
  /** Representative colour shown in the picker swatch */
  swatch: string;
  palette: Palette;
}

export const Themes: ThemeOption[] = [
  { id: 'purple', name: 'Grape', swatch: ramps.purple[600], palette: Colors },
  { id: 'ocean', name: 'Ocean', swatch: ramps.ocean[600], palette: makePalette(ramps.ocean, '#f4f8ff') },
  { id: 'emerald', name: 'Emerald', swatch: ramps.emerald[600], palette: makePalette(ramps.emerald, '#f2fbf6') },
  { id: 'rose', name: 'Rose', swatch: ramps.rose[600], palette: makePalette(ramps.rose, '#fff4f6') },
  { id: 'sunset', name: 'Sunset', swatch: ramps.sunset[600], palette: makePalette(ramps.sunset, '#fff8f2') },
  { id: 'midnight', name: 'Indigo', swatch: ramps.midnight[600], palette: makePalette(ramps.midnight, '#f4f5fc') },
];

export const DEFAULT_THEME_ID = 'purple';

export function getThemeById(id: string | null | undefined): ThemeOption {
  return Themes.find((t) => t.id === id) ?? Themes[0];
}

// Status color mappings
export const StatusColors: Record<string, { bg: string; text: string; border: string }> = {
  Planning: { bg: Colors.sky[50], text: Colors.sky[600], border: Colors.sky[200] },
  Packing: { bg: Colors.violet[50], text: Colors.violet[600], border: Colors.violet[200] },
  'In progress': { bg: Colors.amber[50], text: Colors.amber[600], border: Colors.amber[200] },
  Completed: { bg: Colors.emerald[50], text: Colors.emerald[600], border: Colors.emerald[200] },
};

export const CategoryColors: Record<string, { bg: string; text: string }> = {
  'Food Live Station': { bg: Colors.amber[50], text: Colors.amber[600] },
  'Drinks Live Station': { bg: Colors.sky[50], text: Colors.sky[600] },
  'Desserts Live Station': { bg: Colors.rose[50], text: '#e11d48' },
  'Party Package': { bg: Colors.violet[50], text: Colors.violet[600] },
  'Craft Workshop': { bg: Colors.emerald[50], text: Colors.emerald[600] },
  Others: { bg: Colors.slate[100], text: Colors.slate[600] },
  Frozen: { bg: Colors.sky[50], text: Colors.sky[600] },
  'Room temp goods': { bg: Colors.amber[50], text: Colors.amber[600] },
  Fridge: { bg: Colors.emerald[50], text: Colors.emerald[600] },
};
