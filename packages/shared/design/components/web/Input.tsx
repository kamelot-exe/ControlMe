import React from 'react';
import { clsx } from 'clsx';
import { colors, shadows, borderRadius, spacing, typography, transitions, blur, borders } from '../../tokens';
import type { Size } from '../../types';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size;
  error?: boolean;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
}

const sizeStyles: Record<Size, { padding: string; fontSize: string; height: string }> = {
  sm: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
    height: '32px',
  },
  md: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
    height: '40px',
  },
  lg: {
    padding: `${spacing[4]} ${spacing[5]}`,
    fontSize: typography.fontSize.lg,
    height: '48px',
  },
};

export const Input: React.FC<InputProps> = ({
  size = 'md',
  error = false,
  fullWidth = false,
  label,
  helperText,
  className,
  ...props
}) => {
  const sizeStyle = sizeStyles[size];

  const inputElement = (
    <input
      className={clsx('input', className)}
      style={{
        background: colors.glass.medium,
        backdropFilter: `blur(${blur.md})`,
        WebkitBackdropFilter: `blur(${blur.md})`,
        borderRadius: borderRadius.md,
        border: error 
          ? `1px solid ${colors.semantic.error}` 
          : borders.glass.medium,
        boxShadow: shadows.glass.sm,
        color: colors.text.primary,
        ...sizeStyle,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: typography.fontFamily.sans.join(', '),
        transition: transitions.base,
        outline: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.border = error
          ? `1px solid ${colors.semantic.error}`
          : `1px solid ${colors.accent.primary}`;
        e.currentTarget.style.boxShadow = shadows.glass.md;
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = error
          ? `1px solid ${colors.semantic.error}`
          : borders.glass.medium;
        e.currentTarget.style.boxShadow = shadows.glass.sm;
      }}
      {...props}
    />
  );

  if (label || helperText) {
    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: spacing[2],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              fontFamily: typography.fontFamily.sans.join(', '),
            }}
          >
            {label}
          </label>
        )}
        {inputElement}
        {helperText && (
          <div
            style={{
              marginTop: spacing[1],
              fontSize: typography.fontSize.xs,
              color: error ? colors.semantic.error : colors.text.secondary,
              fontFamily: typography.fontFamily.sans.join(', '),
            }}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }

  return inputElement;
};

