import React from 'react';
import { AlertOctagon, Triangle, AlertCircle, CheckCircle2, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

/**
 * OverviewWardRow:
 * Precision 2-line data row with fixed-width right column for tabular scanning.
 * - Min height 64px, padding 12px 16px, full row tappable.
 * - Left column (24px wide): 20px Lucide distinct geometric severity icon (1.5px stroke).
 * - Middle: Line 1 name (16/600, single line ellipsis), Line 2 severity word + reason (14px muted).
 * - Right column (fixed 88px, right-aligned): Line 1 18px mono number + 13px muted unit, Line 2 12px trend arrow + mono delta.
 * - No chip, no left border, no sparklines.
 */
export default function OverviewWardRow({ territory, onSelect }) {
  const {
    id,
    name,
    telemetry,
    reason,
    severity,
    trend = '+12%/h',
    trendDirection = 'rising' // 'rising' | 'steady' | 'falling'
  } = territory;

  const isCritical = severity === 'critical';
  const isWarning = severity === 'warning';
  const isAdvisory = severity === 'advisory';
  const isNormal = severity === 'safe' || severity === 'normal';

  // Left 20px severity icon (distinct shape per severity, 1.5px stroke)
  const renderIcon = () => {
    if (isCritical) {
      return (
        <AlertOctagon
          className="w-5 h-5 text-[#C1271D] dark:text-[#D9382E] fill-[#C1271D] dark:fill-[#D9382E]"
          strokeWidth={1.5}
          aria-label="Critical incident"
        />
      );
    }
    if (isWarning) {
      return (
        <Triangle
          className="w-5 h-5 text-[#D2620A] dark:text-[#E6731B]"
          strokeWidth={1.5}
          aria-label="Warning status"
        />
      );
    }
    if (isAdvisory) {
      return (
        <AlertCircle
          className="w-5 h-5 text-[#A87A00] dark:text-[#C29214]"
          strokeWidth={1.5}
          aria-label="Advisory status"
        />
      );
    }
    return (
      <CheckCircle2
        className="w-5 h-5 text-[#2E7D4F] dark:text-[#3FA66A]"
        strokeWidth={1.5}
        aria-label="Normal status"
      />
    );
  };

  // Severity word in sentence case
  const renderSeverityWord = () => {
    if (isCritical) {
      return (
        <span className="text-[13px] font-sans font-semibold text-[#C1271D] dark:text-[#D9382E]">
          Critical
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="text-[13px] font-sans font-semibold text-[#D2620A] dark:text-[#E6731B]">
          Warning
        </span>
      );
    }
    if (isAdvisory) {
      return (
        <span className="text-[13px] font-sans font-semibold text-[#A87A00] dark:text-[#C29214]">
          Advisory
        </span>
      );
    }
    return (
      <span className="text-[13px] font-sans font-normal text-[#5C635E] dark:text-[#8A928D]">
        Normal
      </span>
    );
  };

  // Parse numeric telemetry value and unit
  const parts = telemetry.split(' ');
  const numberVal = parts[0] || telemetry;
  const unitVal = parts.slice(1).join(' ') || 'mm/h';

  // Trend line 2 in right column
  const renderTrend = () => {
    if (trendDirection === 'rising') {
      const colorClass = isCritical
        ? 'text-[#C1271D] dark:text-[#D9382E]'
        : isWarning
          ? 'text-[#D2620A] dark:text-[#E6731B]'
          : 'text-[#A87A00] dark:text-[#C29214]';
      return (
        <div className={`flex items-center gap-0.5 text-xs font-mono font-medium ${colorClass}`}>
          <ArrowUp className="w-3 h-3" strokeWidth={1.5} />
          <span>{trend}</span>
        </div>
      );
    }
    if (trendDirection === 'falling') {
      return (
        <div className="flex items-center gap-0.5 text-xs font-mono font-medium text-[#2E7D4F] dark:text-[#3FA66A]">
          <ArrowDown className="w-3 h-3" strokeWidth={1.5} />
          <span>{trend}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-0.5 text-xs font-mono text-[#5C635E] dark:text-[#8A928D]">
        <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        <span>{trend}</span>
      </div>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect && onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onSelect) onSelect(id);
        }
      }}
      className="min-h-[64px] py-3 px-4 flex items-center justify-between cursor-pointer select-none transition-colors duration-150 hover:bg-[#ECE9E2]/60 dark:hover:bg-[#2A302D]/40 active:bg-[#ECE9E2] dark:active:bg-[#2A302D] focus:outline-none"
    >
      {/* Left 24px column: 20px icon */}
      <div className="w-6 flex-shrink-0 flex items-center justify-center mr-3">
        {renderIcon()}
      </div>

      {/* Middle column: 2 lines, single line ellipsis, no third line */}
      <div className="flex-1 min-w-0 pr-3">
        {/* Line 1: Ward name (Normal rows visually quieter with ink-muted) */}
        <h2 className={`text-[16px] font-sans font-semibold leading-tight truncate ${
          isNormal 
            ? 'text-[#5C635E] dark:text-[#8A928D]' 
            : 'text-[#1A1D1B] dark:text-[#ECEAE4]'
        }`}>
          {name}
        </h2>

        {/* Line 2: Severity word in sentence case · reason (14px muted) */}
        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
          {renderSeverityWord()}
          <span className="text-[#5C635E] dark:text-[#8A928D] text-xs">·</span>
          <span className="text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] truncate leading-tight">
            {reason}
          </span>
        </div>
      </div>

      {/* Right column: Fixed width 88px, right-aligned so numbers align down the column */}
      <div className="w-[88px] flex-shrink-0 flex flex-col items-end text-right">
        {/* Line 1: Rainfall number (18/600 mono, ink) + muted unit */}
        <div className="flex items-baseline gap-1">
          <span className="text-[18px] font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] tabular-nums leading-tight">
            {numberVal}
          </span>
          <span className="text-[13px] font-sans text-[#5C635E] dark:text-[#8A928D] leading-tight">
            {unitVal}
          </span>
        </div>

        {/* Line 2: Lucide 12px arrow + delta (12px mono) */}
        {renderTrend()}
      </div>
    </div>
  );
}
