import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  Palette,
  Themes,
  ThemeOption,
  DEFAULT_THEME_ID,
  getThemeById,
} from '../constants/colors';
import { loadData, saveData, KEYS } from '../utils/storage';

interface ThemeContextValue {
  /** Active palette — alias this to `Colors` in components for drop-in use. */
  colors: Palette;
  themeId: string;
  themes: ThemeOption[];
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);

  // Load saved theme once on startup
  useEffect(() => {
    (async () => {
      const saved = await loadData<string>(KEYS.THEME, DEFAULT_THEME_ID);
      setThemeIdState(saved);
    })();
  }, []);

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    saveData(KEYS.THEME, id);
  };

  const colors = useMemo(() => getThemeById(themeId).palette, [themeId]);

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, themeId, themes: Themes, setThemeId }),
    [colors, themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * Build a StyleSheet from the active palette, memoised per theme.
 * Usage:
 *   const styles = useThemedStyles(makeStyles);
 *   const makeStyles = (Colors: Palette) => StyleSheet.create({ ... });
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: Palette) => T
): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
