/**
 * Design System Tokens
 * Minimalistic Glassmorphism Theme
 */

export const colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Glass backgrounds
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    dark: 'rgba(255, 255, 255, 0.05)',
    backdrop: 'rgba(255, 255, 255, 0.08)',
  },
  
  // Accent colors
  accent: {
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Purple
    tertiary: '#EC4899', // Pink
  },
  
  // Neutral grays
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Text colors
  text: {
    primary: 'rgba(17, 24, 39, 0.95)',
    secondary: 'rgba(17, 24, 39, 0.7)',
    tertiary: 'rgba(17, 24, 39, 0.5)',
    inverse: 'rgba(255, 255, 255, 0.95)',
    inverseSecondary: 'rgba(255, 255, 255, 0.7)',
  },
} as const;

export const shadows = {
  // Glass shadows
  glass: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
    xl: '0 16px 64px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  
  // Inner shadows for depth
  inner: {
    sm: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
    md: 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
  },
  
  // Glow effects
  glow: {
    primary: '0 0 20px rgba(99, 102, 241, 0.3)',
    secondary: '0 0 20px rgba(139, 92, 246, 0.3)',
    tertiary: '0 0 20px rgba(236, 72, 153, 0.3)',
  },
} as const;

export const borderRadius = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const blur = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
} as const;

export const borders = {
  glass: {
    light: '1px solid rgba(255, 255, 255, 0.2)',
    medium: '1px solid rgba(255, 255, 255, 0.3)',
    dark: '1px solid rgba(255, 255, 255, 0.1)',
  },
  divider: '1px solid rgba(0, 0, 0, 0.06)',
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Export all tokens as a single object
export const tokens = {
  colors,
  shadows,
  borderRadius,
  spacing,
  typography,
  blur,
  borders,
  transitions,
  zIndex,
} as const;

export type Tokens = typeof tokens;

