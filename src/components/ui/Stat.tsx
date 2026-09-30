import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { SeverityLevel } from '../../types';

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string | number;
    isIncreaseBad?: boolean;
    period?: string;
  };
  severity?: SeverityLevel;
  subtext?: string;
  className?: string;
  onClick?: () => void;
  size?: 'normal' | 'hero';
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  unit,
  delta,
  severity,
  subtext,
  className,
  onClick,
  size = 'normal',
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  // Smooth number transitions if numeric
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "p-6 bg-zd-surface border border-zd-border rounded-panel flex flex-col justify-between transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-zd-hover",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-micro font-sans text-zd-muted">
          {label}
        </span>
        {severity && (
          <span className={clsx(
            "w-2 h-2 rounded-full",
            severity === 'critical' ? 'bg-sev-critical animate-soft-pulse' :
            severity === 'warning' ? 'bg-sev-warning' :
            severity === 'advisory' ? 'bg-sev-advisory' : 'bg-sev-normal'
          )} />
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={clsx(
          "font-mono text-zd-text tracking-tight font-light",
          size === 'hero' ? 'text-hero' : 'text-3xl'
        )}>
          {displayValue}
        </span>
        {unit && (
          <span className="font-sans text-sm text-zd-muted font-normal">
            {unit}
          </span>
        )}
      </div>

      {(delta || subtext) && (
        <div className="mt-3 flex items-center justify-between text-xs text-zd-muted font-sans">
          {delta && (
            <div className="flex items-center gap-1 font-mono">
              {Number(delta.value) > 0 ? (
                <ArrowUpRight className={clsx("w-3.5 h-3.5", delta.isIncreaseBad ? "text-sev-critical" : "text-sev-normal")} strokeWidth={1.5} />
              ) : Number(delta.value) < 0 ? (
                <ArrowDownRight className={clsx("w-3.5 h-3.5", delta.isIncreaseBad ? "text-sev-normal" : "text-sev-critical")} strokeWidth={1.5} />
              ) : (
                <Minus className="w-3.5 h-3.5 text-zd-dim" strokeWidth={1.5} />
              )}
              <span className={clsx(
                Number(delta.value) > 0 && (delta.isIncreaseBad ? "text-sev-critical" : "text-sev-normal"),
                Number(delta.value) < 0 && (delta.isIncreaseBad ? "text-sev-normal" : "text-sev-critical")
              )}>
                {Number(delta.value) > 0 ? `+${delta.value}` : delta.value}
              </span>
              {delta.period && <span className="text-zd-dim font-sans ml-0.5">vs {delta.period}</span>}
            </div>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
