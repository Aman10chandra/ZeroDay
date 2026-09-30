import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function SluiceOverrideModal({ isOpen, onClose }) {
  const [gateOpening, setGateOpening] = useState(40);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 transition-calm">
      <div 
        role="dialog"
        aria-labelledby="sluice-dialog-title"
        className="w-full sm:max-w-md bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-t-[8px] sm:rounded-[8px] shadow-modal overflow-hidden text-[#1A1D1B] dark:text-[#ECEAE4]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between">
          <div>
            <h3 id="sluice-dialog-title" className="text-sm font-semibold tracking-tight">
              Sluice hydraulic override
            </h3>
            <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] mt-0.5">
              Rampur Weir Barrier 03 · Actuator N-029
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Safety Notice */}
          <div className="p-3 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#ECE9E2]/40 dark:bg-[#121514]/40 text-[#5C635E] dark:text-[#8A928D] leading-relaxed">
            Manual override bypasses automated basin retention balance. Downstream discharge will increase immediately upon command execution.
          </div>

          {/* Gate Aperture Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D]">
                Aperture opening
              </span>
              <span className="text-base font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                {gateOpening}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={gateOpening}
              onChange={(e) => setGateOpening(Number(e.target.value))}
              className="w-full h-1.5 bg-[#D8D4CA] dark:bg-[#2A302D] rounded-full appearance-none cursor-pointer accent-[#1A1D1B] dark:accent-[#ECEAE4]"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] mt-1.5">
              <span>0% (Closed)</span>
              <span>50%</span>
              <span>100% (Full dump)</span>
            </div>
          </div>

          {/* Telemetry data rows */}
          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] font-mono text-xs">
            <div className="flex justify-between p-2.5">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Discharge volume</span>
              <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
                {(gateOpening * 31).toLocaleString()} m³/s
              </span>
            </div>
            <div className="flex justify-between p-2.5">
              <span className="text-[#5C635E] dark:text-[#8A928D]">Downstream impact</span>
              <span className={`font-semibold ${gateOpening > 50 ? 'text-[#C1271D] dark:text-[#D9382E]' : 'text-[#A87A00] dark:text-[#C79200]'}`}>
                {gateOpening > 50 ? 'Critical surge' : 'Nominal discharge'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="h-11 px-4 rounded-[8px] border border-[#D8D4CA] dark:border-[#2A302D] font-medium text-xs text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] transition-calm"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || appliedSuccess}
              className="h-11 px-5 rounded-[8px] font-semibold text-xs text-white bg-[#C1271D] hover:bg-[#A81E15] transition-calm flex items-center gap-1.5"
            >
              {isApplying ? (
                <span>Executing...</span>
              ) : appliedSuccess ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={1.5} />
                  <span>Command executed</span>
                </>
              ) : (
                <span>Apply gate override</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
