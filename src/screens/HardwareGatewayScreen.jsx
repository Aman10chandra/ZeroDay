import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, Network, Wifi, WifiOff, Play, RotateCcw } from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function HardwareGatewayScreen({ onBack, onShowToast, userRole = 'admin' }) {
  const [activeTab, setActiveTab] = useState('lora'); // 'lora' | 'ble_mesh'
  const [isCellularDown, setIsCellularDown] = useState(false);
  const [activeHopIndex, setActiveHopIndex] = useState(0);
  const [isRelaying, setIsRelaying] = useState(false);

  // Mesh hop simulation
  const meshHops = [
    { id: 1, title: 'Alert origin', role: 'ESP32 Base Station', dist: '0.0 km', status: 'Broadcasting' },
    { id: 2, title: 'Relay node 1', role: 'Watchtower Station', dist: '1.2 km', status: 'Mesh forward' },
    { id: 3, title: 'Relay node 2', role: 'Panchayat Device', dist: '2.5 km', status: 'Mesh forward' },
    { id: 4, title: 'Target node', role: 'Hilltop Citizen Node', dist: '3.8 km', status: 'Delivered' },
  ];

  useEffect(() => {
    let timer;
    if (isRelaying) {
      timer = setInterval(() => {
        setActiveHopIndex(prev => {
          if (prev >= meshHops.length - 1) {
            setIsRelaying(false);
            if (onShowToast) onShowToast("BLE Mesh relay delivered packet to dead-zone node.", "success");
            return prev;
          }
          return prev + 1;
        });
      }, 750);
    }
    return () => clearInterval(timer);
  }, [isRelaying]);

  const handleStartRelayTest = () => {
    setActiveHopIndex(0);
    setIsRelaying(true);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-12 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Hardware Gateway" userRole={userRole} />

      {/* Subheader */}
      <div className="px-4 py-2.5 bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 -ml-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
            title="Return"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-tight">
              Hardware gateway
            </h1>
            <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
              LoRA 868MHz + BLE offline mesh
            </p>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="flex bg-[#ECE9E2] dark:bg-[#121514] p-0.5 rounded-[6px] border border-[#D8D4CA] dark:border-[#2A302D] text-xs font-mono">
          <button
            onClick={() => setActiveTab('lora')}
            className={`px-2.5 py-1 rounded-[4px] transition-calm ${
              activeTab === 'lora' 
                ? 'bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold' 
                : 'text-[#5C635E] dark:text-[#8A928D]'
            }`}
          >
            LoRA & ESP
          </button>
          <button
            onClick={() => setActiveTab('ble_mesh')}
            className={`px-2.5 py-1 rounded-[4px] transition-calm ${
              activeTab === 'ble_mesh' 
                ? 'bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold' 
                : 'text-[#5C635E] dark:text-[#8A928D]'
            }`}
          >
            BLE Mesh
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'lora' ? (
          <>
            {/* LoRA Base Station Status Header */}
            <section aria-label="LoRA base station parameters">
              <div className="py-1 mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
                  Base station receiver
                </span>
                <span className="text-[10px] font-mono uppercase text-[#2E7D4F] dark:text-[#389E65] border border-[#2E7D4F]/40 dark:border-[#389E65]/40 px-1 py-0.2 rounded-[3px]">
                  Online
                </span>
              </div>

              {/* RF Telemetry Data Rows */}
              <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs font-mono">
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#5C635E] dark:text-[#8A928D]">Center frequency</span>
                  <span className="font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">868.0 MHz (SX1276)</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#5C635E] dark:text-[#8A928D]">Signal strength (RSSI)</span>
                  <span className="text-[#2E7D4F] dark:text-[#389E65] font-semibold">-74 dBm</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#5C635E] dark:text-[#8A928D]">Signal-to-noise ratio</span>
                  <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">+9.2 dB</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#5C635E] dark:text-[#8A928D]">Packet delivery ratio</span>
                  <span className="text-[#2E7D4F] dark:text-[#389E65] font-semibold">99.4%</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-[#5C635E] dark:text-[#8A928D]">Hilly coverage radius</span>
                  <span className="text-[#1A1D1B] dark:text-[#ECEAE4]">12.0 km line-of-sight</span>
                </div>
              </div>
            </section>

            {/* Field Sensor Uplinks */}
            <section aria-label="Field sensor uplinks">
              <div className="py-1 mb-1.5">
                <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
                  Active remote nodes (3)
                </span>
              </div>

              <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
                {/* Node 1 */}
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">Node 01</span>
                      <span className="text-[#5C635E] dark:text-[#8A928D]">· Kotdwar Ridge A (MPU-6050)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                      Uplink 4s ago · SF7 · BW 125kHz
                    </span>
                  </div>
                  <span className="font-mono text-[#2E7D4F] dark:text-[#389E65] font-semibold">4.18V (98%)</span>
                </div>

                {/* Node 2 */}
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">Node 02</span>
                      <span className="text-[#5C635E] dark:text-[#8A928D]">· Rampur Weir 03 (JSN-SR04T)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                      Uplink 2s ago · SF7 · BW 125kHz
                    </span>
                  </div>
                  <span className="font-mono text-[#2E7D4F] dark:text-[#389E65] font-semibold">4.05V (92%)</span>
                </div>

                {/* Node 3 */}
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold">Node 03</span>
                      <span className="text-[#5C635E] dark:text-[#8A928D]">· Highland Sector (Soil & DHT22)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                      Uplink 8s ago · SF10 · BW 125kHz
                    </span>
                  </div>
                  <span className="font-mono text-[#2E7D4F] dark:text-[#389E65] font-semibold">4.22V (100%)</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* BLE MESH MULTI-HOP SECTION */}
            <section aria-label="BLE mesh peer-to-peer relay">
              <div className="flex items-center justify-between py-1 mb-1.5">
                <span className="text-[11px] font-mono tracking-[0.06em] uppercase text-[#5C635E] dark:text-[#8A928D]">
                  Peer-to-peer relay simulation
                </span>
                
                {/* Cell Outage Toggle */}
                <button
                  onClick={() => setIsCellularDown(!isCellularDown)}
                  className={`h-7 px-2 text-[11px] font-mono rounded-[4px] border flex items-center gap-1 transition-calm ${
                    isCellularDown 
                      ? 'bg-[#C1271D]/10 text-[#C1271D] dark:text-[#D9382E] border-[#C1271D]/40' 
                      : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#5C635E] dark:text-[#8A928D]'
                  }`}
                >
                  {isCellularDown ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                  <span>{isCellularDown ? 'Cell grid: Down' : 'Cell grid: Normal'}</span>
                </button>
              </div>

              <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-4 bg-[#FAF9F6] dark:bg-[#171B19] space-y-3.5">
                <p className="text-xs text-[#5C635E] dark:text-[#8A928D] leading-relaxed">
                  Decentralized alert relay operates when telecommunication towers fail. Encrypted packets propagate via Bluetooth Low Energy advertisements across peer smartphones.
                </p>

                {/* The Relay Pipeline Diagram */}
                <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 bg-[#0F1211] text-[#ECEAE4] relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10 font-mono">
                    {meshHops.map((hop, idx) => {
                      const isPassed = idx <= activeHopIndex;
                      const isCurrent = idx === activeHopIndex && isRelaying;
                      return (
                        <div key={hop.id} className="flex flex-col items-center text-center max-w-[68px]">
                          <div className={`w-8 h-8 rounded-[6px] border flex items-center justify-center text-xs font-semibold transition-calm ${
                            isCurrent
                              ? 'bg-[#1A1D1B] border-[#ECEAE4] text-white ring-1 ring-[#ECEAE4]'
                              : isPassed 
                                ? 'bg-[#2A302D] border-[#8A928D] text-[#ECEAE4]' 
                                : 'bg-[#121514] border-[#2A302D] text-[#5C635E]'
                          }`}>
                            {idx === 0 ? 'HUB' : idx === meshHops.length - 1 ? 'RX' : `R0${idx}`}
                          </div>
                          <span className="text-[10px] mt-1.5 leading-tight">{hop.title}</span>
                          <span className="text-[9px] text-[#8A928D] mt-0.5">{hop.dist}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Connecting Progress Track */}
                  <div className="absolute top-[28px] left-8 right-8 h-[1px] bg-[#2A302D] z-0">
                    <div 
                      className="h-full bg-[#ECEAE4] transition-all duration-500 ease-out"
                      style={{ width: `${(activeHopIndex / (meshHops.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleStartRelayTest}
                    disabled={isRelaying}
                    className="flex-1 h-11 px-3 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#0F1211] text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm hover:opacity-90 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{isRelaying ? 'Relaying packet...' : 'Test multi-hop broadcast'}</span>
                  </button>
                  <button
                    onClick={() => setActiveHopIndex(0)}
                    className="h-11 px-3 border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] transition-calm"
                    title="Reset simulation"
                  >
                    <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
