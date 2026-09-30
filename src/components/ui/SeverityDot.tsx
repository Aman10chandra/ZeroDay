import React from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { SeverityLevel } from '../../types';

interface SeverityDotProps {
  level: SeverityLevel;
  label?: string;
  showIcon?: boolean;
  className?: string;
  pulse?: boolean;
}

export const SeverityDot: React.FC<SeverityDotProps> = ({
  level,
  label,
  showIcon = true,
  className,
  pulse = false,
}) => {
  const configs = {
    safe: {
      text: label || 'Normal',
      color: '#4CB782',
      textColor: 'text-sev-normal',
      icon: CheckCircle2,
    },
    advisory: {
      text: label || 'Advisory',
      color: '#D9B44A',
      textColor: 'text-sev-advisory',
      icon: Info,
    },
    warning: {
      text: label || 'Warning',
      color: '#E8843A',
      textColor: 'text-sev-warning',
      icon: AlertTriangle,
    },
    critical: {
      text: label || 'Critical',
      color: '#E5484D',
      textColor: 'text-sev-critical',
      icon: AlertOctagon,
    },
  };

  const cfg = configs[level] || configs.safe;
  const Icon = cfg.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-sans font-medium select-none",
        cfg.textColor,
        className
      )}
    >
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        {(pulse || level === 'critical') && (
          <span 
            style={{ backgroundColor: cfg.color }}
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" 
          />
        )}
        <span 
          style={{ backgroundColor: cfg.color }}
          className="relative inline-flex rounded-full h-1.5 w-1.5" 
        />
      </span>

      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />}
      <span>{cfg.text}</span>
    </span>
  );
};
