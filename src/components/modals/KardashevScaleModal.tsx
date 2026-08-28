import React, { useState, useMemo } from 'react';

interface KardashevScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  extinctionProbability?: number;
}

export const KardashevScaleModal: React.FC<KardashevScaleModalProps> = ({
  isOpen,
  onClose,
  extinctionProbability = 12.04,
}) => {
  // Energy parameters (in Terawatts: 1 TW = 10^12 W)
  const [currentPowerTW, setCurrentPowerTW] = useState<number>(18.5); // Earth current primary power ~18.5 TW
  const [growthRatePercent, setGrowthRatePercent] = useState<number>(1.9); // Historical energy growth rate ~1.9%/yr
  const [selectedPreset, setSelectedPreset] = useState<'conservative' | 'historical' | 'fusion' | 'orbital'>('historical');
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'milestones' | 'great-filter'>('overview');

  // Sagan Kardashev continuous scale: K = (log10(P) - 6) / 10 where P is in Watts
  // P_Watts = currentPowerTW * 10^12
  const currentWatts = currentPowerTW * 1e12;
  const currentKRating = useMemo(() => {
    if (currentWatts <= 0) return 0;
    const logP = Math.log10(currentWatts);
    return Math.max(0, (logP - 6) / 10);
  }, [currentWatts]);

  // Target Powers in Watts
  const TYPE_1_WATTS = 1e16; // 10,000 TW = 10 PW (Total planetary power)
  const TYPE_2_WATTS = 1e26; // 10^26 W (Total stellar power / Sun output ~3.8e26 W)
  const TYPE_3_WATTS = 1e36; // 10^36 W (Total galactic power / Milky Way ~10^37 W)

  // Solar insolation hitting Earth = ~1.74 * 10^17 W = 174,000 TW
  const EARTH_SOLAR_INSOLATION_WATTS = 1.74e17;

  // Time estimates to reach next levels: t = ln(P_target / P_current) / r
  const calculations = useMemo(() => {
    const r = growthRatePercent / 100;
    const currentYear = new Date().getFullYear();

    if (r <= 0) {
      return {
        yearsToType1: Infinity,
        targetYearType1: Infinity,
        yearsToType2: Infinity,
        targetYearType2: Infinity,
        yearsToType3: Infinity,
        targetYearType3: Infinity,
        powerRatioType1: TYPE_1_WATTS / currentWatts,
        progressPercent: (currentKRating / 1.0) * 100,
      };
    }

    const yearsToType1 = Math.round(Math.log(TYPE_1_WATTS / currentWatts) / r);
    const targetYearType1 = currentYear + yearsToType1;

    const yearsToType2 = Math.round(Math.log(TYPE_2_WATTS / currentWatts) / r);
    const targetYearType2 = currentYear + yearsToType2;

    const yearsToType3 = Math.round(Math.log(TYPE_3_WATTS / currentWatts) / r);
    const targetYearType3 = currentYear + yearsToType3;

    const powerRatioType1 = TYPE_1_WATTS / currentWatts;
    const progressPercent = (currentKRating / 1.0) * 100;
    const harnessRatioSolar = (currentWatts / EARTH_SOLAR_INSOLATION_WATTS) * 100;

    return {
      yearsToType1,
      targetYearType1,
      yearsToType2,
      targetYearType2,
      yearsToType3,
      targetYearType3,
      powerRatioType1,
      progressPercent,
      harnessRatioSolar,
    };
  }, [currentWatts, growthRatePercent, currentKRating]);

  const handleApplyPreset = (preset: 'conservative' | 'historical' | 'fusion' | 'orbital') => {
    setSelectedPreset(preset);
    if (preset === 'conservative') {
      setGrowthRatePercent(1.0);
    } else if (preset === 'historical') {
      setGrowthRatePercent(1.9);
    } else if (preset === 'fusion') {
      setGrowthRatePercent(2.6);
    } else if (preset === 'orbital') {
      setGrowthRatePercent(3.6);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div
        id="kardashev-scale-modal"
        className="bg-[#131313] border border-[#00F2FF] w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col shadow-[0_0_40px_rgba(0,242,255,0.2)]"
      >
        {/* Modal Top Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2C2E33] flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#00F2FF]/10 border border-[#00F2FF] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00F2FF] text-[20px]">
                solar_power
              </span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-[16px] sm:text-[18px] uppercase tracking-wider text-[#e2e2e2]">
                KARDASHEV SCALE & CIVILIZATION ASCENSION TELEMETRY
              </h2>
              <span className="text-[10px] text-[#00F2FF] font-mono">
                PLANETARY ENERGY HARNESSING INDEX // CARAGAN-KARDASHEV CONTINUOUS FORMULA
              </span>
            </div>
          </div>
          <button
            id="close-kardashev-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] text-[#cfc4c5] hover:text-[#00F2FF] border border-[#2C2E33] transition-colors"
            aria-label="Close Kardashev Scale Modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2C2E33] bg-[#0e0e0e] px-4 font-mono text-[12px] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#00F2FF] text-[#00F2FF]'
                : 'border-transparent text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            CIVILIZATION GAUGE & ETA
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-[#00F2FF] text-[#00F2FF]'
                : 'border-transparent text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            EXPANSION TIERS (I, II, III)
          </button>
          <button
            onClick={() => setActiveTab('great-filter')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'great-filter'
                ? 'border-[#00F2FF] text-[#00F2FF]'
                : 'border-transparent text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            GREAT FILTER BOTTLENECK
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'border-[#00F2FF] text-[#00F2FF]'
                : 'border-transparent text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            TRANSITION MILESTONES
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex flex-col gap-6 font-mono text-[#e2e2e2]">
          {/* Main Hero Indicator Box */}
          <div className="bg-[#0e0e0e] border border-[#00F2FF] p-5 sm:p-6 relative overflow-hidden">
            {/* Background grid line decoration */}
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#00F2FF]/5 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Big Kardashev Number */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#00F2FF]/20 border border-[#00F2FF] text-[#00F2FF] text-[10px] font-bold">
                    EARTH STATUS: SUB-PLANETARY
                  </span>
                  <span className="text-[10px] text-[#757575] uppercase">
                    TYPE 0 $\to$ TYPE I TRANSITION
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-[52px] sm:text-[64px] font-headline font-black text-[#00F2FF] tracking-tight leading-none">
                    K {currentKRating.toFixed(3)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="h-3 flex-1 bg-[#1f1f1f] rounded-full overflow-hidden border border-[#2C2E33] p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#00F2FF] via-[#39FF14] to-[#FFCC00] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, calculations.progressPercent)}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-bold text-[#00F2FF]">
                    {calculations.progressPercent.toFixed(1)}% of Type I
                  </span>
                </div>

                <span className="text-[11px] text-[#cfc4c5] mt-3 leading-relaxed">
                  Formula: <code className="text-[#00F2FF] bg-[#1a1a1a] px-1 py-0.5">K = (log₁₀(P) - 6) / 10</code>. Current power output: <b className="text-white">{(currentWatts / 1e12).toFixed(1)} Terawatts</b> ({calculations.harnessRatioSolar.toFixed(4)}% of solar energy incident on Earth).
                </span>
              </div>

              {/* Right Column: Time Estimation Countdown Card */}
              <div className="lg:col-span-7 bg-[#171717] border border-[#2C2E33] p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-[#2C2E33] pb-2">
                  <span className="text-[11px] font-bold text-[#39FF14] tracking-wider uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">timelapse</span>
                    ESTIMATED TIME TO REACH TYPE I (PLANETARY)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
                    TARGET: 10,000 TW (10¹⁶ W)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-1">
                  <div className="flex flex-col bg-[#0e0e0e] p-3 border border-[#2C2E33]">
                    <span className="text-[10px] text-[#757575] uppercase">TIME REMAINING</span>
                    <span className="text-[28px] font-headline font-black text-[#39FF14] tracking-tight">
                      ~{calculations.yearsToType1} YEARS
                    </span>
                    <span className="text-[10px] text-[#cfc4c5]">
                      At {growthRatePercent.toFixed(1)}% annual energy growth
                    </span>
                  </div>

                  <div className="flex flex-col bg-[#0e0e0e] p-3 border border-[#2C2E33]">
                    <span className="text-[10px] text-[#757575] uppercase">PROJECTED ASCENSION YEAR</span>
                    <span className="text-[28px] font-headline font-black text-[#00F2FF] tracking-tight">
                      YEAR {calculations.targetYearType1}
                    </span>
                    <span className="text-[10px] text-[#cfc4c5]">
                      ~{(calculations.yearsToType1 / 25).toFixed(1)} Human Generations
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] bg-[#1f1f1f] px-3 py-2 border border-[#2C2E33]">
                  <span className="text-[#cfc4c5]">REQUIRED ENERGY MULTIPLIER:</span>
                  <span className="text-[#FFCC00] font-bold">
                    {calculations.powerRatioType1.toFixed(1)}× CURRENT OUTPUT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Simulation & Growth Rate Engine */}
          <div className="bg-[#171717] border border-[#2C2E33] p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#2C2E33] pb-3">
              <div>
                <span className="text-[13px] font-headline font-bold text-[#e2e2e2] uppercase">
                  ENERGY GROWTH & TRAJECTORY SIMULATION ENGINE
                </span>
                <span className="text-[10px] text-[#00F2FF] block">
                  ADJUST ANNUAL PRIMARY POWER EXPANSION COEFFICIENTS (r)
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#757575] mr-1">PRESETS:</span>
                <button
                  onClick={() => handleApplyPreset('conservative')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-colors ${
                    selectedPreset === 'conservative'
                      ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                      : 'bg-[#0e0e0e] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                  }`}
                >
                  CONSERVATIVE (1.0%)
                </button>
                <button
                  onClick={() => handleApplyPreset('historical')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-colors ${
                    selectedPreset === 'historical'
                      ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                      : 'bg-[#0e0e0e] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                  }`}
                >
                  HISTORICAL (1.9%)
                </button>
                <button
                  onClick={() => handleApplyPreset('fusion')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-colors ${
                    selectedPreset === 'fusion'
                      ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                      : 'bg-[#0e0e0e] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                  }`}
                >
                  FUSION GRID (2.6%)
                </button>
                <button
                  onClick={() => handleApplyPreset('orbital')}
                  className={`px-2 py-1 text-[10px] font-bold border transition-colors ${
                    selectedPreset === 'orbital'
                      ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                      : 'bg-[#0e0e0e] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                  }`}
                >
                  ORBITAL SWARM (3.6%)
                </button>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div className="flex flex-col gap-2 bg-[#0e0e0e] p-3.5 border border-[#2C2E33]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#cfc4c5]">ANNUAL ENERGY GROWTH RATE (r):</span>
                  <span className="text-[#00F2FF] font-bold">{growthRatePercent.toFixed(2)}% / year</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.1"
                  value={growthRatePercent}
                  onChange={(e) => {
                    setGrowthRatePercent(parseFloat(e.target.value));
                    setSelectedPreset('historical');
                  }}
                  className="accent-[#00F2FF] w-full cursor-pointer bg-[#2a2a2a]"
                />
                <div className="flex justify-between text-[9px] text-[#757575]">
                  <span>0.5% (Stagnation)</span>
                  <span>1.9% (Baseline)</span>
                  <span>4.5% (Exponential Space Industrialization)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-[#0e0e0e] p-3.5 border border-[#2C2E33]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#cfc4c5]">CURRENT POWER HARNESS BASELINE:</span>
                  <span className="text-[#39FF14] font-bold">{currentPowerTW.toFixed(1)} Terawatts (TW)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="0.5"
                  value={currentPowerTW}
                  onChange={(e) => setCurrentPowerTW(parseFloat(e.target.value))}
                  className="accent-[#39FF14] w-full cursor-pointer bg-[#2a2a2a]"
                />
                <div className="flex justify-between text-[9px] text-[#757575]">
                  <span>10 TW (Pre-industrial)</span>
                  <span>18.5 TW (2026 Earth)</span>
                  <span>50 TW (Electrified Multi-Continent)</span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW & COMPARISON METRICS */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-[#cfc4c5] tracking-wider uppercase">
                CIVILIZATION SCALE COMPARISON MATRIX
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type I Card */}
                <div className="bg-[#171717] border border-[#00F2FF]/50 p-4 flex flex-col justify-between gap-3 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/40 font-bold">
                      TIER 1.0 TARGET
                    </span>
                    <span className="text-[11px] text-[#39FF14] font-bold">
                      ~{calculations.yearsToType1} yrs
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-headline font-bold text-white uppercase">
                      TYPE I: PLANETARY
                    </h3>
                    <p className="text-[11px] text-[#cfc4c5] mt-1 leading-relaxed">
                      Complete mastery of all energy falling upon the planet from its star, plus all geological, geothermal, tidal, and total planetary atmospheric energies.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2C2E33] text-[10px] flex justify-between">
                    <span className="text-[#757575]">ENERGY HARNESS:</span>
                    <span className="text-[#00F2FF] font-bold">10¹⁶ W (10,000 TW)</span>
                  </div>
                </div>

                {/* Type II Card */}
                <div className="bg-[#171717] border border-[#2C2E33] p-4 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 bg-[#FFCC00]/10 text-[#FFCC00] border border-[#FFCC00]/40 font-bold">
                      TIER 2.0 HORIZON
                    </span>
                    <span className="text-[11px] text-[#FFCC00] font-bold">
                      ~{calculations.yearsToType2} yrs
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-headline font-bold text-white uppercase">
                      TYPE II: STELLAR
                    </h3>
                    <p className="text-[11px] text-[#cfc4c5] mt-1 leading-relaxed">
                      Direct containment and capture of total host star luminescent radiation via orbital Dyson Swarms, Matrioshka Brains, and circumstellar energy lattices.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2C2E33] text-[10px] flex justify-between">
                    <span className="text-[#757575]">ENERGY HARNESS:</span>
                    <span className="text-[#FFCC00] font-bold">10²⁶ W (10¹⁴ TW)</span>
                  </div>
                </div>

                {/* Type III Card */}
                <div className="bg-[#171717] border border-[#2C2E33] p-4 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/40 font-bold">
                      TIER 3.0 HORIZON
                    </span>
                    <span className="text-[11px] text-[#FF3B30] font-bold">
                      ~{calculations.yearsToType3} yrs
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-headline font-bold text-white uppercase">
                      TYPE III: GALACTIC
                    </h3>
                    <p className="text-[11px] text-[#cfc4c5] mt-1 leading-relaxed">
                      Galactic-scale power mastery, tapping energy from hundreds of billions of star systems, supermassive black hole accretion disks (Penrose Process), and relativistic stellar engines.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#2C2E33] text-[10px] flex justify-between">
                    <span className="text-[#757575]">ENERGY HARNESS:</span>
                    <span className="text-[#FF3B30] font-bold">10³⁶ W (Galactic)</span>
                  </div>
                </div>
              </div>

              {/* Energy Source Distribution on Earth */}
              <div className="bg-[#171717] border border-[#2C2E33] p-4 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-[#00F2FF] uppercase">
                  PLANETARY ENERGY SOURCES VS HUMAN CONSUMPTION
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="bg-[#0e0e0e] p-3 border border-[#2C2E33]">
                    <span className="text-[10px] text-[#757575] block">SOLAR RADIANT INSOLATION</span>
                    <span className="text-[15px] font-bold text-[#00F2FF]">174,000 TW</span>
                    <span className="text-[9px] text-[#757575] block mt-0.5">1.74 × 10¹⁷ Watts hitting Earth</span>
                  </div>
                  <div className="bg-[#0e0e0e] p-3 border border-[#2C2E33]">
                    <span className="text-[10px] text-[#757575] block">ATMOSPHERIC KINETIC (WIND)</span>
                    <span className="text-[15px] font-bold text-[#39FF14]">1,200 TW</span>
                    <span className="text-[9px] text-[#757575] block mt-0.5">Continuous troposphere flux</span>
                  </div>
                  <div className="bg-[#0e0e0e] p-3 border border-[#2C2E33]">
                    <span className="text-[10px] text-[#757575] block">GEOTHERMAL HEAT FLUX</span>
                    <span className="text-[15px] font-bold text-[#FFCC00]">44 TW</span>
                    <span className="text-[9px] text-[#757575] block mt-0.5">Core & mantle radiogenic heat</span>
                  </div>
                  <div className="bg-[#0e0e0e] p-3 border border-[#2C2E33]">
                    <span className="text-[10px] text-[#757575] block">TOTAL HUMAN CONSUMPTION</span>
                    <span className="text-[15px] font-bold text-white">18.5 TW</span>
                    <span className="text-[9px] text-[#00F2FF] block mt-0.5">~0.0106% of solar flux</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE PROJECTIONS */}
          {activeTab === 'timeline' && (
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-[#cfc4c5] tracking-wider uppercase">
                EXPONENTIAL ASCENSION TIMELINE FORECAST
              </span>

              <div className="space-y-3">
                <div className="bg-[#171717] border-l-4 border-[#00F2FF] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-white">YEAR 2026: TYPE 0.727 (PRESENT DAY)</span>
                    <span className="text-[11px] text-[#00F2FF] font-bold">18.5 TW</span>
                  </div>
                  <p className="text-[11px] text-[#cfc4c5]">
                    Fossil fuel transition, early commercial fission, rapid terrestrial solar/wind scale-up, prototype magnetic confinement fusion experiments (ITER, SPARC).
                  </p>
                </div>

                <div className="bg-[#171717] border-l-4 border-[#39FF14] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-[#39FF14]">
                      YEAR ~{new Date().getFullYear() + Math.round(calculations.yearsToType1 * 0.4)}: TYPE 0.85 (INTERMEDIATE FUSION)
                    </span>
                    <span className="text-[11px] text-[#39FF14] font-bold">~350 TW</span>
                  </div>
                  <p className="text-[11px] text-[#cfc4c5]">
                    Decentralized D-T/D-He3 fusion reactors powering global desalination, carbon capture sequestration at gigaton scale, orbital space solar power (SPS) prototypes beaming gigawatts via microwave.
                  </p>
                </div>

                <div className="bg-[#171717] border-l-4 border-[#FFCC00] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-[#FFCC00]">
                      YEAR ~{calculations.targetYearType1}: TYPE I (FULL PLANETARY HARNESS)
                    </span>
                    <span className="text-[11px] text-[#FFCC00] font-bold">10,000 TW (10¹⁶ W)</span>
                  </div>
                  <p className="text-[11px] text-[#cfc4c5]">
                    Complete control of Earth&apos;s climate, active volcanism mitigation, seismic stress discharge regulation, orbital asteroid deflection shields, and multi-planetary self-sustaining colonies on the Moon and Mars.
                  </p>
                </div>

                <div className="bg-[#171717] border-l-4 border-[#FF3B30] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-[#FF3B30]">
                      YEAR ~{calculations.targetYearType2}: TYPE II (SOLAR DYSON SWARM)
                    </span>
                    <span className="text-[11px] text-[#FF3B30] font-bold">10²⁶ W (100,000,000,000,000 TW)</span>
                  </div>
                  <p className="text-[11px] text-[#cfc4c5]">
                    Mercury disassembly into megawatt mirror swarms surrounding the Sun. Interstellar relativistic laser sail propulsion fleets and complete solar system terraforming.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GREAT FILTER BOTTLENECK */}
          {activeTab === 'great-filter' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#1f1616] border border-[#FF3B30] p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#FF3B30]">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span className="font-headline font-bold text-[13px] uppercase">
                    THE GREAT FILTER: TYPE 0.7 $\to$ TYPE 1.0 VULNERABILITY WINDOW
                  </span>
                </div>
                <p className="text-[11px] text-[#cfc4c5] leading-relaxed">
                  Astrophysicist Robin Hanson&apos;s <i>Great Filter</i> hypothesis dictates that the transition from a Type 0 pre-planetary civilization to a Type I planetary civilization is the single most hazardous phase in any species&apos; evolutionary history. The civilization develops planetary-destroying power (thermonuclear weapons, AI misalignment, geoengineering catastrophes, bio-pathogens) before achieving multi-planetary redundancy or full planetary hazard control.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#171717] border border-[#2C2E33] p-4 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-[#FF3B30] uppercase">
                    ACTIVE FILTER THREATS (DOOMSDAY METRICS)
                  </span>
                  <ul className="space-y-2 text-[11px] text-[#e2e2e2]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span><b>Biosphere Destabilization:</b> Atmospheric CO₂ at 426.8 ppm and thermal inertia triggering unstoppable feedback loops before clean energy transition.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span><b>Unprotected Orbital Vulnerability:</b> 2,400+ Potentially Hazardous Asteroids (PHAs) crossing Earth&apos;s orbit without autonomous kinetic deflection infrastructure.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF3B30] font-bold">✕</span>
                      <span><b>Supervolcanic / Caldera Shocks:</b> VEI-7+ eruptions triggering abrupt volcanic winter before indoor agrarian bioreactor scale-up.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#171717] border border-[#2C2E33] p-4 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-[#39FF14] uppercase">
                    TYPE I IMMUNITY ADVANTAGES
                  </span>
                  <ul className="space-y-2 text-[11px] text-[#e2e2e2]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#39FF14] font-bold">✓</span>
                      <span><b>Planetary Thermal Regulation:</b> Ability to actively manage planetary albedo and remove billions of tons of CO₂ annually.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#39FF14] font-bold">✓</span>
                      <span><b>Absolute Asteroid Defense:</b> Multi-gigawatt orbital directed energy arrays capable of vaporizing or deflecting kilometer-scale bolides years in advance.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#39FF14] font-bold">✓</span>
                      <span><b>Off-World Redundancy:</b> Self-sustaining lunar, Martian, and orbital habitats ensuring human civilizational continuity regardless of terrestrial catastrophe.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSITION MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="flex flex-col gap-4">
              <span className="text-[12px] font-bold text-[#cfc4c5] tracking-wider uppercase">
                ROADMAP TO TYPE I CIVILIZATION (EARTH ASCENSION CHECKLIST)
              </span>

              <div className="space-y-3">
                {[
                  {
                    title: 'Net-Positive Fusion Energy Grid (Q > 10)',
                    status: 'IN PROGRESS (2026-2035)',
                    badgeColor: 'text-[#00F2FF] border-[#00F2FF]',
                    desc: 'Commercial magnetic confinement & inertial fusion power plants providing limitless zero-carbon baseload energy.',
                  },
                  {
                    title: 'Space-Based Solar Power (SBSP) Orbital Constellations',
                    status: 'PROTOTYPE TESTING',
                    badgeColor: 'text-[#FFCC00] border-[#FFCC00]',
                    desc: 'Gigawatt-class orbital solar collectors in Geostationary Orbit transmitting power to rectenna arrays on Earth 24/7.',
                  },
                  {
                    title: 'Autonomous Planetary Defense Orbital Network',
                    status: 'INITIAL DEPLOYMENT (DART Follow-ups)',
                    badgeColor: 'text-[#00F2FF] border-[#00F2FF]',
                    desc: 'Constellation of early-detection infrared space telescopes and kinetic impactor fleets defending Earth against 100% of PHAs.',
                  },
                  {
                    title: 'Global Atmospheric & Oceanic Climate Control Equilibrium',
                    status: 'PENDING SCALING',
                    badgeColor: 'text-[#FF3B30] border-[#FF3B30]',
                    desc: 'Direct air capture and ocean alkalinity enhancement sequestering 50+ Gigatons of CO₂/yr back to pre-industrial 280 ppm.',
                  },
                  {
                    title: 'Self-Sustaining Off-Earth Biospheres (Moon / Mars)',
                    status: 'TARGET 2040-2070',
                    badgeColor: 'text-[#FFCC00] border-[#FFCC00]',
                    desc: 'Independent agricultural and industrial ecosystems preventing single-planet extinction vulnerability.',
                  },
                  {
                    title: 'Sub-Crustal Geothermal & Magma Chamber Depressurization',
                    status: 'THEORETICAL RESEARCH',
                    badgeColor: 'text-[#757575] border-[#757575]',
                    desc: 'Deep super-critical geothermal drilling tapping and cooling magma chambers under active supervolcano calderas.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#171717] border border-[#2C2E33] p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-[#00F2FF] font-bold text-[12px]">[{idx + 1}]</span>
                      <div>
                        <span className="text-[13px] font-bold text-white block">{item.title}</span>
                        <span className="text-[11px] text-[#cfc4c5] block mt-0.5">{item.desc}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 border ${item.badgeColor} whitespace-nowrap font-bold shrink-0`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2C2E33] flex justify-between items-center">
          <div className="text-[10px] font-mono text-[#757575] hidden sm:block">
            REF: SAGAN, C. (1973) // KARDASHEV, N. (1964) TRANSMISSION OF INFORMATION BY EXTRATERRESTRIAL CIVILIZATIONS
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00F2FF] text-black font-mono font-bold text-[11px] hover:bg-white transition-colors"
          >
            CLOSE TELEMETRY PANEL
          </button>
        </div>
      </div>
    </div>
  );
};
