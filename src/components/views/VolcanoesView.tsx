import React, { useState } from 'react';
import { VolcanoEvent } from '../../types';

interface VolcanoesViewProps {
  volcanoes: VolcanoEvent[];
  onSelectVolcano: (volcano: VolcanoEvent) => void;
}

export const VolcanoesView: React.FC<VolcanoesViewProps> = ({
  volcanoes,
  onSelectVolcano,
}) => {
  const [activeTab, setActiveTab] = useState<'90d' | 'all'>('90d');

  const handleExportData = () => {
    const headers = ['VOLCANO_NAME', 'AFFECTED_REGIONS', 'DATE_RANGE', 'STATUS', 'ALERT_LEVEL_BARS', 'VEI', 'SO2_OUTPUT_KT', 'ASH_PLUME_KM'];
    const rows = volcanoes.map((v) => [
      `"${v.name}"`,
      `"${v.regions.join('; ')}"`,
      `"${v.dateRange}"`,
      `"${v.status}"`,
      v.alertBars,
      v.vei,
      v.so2OutputKt,
      v.ashPlumeKm,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doomsday_volcanic_activity_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="volcanoes-view" className="flex flex-col w-full bg-[#131313] text-[#e2e2e2]">
      {/* Top Global Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#2C2E33] p-px">
        {/* Hero / Main Stat Card */}
        <div className="lg:col-span-8 bg-[#1f1f1f] relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDpjWO5Ms2bvBZmiNY_x1cE7vLSYs8Upw-sEOLBq9yvFO0kHMSzXtF6xENjOJ2t7U42b3RD-CSIx-2NAQmX6kVSezUGPMCOkhS3eYt3i60DEUvgxoy6JzYRruBKXNarlK9f8OSb2bWnW1X6s524kcbuKSCE0Eybcx_BA-F-kaXaeimh-6Se9_v1oc9iOLbRctihLHMKCIfDii1n8BuEcu7et8ub4bzsB_-pxxb6IXW9lEm3s28tOW2Y')`,
            }}
          ></div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1f1f] via-transparent to-transparent"></div>

          <div className="relative z-10 p-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#FF3B30] shadow-[0_0_12px_rgba(255,59,48,0.8)] animate-pulse"></div>
              <span className="text-[11px] font-mono font-bold text-[#FF3B30] uppercase tracking-widest">
                Global Volcano Status: Critical
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#cfc4c5] [writing-mode:vertical-rl] tracking-wider">
              SYS.MONITOR.V-01
            </span>
          </div>

          <div className="relative z-10 p-6">
            <h2 className="text-[42px] sm:text-[48px] font-headline font-black text-[#e2e2e2] mb-2 leading-none">
              42 <span className="text-[20px] font-headline font-bold text-[#cfc4c5]">ACTIVE ERUPTIONS</span>
            </h2>
            <p className="text-[13px] font-mono text-[#cfc4c5] max-w-xl leading-relaxed">
              Seismic swarm detected in the Ring of Fire. Magma displacement indicates high probability of multi-caldera cascade events within the next 90 days. Atmospheric sulfur dioxide (SO2) levels breaching containment thresholds.
            </p>
          </div>
        </div>

        {/* Secondary Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-px bg-[#2C2E33]">
          <div className="flex-1 bg-[#1f1f1f] p-6 flex flex-col justify-between">
            <span className="text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
              VEI 5+ Probability
            </span>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <span className="font-headline font-bold text-[32px] text-[#FFCC00]">
                  18.4%
                </span>
                <span className="text-[11px] font-mono text-[#FFCC00] mb-1">
                  +2.1% (72h)
                </span>
              </div>
              <div className="h-2 w-full bg-[#353535] overflow-hidden">
                <div className="h-full bg-[#FFCC00] w-[18.4%] shadow-[0_0_8px_rgba(255,204,0,0.5)]"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#1f1f1f] p-6 flex flex-col justify-between group hover:bg-[#2a2a2a] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
              Atmospheric Ash Coverage
            </span>
            <div className="flex items-end gap-3 mt-4">
              <span className="font-headline font-bold text-[32px] text-[#00F2FF]">
                14M
              </span>
              <span className="text-[13px] font-mono text-[#00F2FF] mb-1">
                km²
              </span>
            </div>
            
            {/* Mini Sparkline SVG */}
            <div className="mt-4 h-8 w-full text-[#00F2FF]">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                <path
                  className="opacity-80"
                  d="M0,20 L10,18 L20,19 L30,15 L40,16 L50,12 L60,14 L70,8 L80,10 L90,4 L100,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                ></path>
                <path
                  className="opacity-10"
                  d="M0,20 L10,18 L20,19 L30,15 L40,16 L50,12 L60,14 L70,8 L80,10 L90,4 L100,2 L100,20 L0,20 Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#2C2E33] p-px mt-px">
        {/* Historical Impact Charts (Left Column) */}
        <div className="lg:col-span-3 bg-[#131313] flex flex-col h-full">
          <div className="p-4 bg-[#2a2a2a] flex items-center justify-between border-b border-[#2C2E33]">
            <span className="text-[11px] font-mono font-bold text-[#e2e2e2] tracking-wider uppercase">
              HISTORICAL SEISMIC IMPACT
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#cfc4c5]">
              history
            </span>
          </div>

          <div className="p-6 flex flex-col gap-8 flex-1">
            {/* Chart 1: Krakatoa */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[11px] font-mono font-bold">
                <span className="text-[#cfc4c5]">KRAKATOA (1883)</span>
                <span className="text-[#FF3B30]">VEI 6</span>
              </div>
              <div className="flex gap-1 h-12 items-end">
                <div className="w-full bg-[#FF3B30]/20 h-[20%] hover:bg-[#FF3B30] transition-colors" title="Month 1: Initial explosions"></div>
                <div className="w-full bg-[#FF3B30]/40 h-[40%] hover:bg-[#FF3B30] transition-colors" title="Month 2: Magma chamber surge"></div>
                <div className="w-full bg-[#FF3B30]/60 h-[80%] hover:bg-[#FF3B30] transition-colors" title="Month 3: Island collapse"></div>
                <div className="w-full bg-[#FF3B30] shadow-[0_0_8px_rgba(255,59,48,0.8)] h-[100%]" title="Peak Eruption: Caldera destruction"></div>
                <div className="w-full bg-[#FF3B30]/80 h-[90%] hover:bg-[#FF3B30] transition-colors" title="Month 5: Tsunami cascade"></div>
                <div className="w-full bg-[#FF3B30]/40 h-[50%] hover:bg-[#FF3B30] transition-colors" title="Month 6: Ash cloud drift"></div>
              </div>
            </div>

            {/* Chart 2: Pinatubo */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[11px] font-mono font-bold">
                <span className="text-[#cfc4c5]">PINATUBO (1991)</span>
                <span className="text-[#FFCC00]">VEI 6</span>
              </div>
              <div className="flex gap-1 h-12 items-end">
                <div className="w-full bg-[#FFCC00]/20 h-[10%] hover:bg-[#FFCC00] transition-colors" title="Phase 1: Pre-eruption venting"></div>
                <div className="w-full bg-[#FFCC00]/30 h-[20%] hover:bg-[#FFCC00] transition-colors" title="Phase 2: Dome extrusion"></div>
                <div className="w-full bg-[#FFCC00]/50 h-[60%] hover:bg-[#FFCC00] transition-colors" title="Phase 3: Tephra fall"></div>
                <div className="w-full bg-[#FFCC00]/80 h-[80%] hover:bg-[#FFCC00] transition-colors" title="Phase 4: Stratospheric injection"></div>
                <div className="w-full bg-[#FFCC00] shadow-[0_0_8px_rgba(255,204,0,0.5)] h-[90%]" title="Peak SO2 release (20Mt)"></div>
                <div className="w-full bg-[#FFCC00]/30 h-[30%] hover:bg-[#FFCC00] transition-colors" title="Phase 6: Global cooling offset"></div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#353535]">
              <p className="text-[12px] font-mono text-[#cfc4c5] leading-relaxed">
                Data models correlate historical atmospheric ejection volume to current projected cascade scenarios.
              </p>
            </div>
          </div>
        </div>

        {/* Active Eruptions Table (Right Column) */}
        <div className="lg:col-span-9 bg-[#1b1b1b] flex flex-col overflow-hidden">
          <div className="p-4 bg-[#2a2a2a] flex items-center justify-between border-b border-[#2C2E33]">
            <span className="text-[11px] font-mono font-bold text-[#e2e2e2] uppercase tracking-wider">
              Forecasted & Active Volcanic Activity (0 - 90 Days)
            </span>
            <div className="flex gap-4">
              <button
                id="export-volcano-btn"
                onClick={handleExportData}
                className="bg-[#00F2FF] text-[#0e0e0e] px-4 py-1 text-[11px] font-mono font-bold hover:bg-white transition-colors"
              >
                EXPORT DATA
              </button>
            </div>
          </div>

          {/* Table Structure with background gaps */}
          <div className="flex-1 w-full overflow-x-auto">
            <div className="min-w-[800px] flex flex-col bg-[#2C2E33] gap-px">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-px bg-[#2C2E33]">
                <div className="col-span-3 bg-[#2a2a2a] p-3 text-[11px] font-mono font-bold text-[#cfc4c5]">
                  VOLCANO NAME
                </div>
                <div className="col-span-3 bg-[#2a2a2a] p-3 text-[11px] font-mono font-bold text-[#cfc4c5]">
                  AFFECTED REGIONS
                </div>
                <div className="col-span-2 bg-[#2a2a2a] p-3 text-[11px] font-mono font-bold text-[#cfc4c5]">
                  DATE RANGE
                </div>
                <div className="col-span-2 bg-[#2a2a2a] p-3 text-[11px] font-mono font-bold text-[#cfc4c5]">
                  STATUS
                </div>
                <div className="col-span-2 bg-[#2a2a2a] p-3 text-[11px] font-mono font-bold text-[#cfc4c5] text-right">
                  ALERT LEVEL
                </div>
              </div>

              {/* Volcano Rows */}
              {volcanoes.map((volcano) => {
                const isErupting = volcano.status === 'ERUPTING';
                const isRestless = volcano.status === 'RESTLESS';
                const isMonitoring = volcano.status === 'MONITORING';
                const isDormant = volcano.status.includes('DORMANT');

                const statusTextColor = isErupting
                  ? 'text-[#FF3B30]'
                  : isRestless
                  ? 'text-[#FFCC00]'
                  : isMonitoring
                  ? 'text-[#00F2FF]'
                  : 'text-[#cfc4c5]';

                const borderAccent = isErupting
                  ? 'bg-[#FF3B30]'
                  : isRestless
                  ? 'bg-[#FFCC00]'
                  : isMonitoring
                  ? 'bg-[#00F2FF]'
                  : 'bg-[#cfc4c5]';

                return (
                  <div
                    key={volcano.id}
                    onClick={() => onSelectVolcano(volcano)}
                    className="grid grid-cols-12 gap-px bg-[#2C2E33] group cursor-crosshair"
                  >
                    <div className="col-span-3 bg-[#131313] p-4 group-hover:bg-[#1f1f1f] transition-colors flex items-center gap-3 relative">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderAccent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <span className="text-[13px] font-mono text-[#e2e2e2] font-bold">
                        {volcano.name}
                      </span>
                    </div>

                    <div className="col-span-3 bg-[#131313] p-4 group-hover:bg-[#1f1f1f] transition-colors flex items-center flex-wrap gap-2">
                      {volcano.regions.map((reg, idx) => (
                        <span
                          key={idx}
                          className="bg-[#2a2a2a] px-2 py-0.5 text-[10px] font-mono text-[#e2e2e2] uppercase border border-[#2C2E33]"
                        >
                          {reg}
                        </span>
                      ))}
                    </div>

                    <div className="col-span-2 bg-[#131313] p-4 group-hover:bg-[#1f1f1f] transition-colors flex items-center">
                      <span className="text-[13px] font-mono text-[#cfc4c5]">
                        {volcano.dateRange}
                      </span>
                    </div>

                    <div className="col-span-2 bg-[#131313] p-4 group-hover:bg-[#1f1f1f] transition-colors flex items-center">
                      <span
                        className={`text-[11px] font-mono font-bold ${statusTextColor} ${
                          isErupting ? 'animate-pulse' : ''
                        }`}
                      >
                        {volcano.status}
                      </span>
                    </div>

                    <div className="col-span-2 bg-[#131313] p-4 group-hover:bg-[#1f1f1f] transition-colors flex items-center justify-end">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((barIndex) => {
                          const isFilled = barIndex <= volcano.alertBars;
                          let barColor = 'bg-[#353535]';
                          if (isFilled) {
                            if (volcano.alertBars === 4) barColor = 'bg-[#FF3B30] shadow-[0_0_6px_rgba(255,59,48,0.7)]';
                            else if (volcano.alertBars === 3) barColor = 'bg-[#FFCC00] shadow-[0_0_6px_rgba(255,204,0,0.5)]';
                            else if (volcano.alertBars === 2) barColor = 'bg-[#00F2FF] shadow-[0_0_6px_rgba(0,242,255,0.4)]';
                            else barColor = 'bg-[#cfc4c5]';
                          }

                          return (
                            <div
                              key={barIndex}
                              className={`w-2 h-6 ${barColor} transition-all`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
