export const Colors = {
  // Brand
  brand: {
    red: '#E8302A',
    orange: '#F5A623',
    blue: '#1A3D7C',
    sky: '#1AB3E8',
    pink: '#F472B6',
  },

  // Primary (Teal — used as the main app accent)
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
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

  // Sky (info)
  sky: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },

  // Violet (packing)
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    500: '#8b5cf6',
    600: '#7c3aed',
  },

  // White / Black
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Background
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  divider: '#f1f5f9',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',
};

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
