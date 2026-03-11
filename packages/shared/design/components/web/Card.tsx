import React from 'react';
import { clsx } from 'clsx';
import { colors, shadows, borderRadius, borders, blur } from '../../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'medium' | 'dark';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: keyof typeof borderRadius;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'medium',
  shadow = 'md',
  rounded = 'lg',
  children,
  className,
  ...props
}) => {
  const glassBg = colors.glass[variant];
  const shadowValue = shadows.glass[shadow];
  const roundedValue = borderRadius[rounded];

  return (
    <div
      className={clsx('card', className)}
      style={{
        background: glassBg,
        backdropFilter: `blur(${blur.md})`,
        WebkitBackdropFilter: `blur(${blur.md})`,
        borderRadius: roundedValue,
        boxShadow: shadowValue,
        border: borders.glass.medium,
        transition: 'all 200ms ease-in-out',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

