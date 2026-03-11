import React from 'react';
import { clsx } from 'clsx';
import { colors, shadows, borderRadius, spacing, typography, blur } from '../../tokens';
import type { AccentColor, SemanticColor, Size } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'semantic' | 'glass';
  color?: AccentColor | SemanticColor;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<Size, { padding: string; fontSize: string }> = {
  sm: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: typography.fontSize.xs,
  },
  md: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
  },
  lg: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'accent',
  color = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const sizeStyle = sizeStyles[size];

  const getVariantStyles = () => {
    if (variant === 'semantic' && color in colors.semantic) {
      const semanticColor = colors.semantic[color as SemanticColor];
      return {
        background: `${semanticColor}20`,
        color: semanticColor,
        border: `1px solid ${semanticColor}40`,
      };
    }

    if (variant === 'accent' && color in colors.accent) {
      const accentColor = colors.accent[color as AccentColor];
      return {
        background: `${accentColor}20`,
        color: accentColor,
        border: `1px solid ${accentColor}40`,
      };
    }

    // glass variant
    return {
      background: colors.glass.medium,
      backdropFilter: `blur(${blur.sm})`,
      WebkitBackdropFilter: `blur(${blur.sm})`,
      color: colors.text.primary,
      border: `1px solid ${colors.glass.light}`,
    };
  };

  const variantStyles = getVariantStyles();

  return (
    <span
      className={clsx('badge', className)}
      style={{
        ...variantStyles,
        ...sizeStyle,
        borderRadius: borderRadius.full,
        fontWeight: typography.fontWeight.medium,
        fontFamily: typography.fontFamily.sans.join(', '),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: shadows.glass.sm,
        lineHeight: 1,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

