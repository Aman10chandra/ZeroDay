import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useStore } from '../../store/useStore';
import { RescueMap } from './RescueMap';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { 
  Plus, 
  Search, 
  Filter, 
  ShieldAlert, 
  Users, 
  LifeBuoy, 
  CheckCircle2, 
  Clock, 
  Phone, 
  AlertTriangle, 
  MapPin, 
  Send, 
  Radio, 
  Battery, 
  Crosshair, 
  ExternalLink, 
  HeartHandshake, 
  Compass, 
  ChevronRight,
  ShieldCheck,
  Flame,
  Waves,
  Mountain,
  MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import { RescueRequest, RescueUrgency, RescueHazardType, StateOfficer } from '../../types';

export const RescueRequestsScreen: React.FC = () => {
  const { 
    rescueRequests, 
    wards, 
    stateOfficers, 
    selectedRescueId, 
    selectRescueRequest, 
    addRescueRequest, 
    updateRescueStatus, 
    assignRescueOfficer, 
    showToast, 
    addAuditLog 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [targetRequestForDispatch, setTargetRequestForDispatch] = useState<RescueRequest | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [dispatchBriefing, setDispatchBriefing] = useState('');

  // New SOS Form state
  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [wardId, setWardId] = useState('ward-rampur-4b');
  const [addressText, setAddressText] = useState('');
  const [peopleCount, setPeopleCount] = useState(3);
  const [vulnerableDetails, setVulnerableDetails] = useState('');
  const [urgency, setUrgency] = useState<RescueUrgency>('critical');
  const [hazardType, setHazardType] = useState<RescueHazardType>('flood_inundation');
  const [situation, setSituation] = useState('');

  const selectedRequest = rescueRequests.find(r => r.id === selectedRescueId) || null;

  // Filter requests
  const filteredRequests = rescueRequests.filter(req => {
    if (filterUrgency !== 'all' && req.urgency !== filterUrgency) return false;
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        req.citizenName.toLowerCase().includes(q) ||
        req.code.toLowerCase().includes(q) ||
        req.phone.includes(q) ||
        req.wardName.toLowerCase().includes(q) ||
        req.situation.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Summary Metrics
  const totalCount = rescueRequests.length;
  const criticalCount = rescueRequests.filter(r => r.urgency === 'critical' && r.status !== 'rescued').length;
  const dispatchedCount = rescueRequests.filter(r => r.status === 'dispatched' || r.status === 'in_progress').length;
  const rescuedCount = rescueRequests.filter(r => r.status === 'rescued').length;
  const totalPeopleAtRisk = rescueRequests
    .filter(r => r.status !== 'rescued')
    .reduce((acc, curr) => acc + curr.peopleCount, 0);

  // Dispatch Action
  const handleOpenDispatch = (req: RescueRequest) => {
    setTargetRequestForDispatch(req);
    // Auto-select first available officer or current assigned
    const defaultOfficer = stateOfficers.find(o => o.status === 'standby' || o.id === req.assignedOfficerId) || stateOfficers[0];
    setSelectedOfficerId(defaultOfficer?.id || '');
    setDispatchBriefing(`Urgent evacuation requested for ${req.peopleCount} citizens at ${req.addressText}. Priority: ${req.urgency.toUpperCase()}.`);
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async () => {
    if (!targetRequestForDispatch || !selectedOfficerId) return;
    await assignRescueOfficer(targetRequestForDispatch.id, selectedOfficerId);
    if (dispatchBriefing.trim()) {
      await updateRescueStatus(targetRequestForDispatch.id, 'dispatched', `Briefing: ${dispatchBriefing}`);
    }
    setDispatchModalOpen(false);
  };

  const handleMarkRescued = async (req: RescueRequest) => {
    await updateRescueStatus(req.id, 'rescued', 'Extricated by field team and transferred to nearest relief shelter.');
    showToast({
      type: 'success',
      title: 'Extrication Confirmed',
      message: `${req.citizenName} (${req.peopleCount} souls) marked safe at haven.`,
    });
  };

  const handleSendPing = (req: RescueRequest) => {
    showToast({
      type: 'info',
      title: 'Satellite Beacon Ping Sent',
      message: `Distress acknowledgment broadcasted to ${req.phone} & LoRa node.`,
    });
    addAuditLog('SATELLITE_BEACON_PING', req.code, `Operator sent satellite comms handshake to ${req.citizenName}`);
  };

  // Submit New SOS
  const handleCreateSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !phone.trim() || !situation.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Details',
        message: 'Please complete all required fields.',
      });
      return;
    }

    const selectedWard = wards.find(w => w.id === wardId);
    // Slight offset from ward center for distinct pin placement
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;

    const newReq = await addRescueRequest({
      citizenName,
      phone,
      alternatePhone: alternatePhone || undefined,
      wardId,
      wardName: selectedWard?.name || 'Kotdwar Ward',
      district: selectedWard?.district || 'Pauri Garhwal',
      addressText: addressText || `${selectedWard?.name} Area`,
      lat: (selectedWard?.lat || 29.7468) + latOffset,
      lng: (selectedWard?.lng || 78.5292) + lngOffset,
      peopleCount: Number(peopleCount) || 1,
      vulnerableDetails: vulnerableDetails || undefined,
      urgency,
      hazardType,
      situation,
      batteryPct: Math.floor(20 + Math.random() * 60),
    });

    setAddModalOpen(false);
    selectRescueRequest(newReq.id);
    showToast({
      type: 'critical',
      title: 'Emergency Distress Beacon Received',
      message: `Logged SOS from ${newReq.citizenName} (${newReq.peopleCount} people in danger).`,
    });

    // Reset Form
    setCitizenName('');
    setPhone('');
    setAlternatePhone('');
    setAddressText('');
    setPeopleCount(3);
    setVulnerableDetails('');
    setSituation('');
  };

  return (
    <div className="h-full flex flex-col bg-zd-base text-zd-text overflow-hidden">
      {/* 1. Header Toolbar */}
      <header className="px-6 py-3.5 border-b border-zd-border bg-zd-surface shrink-0 flex flex-wrap items-center justify-between gap-4 z-20">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold tracking-tight text-zd-text font-sans">
              Citizen Rescue Map & Distress Operations
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sev-critical/15 text-sev-critical border border-sev-critical/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sev-critical animate-ping" />
              <span>LIVE SOS MONITOR</span>
            </span>
          </div>
          <p className="text-xs text-zd-muted font-sans mt-0.5">
            Real-time geospatial plotting of citizen SOS calls, flood entrapments, and rapid field team deployment.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Raise Emergency SOS</span>
          </Button>
        </div>
      </header>

      {/* 2. Operations Metrics Strip */}
      <section aria-label="Operations Metrics" className="px-6 py-3 border-b border-zd-border bg-zd-raised/40 shrink-0 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-sans">
        <div className="p-3 bg-zd-surface rounded-panel border border-zd-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-zd-accent/15 border border-zd-accent/30 flex items-center justify-center text-zd-accent shrink-0">
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[28px] font-semibold text-zd-text leading-none tabular-nums">{totalCount}</div>
            <div className="font-sans text-xs text-zd-muted mt-1 truncate">Distress signals</div>
          </div>
        </div>

        <div className="p-3 bg-zd-surface rounded-panel border border-zd-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-sev-critical/15 border border-sev-critical/30 flex items-center justify-center text-sev-critical shrink-0">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[28px] font-semibold text-sev-critical leading-none tabular-nums">{criticalCount}</div>
            <div className="font-sans text-xs text-zd-muted mt-1 truncate">Critical trapped souls</div>
          </div>
        </div>

        <div className="p-3 bg-zd-surface rounded-panel border border-zd-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[28px] font-semibold text-zd-text leading-none tabular-nums">{totalPeopleAtRisk}</div>
            <div className="font-sans text-xs text-zd-muted mt-1 truncate">Citizens at risk</div>
          </div>
        </div>

        <div className="p-3 bg-zd-surface rounded-panel border border-zd-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-zd-accent/15 border border-zd-accent/30 flex items-center justify-center text-zd-accent shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[28px] font-semibold text-zd-accent leading-none tabular-nums">{dispatchedCount}</div>
            <div className="font-sans text-xs text-zd-muted mt-1 truncate">Teams dispatched</div>
          </div>
        </div>

        <div className="p-3 bg-zd-surface rounded-panel border border-zd-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-sev-safe/15 border border-sev-safe/30 flex items-center justify-center text-sev-safe shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[28px] font-semibold text-sev-safe leading-none tabular-nums">{rescuedCount}</div>
            <div className="font-sans text-xs text-zd-muted mt-1 truncate">Safely evacuated</div>
          </div>
        </div>
      </section>

      {/* 3. Main Workspace: Split View Map (Left) & Feed (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Tactical Interactive Rescue Map */}
        <div className="flex-1 h-[45vh] lg:h-full relative p-3 bg-zd-base min-h-0">
          <RescueMap
            rescueRequests={filteredRequests}
            wards={wards}
            selectedRescueId={selectedRescueId}
            onSelectRescue={(id) => selectRescueRequest(id)}
            onDispatchOfficer={handleOpenDispatch}
            onMarkRescued={handleMarkRescued}
          />
        </div>

        {/* Right: Citizen Distress Feed & Dispatch Deck */}
        <div className="w-full lg:w-[460px] h-[55vh] lg:h-full border-t lg:border-t-0 lg:border-l border-zd-border bg-zd-surface flex flex-col shrink-0 min-h-0">
          {/* Feed Search & Filter Bar */}
          <div className="p-3.5 border-b border-zd-border space-y-2.5 bg-zd-surface/95 backdrop-blur shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zd-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search citizen, SOS code, phone, or ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent transition-colors font-sans"
              />
            </div>

            {/* Quick Filter Chips with Dot Indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-[11px] font-sans">
              <button
                onClick={() => { setFilterUrgency('all'); setFilterStatus('all'); }}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors shrink-0 flex items-center gap-1.5",
                  filterUrgency === 'all' && filterStatus === 'all'
                    ? "bg-zd-raised border-zd-accent/50 text-zd-text font-medium"
                    : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zd-muted" />
                <span>All ({rescueRequests.length})</span>
              </button>
              <button
                onClick={() => { setFilterUrgency('critical'); setFilterStatus('all'); }}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors shrink-0 flex items-center gap-1.5",
                  filterUrgency === 'critical'
                    ? "bg-sev-critical/20 border-sev-critical/60 text-sev-critical font-medium"
                    : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sev-critical animate-pulse" />
                <span>Critical ({rescueRequests.filter(r => r.urgency === 'critical').length})</span>
              </button>
              <button
                onClick={() => { setFilterUrgency('all'); setFilterStatus('pending'); }}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors shrink-0 flex items-center gap-1.5",
                  filterStatus === 'pending'
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-400 font-medium"
                    : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Pending ({rescueRequests.filter(r => r.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => { setFilterUrgency('all'); setFilterStatus('dispatched'); }}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors shrink-0 flex items-center gap-1.5",
                  filterStatus === 'dispatched'
                    ? "bg-zd-accent/20 border-zd-accent/60 text-zd-accent font-medium"
                    : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zd-accent" />
                <span>Dispatched ({rescueRequests.filter(r => r.status === 'dispatched' || r.status === 'in_progress').length})</span>
              </button>
              <button
                onClick={() => { setFilterUrgency('all'); setFilterStatus('rescued'); }}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors shrink-0 flex items-center gap-1.5",
                  filterStatus === 'rescued'
                    ? "bg-sev-safe/20 border-sev-safe/60 text-sev-safe font-medium"
                    : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sev-safe" />
                <span>Rescued ({rescueRequests.filter(r => r.status === 'rescued').length})</span>
              </button>
            </div>
          </div>

          {/* Citizen Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-zd-dim text-xs font-sans">
                <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-40 text-zd-accent" />
                <p>No rescue requests match your current filters.</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRescueId === req.id;
                const isCritical = req.urgency === 'critical';
                const isRescued = req.status === 'rescued';
                const isDispatched = req.status === 'dispatched' || req.status === 'in_progress';

                return (
                  <div
                    key={req.id}
                    onClick={() => selectRescueRequest(req.id)}
                    className={clsx(
                      "p-3.5 rounded-panel border transition-all duration-150 cursor-pointer text-xs font-sans relative group",
                      isSelected 
                        ? "bg-zd-raised border-zd-accent shadow-sm" 
                        : "bg-zd-surface border-zd-border hover:border-zd-border-focus hover:bg-zd-hover"
                    )}
                  >
                    {/* Header = ID + Ward (muted) + Status (dot + sentence case, filled badge ONLY if Critical) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-xs font-semibold text-zd-text tracking-wide tabular-nums">{req.code}</span>
                        <span className="text-zd-dim">·</span>
                        <span className="text-xs text-zd-muted font-sans truncate">{req.wardName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCritical && req.status !== 'rescued' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-sev-critical text-white flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>Critical</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-sans text-zd-muted">
                            <span className={clsx(
                              "w-2 h-2 rounded-full",
                              isRescued ? "bg-sev-safe" : isDispatched ? "bg-zd-accent" : "bg-sev-warning"
                            )} />
                            <span className="capitalize">{req.status.replace('_', ' ')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body = Name + Souls Count */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-zd-text text-sm truncate">{req.citizenName}</span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zd-raised border border-zd-border text-zd-text flex items-center gap-1 whitespace-nowrap tabular-nums shrink-0">
                        <Users className="w-3 h-3 text-zd-accent" />
                        <span>{req.peopleCount} {req.peopleCount === 1 ? 'soul' : 'souls'}</span>
                      </span>
                    </div>

                    {/* One-line Description (Clamped to 2 lines) */}
                    <p className="text-zd-muted text-xs line-clamp-2 leading-relaxed mb-2">
                      {req.situation}
                    </p>

                    {/* Single Highlighted Vulnerability Line */}
                    {req.vulnerableDetails && (
                      <div className="text-[11px] text-sev-warning bg-sev-warning/10 border border-sev-warning/25 px-2.5 py-1 rounded mb-2 font-medium flex items-center gap-1.5 truncate">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="truncate">{req.vulnerableDetails}</span>
                      </div>
                    )}

                    {/* Footer Row: Phone, Battery, Time in ONE muted row */}
                    <div className="flex items-center justify-between text-xs text-zd-dim pt-2 border-t border-zd-border/60">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-mono tabular-nums text-zd-muted">
                          <Phone className="w-3 h-3 text-zd-accent" />
                          <span>{req.phone}</span>
                        </span>
                        {req.batteryPct !== undefined && (
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Battery className={clsx("w-3 h-3", req.batteryPct < 25 ? "text-sev-critical" : "text-zd-dim")} />
                            <span>{req.batteryPct}%</span>
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-zd-dim">
                        <Clock className="w-3 h-3" />
                        <span>{req.timestamp}</span>
                      </span>
                    </div>

                    {/* State Action: ONE primary action per state + Overflow "..." menu */}
                    <div className="mt-2.5 pt-2 border-t border-zd-border/60 flex items-center justify-between gap-2">
                      {/* State 1: Pending -> Dispatch primary button */}
                      {req.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleOpenDispatch(req); }}
                          className="flex-1 h-8 text-xs font-semibold gap-1.5 justify-center"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </Button>
                      )}

                      {/* State 2: Dispatched -> Team info */}
                      {isDispatched && (
                        <div className="flex-1 px-2.5 py-1.5 rounded bg-zd-raised border border-zd-border flex items-center justify-between text-xs min-w-0">
                          <span className="text-zd-accent font-medium flex items-center gap-1.5 truncate">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{req.assignedOfficerName || 'Team Dispatched'}</span>
                          </span>
                          <span className="text-zd-dim text-[11px] font-mono shrink-0 ml-2">{req.assignedUnit || 'SAR'}</span>
                        </div>
                      )}

                      {/* State 3: Rescued -> Safe confirmation badge */}
                      {isRescued && (
                        <div className="flex-1 px-2.5 py-1.5 rounded bg-sev-safe/10 border border-sev-safe/25 flex items-center gap-1.5 text-xs text-sev-safe">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Extricated & safe</span>
                        </div>
                      )}

                      {/* Overflow "..." menu for secondary actions */}
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-control bg-zd-raised hover:bg-zd-hover text-zd-muted hover:text-zd-text border border-zd-border flex items-center justify-center transition-colors shrink-0"
                            title="More actions"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            onClick={(e) => e.stopPropagation()}
                            side="top"
                            align="end"
                            sideOffset={4}
                            className="z-50 w-44 p-1.5 bg-zd-surface border border-zd-border rounded-panel shadow-popover text-xs font-sans space-y-1 animate-in fade-in-0 zoom-in-95"
                          >
                            {req.status !== 'rescued' && (
                              <button
                                onClick={() => handleMarkRescued(req)}
                                className="w-full px-2.5 py-1.5 rounded-control text-left hover:bg-zd-hover text-sev-safe flex items-center gap-2 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark safe</span>
                              </button>
                            )}
                            {isDispatched && (
                              <button
                                onClick={() => handleOpenDispatch(req)}
                                className="w-full px-2.5 py-1.5 rounded-control text-left hover:bg-zd-hover text-zd-text flex items-center gap-2 transition-colors"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-zd-accent" />
                                <span>Reassign team</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleSendPing(req)}
                              className="w-full px-2.5 py-1.5 rounded-control text-left hover:bg-zd-hover text-zd-muted hover:text-zd-text flex items-center gap-2 transition-colors"
                            >
                              <Radio className="w-3.5 h-3.5 text-zd-accent" />
                              <span>Send beacon ping</span>
                            </button>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Detailed Citizen Distress Dossier Drawer */}
      <Drawer
        isOpen={Boolean(selectedRequest)}
        onClose={() => selectRescueRequest(null)}
        title={selectedRequest ? `Rescue Dossier: ${selectedRequest.code}` : ''}
        subtitle={selectedRequest ? `${selectedRequest.citizenName} • ${selectedRequest.wardName}` : ''}
        width="w-full max-w-md"
      >
        {selectedRequest && (
          <div className="space-y-4 font-sans text-xs">
            {/* Status & Urgency Banner */}
            <div className={clsx(
              "p-3 rounded-panel border flex items-center justify-between",
              selectedRequest.status === 'rescued' ? "bg-sev-safe/15 border-sev-safe/30 text-sev-safe" :
              selectedRequest.urgency === 'critical' ? "bg-sev-critical/15 border-sev-critical/30 text-sev-critical" :
              "bg-sev-warning/15 border-sev-warning/30 text-sev-warning"
            )}>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  "w-2.5 h-2.5 rounded-full",
                  selectedRequest.status === 'rescued' ? 'bg-sev-safe' : 'bg-sev-critical animate-ping'
                )} />
                <span className="font-semibold uppercase tracking-wider text-xs">
                  {selectedRequest.urgency} Urgency • {selectedRequest.status.replace('_', ' ')}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-zd-text">
                {selectedRequest.peopleCount} Persons
              </span>
            </div>

            {/* Situation Details */}
            <div className="p-3 bg-zd-raised rounded-panel border border-zd-border space-y-2">
              <div className="font-semibold text-zd-text">Distress Call Transcript & Observation</div>
              <p className="text-zd-muted leading-relaxed text-xs">
                "{selectedRequest.situation}"
              </p>
              {selectedRequest.vulnerableDetails && (
                <div className="p-2 rounded bg-sev-critical/10 border border-sev-critical/20 text-sev-critical font-medium text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Vulnerability: {selectedRequest.vulnerableDetails}</span>
                </div>
              )}
            </div>

            {/* Citizen Details Card */}
            <div className="p-3 bg-zd-surface rounded-panel border border-zd-border space-y-2.5">
              <div className="font-semibold text-zd-text border-b border-zd-border pb-1.5 flex items-center justify-between">
                <span>Citizen Contact Information</span>
                <span className="text-[11px] font-normal text-zd-dim">Verified Cell ID</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zd-dim block">Primary Phone</span>
                  <span className="font-mono font-medium text-zd-text">{selectedRequest.phone}</span>
                </div>
                {selectedRequest.alternatePhone && (
                  <div>
                    <span className="text-zd-dim block">Satellite Alt Contact</span>
                    <span className="font-mono font-medium text-zd-text">{selectedRequest.alternatePhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-zd-dim block">Distress Timestamp</span>
                  <span className="font-mono text-zd-text">{selectedRequest.timestamp}</span>
                </div>
                <div>
                  <span className="text-zd-dim block">Phone Battery</span>
                  <span className="font-mono text-zd-text">{selectedRequest.batteryPct ?? 65}% Remaining</span>
                </div>
              </div>

              <div>
                <span className="text-zd-dim text-[11px] block">Reported Address</span>
                <span className="text-zd-text font-medium text-xs">{selectedRequest.addressText}</span>
              </div>

              <div>
                <span className="text-zd-dim text-[11px] block">GPS Coordinates</span>
                <span className="font-mono text-xs text-zd-accent">
                  {selectedRequest.lat.toFixed(5)}° N, {selectedRequest.lng.toFixed(5)}° E
                </span>
              </div>
            </div>

            {/* Assigned Unit & Officer */}
            <div className="p-3 bg-zd-surface rounded-panel border border-zd-border space-y-2">
              <div className="font-semibold text-zd-text border-b border-zd-border pb-1.5 flex items-center justify-between">
                <span>Assigned Rescue Taskforce</span>
                <button
                  onClick={() => handleOpenDispatch(selectedRequest)}
                  className="text-zd-accent hover:underline text-[11px] font-medium"
                >
                  {selectedRequest.assignedOfficerId ? 'Change Officer' : 'Assign Team'}
                </button>
              </div>

              {selectedRequest.assignedOfficerName ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-zd-accent" />
                    <span className="font-semibold text-zd-text">{selectedRequest.assignedOfficerName}</span>
                  </div>
                  <div className="text-zd-muted text-[11px]">
                    Unit: <span className="text-zd-text font-medium">{selectedRequest.assignedUnit}</span>
                  </div>
                  {selectedRequest.notes && (
                    <div className="text-[11px] text-zd-dim bg-zd-base p-2 rounded border border-zd-border mt-1">
                      {selectedRequest.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-zd-dim text-xs">
                  <p>No commanding officer assigned yet.</p>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenDispatch(selectedRequest)}
                    className="mt-2 text-xs w-full"
                  >
                    Dispatch Nearest Unit
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 flex flex-col gap-2">
              {selectedRequest.status !== 'rescued' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleMarkRescued(selectedRequest);
                    selectRescueRequest(null);
                  }}
                  className="w-full bg-sev-safe hover:bg-sev-safe-hover text-white flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Extrication & Safety</span>
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => handleSendPing(selectedRequest)}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <Radio className="w-4 h-4 text-zd-accent" />
                <span>Send Two-Way Satellite Broadcast</span>
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* 5. "Raise Emergency SOS" Citizen Intake Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Raise Emergency Citizen Rescue SOS"
        subtitle="Simulate incoming distress intake from citizen emergency portal or emergency 112 hotline"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSOS} className="space-y-3.5 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zd-muted mb-1 font-medium">Citizen / Family Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Rawat & Family"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
              />
            </div>

            <div>
              <label className="block text-zd-muted mb-1 font-medium">Primary Contact Number *</label>
              <input
                type="text"
                required
                placeholder="+91-98765-43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zd-muted mb-1 font-medium">Ward / Catchment Area *</label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text focus:outline-none focus:border-zd-accent"
              >
                {wards.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.riskLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zd-muted mb-1 font-medium">People Trapped *</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text font-mono"
              />
            </div>

            <div>
              <label className="block text-zd-muted mb-1 font-medium">Urgency Level *</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as RescueUrgency)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text font-semibold text-sev-critical"
              >
                <option value="critical">CRITICAL (Imminent Life Threat)</option>
                <option value="urgent">URGENT (Cut off / Inundated)</option>
                <option value="moderate">MODERATE (Precautionary)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zd-muted mb-1 font-medium">Local Address / Landmarks</label>
            <input
              type="text"
              placeholder="e.g. Near Khoh bridge culvert, Green roof house"
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim"
            />
          </div>

          <div>
            <label className="block text-zd-muted mb-1 font-medium">Hazard Nature</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'flood_inundation', label: 'Surging Water', icon: Waves },
                { id: 'landslide_trap', label: 'Mudslide / Rock', icon: Mountain },
                { id: 'isolated_cut_off', label: 'Bridge Washed', icon: Compass },
                { id: 'medical_trauma', label: 'Medical Emergency', icon: HeartHandshake },
              ].map(h => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => setHazardType(h.id as RescueHazardType)}
                  className={clsx(
                    "p-2 rounded border text-left flex items-center gap-1.5 transition-colors text-xs font-sans",
                    hazardType === h.id 
                      ? "bg-zd-accent/20 border-zd-accent text-zd-accent font-semibold" 
                      : "bg-zd-raised border-zd-border text-zd-muted hover:text-zd-text"
                  )}
                >
                  <h.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zd-muted mb-1 font-medium">Vulnerable Citizens Present (Infants, Elderly, Sick)</label>
            <input
              type="text"
              placeholder="e.g. 1 newborn baby, 1 oxygen patient requiring wheelchair"
              value={vulnerableDetails}
              onChange={(e) => setVulnerableDetails(e.target.value)}
              className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim"
            />
          </div>

          <div>
            <label className="block text-zd-muted mb-1 font-medium">Situation & Entrapment Narrative *</label>
            <textarea
              required
              rows={3}
              placeholder="Detail water level, structural condition, accessible entry points..."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
            />
          </div>

          <div className="pt-2 border-t border-zd-border flex items-center justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-sev-critical hover:bg-sev-critical-hover text-white">
              Dispatch Distress Beacon
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. "Dispatch Field Officer / Unit" Modal */}
      <Modal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title="Dispatch Field Taskforce to Distress Location"
        subtitle={targetRequestForDispatch ? `Assign tactical unit for ${targetRequestForDispatch.citizenName} (${targetRequestForDispatch.code})` : ''}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-sans">
          {targetRequestForDispatch && (
            <div className="p-3 bg-zd-raised rounded-panel border border-zd-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zd-text">{targetRequestForDispatch.citizenName} ({targetRequestForDispatch.peopleCount} trapped)</span>
                <span className="text-sev-critical font-mono font-bold uppercase">{targetRequestForDispatch.urgency}</span>
              </div>
              <p className="text-zd-muted text-[11px]">{targetRequestForDispatch.situation}</p>
              <div className="text-[11px] text-zd-dim">📍 {targetRequestForDispatch.addressText} ({targetRequestForDispatch.wardName})</div>
            </div>
          )}

          <div>
            <label className="block text-zd-muted mb-2 font-medium">Select Commanding Officer / Tactical Unit</label>
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {stateOfficers.map(officer => {
                const isSelected = selectedOfficerId === officer.id;
                return (
                  <div
                    key={officer.id}
                    onClick={() => setSelectedOfficerId(officer.id)}
                    className={clsx(
                      "p-3 rounded-panel border transition-all cursor-pointer flex items-center justify-between gap-3",
                      isSelected 
                        ? "bg-zd-raised border-zd-accent shadow-sm" 
                        : "bg-zd-surface border-zd-border hover:bg-zd-hover"
                    )}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-zd-text flex items-center gap-2">
                        <span>{officer.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zd-base border border-zd-border text-zd-muted">
                          {officer.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-zd-muted">
                        {officer.rank} • <span className="text-zd-text font-medium">{officer.unitName}</span>
                      </div>
                      <div className="text-[10px] text-zd-dim">
                        Equipped: {officer.equipment.slice(0, 2).join(', ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold",
                        officer.status === 'standby' ? 'bg-sev-safe/20 text-sev-safe' : 'bg-zd-accent/20 text-zd-accent'
                      )}>
                        {officer.status.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-zd-dim mt-1 font-mono">{officer.personnelCount} crew</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-zd-muted mb-1 font-medium">Tactical Deployment Briefing / Directives</label>
            <textarea
              rows={2}
              value={dispatchBriefing}
              onChange={(e) => setDispatchBriefing(e.target.value)}
              placeholder="Provide ingress corridor advice, equipment requirements, life vest staging..."
              className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
            />
          </div>

          <div className="pt-2 border-t border-zd-border flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmDispatch}>
              Deploy Unit Immediately
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
