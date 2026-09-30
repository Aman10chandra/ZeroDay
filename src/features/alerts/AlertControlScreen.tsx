import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { SeverityDot } from '../../components/ui/SeverityDot';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { TypedConfirmModal } from '../../components/ui/TypedConfirmModal';
import { 
  Send, 
  Smartphone, 
  Radio, 
  MessageSquare, 
  ChevronRight, 
  ArrowRight,
  ArrowLeft,
  Calendar,
  Languages,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AlertNotification, SeverityLevel } from '../../types';

export const AlertControlScreen: React.FC = () => {
  const { 
    alerts, 
    wards, 
    createAlert, 
    addAuditLog, 
    showToast,
    currentUser 
  } = useStore();

  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [selectedAlert, setSelectedAlert] = useState<AlertNotification | null>(null);

  // Compose 3-step modal state
  const [composeOpen, setComposeOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [typedConfirmOpen, setTypedConfirmOpen] = useState(false);

  // Compose Form Fields
  const [severity, setSeverity] = useState<SeverityLevel>('critical');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('ward-rampur-4b');
  const [textEn, setTextEn] = useState('Flash flood warning for Rampur Basin 4B. River 1.6m above danger mark. Evacuate immediately along high ridge to Govt School Rampur.');
  const [textHi, setTextHi] = useState('रामपुर बेसिन 4B के लिए फ्लैश फ्लड चेतावनी। नदी खतरे के निशान से 1.6 मीटर ऊपर। तुरंत राजकीय विद्यालय रामपुर की ओर बढ़ें।');
  const [channelPush, setChannelPush] = useState(true);
  const [channelSms, setChannelSms] = useState(true);
  const [channelMesh, setChannelMesh] = useState(true);

  // Channel details modal
  const [channelDetail, setChannelDetail] = useState<string | null>(null);

  const targetWard = wards.find(w => w.id === selectedRegionId) || wards[0];

  const handleStartCompose = () => {
    setStep(1);
    setComposeOpen(true);
  };

  const handleFinalizeConfirm = () => {
    setComposeOpen(false);
    setTypedConfirmOpen(true);
  };

  const executeAlertBroadcast = async () => {
    setTypedConfirmOpen(false);
    const channels: ('push' | 'sms' | 'ble_mesh')[] = [];
    if (channelPush) channels.push('push');
    if (channelSms) channels.push('sms');
    if (channelMesh) channels.push('ble_mesh');

    await createAlert({
      title: `${severity.toUpperCase()}: ${targetWard.name}`,
      titleHi: `${severity === 'critical' ? 'गंभीर चेतावनी' : 'चेतावनी'}: ${targetWard.name}`,
      body: textEn,
      bodyHi: textHi,
      severity,
      regionId: selectedRegionId,
      channels,
      directiveType: severity === 'critical' ? 'EVACUATION' : 'STANDBY',
    });

    showToast({
      type: severity === 'critical' ? 'critical' : 'warning',
      title: 'Alert Broadcasted',
      message: `Emergency message dispatched across ${channels.length} channels to ${targetWard.name}.`,
      onUndo: () => {
        showToast({ type: 'info', title: 'Broadcast Recalled', message: 'Transmission cancelled' });
      },
      undoLabel: 'Recall (10s)'
    });

    addAuditLog('COMPOSE_ALERT_BROADCAST', targetWard.code, `Transmitted ${severity} alert via ${channels.join(', ')}`);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-zd-base text-zd-text select-none max-w-5xl mx-auto">
      {/* Header with Compose Button */}
      <div className="flex items-center justify-between pb-6 border-b border-zd-border mb-8">
        <div>
          <h1 className="font-sans font-semibold text-2xl text-zd-text tracking-tight">
            Alerts
          </h1>
          <p className="font-sans text-xs text-zd-muted mt-1">
            Emergency notification dissemination and transmission telemetry
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleStartCompose}
          className="gap-2 font-sans text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Compose alert</span>
        </Button>
      </div>

      {/* Two-Option Mode Control: Automatic vs Manual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => {
            setMode('auto');
            addAuditLog('ALERT_MODE_SWITCH', 'SYSTEM', 'Switched to Automatic threshold dispatch');
          }}
          className={`p-4 rounded-panel border cursor-pointer transition-colors ${
            mode === 'auto'
              ? 'bg-zd-surface border-zd-accent/50'
              : 'bg-zd-base border-zd-border hover:bg-zd-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-sans text-xs font-semibold text-zd-text">
              Automatic (sensor thresholds)
            </span>
            <span className={`w-2 h-2 rounded-full ${mode === 'auto' ? 'bg-zd-accent' : 'bg-zd-dim'}`} />
          </div>
          <p className="font-sans text-xs text-zd-muted leading-relaxed">
            Directives are autonomously dispatched when soil saturation or kinematic shear velocity breaches critical triggers.
          </p>
        </div>

        <div
          onClick={() => {
            setMode('manual');
            addAuditLog('ALERT_MODE_SWITCH', 'SYSTEM', 'Switched to Manual supervisor confirmation mode');
          }}
          className={`p-4 rounded-panel border cursor-pointer transition-colors ${
            mode === 'manual'
              ? 'bg-zd-surface border-zd-accent/50'
              : 'bg-zd-base border-zd-border hover:bg-zd-surface'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-sans text-xs font-semibold text-zd-text">
              Manual override
            </span>
            <span className={`w-2 h-2 rounded-full ${mode === 'manual' ? 'bg-zd-accent' : 'bg-zd-dim'}`} />
          </div>
          <p className="font-sans text-xs text-zd-muted leading-relaxed">
            All automated alerts are held in an authorized review queue awaiting district officer typed sign-off before transmission.
          </p>
        </div>
      </div>

      {/* Three Understated Channel Rows (Not Cards) */}
      <div className="mb-10">
        <span className="font-sans text-xs text-zd-muted block mb-3">Transmission Channels</span>
        <div className="divide-y divide-zd-border border-y border-zd-border">
          {/* Row 1: Internet Push */}
          <div className="py-3 flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-sev-normal" />
              <span className="font-medium text-zd-text">Internet push</span>
              <span className="font-mono text-zd-dim">·</span>
              <span className="text-zd-muted">1,240 active mobile app sessions in basin, healthy</span>
            </div>
            <button
              onClick={() => setChannelDetail('Internet Push Protocol (APNs / FCM): 99.8% reach in connected zones')}
              className="text-zd-accent hover:underline text-xs"
            >
              Details
            </button>
          </div>

          {/* Row 2: Cellular SMS */}
          <div className="py-3 flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-sev-normal" />
              <span className="font-medium text-zd-text">Cellular SMS</span>
              <span className="font-mono text-zd-dim">·</span>
              <span className="text-zd-muted">8,450 registered citizen devices on BSNL/Airtel gateways</span>
            </div>
            <button
              onClick={() => setChannelDetail('Cellular SMS Gateway (CDAC e-Gov SMS Gateway): Direct SMPP link operational')}
              className="text-zd-accent hover:underline text-xs"
            >
              Details
            </button>
          </div>

          {/* Row 3: Offline Mesh */}
          <div className="py-3 flex items-center justify-between font-sans text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-sev-normal" />
              <span className="font-medium text-zd-text">Offline mesh</span>
              <span className="font-mono text-zd-dim">·</span>
              <span className="text-zd-muted">9 of 12 Bluetooth Low Energy dead-zone relay nodes reporting</span>
            </div>
            <button
              onClick={() => setChannelDetail('BLE Mesh Flooding Relay Network: Active dead-zone delivery protocol')}
              className="text-zd-accent hover:underline text-xs"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Transmission Log Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans text-xs font-semibold text-zd-text">
            Transmission Log
          </h3>
          <span className="font-mono text-xs text-zd-dim">
            {alerts.length} dispatches recorded
          </span>
        </div>

        <div className="border border-zd-border rounded-panel overflow-hidden bg-zd-surface">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zd-base border-b border-zd-border font-mono text-micro text-zd-muted">
              <tr>
                <th className="py-2.5 px-4 font-normal">Timestamp</th>
                <th className="py-2.5 px-3 font-normal">Severity</th>
                <th className="py-2.5 px-4 font-normal">Message Excerpt</th>
                <th className="py-2.5 px-3 font-normal">Channels</th>
                <th className="py-2.5 px-4 font-normal text-right">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zd-border font-mono text-xs">
              {alerts.map(alert => (
                <tr
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="hover:bg-zd-hover cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-zd-dim">
                    {/^\d{4}-\d{2}-\d{2}T/.test(alert.timestamp) ? `${alert.timestamp.slice(11, 16)} IST` : alert.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 capitalize font-sans">
                      <SeverityDot level={alert.severity} />
                      <span className="text-zd-text text-[11px]">{alert.severity}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans text-zd-text truncate max-w-xs">
                    {alert.body}
                  </td>
                  <td className="py-3 px-3 text-zd-muted uppercase text-[11px]">
                    {alert.channels.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-zd-base rounded-full overflow-hidden">
                        <div className="w-[94%] h-full bg-sev-normal rounded-full" />
                      </div>
                      <span className="text-[11px] text-zd-dim font-bold">94%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Inspector Drawer */}
      <Drawer
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title || 'Alert Telemetry'}
        subtitle={`Dispatched at ${selectedAlert?.timestamp}`}
        width="w-96"
      >
        {selectedAlert && (
          <div className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1">
              <span className="text-zd-muted block text-[11px]">English Message</span>
              <p className="text-zd-text leading-relaxed">{selectedAlert.body}</p>
            </div>

            <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1">
              <span className="text-zd-muted block text-[11px]">Hindi Translation (हिन्दी)</span>
              <p className="text-zd-text leading-relaxed font-sans">{selectedAlert.bodyHi}</p>
            </div>

            <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
              <span className="text-zd-muted block font-sans text-[11px] mb-1">Per-Channel Delivery Audit</span>
              <div className="flex justify-between">
                <span>Push Broadcast:</span>
                <span className="text-sev-normal">1,218 of 1,240 (98.2%)</span>
              </div>
              <div className="flex justify-between">
                <span>Cellular SMS:</span>
                <span className="text-sev-normal">8,102 of 8,450 (95.8%)</span>
              </div>
              <div className="flex justify-between">
                <span>BLE Offline Mesh:</span>
                <span className="text-zd-accent">9 of 12 relays confirmed</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* 3-Step Compose Dialog */}
      <Modal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        title={
          step === 1 ? 'Compose Message (Step 1 of 3)' :
          step === 2 ? 'Select Audience & Channels (Step 2 of 3)' :
          'Review & Authorize (Step 3 of 3)'
        }
        subtitle="Emergency Civilian Broadcast Pipeline"
        maxWidth="max-w-xl"
      >
        <div className="space-y-5 font-sans text-xs">
          {step === 1 && (
            <div className="space-y-4">
              {/* Severity Selector */}
              <div>
                <label className="block text-zd-muted mb-1.5">Severity Level</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {(['advisory', 'warning', 'critical'] as SeverityLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`h-8 rounded-[6px] border capitalize flex items-center justify-center gap-1.5 transition-colors ${
                        severity === lvl
                          ? lvl === 'critical' ? 'bg-sev-critical-dim border-sev-critical text-sev-critical font-bold' :
                            lvl === 'warning' ? 'bg-sev-warning-dim border-sev-warning text-sev-warning font-bold' :
                            'bg-sev-advisory-dim border-sev-advisory text-sev-advisory font-bold'
                          : 'bg-zd-base border-zd-border text-zd-muted'
                      }`}
                    >
                      <SeverityDot level={lvl} />
                      <span>{lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* English & Hindi text fields */}
              <div>
                <label className="block text-zd-muted mb-1.5">English Directive</label>
                <textarea
                  rows={3}
                  value={textEn}
                  onChange={(e) => setTextEn(e.target.value)}
                  className="w-full p-2.5 bg-zd-base border border-zd-border rounded-[6px] text-zd-text font-sans text-xs focus:outline-none focus:border-zd-accent"
                />
              </div>

              <div>
                <label className="block text-zd-muted mb-1.5">Hindi Directive (हिन्दी अनुवाद)</label>
                <textarea
                  rows={2}
                  value={textHi}
                  onChange={(e) => setTextHi(e.target.value)}
                  className="w-full p-2.5 bg-zd-base border border-zd-border rounded-[6px] text-zd-text font-sans text-xs focus:outline-none focus:border-zd-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setComposeOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setStep(2)}>
                  <span>Audience & channels</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-zd-muted mb-1.5">Target Basin / Sector</label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full h-8 px-3 rounded-[6px] bg-zd-base border border-zd-border text-zd-text font-sans text-xs"
                >
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              {/* Channels Checkboxes */}
              <div>
                <label className="block text-zd-muted mb-2">Dissemination Channels</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 bg-zd-base border border-zd-border rounded-[6px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelPush}
                      onChange={(e) => setChannelPush(e.target.checked)}
                      className="accent-zd-accent"
                    />
                    <div>
                      <span className="font-semibold text-zd-text">Mobile Internet Push</span>
                      <p className="text-[11px] text-zd-muted">1,240 devices reachable immediately</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-zd-base border border-zd-border rounded-[6px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSms}
                      onChange={(e) => setChannelSms(e.target.checked)}
                      className="accent-zd-accent"
                    />
                    <div>
                      <span className="font-semibold text-zd-text">Emergency Cellular SMS</span>
                      <p className="text-[11px] text-zd-muted">8,450 citizens via BSNL/Airtel tower broadcast</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-zd-base border border-zd-border rounded-[6px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelMesh}
                      onChange={(e) => setChannelMesh(e.target.checked)}
                      className="accent-zd-accent"
                    />
                    <div>
                      <span className="font-semibold text-zd-text">BLE Offline Mesh Relay</span>
                      <p className="text-[11px] text-zd-muted">Penetrates dead zones via peer relay nodes</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
                <Button variant="primary" onClick={() => setStep(3)}>
                  <span>Review & confirm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-zd-muted font-sans">Target Basin:</span>
                  <span className="text-zd-text font-bold">{targetWard.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zd-muted font-sans">Severity:</span>
                  <span className="capitalize text-sev-critical font-bold">{severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zd-muted font-sans">Total Estimated Reach:</span>
                  <span className="text-zd-accent font-bold">~9,690 persons</span>
                </div>
              </div>

              <div className="p-3 bg-zd-base border border-zd-border rounded-panel">
                <span className="text-zd-muted block text-[11px] mb-1 font-sans">Message Preview:</span>
                <p className="text-zd-text leading-relaxed font-sans">{textEn}</p>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </Button>
                <Button variant="destructive" onClick={handleFinalizeConfirm}>
                  Authorize broadcast
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Typed Confirmation Modal */}
      <TypedConfirmModal
        isOpen={typedConfirmOpen}
        onClose={() => setTypedConfirmOpen(false)}
        onConfirm={executeAlertBroadcast}
        title="Authorize Emergency Alert Broadcast"
        prompt="Type BROADCAST to authorize multi-channel transmission"
        confirmWord="BROADCAST"
        actionLabel="Transmit to Citizens"
        description="This action will issue loud sirens on mobile devices and cellular SMS broadcasts across Rampur Basin."
      />

      {/* Channel detail modal */}
      <Modal
        isOpen={channelDetail !== null}
        onClose={() => setChannelDetail(null)}
        title="Channel Infrastructure"
        subtitle="Gateway details and routing"
        maxWidth="max-w-md"
      >
        <p className="font-sans text-xs text-zd-text">{channelDetail}</p>
      </Modal>
    </div>
  );
};
