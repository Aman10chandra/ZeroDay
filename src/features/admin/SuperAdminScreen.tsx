import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Modal } from '../../components/ui/Modal';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Phone, 
  CheckCircle2, 
  Search, 
  Plus, 
  Compass, 
  Waves, 
  Clock, 
  ArrowRight,
  UserPlus,
  Shield,
  LifeBuoy,
  ChevronRight,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import { StateSection, StateOfficer } from '../../types';

export const SuperAdminScreen: React.FC = () => {
  const { 
    stateSections, 
    stateOfficers, 
    currentUser, 
    assignSectionOfficer, 
    addOfficer, 
    updateOfficerStatus, 
    selectedSectionId, 
    selectStateSection, 
    navigateScreen, 
    showToast, 
    addAuditLog 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'sections' | 'officers'>('sections');
  const [filterMode, setFilterMode] = useState<'all' | 'gaps' | 'critical'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Drawers
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [targetSection, setTargetSection] = useState<StateSection | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailSection, setDetailSection] = useState<StateSection | null>(null);

  // Commission Officer Modal
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [officerRank, setOfficerRank] = useState('Inspector / Team Lead');
  const [officerDept, setOfficerDept] = useState<'SDRF' | 'NDRF' | 'DDMA' | 'ITBP' | 'State Fire & Rescue'>('SDRF');
  const [officerPhone, setOfficerPhone] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerUnit, setOfficerUnit] = useState('');
  const [personnelCount, setPersonnelCount] = useState(12);

  // Summary Metrics
  const totalSections = stateSections.length;
  const criticalSections = stateSections.filter(s => s.riskLevel === 'critical').length;
  const unassignedCount = stateSections.filter(s => !s.assignedOfficerId).length;
  const deployedOfficers = stateOfficers.filter(o => o.status === 'deployed').length;
  const totalOfficers = stateOfficers.length;

  // Filtered Sections
  const filteredSections = stateSections.filter(sec => {
    if (districtFilter !== 'all' && sec.district !== districtFilter) return false;
    if (filterMode === 'gaps' && sec.assignedOfficerId) return false;
    if (filterMode === 'critical' && sec.riskLevel !== 'critical') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        sec.name.toLowerCase().includes(q) ||
        sec.district.toLowerCase().includes(q) ||
        sec.riverBasin.toLowerCase().includes(q) ||
        (sec.assignedOfficerName && sec.assignedOfficerName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const districts = Array.from(new Set(stateSections.map(s => s.district)));

  const handleOpenAssignModal = (section: StateSection, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetSection(section);
    const available = stateOfficers.find(o => o.status === 'standby' || o.id === section.assignedOfficerId) || stateOfficers[0];
    setSelectedOfficerId(available?.id || '');
    setAssignmentNotes(`Sector ${section.name} deployment. Priority focus: civilian evacuation and flood barrier monitoring.`);
    setAssignmentModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!targetSection || !selectedOfficerId) return;
    await assignSectionOfficer(targetSection.id, selectedOfficerId);
    setAssignmentModalOpen(false);
    if (detailSection?.id === targetSection.id) {
      const updated = stateSections.find(s => s.id === targetSection.id);
      if (updated) setDetailSection(updated);
    }
  };

  const handleOpenDetail = (section: StateSection) => {
    setDetailSection(section);
    setDetailDrawerOpen(true);
  };

  const handleCommissionOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim() || !officerPhone.trim() || !officerUnit.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing Details',
        message: 'Please complete all required fields.',
      });
      return;
    }

    const newOfficer = await addOfficer({
      name: officerName,
      rank: officerRank,
      department: officerDept,
      phone: officerPhone,
      email: officerEmail || `${officerName.toLowerCase().replace(/\s+/g, '.')}@gov.in`,
      unitName: officerUnit,
      personnelCount: Number(personnelCount) || 10,
      equipment: ['High-buoyancy vests', 'VHF Comms', 'High-angle Ropes'],
      status: 'standby',
    });

    setCommissionModalOpen(false);
    showToast({
      type: 'success',
      title: 'Officer Commissioned',
      message: `Registered ${newOfficer.name} into State Response Roster.`,
    });

    setOfficerName('');
    setOfficerPhone('');
    setOfficerEmail('');
    setOfficerUnit('');
  };

  return (
    <div className="h-full flex flex-col bg-zd-base text-zd-text overflow-hidden font-sans">
      {/* 1. Calm, Clean Top Header */}
      <header className="px-6 py-4 border-b border-zd-border bg-zd-surface shrink-0 flex flex-wrap items-center justify-between gap-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zd-dim uppercase tracking-wider">Super Admin Console</span>
            <span className="text-zd-border">/</span>
            <span className="text-[11px] font-mono text-zd-accent uppercase tracking-wider font-semibold">Pauri Garhwal & State Command</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zd-text mt-0.5">
            State Area Command & Officer Assignments
          </h1>
          <p className="text-xs text-zd-muted mt-0.5">
            High-level oversight of all regional sectors, flood catchments, and responding commander deployments.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => navigateScreen('rescue_requests')}
            className="text-xs flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-sev-critical" />
            <span>Open Citizen Rescue Map</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => setCommissionModalOpen(true)}
            className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Commission Officer</span>
          </Button>
        </div>
      </header>

      {/* 2. Calm Summary Cards (Low Cognitive Load - 3 Metrics) */}
      <section aria-label="Command Summary" className="px-6 py-3 border-b border-zd-border bg-zd-surface/50 shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center justify-between p-3 rounded-control bg-zd-surface border border-zd-border">
          <div className="space-y-0.5">
            <span className="text-[11px] text-zd-dim font-mono uppercase">Monitored Sectors</span>
            <div className="text-base font-bold font-mono text-zd-text">{totalSections} Areas</div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-zd-raised text-zd-muted font-mono font-medium">
            {criticalSections} Critical
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-control bg-zd-surface border border-zd-border">
          <div className="space-y-0.5">
            <span className="text-[11px] text-zd-dim font-mono uppercase">Command Gaps</span>
            <div className={clsx("text-base font-bold font-mono", unassignedCount > 0 ? "text-amber-400" : "text-sev-safe")}>
              {unassignedCount} Sectors Unassigned
            </div>
          </div>
          {unassignedCount > 0 ? (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold font-mono">
              Action Required
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-sev-safe/15 border border-sev-safe/30 text-sev-safe font-semibold font-mono">
              Fully Covered
            </span>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-control bg-zd-surface border border-zd-border">
          <div className="space-y-0.5">
            <span className="text-[11px] text-zd-dim font-mono uppercase">Officer Force Deployment</span>
            <div className="text-base font-bold font-mono text-zd-text">{deployedOfficers} / {totalOfficers} Active</div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-zd-accent/15 border border-zd-accent/30 text-zd-accent font-mono font-semibold">
            {totalOfficers - deployedOfficers} on Standby
          </span>
        </div>
      </section>

      {/* 3. Navigation Controls & Search Bar */}
      <div className="px-6 py-3 border-b border-zd-border bg-zd-surface shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-zd-raised p-1 rounded-control border border-zd-border">
          <button
            onClick={() => setActiveTab('sections')}
            className={clsx(
              "px-3 py-1 rounded-control font-medium transition-colors flex items-center gap-1.5",
              activeTab === 'sections' ? "bg-zd-surface text-zd-text shadow-sm" : "text-zd-muted hover:text-zd-text"
            )}
          >
            <Compass className="w-3.5 h-3.5 text-zd-accent" />
            <span>State Sectors ({stateSections.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={clsx(
              "px-3 py-1 rounded-control font-medium transition-colors flex items-center gap-1.5",
              activeTab === 'officers' ? "bg-zd-surface text-zd-text shadow-sm" : "text-zd-muted hover:text-zd-text"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zd-accent" />
            <span>Officer Roster ({stateOfficers.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'sections' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors",
                  filterMode === 'all' ? "bg-zd-raised border-zd-accent/50 text-zd-text font-medium" : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('gaps')}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors flex items-center gap-1",
                  filterMode === 'gaps' ? "bg-amber-500/20 border-amber-500/60 text-amber-400 font-semibold" : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span>Needs Officer ({unassignedCount})</span>
              </button>
              <button
                onClick={() => setFilterMode('critical')}
                className={clsx(
                  "px-2.5 py-1 rounded-control border transition-colors flex items-center gap-1",
                  filterMode === 'critical' ? "bg-sev-critical/20 border-sev-critical/60 text-sev-critical font-semibold" : "border-zd-border text-zd-muted hover:text-zd-text"
                )}
              >
                <span>Critical Risk ({criticalSections})</span>
              </button>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-zd-raised border border-zd-border rounded-control text-zd-text focus:outline-none focus:border-zd-accent font-sans"
              >
                <option value="all">All Districts</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-zd-dim absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'sections' ? "Search sector or officer..." : "Search officer by name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
            />
          </div>
        </div>
      </div>

      {/* 4. Spacious, Uncluttered Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0 bg-zd-base">
        {activeTab === 'sections' ? (
          /* CALM SECTORS MASTER LIST */
          <div className="max-w-6xl mx-auto space-y-2.5">
            {filteredSections.length === 0 ? (
              <div className="text-center py-16 text-zd-dim text-xs">
                <Compass className="w-8 h-8 mx-auto mb-2 opacity-30 text-zd-accent" />
                <p>No state sectors match your current filter.</p>
              </div>
            ) : (
              filteredSections.map((section) => {
                const isAssigned = Boolean(section.assignedOfficerId);
                const isCritical = section.riskLevel === 'critical';

                return (
                  <div
                    key={section.id}
                    onClick={() => handleOpenDetail(section)}
                    className={clsx(
                      "p-4 rounded-panel border bg-zd-surface transition-all duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zd-border-high hover:bg-zd-hover/40",
                      isCritical ? "border-l-4 border-l-sev-critical" : "border-l-4 border-l-zd-border"
                    )}
                  >
                    {/* Left: Sector Identity */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zd-accent">{section.code}</span>
                        <span className="text-zd-dim">•</span>
                        <span className="text-xs font-semibold text-zd-text truncate">{section.name}</span>
                        <span className="text-[11px] text-zd-muted">({section.district})</span>
                      </div>
                      <div className="text-[11px] text-zd-muted flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Waves className="w-3 h-3 text-sky-400" /> {section.riverBasin}
                        </span>
                        <span className="text-zd-dim">•</span>
                        <span>{section.weatherCondition}</span>
                      </div>
                    </div>

                    {/* Middle: Severity & Active Rescues */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div>
                        <span className="text-[10px] text-zd-dim font-mono block uppercase">Severity</span>
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase inline-block",
                          section.riskLevel === 'critical' ? 'bg-sev-critical/20 text-sev-critical border border-sev-critical/30' :
                          section.riskLevel === 'warning' ? 'bg-sev-warning/20 text-sev-warning border border-sev-warning/30' :
                          section.riskLevel === 'advisory' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-sev-safe/20 text-sev-safe border border-sev-safe/30'
                        )}>
                          {section.riskLevel}
                        </span>
                      </div>

                      <div className="min-w-[90px]">
                        <span className="text-[10px] text-zd-dim font-mono block uppercase">SOS Calls</span>
                        <span className={clsx(
                          "font-mono font-semibold text-xs flex items-center gap-1.5",
                          section.activeRescueCount > 0 ? "text-sev-critical" : "text-zd-muted"
                        )}>
                          {section.activeRescueCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sev-critical animate-ping" />}
                          {section.activeRescueCount > 0 ? `${section.activeRescueCount} Active` : 'None'}
                        </span>
                      </div>

                      <div className="min-w-[100px] hidden lg:block">
                        <span className="text-[10px] text-zd-dim font-mono block uppercase">Evacuation</span>
                        <span className="font-mono text-xs text-zd-text">
                          {Math.round((section.evacuatedCount / section.totalPopulation) * 100)}% ({section.evacuatedCount})
                        </span>
                      </div>
                    </div>

                    {/* Right: Assigned Officer / Action */}
                    <div className="shrink-0 flex items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-zd-border">
                      {isAssigned ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zd-accent/15 border border-zd-accent/30 flex items-center justify-center text-zd-accent text-xs font-bold shrink-0">
                            {section.assignedOfficerName ? section.assignedOfficerName[0] : 'O'}
                          </div>
                          <div className="text-left min-w-[130px] max-w-[180px]">
                            <div className="font-semibold text-xs text-zd-text truncate">{section.assignedOfficerName}</div>
                            <div className="text-[10px] text-zd-dim truncate">{section.assignedUnit}</div>
                          </div>
                          <button
                            onClick={(e) => handleOpenAssignModal(section, e)}
                            className="px-2.5 py-1 text-xs rounded-control bg-zd-raised hover:bg-zd-hover text-zd-text border border-zd-border transition-colors font-medium"
                          >
                            Reassign
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30">
                            Command Gap
                          </span>
                          <Button
                            variant="primary"
                            onClick={(e) => handleOpenAssignModal(section, e)}
                            className="text-xs px-3 py-1 font-semibold shadow-sm"
                          >
                            + Assign Officer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* CALM OFFICER ROSTER */
          <div className="max-w-6xl mx-auto space-y-2.5">
            {stateOfficers.map((officer) => {
              const isDeployed = officer.status === 'deployed';

              return (
                <div
                  key={officer.id}
                  className="p-4 rounded-panel border border-zd-border bg-zd-surface flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zd-border-high transition-colors"
                >
                  {/* Left: Officer Profile */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-zd-accent/15 border border-zd-accent/30 flex items-center justify-center text-zd-accent text-xs font-bold shrink-0">
                      {officer.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zd-text truncate">{officer.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zd-base border border-zd-border text-zd-accent">
                          {officer.department}
                        </span>
                        <span className="text-[11px] text-zd-dim font-mono">{officer.badgeNumber}</span>
                      </div>
                      <div className="text-xs text-zd-muted mt-0.5">
                        {officer.rank} • <span className="text-zd-text font-medium">{officer.unitName}</span> ({officer.personnelCount} personnel)
                      </div>
                    </div>
                  </div>

                  {/* Middle: Current Sector Assignment */}
                  <div className="min-w-[200px] shrink-0">
                    <span className="text-[10px] text-zd-dim font-mono block uppercase">Assigned Sector</span>
                    <span className="text-xs font-semibold text-zd-text flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-zd-accent shrink-0" />
                      {officer.assignedAreaName || 'Standby Tactical Reserve'}
                    </span>
                  </div>

                  {/* Right: Status & Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase",
                      isDeployed ? "bg-zd-accent/20 text-zd-accent border border-zd-accent/30" : "bg-sev-safe/20 text-sev-safe border border-sev-safe/30"
                    )}>
                      {officer.status.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => {
                        const openSection = stateSections.find(s => !s.assignedOfficerId) || stateSections[0];
                        handleOpenAssignModal(openSection);
                      }}
                      className="px-2.5 py-1 text-xs rounded-control bg-zd-raised hover:bg-zd-hover text-zd-text border border-zd-border transition-colors font-medium"
                    >
                      Assign Sector
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Sector Details Drawer */}
      <Drawer
        isOpen={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={detailSection ? detailSection.name : ''}
        subtitle={detailSection ? `${detailSection.district} • ${detailSection.riverBasin}` : ''}
        width="w-full max-w-md"
      >
        {detailSection && (
          <div className="space-y-4 text-xs font-sans">
            {/* Status Strip */}
            <div className={clsx(
              "p-3 rounded-panel border flex items-center justify-between",
              detailSection.riskLevel === 'critical' ? "bg-sev-critical/15 border-sev-critical/30 text-sev-critical" :
              detailSection.riskLevel === 'warning' ? "bg-sev-warning/15 border-sev-warning/30 text-sev-warning" :
              "bg-zd-raised border-zd-border text-zd-text"
            )}>
              <span className="font-semibold uppercase font-mono">{detailSection.riskLevel} Hazard Priority</span>
              <span className="font-mono font-bold">Score {detailSection.riskScore} / 100</span>
            </div>

            {/* Tactical Conditions */}
            <div className="p-3 rounded-panel bg-zd-raised border border-zd-border space-y-2">
              <span className="text-[10px] uppercase font-mono text-zd-dim font-bold block">Hydrological & Access Status</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zd-dim block">3-Hour Precipitation</span>
                  <span className="font-mono font-bold text-zd-text">{detailSection.rainfallLast3hMm} mm</span>
                </div>
                <div>
                  <span className="text-zd-dim block">Active SOS Signals</span>
                  <span className="font-mono font-bold text-sev-critical">{detailSection.activeRescueCount} Calls</span>
                </div>
                <div>
                  <span className="text-zd-dim block">Road Network</span>
                  <span className="font-medium text-zd-text">{detailSection.roadAccessStatus}</span>
                </div>
                <div>
                  <span className="text-zd-dim block">Bridges Status</span>
                  <span className="font-medium text-zd-text">{detailSection.bridgeStatus}</span>
                </div>
              </div>
            </div>

            {/* Commanding Officer Details */}
            <div className="p-3 rounded-panel bg-zd-surface border border-zd-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-zd-dim font-bold">Commanding Officer</span>
                <button
                  onClick={() => handleOpenAssignModal(detailSection)}
                  className="text-zd-accent hover:underline text-[11px] font-semibold"
                >
                  {detailSection.assignedOfficerId ? 'Change Officer' : 'Assign Officer'}
                </button>
              </div>

              {detailSection.assignedOfficerName ? (
                <div className="space-y-1 pt-1">
                  <div className="font-semibold text-sm text-zd-text flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-zd-accent" />
                    <span>{detailSection.assignedOfficerName}</span>
                  </div>
                  <div className="text-xs text-zd-muted">
                    {detailSection.assignedOfficerRank} • {detailSection.assignedUnit}
                  </div>
                  {detailSection.officerPhone && (
                    <div className="text-[11px] text-zd-dim flex items-center gap-1.5 pt-1">
                      <Phone className="w-3 h-3 text-zd-accent" />
                      <span>{detailSection.officerPhone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-zd-dim">
                  <p>No commanding officer assigned to this area.</p>
                  <Button
                    variant="primary"
                    onClick={() => handleOpenAssignModal(detailSection)}
                    className="mt-2 text-xs w-full"
                  >
                    Assign Officer Now
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setDetailDrawerOpen(false);
                navigateScreen('rescue_requests');
              }}
              className="w-full text-xs flex items-center justify-center gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-sev-critical" />
              <span>Inspect Citizen Rescues in this Sector</span>
            </Button>
          </div>
        )}
      </Drawer>

      {/* 6. Focused Officer Assignment Modal */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        title="Assign Commanding Officer"
        subtitle={targetSection ? `Deploy tactical response leadership to ${targetSection.name} (${targetSection.district})` : ''}
        maxWidth="md"
      >
        <div className="space-y-3.5 text-xs font-sans">
          {targetSection && (
            <div className="p-3 bg-zd-raised rounded-panel border border-zd-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-zd-text">{targetSection.name}</div>
                <div className="text-[11px] text-zd-muted">{targetSection.district} • {targetSection.riverBasin}</div>
              </div>
              <span className={clsx(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                targetSection.riskLevel === 'critical' ? 'bg-sev-critical/20 text-sev-critical' : 'bg-sev-warning/20 text-sev-warning'
              )}>
                {targetSection.riskLevel}
              </span>
            </div>
          )}

          <div>
            <label className="block text-zd-muted mb-1.5 font-medium">Select Responding Officer</label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {stateOfficers.map((officer) => {
                const isSelected = selectedOfficerId === officer.id;

                return (
                  <div
                    key={officer.id}
                    onClick={() => setSelectedOfficerId(officer.id)}
                    className={clsx(
                      "p-2.5 rounded-control border transition-all cursor-pointer flex items-center justify-between gap-3",
                      isSelected ? "bg-zd-raised border-zd-accent shadow-sm" : "bg-zd-surface border-zd-border hover:bg-zd-hover"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-zd-text flex items-center gap-1.5">
                        <span>{officer.name}</span>
                        <span className="text-[10px] font-mono px-1 rounded bg-zd-base border border-zd-border text-zd-accent">
                          {officer.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-zd-muted truncate">
                        {officer.rank} • {officer.unitName}
                      </div>
                    </div>

                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold shrink-0",
                      officer.status === 'standby' ? 'bg-sev-safe/20 text-sev-safe' : 'bg-zd-accent/20 text-zd-accent'
                    )}>
                      {officer.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-zd-muted mb-1 font-medium">Deployment Instructions</label>
            <textarea
              rows={2}
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="State area deployment objectives..."
              className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
            />
          </div>

          <div className="pt-2 border-t border-zd-border flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmAssignment}>
              Confirm Area Command
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Commission Officer Modal */}
      <Modal
        isOpen={commissionModalOpen}
        onClose={() => setCommissionModalOpen(false)}
        title="Commission Responding Officer"
        subtitle="Register disaster response battalion commanders and QRT personnel into the state registry"
        maxWidth="md"
      >
        <form onSubmit={handleCommissionOfficer} className="space-y-3 text-xs font-sans">
          <div>
            <label className="block text-zd-muted mb-1 font-medium">Officer Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Insp. Sunil Bhatt"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zd-muted mb-1 font-medium">Department *</label>
              <select
                value={officerDept}
                onChange={(e) => setOfficerDept(e.target.value as any)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text focus:outline-none focus:border-zd-accent"
              >
                <option value="SDRF">SDRF</option>
                <option value="NDRF">NDRF</option>
                <option value="ITBP">ITBP</option>
                <option value="DDMA">DDMA</option>
                <option value="State Fire & Rescue">Fire & Rescue</option>
              </select>
            </div>

            <div>
              <label className="block text-zd-muted mb-1 font-medium">Rank / Designation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Inspector / QRT Lead"
                value={officerRank}
                onChange={(e) => setOfficerRank(e.target.value)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zd-muted mb-1 font-medium">Battalion / Unit Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. SDRF Water Rescue Unit 4"
                value={officerUnit}
                onChange={(e) => setOfficerUnit(e.target.value)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent"
              />
            </div>

            <div>
              <label className="block text-zd-muted mb-1 font-medium">Direct Phone *</label>
              <input
                type="text"
                required
                placeholder="+91-94120-00000"
                value={officerPhone}
                onChange={(e) => setOfficerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-zd-raised border border-zd-border rounded-control text-zd-text placeholder:text-zd-dim font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zd-border flex items-center justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => setCommissionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Commission to State Registry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
