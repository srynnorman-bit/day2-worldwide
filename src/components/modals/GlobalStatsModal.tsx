import React, { useState, useEffect } from 'react';
import { fetchWorldBankPopulation, calculateAIExtinctionProbability } from '../../services/telemetryApi';
import { WorldBankPopulationResponse, GeminiExtinctionCalculationResult } from '../../types';

interface GlobalStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  extinctionProbability: number;
  onSetExtinctionProbability: (val: number) => void;
  onOpenKardashev?: () => void;
}

export const GlobalStatsModal: React.FC<GlobalStatsModalProps> = ({
  isOpen,
  onClose,
  extinctionProbability,
  onSetExtinctionProbability,
  onOpenKardashev,
}) => {
  const [countryCode, setCountryCode] = useState<string>('SGP');
  const [queryYear, setQueryYear] = useState<string>('2025');
  const [populationData, setPopulationData] = useState<WorldBankPopulationResponse | null>(null);
  const [loadingPopulation, setLoadingPopulation] = useState<boolean>(false);
  const [popError, setPopError] = useState<string | null>(null);

  // Gemini AI calculation states
  const [isCalculatingAI, setIsCalculatingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<GeminiExtinctionCalculationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customParams, setCustomParams] = useState<string>('');

  const loadPopulation = async (country: string, year: string) => {
    setLoadingPopulation(true);
    setPopError(null);
    try {
      const data = await fetchWorldBankPopulation(country, year);
      setPopulationData(data);
    } catch (err: any) {
      setPopError(err?.message || 'Failed to fetch World Bank population data');
    } finally {
      setLoadingPopulation(false);
    }
  };

  const runGeminiCalculation = async () => {
    setIsCalculatingAI(true);
    setAiError(null);
    try {
      const res = await calculateAIExtinctionProbability({
        neoObjectsCount: 8,
        hazardousNeosCount: 2,
        volcanoActivityLevel: 'VEI-7 Caldera Inflation Alert (Campi Flegrei, Yellowstone, Toba)',
        earthquakeActivityLevel: 'Cascadia Megathrust Subduction M9.0 Probability Surge',
        wildfireIntensity: 'Boreal Smoke Veil / Megafire Cascades',
        atmosphericCO2: '426.8 ppm (+2.4 ppm/yr)',
        worldPopulation: populationData?.population ? `${populationData.population.toLocaleString()} (${populationData.country})` : '8,045,311,447 (World Bank SP.POP.TOTL)',
        activeThreats: [
          'Asteroid 99942 Apophis gravitational keyhole resonances',
          'Supervolcanic Caldera magma replenishment (Campi Flegrei)',
          'Atmospheric CO2 426.8 ppm and oceanic acidification pH 8.04'
        ],
        customParameters: customParams
      });
      setAiResult(res);
      if (res.extinctionProbability) {
        onSetExtinctionProbability(res.extinctionProbability);
      }
    } catch (err: any) {
      setAiError(err?.message || 'Gemini calculation failed');
    } finally {
      setIsCalculatingAI(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPopulation(countryCode, queryYear);
      if (!aiResult) {
        runGeminiCalculation();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultBreakdown = [
    { category: 'Supervolcanic Winter & Caldera Cascade', percentage: 3.82, color: '#FF3B30', defcon: 'DEFCON 2', rationale: 'Active caldera uplift and magma pressurization.' },
    { category: 'Biosphere Tipping Points & Climate Collapse', percentage: 4.10, color: '#FFCC00', defcon: 'DEFCON 3', rationale: 'CO2 at 426.8 ppm surpassing planetary boundary.' },
    { category: 'Near-Earth Object (NEO) Impact (Apophis/Bennu)', percentage: 2.45, color: '#00F2FF', defcon: 'DEFCON 3', rationale: 'Multiple PHA orbital crossings within lunar distance.' },
    { category: 'Geomagnetic Storm / CME Grid Collapse', percentage: 0.95, color: '#cfc4c5', defcon: 'DEFCON 4', rationale: 'Solar Maximum geomagnetic vulnerability.' },
    { category: 'Oceanic Anoxic Event / Methane Clathrate', percentage: 0.72, color: '#757575', defcon: 'DEFCON 4', rationale: 'Deep ocean hypoxia expansion.' },
  ];

  const activeBreakdown = aiResult?.threatBreakdown?.length
    ? aiResult.threatBreakdown.map((item, idx) => ({
        ...item,
        color: idx === 0 ? '#FF3B30' : idx === 1 ? '#FFCC00' : idx === 2 ? '#00F2FF' : '#cfc4c5'
      }))
    : defaultBreakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#131313] border border-[#00F2FF] w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col shadow-[0_0_35px_rgba(0,242,255,0.25)]">
        {/* Modal Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2C2E33] flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF] animate-pulse">psychology</span>
            <div>
              <h2 className="font-headline font-bold text-[18px] uppercase tracking-wider text-[#e2e2e2]">
                GEMINI AI EXTINCTION PROBABILITY & DEMOGRAPHIC MATRIX
              </h2>
              <span className="text-[10px] text-[#00F2FF] font-mono">
                POWERED BY GEMINI 3.7 FLASH // MULTI-HAZARD PREDICTIVE ENGINE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] text-[#cfc4c5] hover:text-[#00F2FF] border border-[#2C2E33]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-6 font-mono">
          {/* Gemini AI Trigger & Control Hero */}
          <div className="bg-[#0e0e0e] border border-[#00F2FF] p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#00F2FF]/20 border border-[#00F2FF] text-[#00F2FF] text-[10px] font-bold">
                    {aiResult?.source || 'GEMINI 3.7 FLASH'}
                  </span>
                  <span className="text-[11px] text-[#757575] font-bold">
                    100-YEAR EXTINCTION RISK ASSESSMENT
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-[48px] font-headline font-black text-[#FF3B30] tracking-tight">
                    {extinctionProbability.toFixed(2)}%
                  </span>
                  <span className="text-[13px] text-[#FFCC00] font-bold">
                    {aiResult?.riskTier || (extinctionProbability > 20 ? 'CRITICAL RISK MATRIX' : 'ELEVATED DEFCON 3')}
                  </span>
                </div>
                <span className="text-[11px] text-[#cfc4c5] mt-1 max-w-xl">
                  {aiResult?.primaryThreatVector ||
                    'Synthesized multi-hazard analysis across orbital asteroids, caldera inflation, and biosphere disruption.'}
                </span>
              </div>

              {/* Action Button & Slider */}
              <div className="flex flex-col gap-3 w-full lg:w-72">
                <button
                  onClick={runGeminiCalculation}
                  disabled={isCalculatingAI}
                  className="w-full py-3 bg-[#00F2FF] hover:bg-white text-black font-headline font-black text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isCalculatingAI ? 'animate-spin' : ''}`}>
                    {isCalculatingAI ? 'sync' : 'auto_awesome'}
                  </span>
                  {isCalculatingAI ? 'CALCULATING WITH GEMINI...' : 'RECALCULATE WITH GEMINI'}
                </button>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] text-[#cfc4c5]">
                    <span>MANUAL DEFCON OVERRIDE:</span>
                    <span className="text-[#00F2FF]">{extinctionProbability.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.1"
                    value={extinctionProbability}
                    onChange={(e) => onSetExtinctionProbability(parseFloat(e.target.value))}
                    className="accent-[#00F2FF] w-full cursor-pointer bg-[#2a2a2a]"
                  />
                </div>
              </div>
            </div>

            {/* AI Detailed Assessment Summary */}
            {aiResult?.detailedAssessment && (
              <div className="bg-[#171717] border-l-2 border-[#00F2FF] p-3 text-[11px] text-[#e2e2e2] leading-relaxed">
                <span className="text-[#00F2FF] font-bold block mb-1">
                  AI EVALUATION SUMMARY ({new Date(aiResult.calculatedAt).toLocaleTimeString()}):
                </span>
                {aiResult.detailedAssessment}
              </div>
            )}
            {aiError && <span className="text-[11px] text-[#FF3B30]">{aiError}</span>}
          </div>

          {/* World Bank Population API Integration Block */}
          <div className="bg-[#1b1b1b] border border-[#2C2E33] p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#2C2E33] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00F2FF] text-[20px]">
                  groups
                </span>
                <div>
                  <span className="text-[12px] font-headline font-bold text-[#e2e2e2] uppercase">
                    World Bank Population Telemetry
                  </span>
                  <span className="text-[10px] text-[#00F2FF] block">
                    INDICATOR: SP.POP.TOTL // LIVE REST API
                  </span>
                </div>
              </div>

              {/* Country & Date Selector Form */}
              <div className="flex items-center gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    loadPopulation(e.target.value, queryYear);
                  }}
                  className="bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono text-[#00F2FF] outline-none"
                >
                  <option value="SGP">Singapore (SGP)</option>
                  <option value="WLD">World Total (WLD)</option>
                  <option value="USA">United States (USA)</option>
                  <option value="IDN">Indonesia (IDN)</option>
                  <option value="JPN">Japan (JPN)</option>
                  <option value="ISL">Iceland (ISL)</option>
                  <option value="NZL">New Zealand (NZL)</option>
                </select>

                <input
                  type="text"
                  value={queryYear}
                  onChange={(e) => setQueryYear(e.target.value)}
                  placeholder="2025"
                  className="w-16 bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono text-[#e2e2e2] text-center outline-none"
                />

                <button
                  onClick={() => loadPopulation(countryCode, queryYear)}
                  disabled={loadingPopulation}
                  className="px-2.5 py-1 bg-[#00F2FF]/10 hover:bg-[#00F2FF]/20 border border-[#00F2FF] text-[#00F2FF] text-[10px] font-bold uppercase transition-colors flex items-center gap-1"
                >
                  <span className={`material-symbols-outlined text-[14px] ${loadingPopulation ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  QUERY
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#131313] p-3 border border-[#2C2E33]">
                <span className="text-[10px] text-[#757575] block uppercase">
                  COUNTRY / TERRITORY
                </span>
                <span className="text-[16px] font-bold text-[#e2e2e2]">
                  {populationData?.country || countryCode} ({populationData?.countryIso || countryCode})
                </span>
                <span className="text-[10px] text-[#cfc4c5] block mt-0.5">
                  YEAR: {populationData?.year || queryYear}
                </span>
              </div>

              <div className="bg-[#131313] p-3 border border-[#2C2E33]">
                <span className="text-[10px] text-[#757575] block uppercase">
                  TOTAL POPULATION
                </span>
                <span className="text-[18px] font-bold text-[#00F2FF]">
                  {loadingPopulation
                    ? 'FETCHING...'
                    : populationData?.population !== null && populationData?.population !== undefined
                    ? populationData.population.toLocaleString()
                    : 'N/A (CENSUS PENDING)'}
                </span>
                <span className="text-[10px] text-[#39FF14] block mt-0.5">
                  {populationData?.source || 'API CONNECTED'}
                </span>
              </div>

              <div className="bg-[#131313] p-3 border border-[#2C2E33]">
                <span className="text-[10px] text-[#757575] block uppercase">
                  ACTIVE ENDPOINT
                </span>
                <a
                  href={`https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json&date=${queryYear}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#00F2FF] hover:underline block break-all mt-0.5 leading-tight"
                >
                  api.worldbank.org/v2/country/{countryCode}...
                </a>
              </div>
            </div>
            {popError && <span className="text-[10px] text-[#FF3B30]">{popError}</span>}
          </div>

          {/* Threat Vector Contribution Breakdown */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-[#cfc4c5] tracking-wider">
              MULTI-HAZARD RISK VECTOR CONTRIBUTION
            </span>

            <div className="space-y-3">
              {activeBreakdown.map((item: any, idx: number) => (
                <div key={idx} className="bg-[#1b1b1b] border border-[#2C2E33] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <div className="flex flex-col">
                      <span className="text-[#e2e2e2] font-bold">{item.category || item.name}</span>
                      {item.rationale && (
                        <span className="text-[10px] text-[#757575]">{item.rationale}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 border border-[#2C2E33] text-[#cfc4c5]">
                        {item.defcon}
                      </span>
                      <span className="font-bold" style={{ color: item.color || '#00F2FF' }}>
                        {(item.percentage || item.risk || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-[#2a2a2a] overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, ((item.percentage || item.risk || 0) / 5) * 100)}%`,
                        backgroundColor: item.color || '#00F2FF',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigation Directives */}
          {aiResult?.mitigationDirectives && aiResult.mitigationDirectives.length > 0 && (
            <div className="bg-[#171717] border border-[#2C2E33] p-4 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#00F2FF] uppercase">
                AI PLANETARY DEFENSE DIRECTIVES:
              </span>
              <ul className="space-y-1 text-[11px] text-[#e2e2e2]">
                {aiResult.mitigationDirectives.map((directive, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#00F2FF] font-bold">[{i + 1}]</span>
                    <span>{directive}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Kardashev Scale Civilizational Index Integration */}
          <div className="bg-[#171717] border border-[#00F2FF]/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#00F2FF]/10 border border-[#00F2FF] text-[#00F2FF] mt-0.5">
                <span className="material-symbols-outlined text-[20px]">solar_power</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-white uppercase">
                    KARDASHEV SCALE CIVILIZATIONAL INDEX: TYPE 0.73
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 font-bold">
                    18.5 TW HARNESSED
                  </span>
                </div>
                <span className="text-[11px] text-[#cfc4c5] mt-0.5">
                  Target Type I Planetary Power: 10,000 TW (10¹⁶ W) // Estimated Ascension Horizon: <b className="text-[#39FF14]">~2357 (+331 years)</b> at 1.9% annual expansion.
                </span>
              </div>
            </div>

            {onOpenKardashev && (
              <button
                onClick={() => {
                  onClose();
                  onOpenKardashev();
                }}
                className="px-3 py-1.5 bg-[#00F2FF]/10 hover:bg-[#00F2FF] text-[#00F2FF] hover:text-black border border-[#00F2FF] font-bold text-[10px] uppercase transition-colors shrink-0 flex items-center gap-1"
              >
                <span>OPEN FULL KARDASHEV TELEMETRY</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>

          {/* Planetary Health Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
              <span className="text-[10px] text-[#757575] block">ATMOSPHERIC CO2</span>
              <span className="text-[16px] font-bold text-[#FF3B30]">426.8 ppm</span>
              <span className="text-[10px] text-[#FF3B30]">+2.4 ppm/yr</span>
            </div>
            <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
              <span className="text-[10px] text-[#757575] block">OCEAN ACIDIFICATION</span>
              <span className="text-[16px] font-bold text-[#FFCC00]">pH 8.04</span>
              <span className="text-[10px] text-[#FFCC00]">-0.11 since 1850</span>
            </div>
            <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
              <span className="text-[10px] text-[#757575] block">BIOSPHERE INTACTNESS</span>
              <span className="text-[16px] font-bold text-[#00F2FF]">68.4%</span>
              <span className="text-[10px] text-[#00F2FF]">Below safe boundary (75%)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2C2E33] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00F2FF] text-black font-mono font-bold text-[11px] hover:bg-white transition-colors"
          >
            CLOSE PANEL
          </button>
        </div>
      </div>
    </div>
  );
};
