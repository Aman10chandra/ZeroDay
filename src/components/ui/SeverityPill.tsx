import React from 'react';
import clsx from 'clsx';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { SeverityLevel } from '../../types';

interface SeverityPillProps {
  level: SeverityLevel;
  label?: string;
  showIcon?: boolean;
  className?: string;
  pulse?: boolean;
}

export const SeverityPill: React.FC<SeverityPillProps> = ({
  level,
  label,
  showIcon = true,
  className,
  pulse = false,
}) => {
  const configs = {
    safe: {
      text: label || 'Normal',
      textColor: 'text-[#2E7D4F] dark:text-[#389E65]',
      bg: 'bg-sev-safe-dim border-sev-safe/30',
      dot: 'bg-sev-safe',
      icon: CheckCircle2,
    },
    advisory: {
      text: label || 'Advisory',
      textColor: 'text-[#C49B1A] dark:text-[#C79200]',
      bg: 'bg-sev-advisory-dim border-sev-advisory/30',
      dot: 'bg-sev-advisory',
      icon: Info,
    },
    warning: {
      text: label || 'Warning',
      textColor: 'text-[#D97316] dark:text-[#E87214]',
      bg: 'bg-sev-warning-dim border-sev-warning/30',
      dot: 'bg-sev-warning',
      icon: AlertTriangle,
    },
    critical: {
      text: label || 'Critical',
      textColor: 'text-[#D32F2F] dark:text-[#D9382E]',
      bg: 'bg-sev-critical-dim border-sev-critical/40',
      dot: 'bg-sev-critical',
      icon: AlertOctagon,
    },
  };

  const cfg = configs[level] || configs.safe;
  const IconComponent = cfg.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border font-mono text-[11px] font-semibold tracking-[0.04em] uppercase",
        cfg.bg,
        cfg.textColor,
        className
      )}
    >
      <span
        className={clsx(
          "w-1.5 h-1.5 rounded-full shrink-0",
          cfg.dot,
          (pulse || level === 'critical') && "animate-live-pulse"
        )}
      />
      {showIcon && <IconComponent className="w-3 h-3 shrink-0" strokeWidth={2} />}
      <span>{cfg.text}</span>
    </span>
  );
};
