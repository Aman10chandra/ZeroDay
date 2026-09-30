import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}, ref) => {
  const base = "inline-flex items-center justify-center font-sans text-xs font-medium transition-all duration-150 select-none rounded-[6px] focus:outline-none focus:ring-1 focus:ring-zd-accent active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0";

  const variants = {
    // Primary is glacier teal
    primary: "bg-[#5CC8BE] text-[#0A0F13] font-semibold hover:bg-[#68D4CA] border border-transparent shadow-sm",
    secondary: "bg-zd-surface border border-zd-border text-zd-text hover:bg-zd-hover",
    outline: "bg-transparent border border-zd-border text-zd-text hover:bg-zd-surface",
    destructive: "bg-sev-critical text-white hover:bg-[#D93D42] border border-transparent shadow-sm",
    ghost: "bg-transparent text-zd-muted hover:text-zd-text hover:bg-zd-surface border border-transparent",
  };

  const sizes = {
    sm: "h-7 px-2.5 text-xs gap-1.5",
    md: "h-8 px-3 text-xs gap-2",
    lg: "h-10 px-4 text-sm gap-2.5",
    icon: "h-8 w-8 p-0 shrink-0",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
