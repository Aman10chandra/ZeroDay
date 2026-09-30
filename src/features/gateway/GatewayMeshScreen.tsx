import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { 
  Radio, 
  Wifi, 
  Send, 
  CheckCircle2, 
  Signal, 
  ChevronDown, 
  ChevronUp,
  Battery, 
  Activity,
  Layers,
  Smartphone,
  PhoneOff
} from 'lucide-react';

export const GatewayMeshScreen: React.FC = () => {
  const { addAuditLog, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'lora' | 'mesh'>('lora');

  // LoRA state
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [selectedNodeDrawer, setSelectedNodeDrawer] = useState<any | null>(null);

  // Offline Mesh state
  const [cellNetworkDown, setCellNetworkDown] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentHop, setCurrentHop] = useState<number>(0);
  const [deliveredCount, setDeliveredCount] = useState<number | null>(null);
  const [receiptLogOpen, setReceiptLogOpen] = useState(false);

  const loraNodes = [
    { id: 'node-1', name: 'Node 1 (Rampur Base)', sensor: 'SN-014 Water Stage', battery: 94, lastPacket: '12s ago', status: 'online', sf: 7, bw: '125 kHz', rssi: -72 },
    { id: 'node-2', name: 'Node 2 (Ridge Inclinometer)', sensor: 'SN-022 MPU-6050', battery: 88, lastPacket: '4s ago', status: 'online', sf: 8, bw: '125 kHz', rssi: -76 },
    { id: 'node-3', name: 'Node 3 (Upper Catchment)', sensor: 'SN-008 Rain Tipping', battery: 76, lastPacket: '28s ago', status: 'online', sf: 9, bw: '125 kHz', rssi: -81 },
  ];

  const meshHops = [
    { id: 1, name: 'Hub Base', type: 'Gateway', dist: 'Start', latency: '0ms' },
    { id: 2, name: 'Watchtower', type: 'Relay 1', dist: '1.2 km', latency: '24ms' },
    { id: 3, name: 'Panchayat Phone', type: 'Relay 2', dist: '0.9 km', latency: '38ms' },
    { id: 4, name: 'Hilltop Resident', type: 'Terminal', dist: '1.4 km', latency: '52ms' },
  ];

  const handleTestBroadcast = () => {
    if (isBroadcasting) return;
    setIsBroadcasting(true);
    setDeliveredCount(null);
    setCurrentHop(1);

    setTimeout(() => {
      setCurrentHop(2);
      setTimeout(() => {
        setCurrentHop(3);
        setTimeout(() => {
          setCurrentHop(4);
          setTimeout(() => {
            setIsBroadcasting(false);
            setDeliveredCount(9);
            showToast({
              type: 'success',
              title: 'BLE Mesh Test Broadcast Complete',
              message: 'Packet propagated across 3 hops. Delivered to 9 of 12 devices.',
            });
            addAuditLog('BLE_MESH_TEST', 'MESH-RELAY', 'Delivered offline broadcast to 9 of 12 devices in dead zone');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-zd-base text-zd-text select-none max-w-6xl mx-auto">
      {/* Header and Two Tabs */}
      <div className="flex items-center justify-between pb-6 border-b border-zd-border mb-8">
        <div>
          <h1 className="font-sans font-semibold text-2xl text-zd-text tracking-tight">
            Gateway and Mesh
          </h1>
          <p className="font-sans text-xs text-zd-muted mt-1">
            Resilient long-range telemetry and offline device broadcast network
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-0.5 rounded-[6px] bg-zd-surface border border-zd-border font-sans text-xs">
          <button
            onClick={() => setActiveTab('lora')}
            className={`px-4 py-1.5 rounded-[4px] font-medium transition-colors ${
              activeTab === 'lora'
                ? 'bg-zd-base text-zd-text font-semibold shadow-sm'
                : 'text-zd-muted hover:text-zd-text'
            }`}
          >
            LoRA gateway
          </button>
          <button
            onClick={() => setActiveTab('mesh')}
            className={`px-4 py-1.5 rounded-[4px] font-medium transition-colors ${
              activeTab === 'mesh'
                ? 'bg-zd-base text-zd-text font-semibold shadow-sm'
                : 'text-zd-muted hover:text-zd-text'
            }`}
          >
            Offline mesh
          </button>
        </div>
      </div>

      {activeTab === 'lora' ? (
        /* TAB 1: LoRA Gateway */
        <div className="space-y-8">
          {/* Top Half: Map on Left (Wide) + Four Large Numbers Beside It */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Base Station & 3 Nodes Diagram with subtle terrain backdrop */}
            <div className="lg:col-span-8 bg-zd-surface border border-zd-border rounded-panel p-5 relative overflow-hidden h-96">
              {/* Subtle terrain backdrop at 12% opacity */}
              <img
                src="/assets/terrain-dark.webp"
                alt="Catchment terrain relief"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-12 pointer-events-none filter contrast-125"
              />

              <span className="font-sans text-xs text-zd-muted block mb-3 relative z-10">
                Base station MS-8842 & line-of-sight links
              </span>

              <svg className="w-full h-80 relative z-10" viewBox="0 0 600 320">
                {/* Base Station (Center-Left) */}
                <g transform="translate(140, 160)">
                  <circle r="18" fill="rgba(92, 200, 190, 0.12)" />
                  <circle r="7" fill="#5CC8BE" />
                  <text y="32" textAnchor="middle" fill="#EAF0F3" fontSize="11" fontFamily="inherit" fontWeight="bold">
                    DEOC Gateway
                  </text>
                  <text y="44" textAnchor="middle" fill="#93A1AC" fontSize="9" fontFamily="monospace">
                    868.10 MHz
                  </text>
                </g>

                {/* Link to Node 1 */}
                <line
                  x1="140"
                  y1="160"
                  x2="380"
                  y2="60"
                  stroke="#5CC8BE"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLink('4.2 km')}
                  onMouseLeave={() => setHoveredLink(null)}
                />

                {/* Node 1 */}
                <g transform="translate(380, 60)" className="cursor-pointer" onClick={() => setSelectedNodeDrawer(loraNodes[0])}>
                  <circle r="5" fill="#4CB782" />
                  <text x="12" y="4" fill="#EAF0F3" fontSize="11" fontFamily="inherit">Node 1 (Rampur)</text>
                </g>

                {/* Link to Node 2 */}
                <line
                  x1="140"
                  y1="160"
                  x2="490"
                  y2="170"
                  stroke="#5CC8BE"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLink('7.8 km')}
                  onMouseLeave={() => setHoveredLink(null)}
                />

                {/* Node 2 */}
                <g transform="translate(490, 170)" className="cursor-pointer" onClick={() => setSelectedNodeDrawer(loraNodes[1])}>
                  <circle r="5" fill="#4CB782" />
                  <text x="12" y="4" fill="#EAF0F3" fontSize="11" fontFamily="inherit">Node 2 (Ridge MPU)</text>
                </g>

                {/* Link to Node 3 */}
                <line
                  x1="140"
                  y1="160"
                  x2="340"
                  y2="270"
                  stroke="#5CC8BE"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLink('5.1 km')}
                  onMouseLeave={() => setHoveredLink(null)}
                />

                {/* Node 3 */}
                <g transform="translate(340, 270)" className="cursor-pointer" onClick={() => setSelectedNodeDrawer(loraNodes[2])}>
                  <circle r="5" fill="#4CB782" />
                  <text x="12" y="4" fill="#EAF0F3" fontSize="11" fontFamily="inherit">Node 3 (Catchment)</text>
                </g>
              </svg>

              {/* Distance label on hover */}
              {hoveredLink && (
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-zd-surface border border-zd-border rounded-control font-mono text-xs text-zd-text z-20 shadow-sm">
                  Distance: <span className="text-zd-accent font-semibold">{hoveredLink}</span>
                </div>
              )}
            </div>

            {/* Beside it: Four Large Quiet Numbers (Borderless, with divider lines between them) */}
            <div className="lg:col-span-4 bg-zd-surface border border-zd-border rounded-panel divide-y divide-zd-border">
              <div className="p-4">
                <span className="font-sans text-xs text-zd-muted block mb-1">Mean signal RSSI</span>
                <span className="font-mono text-3xl font-light text-zd-text tracking-tight">-74 dBm</span>
              </div>

              <div className="p-4">
                <span className="font-sans text-xs text-zd-muted block mb-1">Signal-to-noise ratio</span>
                <span className="font-mono text-3xl font-light text-zd-text tracking-tight">+9.2 dB</span>
              </div>

              <div className="p-4">
                <span className="font-sans text-xs text-zd-muted block mb-1">Packet delivery ratio</span>
                <span className="font-mono text-3xl font-light text-sev-normal tracking-tight">99.4%</span>
              </div>

              <div className="p-4">
                <span className="font-sans text-xs text-zd-muted block mb-1">Effective range</span>
                <span className="font-mono text-3xl font-light text-zd-text tracking-tight">12 km</span>
              </div>
            </div>
          </div>

          {/* Bottom: Node List (3 Rows, 48px height with hairline between and chevron on hover) */}
          <div className="bg-zd-surface border border-zd-border rounded-panel overflow-hidden">
            <div className="p-4 border-b border-zd-border flex items-center justify-between">
              <h3 className="font-sans text-xs font-semibold text-zd-text">Reporting telemetry nodes</h3>
              <span className="font-mono text-xs text-zd-dim">3 of 3 connected</span>
            </div>

            <div className="divide-y divide-zd-border">
              {loraNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeDrawer(node)}
                  className="h-12 px-4 flex items-center justify-between hover:bg-zd-hover cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-sev-normal" />
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-sans text-xs font-medium text-zd-text">{node.name}</h4>
                      <span className="font-mono text-[11px] text-zd-dim">· {node.sensor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs text-zd-muted">
                    <span>Battery {node.battery}%</span>
                    <span>Received {node.lastPacket}</span>
                    <span className="text-zd-accent group-hover:underline font-sans text-xs">
                      Diagnostics
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: Offline Mesh */
        <div className="space-y-8">
          {/* Controls: "Cell network down" Switch + "Test broadcast" Button */}
          <div className="p-4 bg-zd-surface border border-zd-border rounded-panel flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCellNetworkDown(!cellNetworkDown)}
                className="flex items-center gap-2 text-xs font-sans text-zd-text"
              >
                {cellNetworkDown ? (
                  <PhoneOff className="w-4 h-4 text-sev-warning" />
                ) : (
                  <Smartphone className="w-4 h-4 text-sev-normal" />
                )}
                <span>Cell network: {cellNetworkDown ? 'Down (dead zone fallback active)' : 'Operational'}</span>
              </button>
            </div>

            <Button
              variant="primary"
              onClick={handleTestBroadcast}
              disabled={isBroadcasting}
              className="gap-2 font-sans text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Test broadcast'}</span>
            </Button>
          </div>

          {/* Focal Point: Hop Diagram on Faint Backdrop */}
          <div className="bg-zd-surface border border-zd-border rounded-panel p-8 relative overflow-hidden">
            <img
              src="/assets/terrain-dark.webp"
              alt="Catchment terrain relief"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-10 pointer-events-none filter contrast-125"
            />
            <span className="font-sans text-xs text-zd-muted block mb-8 relative z-10">
              Multi-hop BLE mesh relay propagation
            </span>

            {/* Hop Diagram Nodes */}
            <div className="relative flex items-center justify-between max-w-4xl mx-auto py-8 z-10">
              {/* Connecting Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-zd-border z-0" />

              {meshHops.map((hop, index) => {
                const isPassed = currentHop >= hop.id;
                const isCurrent = currentHop === hop.id;

                return (
                  <div key={hop.id} className="relative z-10 flex flex-col items-center">
                    {/* Node Circle */}
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? 'bg-zd-accent/20 border-zd-accent ring-4 ring-zd-accent/20'
                          : isPassed
                          ? 'bg-sev-normal/20 border-sev-normal text-sev-normal'
                          : 'bg-zd-base border-zd-border text-zd-dim'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold">{index + 1}</span>
                    </div>

                    {/* Node Labels */}
                    <span className="font-sans text-xs font-medium text-zd-text mt-3">
                      {hop.name}
                    </span>
                    <span className="font-mono text-[10px] text-zd-dim mt-0.5">
                      {hop.dist} · {hop.latency}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Final Delivered Summary */}
            {deliveredCount !== null && (
              <div className="mt-8 text-center p-3 bg-zd-base border border-zd-border rounded-panel max-w-sm mx-auto relative z-10">
                <span className="font-sans text-xs font-medium text-sev-normal flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Delivered to {deliveredCount} of 12 devices</span>
                </span>
              </div>
            )}
          </div>

          {/* Collapsible Receipt Log Beneath */}
          <div className="border border-zd-border rounded-panel bg-zd-surface overflow-hidden">
            <div
              onClick={() => setReceiptLogOpen(!receiptLogOpen)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-zd-hover transition-colors"
            >
              <h3 className="font-sans text-xs font-semibold text-zd-text">Receipt acknowledgement log</h3>
              <button className="text-zd-muted hover:text-zd-text">
                {receiptLogOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {receiptLogOpen && (
              <div className="divide-y divide-zd-border border-t border-zd-border font-mono text-xs">
                <div className="p-3 px-4 flex justify-between text-zd-muted">
                  <span>Hop 1: Hub Base -&gt; Watchtower</span>
                  <span className="text-sev-normal">ACK_OK (24ms)</span>
                </div>
                <div className="p-3 px-4 flex justify-between text-zd-muted">
                  <span>Hop 2: Watchtower -&gt; Panchayat Phone</span>
                  <span className="text-sev-normal">ACK_OK (38ms)</span>
                </div>
                <div className="p-3 px-4 flex justify-between text-zd-muted">
                  <span>Hop 3: Panchayat Phone -&gt; Hilltop Resident</span>
                  <span className="text-sev-normal">ACK_OK (52ms)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Node Diagnostics Drawer */}
      <Drawer
        isOpen={selectedNodeDrawer !== null}
        onClose={() => setSelectedNodeDrawer(null)}
        title={selectedNodeDrawer?.name || 'Node Diagnostics'}
        subtitle="Semtech SX1276 RF Diagnostics"
        width="w-96"
      >
        {selectedNodeDrawer && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-zd-muted font-sans">Spreading Factor:</span>
                <span className="text-zd-text font-bold">SF{selectedNodeDrawer.sf}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zd-muted font-sans">Bandwidth:</span>
                <span className="text-zd-text">{selectedNodeDrawer.bw}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zd-muted font-sans">Instant RSSI:</span>
                <span className="text-zd-text">{selectedNodeDrawer.rssi} dBm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zd-muted font-sans">Battery:</span>
                <span className="text-sev-normal font-semibold">{selectedNodeDrawer.battery}%</span>
              </div>
            </div>

            {/* RSSI History Chart */}
            <div className="p-3.5 bg-zd-base border border-zd-border rounded-panel">
              <span className="text-zd-muted block mb-2">RSSI History (Last 24h)</span>
              <div className="h-20 w-full flex items-end gap-1.5 pt-2">
                {[ -78, -75, -74, -72, -73, -76, -74 ].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-zd-accent rounded-t-sm"
                      style={{ height: `${((val + 100) / 40) * 100}%` }}
                    />
                    <span className="font-mono text-[9px] text-zd-dim">{i * 4}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
