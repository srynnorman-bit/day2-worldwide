import React, { useState } from 'react';
import { EarthquakeEvent } from '../../types';

interface EarthquakesViewProps {
  earthquakes: EarthquakeEvent[];
  onSelectEarthquake: (eq: EarthquakeEvent) => void;
}

export const EarthquakesView: React.FC<EarthquakesViewProps> = ({
  earthquakes,
  onSelectEarthquake,
}) => {
  const [mapMode, setMapMode] = useState<'LIVE' | 'PREDICTIVE'>('LIVE');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('04:23:11 UTC');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const now = new Date();
      setLastSyncTime(
        `${String(now.getUTCHours()).padStart(2, '0')}:${String(
          now.getUTCMinutes()
        ).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`
      );
    }, 800);
  };

  const handleDownloadReport = () => {
    const reportText = `=====================================================
DOOMSDAY ADVISOR // GLOBAL SEISMIC ACTIVITY REPORT
CLASSIFICATION: S_LEVEL_CLEARANCE
TIMESTAMP: ${new Date().toISOString()}
=====================================================
CURRENT THREAT LEVEL: ELEVATED
TOTAL RECORDED SHOCKS (7D): 342 (+14%)
HIGHEST RECORDED MAGNITUDE: 7.4 M (Tonga Trench)
MOST ACTIVE REGION: TONGA_TRENCH

PROJECTED & RECENT EVENTS:
${earthquakes
  .map(
    (e) =>
      `[${e.id}] ${e.title} | ZONES: ${e.affectedZones.join(', ')} | MAG: ${e.magnitude}M | DEPTH: ${e.depthKm}km | DATE: ${e.dateRange}`
  )
  .join('\n')}

SENSOR NETWORK STATUS:
- Deep Ocean Buoys: 98% ONLINE
- Land Seismometers: 94% ONLINE
- GPS Displacement: CALIBRATING

Acoustic subterranean monitoring feeds confirm elevated stress along Ring of Fire subduction faults.
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seismic_threat_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="earthquakes-view" className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-8 sm:gap-12 bg-[#131313] min-h-screen relative overflow-hidden text-[#e2e2e2]">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F2FF]/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FF3B30]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4"></div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping"></span>
            <span className="text-[11px] font-mono font-bold text-[#FF3B30] tracking-[0.2em]">
              SEISMIC_ACTIVITY_MONITOR
            </span>
          </div>
          <h1 className="font-headline font-black text-[38px] sm:text-[48px] text-[#e2e2e2] uppercase leading-none tracking-tight">
            Global Earthquakes
          </h1>
          <p className="text-[14px] sm:text-[16px] font-mono text-[#cfc4c5] max-w-xl mt-3 leading-relaxed">
            Real-time telemetry and predictive models for tectonic shifts. Monitoring fault line stress accumulation and immediate shock events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-end gap-1 px-4 py-2 bg-[#1f1f1f]/70 border border-[#2C2E33] backdrop-blur-xs shadow-md">
            <span className="text-[11px] font-mono font-bold text-[#cfc4c5]">
              CURRENT_THREAT_LEVEL
            </span>
            <span className="font-headline font-bold text-[20px] text-[#FFCC00]">
              ELEVATED
            </span>
          </div>

          <button
            id="download-seismic-report-btn"
            onClick={handleDownloadReport}
            className="px-6 py-3 bg-[#00F2FF] text-[#1b1b1b] font-mono font-bold text-[11px] hover:bg-white hover:text-black transition-colors border border-transparent shadow-[0_0_15px_rgba(0,242,255,0.3)] uppercase tracking-wider"
          >
            DOWNLOAD REPORT
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left Column: Map & Summary */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Global Heat Map Module */}
          <div className="flex flex-col bg-[#1f1f1f] border border-[#2C2E33] shadow-lg group hover:border-[#00F2FF]/50 transition-colors duration-500">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#2C2E33] bg-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00F2FF] text-sm">
                  public
                </span>
                <span className="text-[11px] font-mono font-bold text-[#e2e2e2]">
                  TECTONIC_HEATMAP
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMapMode('LIVE')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold transition-colors ${
                    mapMode === 'LIVE'
                      ? 'bg-[#131313] border border-[#2C2E33] text-[#e2e2e2]'
                      : 'bg-transparent text-[#757575] hover:text-[#e2e2e2]'
                  }`}
                >
                  LIVE
                </button>
                <button
                  onClick={() => setMapMode('PREDICTIVE')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold transition-colors ${
                    mapMode === 'PREDICTIVE'
                      ? 'bg-[#00F2FF]/10 border border-[#00F2FF]/40 text-[#00F2FF]'
                      : 'bg-transparent text-[#757575] hover:text-[#e2e2e2]'
                  }`}
                >
                  PREDICTIVE
                </button>
              </div>
            </div>

            <div className="relative h-[380px] w-full bg-[#0e0e0e] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2a2a2a_0%,_#131313_70%,_#0e0e0e_100%)] z-10 pointer-events-none"></div>

              {/* Tectonic Map Grid Visualizer */}
              <div className="absolute inset-0 z-20 pointer-events-none border border-[#2C2E33]/30 m-4">
                {/* Fault Grid lines */}
                <div className="absolute top-0 bottom-0 left-1/3 border-l border-[#2C2E33]/30 border-dashed"></div>
                <div className="absolute top-0 bottom-0 right-1/3 border-l border-[#2C2E33]/30 border-dashed"></div>
                <div className="absolute top-1/2 left-0 right-0 border-t border-[#2C2E33]/30 border-dashed"></div>
                <div className="absolute top-1/4 left-0 right-0 border-t border-[#2C2E33]/15 border-dotted"></div>
                <div className="absolute top-3/4 left-0 right-0 border-t border-[#2C2E33]/15 border-dotted"></div>

                {/* Subduction lines sketch */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 200">
                  <path d="M40,50 Q120,40 180,80 T320,120 T380,90" fill="none" stroke="#2C2E33" strokeWidth="2" strokeDasharray="3,3" />
                  <path d="M60,140 Q150,110 240,160 T360,170" fill="none" stroke="#2C2E33" strokeWidth="2" strokeDasharray="3,3" />
                </svg>

                {/* Animated Epicenter Blips */}
                {/* Blip 1: Nankai Trough (Crimson) */}
                <div
                  className="absolute top-[40%] left-[60%] w-4 h-4 cursor-pointer pointer-events-auto"
                  onClick={() => onSelectEarthquake(earthquakes[0])}
                  title="Nankai Trough Alert (7.8 M)"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.9)]"></span>
                </div>

                {/* Blip 2: San Andreas (Amber) */}
                <div
                  className="absolute top-[65%] left-[25%] w-3 h-3 cursor-pointer pointer-events-auto"
                  onClick={() => onSelectEarthquake(earthquakes[1])}
                  title="San Andreas Creep (6.2 M)"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFCC00] opacity-60 animate-ping" style={{ animationDelay: '1s' }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFCC00]"></span>
                </div>

                {/* Blip 3: Aleutian Arc (Cyan) */}
                <div
                  className="absolute top-[20%] left-[80%] w-3 h-3 cursor-pointer pointer-events-auto"
                  onClick={() => onSelectEarthquake(earthquakes[2])}
                  title="Aleutian Trench Shift (5.5 M)"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#00F2FF] opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F2FF]"></span>
                </div>

                {/* Blip 4: Tonga Trench (Crimson) */}
                <div
                  className="absolute top-[75%] left-[72%] w-4 h-4 cursor-pointer pointer-events-auto"
                  onClick={() => onSelectEarthquake(earthquakes[5])}
                  title="Tonga Trench Rupture (7.4 M)"
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75 animate-ping" style={{ animationDelay: '1.5s' }}></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FF3B30]"></span>
                </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2 bg-[#1f1f1f]/90 backdrop-blur-xs border border-[#2C2E33] p-3">
                <span className="text-[9px] font-mono font-bold text-[#cfc4c5] mb-1">
                  MAGNITUDE_SCALE
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00F2FF]"></div>
                  <span className="text-[11px] font-mono text-[#e2e2e2]">3.0 - 4.9</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFCC00]"></div>
                  <span className="text-[11px] font-mono text-[#e2e2e2]">5.0 - 6.9</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FF3B30]"></div>
                  <span className="text-[11px] font-mono text-[#e2e2e2]">7.0+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seismic Events Table Module */}
          <div className="flex flex-col bg-[#1f1f1f] border border-[#2C2E33] shadow-xl">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#2C2E33] bg-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#cfc4c5] text-sm">
                  list_alt
                </span>
                <span className="text-[11px] font-mono font-bold text-[#e2e2e2]">
                  PROJECTED_&_RECENT_EVENTS
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00F2FF]">FILTER_DATA</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#2C2E33] bg-[#0e0e0e]">
                    <th className="p-4 text-[11px] font-mono font-bold text-[#757575] whitespace-nowrap w-1/4">
                      EVENT_ID
                    </th>
                    <th className="p-4 text-[11px] font-mono font-bold text-[#757575] whitespace-nowrap">
                      AFFECTED_ZONES
                    </th>
                    <th className="p-4 text-[11px] font-mono font-bold text-[#757575] whitespace-nowrap">
                      DATE_RANGE
                    </th>
                    <th className="p-4 text-[11px] font-mono font-bold text-[#757575] whitespace-nowrap">
                      MAGNITUDE
                    </th>
                    <th className="p-4 text-[11px] font-mono font-bold text-[#757575] whitespace-nowrap text-right">
                      DEPTH
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13px] font-mono text-[#e2e2e2]">
                  {earthquakes.map((eq) => {
                    const isCrimson = eq.threatColor === 'emergency';
                    const isAmber = eq.threatColor === 'warning';
                    const isCyan = eq.threatColor === 'cyan';

                    const borderHover = isCrimson
                      ? 'hover:border-l-[#FF3B30]'
                      : isAmber
                      ? 'hover:border-l-[#FFCC00]'
                      : isCyan
                      ? 'hover:border-l-[#00F2FF]'
                      : 'hover:border-l-[#e2e2e2]';

                    const badgeStyle = isCrimson
                      ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/30'
                      : isAmber
                      ? 'bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/30'
                      : isCyan
                      ? 'bg-[#00F2FF]/10 text-[#00F2FF] border-[#00F2FF]/30'
                      : 'bg-[#1f1f1f] text-[#cfc4c5] border-[#2C2E33]';

                    return (
                      <tr
                        key={eq.id}
                        onClick={() => onSelectEarthquake(eq)}
                        className={`border-b border-[#2C2E33]/50 hover:bg-[#2a2a2a] hover:border-l-2 ${borderHover} transition-all cursor-crosshair`}
                      >
                        <td className={`p-4 ${isCrimson ? 'text-[#FF3B30] font-bold' : ''}`}>
                          <span className="text-[10px] font-mono text-[#cfc4c5] mr-2 opacity-50">
                            EQ
                          </span>
                          {eq.title}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {eq.affectedZones.map((zone, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 border border-[#2C2E33] bg-[#131313] text-[10px] font-mono text-[#e2e2e2]"
                              >
                                {zone}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 text-[#cfc4c5] text-[11px]">
                          {eq.dateRange}
                        </td>

                        <td className="p-4">
                          <span className={`px-2 py-1 border font-mono font-bold text-[11px] ${badgeStyle}`}>
                            ~{eq.magnitude} M
                          </span>
                        </td>

                        <td className="p-4 text-right text-[#cfc4c5]">
                          {eq.depthKm} km
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Recent Shocks Summary Card */}
          <div className="bg-[#1f1f1f] border border-[#2C2E33] shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B30]/5 to-transparent pointer-events-none"></div>
            
            <div className="px-5 py-4 border-b border-[#2C2E33] bg-[#2a2a2a] flex justify-between items-center z-10">
              <span className="text-[11px] font-mono font-bold text-[#FF3B30] tracking-wider">
                RECENT_SHOCKS_SUMMARY
              </span>
              <span className="material-symbols-outlined text-[#FF3B30] text-sm">
                sensors
              </span>
            </div>

            <div className="p-5 flex flex-col gap-6 z-10">
              <div className="flex items-baseline justify-between border-b border-[#2C2E33]/50 pb-4">
                <div className="flex flex-col">
                  <span className="font-headline font-black text-[42px] sm:text-[48px] text-[#e2e2e2]">
                    342
                  </span>
                  <span className="text-[10px] font-mono text-[#cfc4c5] mt-1">
                    EVENTS_PAST_7_DAYS
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#FF3B30]">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  <span className="text-[11px] font-mono font-bold">+14%</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-mono font-bold text-[#cfc4c5]">
                  ENERGY_RELEASE_DISTRIBUTION
                </span>
                
                {/* Mini Bar Chart */}
                <div className="flex items-end gap-1 h-24 mt-2">
                  <div className="w-1/6 bg-[#00F2FF] h-[20%] hover:h-[25%] transition-all cursor-pointer" title="Mag 3.0-3.9: 42 events"></div>
                  <div className="w-1/6 bg-[#00F2FF] h-[45%] hover:h-[50%] transition-all cursor-pointer" title="Mag 4.0-4.9: 112 events"></div>
                  <div className="w-1/6 bg-[#FFCC00] h-[80%] hover:h-[85%] transition-all cursor-pointer" title="Mag 5.0-5.9: 148 events"></div>
                  <div className="w-1/6 bg-[#FFCC00] h-[30%] hover:h-[35%] transition-all cursor-pointer" title="Mag 6.0-6.9: 34 events"></div>
                  <div className="w-1/6 bg-[#FF3B30] h-[60%] hover:h-[65%] transition-all shadow-[0_0_8px_rgba(255,59,48,0.5)] cursor-pointer" title="Mag 7.0+: 6 events"></div>
                  <div className="w-1/6 bg-[#353535] h-[10%] hover:h-[15%] transition-all border border-[#2C2E33] border-b-0 cursor-pointer" title="Uncataloged: trace"></div>
                </div>

                <div className="flex justify-between text-[8px] font-mono text-[#cfc4c5] opacity-70">
                  <span>M3</span>
                  <span>M7+</span>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <div className="flex justify-between items-center p-2 bg-[#131313] border border-[#2C2E33]">
                  <span className="text-[12px] font-mono text-[#cfc4c5]">
                    Highest Magnitude
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#FF3B30]">
                    7.4 M
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-[#131313] border border-[#2C2E33]">
                  <span className="text-[12px] font-mono text-[#cfc4c5]">
                    Most Active Region
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#e2e2e2]">
                    TONGA_TRENCH
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Status Module */}
          <div className="bg-[#1f1f1f] border border-[#2C2E33] flex flex-col">
            <div className="px-5 py-3 border-b border-[#2C2E33] bg-[#353535]">
              <span className="text-[11px] font-mono font-bold text-[#cfc4c5] tracking-wider">
                SENSOR_NETWORK_STATUS
              </span>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-mono text-[#e2e2e2]">
                  Deep Ocean Buoys
                </span>
                <span className="text-[10px] font-mono px-2 py-1 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
                  98% ONLINE
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-mono text-[#e2e2e2]">
                  Land Seismometers
                </span>
                <span className="text-[10px] font-mono px-2 py-1 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
                  94% ONLINE
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[13px] font-mono text-[#e2e2e2]">
                  GPS Displacement
                </span>
                <span className="text-[10px] font-mono px-2 py-1 bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/30">
                  CALIBRATING
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2C2E33] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#cfc4c5]">
                  LAST_SYNC: {lastSyncTime}
                </span>
                <button
                  id="sync-seismic-sensors-btn"
                  onClick={handleSync}
                  className={`material-symbols-outlined text-[#00F2FF] text-sm hover:text-white transition-transform ${
                    syncing ? 'animate-spin' : ''
                  }`}
                  title="Resync Global Sensor Network"
                >
                  sync
                </button>
              </div>
            </div>
          </div>

          {/* Visual Aesthetic Acoustic Block */}
          <div className="flex-1 min-h-[160px] border border-[#2C2E33] bg-[#0e0e0e] relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity duration-700 bg-cover bg-center mix-blend-luminosity grayscale"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAOXPsyoindGl45RLc7lEsYheETeLQJdoiVXxiYXjBfGoST6rn6TfYHemmwBf6Qj9aSiOA_ZkFBOwMFWTF8VirFH8KoxXY2Ow27-39wiHRF6UNRH-jnFV5EOnAYSn35xwcYpkK1CvM716nte2OXkcC23K9BQCTMa4E5ubAZXR2IVDJqVmTEm3TagW7gSNTK7hoTtgTlT7Kv7mwJPfpsIQhWF6koLgcxvZmE4tMB1crj3vkZ-DqP-GBp')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent"></div>

            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[10px] font-mono text-[#00F2FF] [writing-mode:vertical-rl] rotate-180 absolute right-0 bottom-0 opacity-50 tracking-wider">
                FRAC_ZONE_7A
              </p>
              <div className="w-12 h-1 bg-[#2C2E33] mb-2"></div>
              <p className="text-[11px] font-mono text-[#cfc4c5] w-3/4 leading-relaxed">
                Subterranean acoustic monitoring feeds indicate nominal pressure in primary fault networks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
