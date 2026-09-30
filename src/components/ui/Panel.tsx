import React from 'react';
import clsx from 'clsx';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  borderless?: boolean;
  padded?: boolean;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(({
  title,
  subtitle,
  actions,
  children,
  className,
  borderless = false,
  padded = true,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx(
        "bg-zd-surface border-zd-border flex flex-col rounded-panel transition-colors",
        !borderless && "border",
        className
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-5 py-3.5 border-b border-zd-border flex items-center justify-between gap-3 shrink-0">
          <div>
            {title && (
              <h3 className="text-xs font-sans font-medium text-zd-text">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] font-mono text-zd-muted opacity-80 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={clsx("flex-1", padded && "p-5")}>
        {children}
      </div>
    </div>
  );
});

Panel.displayName = 'Panel';
