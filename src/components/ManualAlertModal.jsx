import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ManualAlertModal({ isOpen, onClose, onConfirm }) {
  const [severity, setSeverity] = useState('critical');
  const [channels, setChannels] = useState({ push: true, sms: true, ble: true });
  const [customMessage, setCustomMessage] = useState('Flash flood warning for Rampur Ward. Move to Govt. School Rampur. Embankment overtopping.');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      if (onConfirm) onConfirm({ severity, channels, customMessage });
      onClose();
    }, 600);
  };

  const severityOptions = [
    { id: 'advisory', label: 'Advisory', color: 'border-[#A87A00] text-[#A87A00] bg-[#A87A00]/10' },
    { id: 'warning', label: 'Warning', color: 'border-[#D2620A] text-[#D2620A] bg-[#D2620A]/10' },
    { id: 'critical', label: 'Critical', color: 'border-[#C1271D] text-[#C1271D] bg-[#C1271D]/10' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 transition-calm">
      <div 
        role="dialog"
        aria-labelledby="alert-dialog-title"
        className="w-full sm:max-w-md bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-t-[8px] sm:rounded-[8px] shadow-modal overflow-hidden text-[#1A1D1B] dark:text-[#ECEAE4]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between">
          <div>
            <h3 id="alert-dialog-title" className="text-sm font-semibold tracking-tight">
              Broadcast alert
            </h3>
            <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] mt-0.5">
              Sector 4B · Rampur Ward
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
          {/* Severity selector */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-2">
              Severity level
            </span>
            <div className="grid grid-cols-3 gap-2">
              {severityOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSeverity(opt.id)}
                  className={`h-11 rounded-[8px] font-semibold border text-xs transition-calm ${
                    severity === opt.id 
                      ? `${opt.color} border-current` 
                      : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#5C635E] dark:text-[#8A928D] hover:border-[#1A1D1B]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery channels */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-2">
              Delivery channels
            </span>
            <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D]">
              {[
                { key: 'push', name: 'Mobile push', count: '1,240 nodes' },
                { key: 'sms', name: 'SMS broadcast', count: '8,450 numbers' },
                { key: 'ble', name: 'BLE mesh', count: '9 peer nodes' },
              ].map((ch) => (
                <label key={ch.key} className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-[#ECE9E2]/50 dark:hover:bg-[#2A302D]/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={channels[ch.key]}
                      onChange={(e) => setChannels({ ...channels, [ch.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1A1D1B] accent-[#1A1D1B] cursor-pointer"
                    />
                    <span className="font-medium text-[#1A1D1B] dark:text-[#ECEAE4]">{ch.name}</span>
                  </div>
                  <span className="font-mono text-[#5C635E] dark:text-[#8A928D] text-[11px]">{ch.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message content */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1.5">
              Message text
            </span>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] text-xs font-mono text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed resize-none focus:outline-none focus:border-[#1A1D1B] dark:focus:border-[#ECEAE4]"
            />
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
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className={`h-11 px-5 rounded-[8px] font-semibold text-xs text-white transition-calm ${
                severity === 'critical' 
                  ? 'bg-[#C1271D] hover:bg-[#A81E15]' 
                  : 'bg-[#1A1D1B] hover:bg-[#2E3330]'
              }`}
            >
              {isBroadcasting ? 'Broadcasting...' : 'Send broadcast'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
