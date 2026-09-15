import React, { useState } from 'react';
import { Megaphone, X, AlertTriangle, Radio, Check, BellRing } from 'lucide-react';

export default function ManualAlertModal({ isOpen, onClose, onConfirm }) {
  const [severity, setSeverity] = useState('critical');
  const [channels, setChannels] = useState({ push: true, sms: true, ble: true });
  const [customMessage, setCustomMessage] = useState('Flash flood warning issued for Rampur Ward. Move to higher ground immediately. Govt. School shelter open.');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      if (onConfirm) onConfirm({ severity, channels, customMessage });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#9a3412] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5" />
            <h3 className="font-bold text-base tracking-tight">
              Emergency Broadcast
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Alert Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'advisory', label: 'Advisory', color: 'border-blue-400 text-blue-700 bg-blue-50' },
                { id: 'warning', label: 'Warning', color: 'border-amber-400 text-amber-700 bg-amber-50' },
                { id: 'critical', label: 'Critical', color: 'border-red-500 text-red-700 bg-red-50' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSeverity(lvl.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    severity === lvl.id ? `${lvl.color} ring-2 ring-offset-1 ring-red-400 font-extrabold` : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Target Channels
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { key: 'push', name: 'Internet Push (1,240 apps)' },
                { key: 'sms', name: 'SMS Broadcast (8,450 numbers)' },
                { key: 'ble', name: 'Offline BLE Mesh (9 nodes)' },
              ].map((ch) => (
                <label key={ch.key} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={channels[ch.key]}
                    onChange={(e) => setChannels({ ...channels, [ch.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-[#9a3412] focus:ring-0 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">{ch.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Broadcast Message
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#9a3412] text-slate-800 leading-relaxed resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="flex-1 py-3 bg-[#9a3412] hover:bg-[#7c2d12] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isBroadcasting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <BellRing className="w-4 h-4" />
                  <span>Send Broadcast</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
