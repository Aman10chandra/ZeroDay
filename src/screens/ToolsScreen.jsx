import React from 'react';
import { Radio, Activity, Network, AlertOctagon, ChevronRight } from 'lucide-react';

/**
 * ToolsScreen:
 * Dedicated screen hosting the three engineering sub-systems:
 * 1. Sensor telemetry (MPU-6050)
 * 2. Risk model (CatBoost + LSTM)
 * 3. Mesh and LoRA gateway (SX1276)
 */
export default function ToolsScreen({
  onNavigateMPU6050,
  onNavigateAIRiskEngine,
  onNavigateGateway,
  userRole = 'admin'
}) {
  const isResident = userRole === 'resident';

  const tools = [
    {
      id: 'telemetry',
      title: 'Sensor telemetry',
      description: isResident 
        ? 'MPU-6050 · Slope vibration and tilt · View only'
        : 'MPU-6050 · Slope vibration and tilt',
      icon: Radio,
      onClick: onNavigateMPU6050,
      renderLiveSummary: () => (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E7D4F] dark:bg-[#3FA66A] flex-shrink-0" />
            <span className="text-xs font-sans font-medium text-[#2E7D4F] dark:text-[#3FA66A]">
              Online
            </span>
          </div>
          <span className="text-xs font-mono text-[#5C635E] dark:text-[#8A928D] mt-0.5">
            SN-022
          </span>
        </div>
      )
    },
    {
      id: 'risk',
      title: 'Risk model',
      description: isResident
        ? 'CatBoost + LSTM · Susceptibility and live trigger · View only'
        : 'CatBoost + LSTM · Susceptibility and live trigger',
      icon: Activity,
      onClick: onNavigateAIRiskEngine,
      renderLiveSummary: () => (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-[#C1271D] dark:text-[#D9382E] fill-[#C1271D] dark:fill-[#D9382E] flex-shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-sans font-medium text-[#C1271D] dark:text-[#D9382E]">
              Critical
            </span>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] mt-0.5">
            94%
          </span>
        </div>
      )
    },
    {
      id: 'gateway',
      title: 'Mesh and LoRA gateway',
      description: isResident
        ? 'SX1276 868 MHz · Peer-to-peer relay · View only'
        : 'SX1276 868 MHz · Peer-to-peer relay',
      icon: Network,
      onClick: onNavigateGateway,
      renderLiveSummary: () => (
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono font-semibold text-[#1A1D1B] dark:text-[#ECEAE4]">
            9/12 nodes
          </span>
          <span className="text-xs font-mono text-[#5C635E] dark:text-[#8A928D] mt-0.5">
            -74 dBm
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-28 pb-[calc(6rem+env(safe-area-inset-bottom))] transition-colors select-none">
      {/* Header */}
      <header className="px-4 py-3 bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-sans font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] leading-tight">
              Tools
            </h1>
            <p className="text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] mt-0.5">
              Sensors, models and comms
            </p>
          </div>
          <span className="text-xs font-sans text-[#5C635E] dark:text-[#8A928D]">
            {userRole === 'admin' ? 'Admin' : 'Resident'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 space-y-4">
        {/* Three rows in one container with 8px radius and 1px dividers */}
        <section 
          aria-label="Engineering tool modules"
          className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] bg-[#FAF9F6] dark:bg-[#171B19] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden"
        >
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={t.onClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (t.onClick) t.onClick();
                  }
                }}
                className="min-h-[72px] p-3.5 flex items-center justify-between cursor-pointer transition-colors duration-150 hover:bg-[#ECE9E2]/60 dark:hover:bg-[#2A302D]/40 active:bg-[#ECE9E2] dark:active:bg-[#2A302D] focus:outline-none"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="w-10 h-10 rounded-[8px] bg-[#ECE9E2] dark:bg-[#2A302D] border border-[#D8D4CA] dark:border-[#3A423E] flex items-center justify-center text-[#1A1D1B] dark:text-[#ECEAE4] flex-shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[16px] font-sans font-semibold text-[#1A1D1B] dark:text-[#ECEAE4] leading-tight truncate">
                      {t.title}
                    </h2>
                    <p className="text-[14px] font-sans text-[#5C635E] dark:text-[#8A928D] mt-0.5 leading-snug truncate">
                      {t.description}
                    </p>
                  </div>
                </div>

                {/* Right: Live Summary & Chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {t.renderLiveSummary()}
                  <ChevronRight className="w-4 h-4 text-[#5C635E] dark:text-[#8A928D]" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Subtext info line */}
        <p className="text-[13px] font-sans text-[#5C635E] dark:text-[#8A928D] px-1">
          Engineering views for field hardware and prediction models.
        </p>
      </main>
    </div>
  );
}
