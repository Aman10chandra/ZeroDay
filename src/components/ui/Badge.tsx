import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'mono' | 'accent' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variants = {
    neutral: 'bg-zd-raised border-zd-border text-zd-muted',
    mono: 'font-mono text-[11px] bg-zd-surface border-zd-border text-zd-muted',
    accent: 'bg-zd-accent-dim border-zd-accent/30 text-zd-accent font-medium',
    outline: 'bg-transparent border-zd-border text-zd-muted',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded-[4px] border text-[11px] leading-none',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
