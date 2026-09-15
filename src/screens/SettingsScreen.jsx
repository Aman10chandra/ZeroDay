import React, { useState } from 'react';
import { 
  ShieldCheck, Languages, MessageSquare, Map, Volume2, 
  Users, Settings as SettingsIcon, Shield, LogOut, ChevronRight 
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function SettingsScreen({ onShowToast }) {
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [offlineMaps, setOfflineMaps] = useState(true);
  const [sirenOnEmergency, setSirenOnEmergency] = useState(false);
  const [language, setLanguage] = useState('Hindi');

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Header */}
      <TopHeader currentRegion="All Regions" />

      <div className="px-4 py-3 flex flex-col gap-4">
        {/* Status Line: Telemetry Synced & ID */}
        <div className="flex items-center justify-between text-xs font-semibold px-0.5 pt-0.5">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-[#b45309]" />
            <span className="text-[11.5px] font-bold text-slate-600 tracking-wider uppercase">
              TELEMETRY SYNCED
            </span>
          </div>
          <span className="text-slate-500 font-bold text-xs tracking-tight">
            ID: MS-8842
          </span>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3.5">
            {/* Avatar RS */}
            <div className="w-14 h-14 rounded-2xl bg-[#ffedd5] border border-[#fed7aa] flex items-center justify-center text-[#9a3412] font-black text-lg flex-shrink-0 shadow-sm">
              RS
            </div>

            {/* Name & Ward */}
            <div>
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight leading-snug">
                Ravi Singh
              </h2>
              <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">
                Rampur ward · +91 98xxxx210
              </p>
            </div>
          </div>

          {/* Verified Representative Pill Banner */}
          <div className="mt-3.5 bg-[#f0f4ff] border border-blue-100/80 rounded-xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>Verified Ward Representative</span>
            </div>
            <span className="bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] text-[11px] font-extrabold px-2 py-0.5 rounded-md">
              Tier 1
            </span>
          </div>
        </div>

        {/* Section: PREFERENCES */}
        <div>
          <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-2 px-1">
            PREFERENCES
          </span>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
            {/* Language */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-slate-600" strokeWidth={2} />
                <span className="text-[14.5px] font-medium text-slate-800">Language</span>
              </div>
              <button 
                onClick={() => setLanguage(language === 'Hindi' ? 'English' : 'Hindi')}
                className="text-[14px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                {language}
              </button>
            </div>

            {/* SMS Alerts */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-slate-600" strokeWidth={2} />
                <span className="text-[14.5px] font-medium text-slate-800">SMS alerts</span>
              </div>
              <button
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  smsAlerts ? 'bg-[#9a3412]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    smsAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Offline Maps */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Map className="w-5 h-5 text-slate-600" strokeWidth={2} />
                <span className="text-[14.5px] font-medium text-slate-800">Offline maps</span>
              </div>
              <button
                onClick={() => setOfflineMaps(!offlineMaps)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  offlineMaps ? 'bg-[#9a3412]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    offlineMaps ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Siren on Emergency */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-slate-600" strokeWidth={2} />
                <span className="text-[14.5px] font-medium text-slate-800">Siren on emergency</span>
              </div>
              <button
                onClick={() => setSirenOnEmergency(!sirenOnEmergency)}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  sirenOnEmergency ? 'bg-[#9a3412]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                    sirenOnEmergency ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section: ACCOUNT */}
        <div>
          <span className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase block mb-2 px-1">
            ACCOUNT
          </span>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden divide-y divide-slate-100">
            {/* Family Members */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-600" strokeWidth={2} />
                <span className="text-[14.5px] font-medium text-slate-800">Family members</span>
              </div>
              <span className="text-[14px] font-medium text-slate-500">
                3 linked
              </span>
            </div>

            {/* App Settings */}
            <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-slate-600" strokeWidth={2} />
                <span className="text-[14.5px] font-medium text-slate-800">App settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" strokeWidth={2.4} />
            </div>
          </div>
        </div>

        {/* Banner: ZeroDay Mesh Active */}
        <div className="bg-[#f0f5ff] border border-blue-100/90 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Shield className="w-4 h-4 text-[#c2410c]" strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-[14.5px] font-bold text-slate-900 leading-tight">
              ZeroDay Mesh Active
            </h4>
            <p className="text-[12px] text-slate-600 font-normal mt-1 leading-snug">
              Critical relay broadcasts work without cellular connectivity via local beaconing.
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-1">
          <button 
            onClick={() => onShowToast ? onShowToast("Session ended. Signed out securely.", "info") : null}
            className="flex items-center gap-2.5 text-[#c2410c] hover:text-[#9a3412] font-bold text-[15px] px-1 py-2 transition-colors active:opacity-75"
          >
            <LogOut className="w-5 h-5 text-[#c2410c]" strokeWidth={2.4} />
            <span>Sign out</span>
          </button>
        </div>

        {/* Footer Build & Agency Info */}
        <div className="pt-2 text-center text-[11px] text-slate-400 font-medium space-y-0.5 pb-2">
          <p>ZeroDay Civic Engine · v3.4.1 (Build 409)</p>
          <p>Disaster Management Cell, District Administration</p>
        </div>
      </div>
    </div>
  );
}
