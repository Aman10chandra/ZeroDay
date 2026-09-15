import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle2, Bell, MessageSquare, Network, 
  Megaphone, ChevronRight 
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function AlertControlScreen({ onBack, onOpenManualAlert }) {
  const [autoMode, setAutoMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [meshEnabled, setMeshEnabled] = useState(true);

  const activeCount = (pushEnabled ? 1 : 0) + (smsEnabled ? 1 : 0) + (meshEnabled ? 1 : 0);

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Header */}
      <TopHeader currentRegion="All Regions" />

      {/* Subheader */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" strokeWidth={2.4} />
          </button>
          <div>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
              Alert Control
            </h1>
            <p className="text-[11.5px] text-slate-500 font-medium leading-none mt-0.5">
              Rampur Ward · Zone 04
            </p>
          </div>
        </div>

        {/* Auto Mode Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Auto</span>
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
              autoMode ? 'bg-[#9a3412]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                autoMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-4">
        {/* Info Banner */}
        <div className="bg-[#fef3eb] border border-[#fed7aa] rounded-2xl p-3 flex items-start gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#c2410c] flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-slate-700 font-medium leading-snug">
            Auto mode active — alerts trigger from telemetry sensor thresholds
          </p>
        </div>

        {/* Alert Channels Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
              Alert Channels
            </h3>
            <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {activeCount} active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Channel 1: Internet Push */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-[#c2410c]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[15.5px] font-bold text-slate-900 leading-tight">
                      Internet Push
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    pushEnabled ? 'bg-[#9a3412]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      pushEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[12px] text-slate-500 mt-2">
                Sends alerts through ZeroDay mobile app
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[#ffedd5] text-[#9a3412] text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  Requires app
                </span>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  High reliability
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                <span>1,240 users · Avg 2s delivery</span>
                <span>Last: 4:12 PM</span>
              </div>
            </div>

            {/* Channel 2: SMS Broadcast */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-[#c2410c]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[15.5px] font-bold text-slate-900 leading-tight">
                      SMS Broadcast
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    smsEnabled ? 'bg-[#9a3412]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      smsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[12px] text-slate-500 mt-2">
                Reaches all registered phones — no app needed
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  No app required
                </span>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  ₹0.12 / SMS
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                <span>8,450 numbers · Hindi & English</span>
                <span>Last: 4:12 PM</span>
              </div>
            </div>

            {/* Channel 3: Offline BLE Mesh */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff7ed] border border-[#ffedd5] flex items-center justify-center text-[#c2410c]">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[15.5px] font-bold text-slate-900 leading-tight">
                      Offline BLE Mesh
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => setMeshEnabled(!meshEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    meshEnabled ? 'bg-[#9a3412]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      meshEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-[12px] text-slate-500 mt-2">
                Works without cell towers or grid power
              </p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-bold text-slate-900">
                  9 / 12 nodes online
                </span>
                <div className="flex items-center gap-1.5">
                  {[...Array(9)].map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-[#9a3412]" />
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-slate-200" />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
                <span>2.4 km cluster coverage</span>
                <span className="font-semibold text-slate-700">Battery 92%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            onClick={onOpenManualAlert}
            className="w-full bg-[#9a3412] hover:bg-[#7c2d12] text-white font-bold text-sm py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-orange-950/15 active:scale-[0.99] transition-all"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Manual Alert</span>
          </button>
          <p className="text-[11.5px] text-slate-400 text-center leading-snug px-3">
            Dispatches immediate broadcast notice to all residents via active channels
          </p>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[16.5px] font-bold text-slate-900 tracking-tight">
              Recent Activity
            </h3>
            <button className="text-xs font-bold text-[#a83210] hover:underline">
              View Log
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {/* Activity 1 */}
            <div className="py-2.5 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#c2410c] mt-0.5 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-slate-900">
                    Emergency alert sent via SMS
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    4:12 PM
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  8,281 of 8,450 delivered · 98%
                </p>
              </div>
            </div>

            {/* Activity 2 */}
            <div className="py-2.5 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#ffedd5] flex items-center justify-center text-[#c2410c] mt-0.5 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-slate-900">
                    Advisory sent via Push
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    2:40 PM
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  1,240 of 1,240 delivered · 100%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
