import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AsteroidObject, MonitoringFeedItem } from '../../types';

interface AsteroidsViewProps {
  asteroids: AsteroidObject[];
  monitoringFeeds: MonitoringFeedItem[];
  extinctionProbability: number;
  onUpdateExtinctionProbability: (val: number) => void;
  onSelectAsteroid: (asteroid: AsteroidObject) => void;
  isLoadingLiveFeed?: boolean;
  feedSource?: 'NASA_NEOWS_LIVE' | 'TELEMETRY_FALLBACK';
  startDate?: string;
  endDate?: string;
  onFetchDateRange?: (start: string, end: string) => void;
  totalElementCount?: number;
}

export const AsteroidsView: React.FC<AsteroidsViewProps> = ({
  asteroids,
  monitoringFeeds,
  extinctionProbability,
  onUpdateExtinctionProbability,
  onSelectAsteroid,
  isLoadingLiveFeed = false,
  feedSource = 'NASA_NEOWS_LIVE',
  startDate = new Date().toISOString().split('T')[0],
  endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  onFetchDateRange,
  totalElementCount,
}) => {
  const [selectedFeedFilter, setSelectedFeedFilter] = useState<'ALL' | 'CRITICAL' | 'NEW' | 'SYSTEM'>('ALL');
  const [activeOrbitalTarget, setActiveOrbitalTarget] = useState<string>('99942 Apophis');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [threatFilter, setThreatFilter] = useState<string>('ALL');

  // Dynamic Radar & Orbital Trajectory Animation State
  const [sweepAngle, setSweepAngle] = useState<number>(0);
  const [simulatedHours, setSimulatedHours] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const speedRef = useRef<number>(simulationSpeed);
  speedRef.current = simulationSpeed;

  useEffect(() => {
    lastTimeRef.current = performance.now();
    const animate = (time: number) => {
      const deltaMs = Math.min(100, time - lastTimeRef.current);
      lastTimeRef.current = time;

      const currentSpeed = speedRef.current;
      // 1x = 6 seconds per rotation (60 deg/sec)
      const degPerMs = (360 / 6000) * currentSpeed;
      setSweepAngle((prev) => (prev + degPerMs * deltaMs) % 360);

      // Trajectory time advance: 1x = 0.5 simulated hour/sec
      const hoursPerMs = (0.5 / 1000) * currentSpeed;
      setSimulatedHours((prev) => (prev + hoursPerMs * deltaMs) % 720);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const [inputStartDate, setInputStartDate] = useState<string>(startDate);
  const [inputEndDate, setInputEndDate] = useState<string>(endDate);

  const handleApplyDateRange = () => {
    if (onFetchDateRange) {
      onFetchDateRange(inputStartDate, inputEndDate);
    }
  };

  const currentTargetObj = useMemo(() => {
    return (
      asteroids.find((a) => a.objectId.includes(activeOrbitalTarget) || a.name.includes(activeOrbitalTarget)) ||
      asteroids[0] ||
      {
        objectId: '99942',
        name: '99942 Apophis (2004 MN4)',
        velocityKmS: 30.73,
        missDistKm: 31600,
        missDistAu: 0.00021,
        estDiaMinM: 340,
        estDiaMaxM: 370,
        threatLevel: 'EXTREME',
        timeToApproach: 'T - 3Y 229D',
        ra: '09h 14m 22s',
        dec: '+16° 44\' 18"',
        orbitPeriodDays: 323.6,
        eccentricity: 0.191,
        inclinationDeg: 3.33,
        hazardous: true,
      }
    );
  }, [asteroids, activeOrbitalTarget]);

  const filteredFeeds = useMemo(() => {
    return monitoringFeeds.filter((feed) => {
      if (selectedFeedFilter === 'ALL') return true;
      if (selectedFeedFilter === 'CRITICAL') return feed.tagType === 'emergency';
      if (selectedFeedFilter === 'NEW') return feed.tagType === 'cyan' || feed.tag === 'LD < 1.0';
      if (selectedFeedFilter === 'SYSTEM') return feed.tagType === 'system';
      return true;
    });
  }, [monitoringFeeds, selectedFeedFilter]);

  const filteredAsteroids = useMemo(() => {
    return asteroids.filter((a) => {
      const matchSearch =
        a.objectId.toLowerCase().includes(tableSearch.toLowerCase()) ||
        a.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        a.approachDateUtc.toLowerCase().includes(tableSearch.toLowerCase());
      const matchThreat = threatFilter === 'ALL' || a.threatLevel === threatFilter;
      return matchSearch && matchThreat;
    });
  }, [asteroids, tableSearch, threatFilter]);

  const handleExportCSV = () => {
    const headers = ['OBJECT_ID', 'NAME', 'APPROACH_DATE_UTC', 'VELOCITY_KM_S', 'MISS_DIST_KM', 'EST_DIA_M', 'THREAT_LEVEL', 'HAZARDOUS'];
    const rows = filteredAsteroids.map((a) => [
      `"${a.objectId}"`,
      `"${a.name}"`,
      `"${a.approachDateUtc}"`,
      a.velocityKmS,
      a.missDistKm,
      `"${a.estDiaMinM} - ${a.estDiaMaxM}"`,
      `"${a.threatLevel}"`,
      a.hazardous ? 'TRUE' : 'FALSE',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doomsday_asteroids_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="asteroids-view" className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8 bg-[#131313] text-[#e2e2e2]">
      {/* Backend API Connection & Date Feed Bar */}
      <div className="bg-[#1b1b1b] border border-[#2C2E33] p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FF] shadow-[0_0_8px_#00F2FF] animate-pulse"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-bold text-[#00F2FF] tracking-wider uppercase">
                NASA NeoWs REST API Feed v1
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 border ${feedSource === 'NASA_NEOWS_LIVE' ? 'bg-[#00F2FF]/10 text-[#00F2FF] border-[#00F2FF]/40' : 'bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/40'}`}>
                {feedSource === 'NASA_NEOWS_LIVE' ? 'LIVE ORBITAL TELEMETRY' : 'PLANETARY DEFENSE REPOSITORY'}
              </span>
              {totalElementCount !== undefined && (
                <span className="text-[10px] font-mono text-[#cfc4c5]">
                  ({totalElementCount} NEOs Tracked)
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[#757575] block mt-0.5">
              GET https://api.nasa.gov/neo/rest/v1/feed?start_date={inputStartDate}&end_date={inputEndDate}&api_key=API_KEY
            </span>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1">
            <span className="text-[10px] font-mono text-[#757575]">START:</span>
            <input
              type="date"
              value={inputStartDate}
              onChange={(e) => setInputStartDate(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-[#e2e2e2] outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1">
            <span className="text-[10px] font-mono text-[#757575]">END:</span>
            <input
              type="date"
              value={inputEndDate}
              onChange={(e) => setInputEndDate(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-[#e2e2e2] outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleApplyDateRange}
            disabled={isLoadingLiveFeed}
            className="px-3 py-1.5 bg-[#00F2FF]/10 hover:bg-[#00F2FF]/20 border border-[#00F2FF] text-[#00F2FF] text-[11px] font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoadingLiveFeed ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isLoadingLiveFeed ? 'SYNCING NASA...' : 'QUERY NEOWS'}
          </button>
        </div>
      </div>

      {/* Extinction Probability & Top Level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Probability Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#000000] border-l-4 border-[#FF3B30] p-6 relative overflow-hidden group border border-[#2C2E33]">
          <div className="absolute inset-0 bg-[#FF3B30]/5 pointer-events-none group-hover:bg-[#FF3B30]/10 transition-colors"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="font-headline font-bold text-[18px] sm:text-[20px] text-[#757575] uppercase tracking-widest">
              Extinction Probability
            </h2>
            <span className="material-symbols-outlined text-[#FF3B30] animate-pulse">
              warning
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6 relative z-10">
            <span className="font-headline font-black text-[40px] sm:text-[48px] text-[#FF3B30] tracking-tight">
              {extinctionProbability.toFixed(2)}%
            </span>
            <span className="text-[12px] font-mono text-[#cfc4c5]">
              CURRENT RISK FACTOR
            </span>
          </div>

          {/* DEFCON Progress Bar with markers */}
          <div className="w-full h-3 bg-[#2a2a2a] rounded-none relative overflow-hidden z-10 border border-[#2C2E33]">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF3B30] shadow-[0_0_12px_rgba(255,59,48,0.8)] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(2, extinctionProbability))}%` }}
            ></div>
            <div className="absolute top-0 left-[25%] w-px h-full bg-[#2C2E33]"></div>
            <div className="absolute top-0 left-[50%] w-px h-full bg-[#2C2E33]"></div>
            <div className="absolute top-0 left-[75%] w-px h-full bg-[#2C2E33]"></div>
          </div>

          <div className="flex justify-between mt-2 text-[11px] font-mono font-bold text-[#cfc4c5] z-10 relative">
            <span>DEFCON 5</span>
            <span>DEFCON 1</span>
          </div>

          {/* Quick DEFCON Simulation adjustment */}
          <div className="mt-4 pt-3 border-t border-[#2C2E33] flex flex-col gap-2 text-[10px] font-mono text-[#757575]">
            <div className="flex items-center justify-between">
              <span>GEMINI AI PROBABILITY:</span>
              <div className="flex items-center gap-1">
                <span className="text-[#00F2FF] font-bold">GEMINI 3.7 FLASH</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => onUpdateExtinctionProbability(8.15)}
                className="px-2 py-0.5 bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#cfc4c5]"
              >
                LOW
              </button>
              <button
                onClick={() => onUpdateExtinctionProbability(12.04)}
                className="px-2 py-0.5 bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#00F2FF]"
              >
                BASELINE (12.04%)
              </button>
              <button
                onClick={() => onUpdateExtinctionProbability(27.8)}
                className="px-2 py-0.5 bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#FF3B30] text-[#FF3B30]"
              >
                SPIKE
              </button>
            </div>
          </div>
        </div>

        {/* Right Stats 3-Col Block */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#2C2E33]">
          <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between border-t border-[#2C2E33] hover:border-[#00F2FF] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#757575] tracking-wider">
              ACTIVE NEO THREATS
            </span>
            <span className="font-headline font-bold text-[32px] text-[#e2e2e2] mt-2">
              {asteroids.length}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[#FFCC00] text-[16px]">
                trending_up
              </span>
              <span className="text-[13px] font-mono text-[#FFCC00]">
                {asteroids.filter((a) => a.hazardous).length} Hazardous
              </span>
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between border-t border-[#2C2E33] hover:border-[#00F2FF] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#757575] tracking-wider">
              MIN MISS DISTANCE
            </span>
            <span className="font-headline font-bold text-[32px] text-[#FF3B30] mt-2">
              {(Math.min(...asteroids.map((a) => a.missDistKm)) / 1000).toFixed(1)}k km
            </span>
            <span className="text-[11px] font-mono text-[#cfc4c5] mt-2">
              &lt; 0.1 Lunar Distance
            </span>
          </div>

          <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between border-t border-[#2C2E33] hover:border-[#00F2FF] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#757575] tracking-wider">
              RADAR TRACKING NODES
            </span>
            <span className="font-headline font-bold text-[32px] text-[#00F2FF] mt-2">
              18 ACTIVE
            </span>
            <span className="text-[11px] font-mono text-[#39FF14] mt-2">
              GOLDSTONE / ARECIBO-SYNC
            </span>
          </div>
        </div>
      </div>

      {/* Main Radar & Live Monitoring Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Orbital Path Simulator & Radar */}
        <div className="col-span-12 lg:col-span-8 bg-[#000000] p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden border border-[#2C2E33] min-h-[490px]">
          {/* Header & Controls Toolbar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 z-10 border-b border-[#2C2E33] pb-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00F2FF]">
                radar
              </span>
              <span className="font-headline font-bold text-[16px] sm:text-[18px] text-[#e2e2e2] uppercase tracking-wide">
                Orbital Radar & Trajectory Projection
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                id="orbital-target-selector"
                value={activeOrbitalTarget}
                onChange={(e) => setActiveOrbitalTarget(e.target.value)}
                className="bg-[#1f1f1f] border border-[#2C2E33] px-2.5 py-1.5 text-[11px] font-mono text-[#00F2FF] focus:border-[#00F2FF] outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
              >
                {asteroids.map((ast) => (
                  <option key={ast.objectId} value={ast.name}>
                    {ast.name} ({ast.threatLevel})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 bg-[#141414] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono shrink-0">
                <span className="text-[9px] text-[#757575] uppercase font-bold tracking-wider mr-0.5">
                  SWEEP:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    id="btn-sweep-speed-1x"
                    onClick={() => setSimulationSpeed(1)}
                    title="Real-time standard radar sweep & orbital velocity (1×)"
                    className={`px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      simulationSpeed === 1
                        ? 'bg-[#00F2FF] border-[#00F2FF] text-black shadow-[0_0_8px_rgba(0,242,255,0.6)]'
                        : 'bg-[#1f1f1f] border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                    }`}
                  >
                    1× REAL-TIME
                  </button>
                  <button
                    id="btn-sweep-speed-5x"
                    onClick={() => setSimulationSpeed(5)}
                    title="Accelerated orbital trajectory projection (5×)"
                    className={`px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      simulationSpeed === 5
                        ? 'bg-[#00F2FF] border-[#00F2FF] text-black shadow-[0_0_8px_rgba(0,242,255,0.6)]'
                        : 'bg-[#1f1f1f] border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                    }`}
                  >
                    5× WARP
                  </button>
                  <button
                    id="btn-sweep-speed-20x"
                    onClick={() => setSimulationSpeed(20)}
                    title="High-speed time-lapse simulation & intercept projection (20×)"
                    className={`px-2.5 py-1 text-[10px] font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      simulationSpeed === 20
                        ? 'bg-[#00F2FF] border-[#00F2FF] text-black shadow-[0_0_8px_rgba(0,242,255,0.6)]'
                        : 'bg-[#1f1f1f] border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                    }`}
                  >
                    20× TIME-LAPSE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Animated SVG / Canvas Radar Visual */}
          <div className="relative w-full h-80 my-2 flex items-center justify-center overflow-hidden">
            {/* Grid coordinate markings */}
            <div className="absolute inset-0 bg-[radial-gradient(#2C2E33_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

            {/* Concentric Radar Range Rings & AU scale labels */}
            <div className="absolute w-[290px] h-[290px] rounded-full border border-[#2C2E33]/60">
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#757575]">0.25 AU</span>
            </div>
            <div className="absolute w-[220px] h-[220px] rounded-full border border-[#2C2E33]/80">
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#757575]">0.15 AU</span>
            </div>
            <div className="absolute w-[150px] h-[150px] rounded-full border border-[#00F2FF]/25">
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#00F2FF]/60">0.05 AU (LD 20)</span>
            </div>
            <div className="absolute w-[75px] h-[75px] rounded-full border border-[#FF3B30]/30 animate-pulse">
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-[#FF3B30]/80">PROXIMITY</span>
            </div>

            {/* Radar Axis Crosshairs */}
            <div className="absolute w-full h-px bg-[#2C2E33]/80"></div>
            <div className="absolute h-full w-px bg-[#2C2E33]/80"></div>

            {/* SVG Orbital Trajectories */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-180 -180 360 360">
              {/* Elliptical Orbits */}
              <ellipse cx="0" cy="0" rx="135" ry="115" fill="none" stroke="#2C2E33" strokeDasharray="3 4" strokeWidth="1" transform="rotate(-25)" />
              <ellipse cx="0" cy="0" rx="100" ry="85" fill="none" stroke="#00F2FF" strokeOpacity="0.2" strokeDasharray="2 3" strokeWidth="1" transform="rotate(15)" />
              <ellipse cx="0" cy="0" rx="65" ry="55" fill="none" stroke="#FFCC00" strokeOpacity="0.3" strokeDasharray="3 3" strokeWidth="1" transform="rotate(40)" />

              {/* Target Intercept Vector */}
              <line x1="0" y1="0" x2="60" y2="-45" stroke="#FF3B30" strokeOpacity="0.4" strokeDasharray="2 2" strokeWidth="1.5" />
            </svg>

            {/* Rotating Radar Sweep Beam */}
            <div
              className="absolute w-[160px] h-[160px] origin-bottom-right top-1/2 left-1/2 -mt-[160px] -ml-[160px] pointer-events-none"
              style={{
                transform: `rotate(${sweepAngle}deg)`,
                background: 'conic-gradient(from 0deg, rgba(0,242,255,0.35) 0deg, rgba(0,242,255,0.08) 35deg, transparent 65deg)',
                borderRadius: '100% 0 0 0',
              }}
            >
              {/* High-intensity sweep leading edge */}
              <div className="absolute bottom-0 right-0 w-[160px] h-0.5 bg-gradient-to-l from-[#00F2FF] to-transparent origin-bottom-right" />
            </div>

            {/* Center Earth Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#00F2FF] shadow-[0_0_16px_#00F2FF] flex items-center justify-center text-[9px] font-bold text-black border border-white">
                ⊕
              </div>
              <span className="text-[9px] font-mono text-[#00F2FF] font-bold mt-1 bg-black/80 px-1 border border-[#00F2FF]/30">
                TERRA (1.00 AU)
              </span>
            </div>

            {/* Dynamic Asteroid Target Positions and Orbital Motion */}
            {asteroids.slice(0, 6).map((ast, idx) => {
              const baseAngles = [45, 125, 205, 280, 95, 340];
              const radii = [42, 68, 102, 128, 85, 115];
              const speeds = [0.8, -0.6, 1.1, -0.9, 1.4, -0.7]; // orbital velocity multipliers
              
              const radius = radii[idx % radii.length];
              const baseAngle = baseAngles[idx % baseAngles.length];
              const speedMult = speeds[idx % speeds.length];
              
              // Dynamic current position based on simulation clock
              const currentAngle = (baseAngle + simulatedHours * speedMult * 12) % 360;
              const rad = (currentAngle * Math.PI) / 180;
              const posX = Math.cos(rad) * radius;
              const posY = Math.sin(rad) * radius;

              // Check if radar sweep just passed this angle (angular difference)
              const diffAngle = ((sweepAngle - (currentAngle < 0 ? currentAngle + 360 : currentAngle)) + 360) % 360;
              const isIlluminated = diffAngle < 35;

              const isSelected = ast.name === currentTargetObj.name;

              return (
                <div
                  key={ast.objectId}
                  onClick={() => {
                    setActiveOrbitalTarget(ast.name);
                    onSelectAsteroid(ast);
                  }}
                  className="absolute cursor-pointer group flex flex-col items-center z-20 transition-transform duration-75"
                  style={{
                    transform: `translate(${posX}px, ${posY}px)`,
                  }}
                >
                  {/* Radar Phosphor Ping Flash */}
                  {isIlluminated && (
                    <div
                      className={`w-6 h-6 rounded-full absolute -inset-1.5 animate-ping ${
                        isSelected
                          ? 'bg-[#FF3B30]/60'
                          : ast.hazardous
                          ? 'bg-[#FFCC00]/50'
                          : 'bg-[#00F2FF]/50'
                      }`}
                    />
                  )}

                  {/* Target Node */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FF3B30] ring-4 ring-[#FF3B30]/40 scale-125 shadow-[0_0_12px_#FF3B30]'
                        : ast.hazardous
                        ? 'bg-[#FFCC00] shadow-[0_0_8px_#FFCC00]'
                        : 'bg-[#cfc4c5]'
                    } ${isIlluminated ? 'brightness-150 scale-110' : 'brightness-100'}`}
                  />

                  {/* Label */}
                  <span className={`text-[9px] font-mono bg-[#0e0e0e]/90 px-1 border whitespace-nowrap mt-1 transition-colors ${
                    isSelected
                      ? 'text-[#FF3B30] border-[#FF3B30]'
                      : isIlluminated
                      ? 'text-[#00F2FF] border-[#00F2FF]'
                      : 'text-[#cfc4c5] border-[#2C2E33] group-hover:text-[#00F2FF]'
                  }`}>
                    {ast.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}

            {/* Active Sweep HUD telemetry indicator */}
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1 bg-black/70 border border-[#2C2E33] p-1.5 text-[9px] font-mono pointer-events-none">
              <span className="text-[#00F2FF] font-bold">
                SWEEP RATE: {simulationSpeed}× {simulationSpeed === 1 ? '(REAL)' : simulationSpeed === 5 ? '(WARP)' : '(TIME-LAPSE)'}
              </span>
              <span className="text-[#cfc4c5]">
                ORBIT TIME: +{simulatedHours.toFixed(1)} hrs
              </span>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#2C2E33] text-[11px] font-mono z-10">
            <div>
              <span className="text-[#757575] block text-[9px]">TARGET:</span>
              <span className="text-[#00F2FF] font-bold truncate block">
                {currentTargetObj.name}
              </span>
            </div>
            <div>
              <span className="text-[#757575] block text-[9px]">VELOCITY:</span>
              <span className="text-[#e2e2e2] font-bold">
                {currentTargetObj.velocityKmS} km/s
              </span>
            </div>
            <div>
              <span className="text-[#757575] block text-[9px]">MISS DISTANCE:</span>
              <span className="text-[#FF3B30] font-bold">
                {currentTargetObj.missDistKm.toLocaleString()} km
              </span>
            </div>
            <div>
              <span className="text-[#757575] block text-[9px]">TIME TO REACH:</span>
              <span className="text-[#FFCC00] font-bold">
                {currentTargetObj.timeToApproach}
              </span>
            </div>
          </div>
        </div>

        {/* Live Feed Sidebar */}
        <div className="col-span-12 lg:col-span-4 bg-[#1f1f1f] flex flex-col border border-[#2C2E33] max-h-[490px]">
          <div className="p-4 border-b border-[#2C2E33] bg-[#2a2a2a] flex justify-between items-center">
            <span className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-wide">
              MONITORING FEED
            </span>
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                id="monitoring-feed-filter"
                value={selectedFeedFilter}
                onChange={(e) => setSelectedFeedFilter(e.target.value as any)}
                className="px-2 py-1 border border-[#2C2E33] bg-[#0e0e0e] text-[11px] font-mono text-[#e2e2e2] focus:border-[#00F2FF] outline-none cursor-pointer"
              >
                <option value="ALL">ALL FEEDS</option>
                <option value="CRITICAL">CRITICAL ONLY</option>
                <option value="NEW">DETECTIONS</option>
                <option value="SYSTEM">SYSTEM LOGS</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-2 cursor-default">
            {filteredFeeds.map((feed) => {
              const borderClass =
                feed.tagType === 'emergency'
                  ? 'border-l-2 border-[#FF3B30]'
                  : feed.tagType === 'warning'
                  ? 'border-l-2 border-[#FFCC00]'
                  : feed.tagType === 'cyan'
                  ? 'border-l-2 border-[#00F2FF]'
                  : 'border-l-2 border-[#2C2E33]';

              const tagColor =
                feed.tagType === 'emergency'
                  ? 'text-[#FF3B30]'
                  : feed.tagType === 'warning'
                  ? 'text-[#FFCC00]'
                  : feed.tagType === 'cyan'
                  ? 'text-[#00F2FF]'
                  : 'text-[#cfc4c5]';

              return (
                <div
                  key={feed.id}
                  className={`bg-[#131313] ${borderClass} p-3 flex flex-col gap-1 cursor-default hover:bg-[#1b1b1b] transition-colors relative overflow-hidden`}
                >
                  {feed.tagType === 'emergency' && (
                    <div className="absolute inset-0 bg-[#FF3B30]/5 pointer-events-none animate-pulse"></div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-mono font-bold ${tagColor}`}>
                      {feed.tag}
                    </span>
                    <span className="text-[10px] font-mono text-[#cfc4c5]">
                      {feed.timestamp}
                    </span>
                  </div>

                  <span className="text-[13px] font-mono text-[#e2e2e2] leading-snug select-text">
                    {feed.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#757575] mt-1 select-text">
                    {feed.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High Density Close Approach Data Log */}
      <div className="mt-2 bg-[#131313] border border-[#2C2E33] flex flex-col">
        <div className="p-4 border-b border-[#2C2E33] bg-[#1b1b1b] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">
              table_chart
            </span>
            <h3 className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-widest">
              Close Approach Data Log ({filteredAsteroids.length} objects)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search filter input */}
            <input
              type="text"
              placeholder="FILTER OBJECTS..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="bg-[#0e0e0e] border border-[#2C2E33] px-3 py-1 text-[11px] font-mono text-[#e2e2e2] placeholder-[#757575] focus:border-[#00F2FF] outline-none"
            />

            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono text-[#cfc4c5] focus:border-[#00F2FF] outline-none cursor-pointer"
            >
              <option value="ALL">ALL THREATS</option>
              <option value="EXTREME">EXTREME</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="ELEVATED">ELEVATED</option>
              <option value="MODERATE">MODERATE</option>
              <option value="LOW">LOW</option>
            </select>

            <button
              id="export-asteroids-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#cfc4c5] hover:text-[#00F2FF] text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              EXPORT CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1b1b1b] border-b border-[#2C2E33] text-[11px] font-mono text-[#757575] uppercase">
                <th className="p-4">OBJECT ID / NAME</th>
                <th className="p-4">APPROACH DATE (UTC)</th>
                <th className="p-4">VELOCITY</th>
                <th className="p-4">MISS DISTANCE</th>
                <th className="p-4">EST. DIAMETER</th>
                <th className="p-4">HAZARDOUS</th>
                <th className="p-4">THREAT LEVEL</th>
                <th className="p-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2E33] font-mono text-[12px]">
              {filteredAsteroids.map((ast) => {
                const badgeClass =
                  ast.threatLevel === 'EXTREME' || ast.threatLevel === 'CRITICAL'
                    ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30] animate-pulse'
                    : ast.threatLevel === 'ELEVATED'
                    ? 'bg-[#FFCC00]/20 text-[#FFCC00] border-[#FFCC00]'
                    : ast.threatLevel === 'MODERATE'
                    ? 'bg-[#00F2FF]/20 text-[#00F2FF] border-[#00F2FF]'
                    : 'bg-[#2a2a2a] text-[#cfc4c5] border-[#2C2E33]';

                return (
                  <tr
                    key={ast.objectId}
                    className="hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                    onClick={() => onSelectAsteroid(ast)}
                  >
                    <td className="p-4 font-bold text-[#e2e2e2]">
                      <div className="flex items-center gap-2">
                        <span>{ast.name}</span>
                        {ast.hazardous && (
                          <span className="px-1 py-0.2 bg-[#FF3B30]/20 text-[#FF3B30] text-[9px] border border-[#FF3B30]/50">
                            PHA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#757575] block font-normal">
                        ID: {ast.objectId}
                      </span>
                    </td>
                    <td className="p-4 text-[#cfc4c5]">{ast.approachDateUtc}</td>
                    <td className="p-4 text-[#e2e2e2] font-semibold">{ast.velocityKmS} km/s</td>
                    <td className="p-4">
                      <span className="text-[#FF3B30] font-bold block">
                        {ast.missDistKm.toLocaleString()} km
                      </span>
                      <span className="text-[10px] text-[#757575]">
                        ({ast.missDistAu} AU)
                      </span>
                    </td>
                    <td className="p-4 text-[#cfc4c5]">
                      {ast.estDiaMinM}m - {ast.estDiaMaxM}m
                    </td>
                    <td className="p-4">
                      {ast.hazardous ? (
                        <span className="text-[#FF3B30] font-bold">YES</span>
                      ) : (
                        <span className="text-[#757575]">NO</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border ${badgeClass}`}>
                        {ast.threatLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsteroid(ast);
                        }}
                        className="px-2.5 py-1 bg-[#1f1f1f] hover:bg-[#00F2FF] hover:text-black text-[#00F2FF] border border-[#00F2FF]/40 text-[10px] font-bold tracking-wider uppercase transition-colors"
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
