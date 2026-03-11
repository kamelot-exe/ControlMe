import React from 'react';
import { clsx } from 'clsx';
import { colors, shadows, borderRadius, spacing, typography, transitions, blur } from '../../tokens';
import type { AccentColor, Size } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  color?: AccentColor;
  size?: Size;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<Size, { padding: string; fontSize: string; height: string }> = {
  sm: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.sm,
    height: '32px',
  },
  md: {
    padding: `${spacing[3]} ${spacing[6]}`,
    fontSize: typography.fontSize.base,
    height: '40px',
  },
  lg: {
    padding: `${spacing[4]} ${spacing[8]}`,
    fontSize: typography.fontSize.lg,
    height: '48px',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const accentColor = colors.accent[color];
  const sizeStyle = sizeStyles[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: accentColor,
          color: colors.text.inverse,
          border: 'none',
          boxShadow: shadows.glass.md,
        };
      case 'secondary':
        return {
          background: colors.glass.medium,
          color: accentColor,
          border: `1px solid ${accentColor}40`,
          boxShadow: shadows.glass.sm,
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: accentColor,
          border: 'none',
          boxShadow: 'none',
        };
      case 'glass':
        return {
          background: colors.glass.medium,
          backdropFilter: `blur(${blur.md})`,
          WebkitBackdropFilter: `blur(${blur.md})`,
          color: colors.text.primary,
          border: `1px solid ${colors.glass.light}`,
          boxShadow: shadows.glass.sm,
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      className={clsx('button', className)}
      disabled={disabled}
      style={{
        ...variantStyles,
        ...sizeStyle,
        borderRadius: borderRadius.md,
        fontWeight: typography.fontWeight.medium,
        fontFamily: typography.fontFamily.sans.join(', '),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: transitions.base,
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = variant === 'primary' 
            ? shadows.glow[color] 
            : shadows.glass.lg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = variantStyles.boxShadow as string;
      }}
      {...props}
    >
      {children}
    </button>
  );
};

