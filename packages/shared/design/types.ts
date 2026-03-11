import { tokens } from './tokens';

export type ColorToken = typeof tokens.colors;
export type ShadowToken = typeof tokens.shadows;
export type BorderRadiusToken = typeof tokens.borderRadius;
export type SpacingToken = typeof tokens.spacing;
export type TypographyToken = typeof tokens.typography;
export type BlurToken = typeof tokens.blur;
export type BorderToken = typeof tokens.borders;
export type TransitionToken = typeof tokens.transitions;
export type ZIndexToken = typeof tokens.zIndex;

export type GlassVariant = 'light' | 'medium' | 'dark' | 'backdrop';
export type AccentColor = 'primary' | 'secondary' | 'tertiary';
export type SemanticColor = 'success' | 'warning' | 'error' | 'info';
export type Size = 'sm' | 'md' | 'lg';
export type ShadowSize = 'sm' | 'md' | 'lg' | 'xl';

