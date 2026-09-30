import React from 'react';
import { Drawer } from '../ui/Drawer';
import { useStore } from '../../store/useStore';
import { SeverityDot } from '../ui/SeverityDot';
import { Button } from '../ui/Button';
import { ExternalLink, Droplets, Waves, Activity, ShieldAlert } from 'lucide-react';
import { WardRegion, SensorNode } from '../../types';

export const RightContextDrawer: React.FC = () => {
  const { rightDrawer, closeRightDrawer, navigateScreen, selectWard } = useStore();

  if (!rightDrawer.isOpen || !rightDrawer.data) return null;

  const renderContent = () => {
    if (rightDrawer.type === 'ward') {
      const ward = rightDrawer.data as WardRegion;
      return (
        <div className="space-y-5 font-sans">
          {/* Header severity status */}
          <div className="flex items-center justify-between pb-3 border-b border-zd-border">
            <div className="flex items-center gap-2">
              <SeverityDot level={ward.riskLevel} />
              <span className="font-sans font-medium text-xs capitalize text-zd-text">
                {ward.riskLevel} condition
              </span>
            </div>
            <span className="font-mono text-xs text-zd-dim">
              Score {ward.riskScore}/100
            </span>
          </div>

          {/* 3 Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-zd-base border border-zd-border rounded-panel">
              <span className="text-[11px] text-zd-muted block mb-1">Rainfall</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-light text-zd-text">{ward.rainfall1h}</span>
                <span className="font-sans text-[10px] text-zd-dim">mm/h</span>
              </div>
            </div>

            <div className="p-3 bg-zd-base border border-zd-border rounded-panel">
              <span className="text-[11px] text-zd-muted block mb-1">River Level</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-light text-zd-text">{ward.riverLevelM}</span>
                <span className="font-sans text-[10px] text-zd-dim">m</span>
              </div>
            </div>

            <div className="p-3 bg-zd-base border border-zd-border rounded-panel">
              <span className="text-[11px] text-zd-muted block mb-1">Saturation</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-lg font-light text-zd-text">{ward.soilSaturationPct}</span>
                <span className="font-sans text-[10px] text-zd-dim">%</span>
              </div>
            </div>
          </div>

          {/* Sparkline Trend */}
          <div className="p-3.5 bg-zd-base border border-zd-border rounded-panel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zd-muted">Precipitation History (6h)</span>
              <span className="font-mono text-[10px] text-zd-dim">50 mm/hr threshold</span>
            </div>
            <div className="h-16 w-full flex items-end gap-1.5 pt-2">
              {[18, 24, 31, 45, 58, 62].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      val >= 50 ? 'bg-sev-critical' : val >= 30 ? 'bg-sev-warning' : 'bg-zd-accent'
                    }`}
                    style={{ height: `${(val / 70) * 100}%` }}
                  />
                  <span className="font-mono text-[9px] text-zd-dim">{i * 2 + 1}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Field Status Summary */}
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel">
            <span className="text-[11px] text-zd-muted block mb-1">Catchment Assessment</span>
            <p className="font-sans text-xs text-zd-text leading-relaxed">
              {ward.statusSummary}
            </p>
          </div>

          {/* Households & Demographics */}
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Households at risk:</span>
              <span className="text-zd-text font-semibold">{ward.householdsAtRisk.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted font-sans">Basin catchment:</span>
              <span className="text-zd-text truncate">{ward.basin}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => {
                selectWard(ward.id);
                navigateScreen('region_detail');
                closeRightDrawer();
              }}
              className="w-full h-10 flex items-center justify-center gap-2"
            >
              <span>Open region</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    if (rightDrawer.type === 'sensor') {
      const sensor = rightDrawer.data as SensorNode;
      return (
        <div className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel flex justify-between items-center">
            <span className="font-mono text-zd-text font-semibold">{sensor.code}</span>
            <span className="font-mono text-[11px] text-zd-muted">Battery {sensor.batteryPct}%</span>
          </div>
          <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zd-muted">Type:</span>
              <span className="text-zd-text">{sensor.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted">Status:</span>
              <span className="text-zd-text capitalize">{sensor.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zd-muted">Uplink:</span>
              <span className="text-zd-text">LoRA 868 MHz</span>
            </div>
          </div>
          {sensor.type.toLowerCase().includes('inclinometer') || sensor.type.toLowerCase().includes('mpu') ? (
            <Button
              variant="primary"
              onClick={() => {
                navigateScreen('sensors_mpu');
                closeRightDrawer();
              }}
              className="w-full"
            >
              Open 3D Telemetry
            </Button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="text-xs text-zd-muted font-mono">
        Context detail loaded for {rightDrawer.type}.
      </div>
    );
  };

  const getTitle = () => {
    if (rightDrawer.type === 'ward') {
      return (rightDrawer.data as WardRegion).name;
    }
    if (rightDrawer.type === 'sensor') {
      return (rightDrawer.data as SensorNode).name;
    }
    return 'Context Inspector';
  };

  const getSubtitle = () => {
    if (rightDrawer.type === 'ward') {
      return `${(rightDrawer.data as WardRegion).district} · Catchment Detail`;
    }
    return 'Telemetry Details';
  };

  return (
    <Drawer
      isOpen={rightDrawer.isOpen}
      onClose={closeRightDrawer}
      title={getTitle()}
      subtitle={getSubtitle()}
      width="w-96"
    >
      {renderContent()}
    </Drawer>
  );
};
