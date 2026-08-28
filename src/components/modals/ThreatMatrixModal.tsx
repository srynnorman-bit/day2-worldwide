import React, { useState } from 'react';

interface ThreatMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatMatrixModal: React.FC<ThreatMatrixModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCascade, setSelectedCascade] = useState<number>(0);

  if (!isOpen) return null;

  const cascadeScenarios = [
    {
      title: 'SUPERVOLCANO → AEROSOL WINTER → DROUGHT → CROP FAILURE',
      severity: 'CRITICAL (DEFCON 1)',
      trigger: 'Campi Flegrei / Yellowstone VEI 7+ Eruption',
      mechanism:
        'Injection of 200 Mt sulfur dioxide into stratosphere blocks 45% solar radiation for 3–5 years, shifting monsoons and causing global agrarian failure within 9 months.',
      steps: [
        'T-0: Plinian Caldera Collapse',
        'T+48h: Stratospheric SO2 dispersion across Northern Hemisphere',
        'T+30d: Global mean temperature drops -4.5°C',
        'T+180d: Global breadbasket yield drops -68%',
        'T+365d: Famine cascade across 3.8 billion population',
      ],
    },
    {
      title: 'MEGA-EARTHQUAKE → OCEANIC TSUNAMI → NUCLEAR FACILITY CASUALTY',
      severity: 'ELEVATED (DEFCON 2)',
      trigger: 'Nankai Trough M8.4+ Rupture',
      mechanism:
        'Tectonic subduction triggers 30-meter run-up tsunami across Pacific Rim, impacting 14 coastal nuclear facilities and subsea telecommunications nodes.',
      steps: [
        'T-0: 120km subduction slab slips 18 meters',
        'T+18m: First tsunami wave impacts Tokyo/Nagoya industrial bays',
        'T+2h: Grid failure across 60M populace',
        'T+24h: Supply chain rupture in 40% global semiconductor fab',
      ],
    },
    {
      title: 'ASTEROID AIRBURST → WILDFIRE CONFLAGRATION → INFRASTRUCTURE BLACKOUT',
      severity: 'MODERATE (DEFCON 3)',
      trigger: '150m Tunguska-class Chondrite at 22 km/s',
      mechanism:
        'Thermal radiation pulse ignites 12,000 km² canopy instantly, creating pyrocumulonimbus storm systems and localized electromagnetic pulse (EMP).',
      steps: [
        'T-0: Atmospheric entry over continent',
        'T+3s: 15 Megaton airburst at 8,000m altitude',
        'T+1h: Regional conflagration and power grid surge failure',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#131313] border border-[#FF3B30] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_0_30px_rgba(255,59,48,0.2)]">
        {/* Modal Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2C2E33] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#FF3B30]">hub</span>
            <h2 className="font-headline font-bold text-[18px] uppercase tracking-wider text-[#e2e2e2]">
              CROSS-THREAT CASCADE MATRIX
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] text-[#cfc4c5] hover:text-[#FF3B30] border border-[#2C2E33]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 font-mono">
          {/* Scenario tabs */}
          <div className="flex flex-col sm:flex-row gap-2">
            {cascadeScenarios.map((sc, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCascade(idx)}
                className={`p-3 text-left border transition-colors flex-1 ${
                  selectedCascade === idx
                    ? 'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30] font-bold'
                    : 'border-[#2C2E33] bg-[#1b1b1b] text-[#cfc4c5] hover:border-[#cfc4c5]'
                }`}
              >
                <div className="text-[10px] opacity-70">SCENARIO 0{idx + 1}</div>
                <div className="text-[11px] truncate mt-1">{sc.title}</div>
              </button>
            ))}
          </div>

          {/* Active Scenario Card */}
          <div className="bg-[#0e0e0e] border border-[#2C2E33] p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="font-headline font-bold text-[20px] text-[#e2e2e2]">
                {cascadeScenarios[selectedCascade].title}
              </h3>
              <span className="px-2 py-1 text-[11px] bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]">
                {cascadeScenarios[selectedCascade].severity}
              </span>
            </div>

            <div className="p-3 bg-[#1f1f1f] border-l-2 border-[#00F2FF]">
              <span className="text-[10px] text-[#757575] block">PRIMARY TRIGGER:</span>
              <span className="text-[13px] text-[#00F2FF] font-bold">
                {cascadeScenarios[selectedCascade].trigger}
              </span>
            </div>

            <p className="text-[13px] text-[#cfc4c5] leading-relaxed">
              {cascadeScenarios[selectedCascade].mechanism}
            </p>

            {/* Timeline Steps */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-[#757575] font-bold tracking-wider">
                TEMPORAL CASCADE SEQUENCE
              </span>
              <div className="space-y-2">
                {cascadeScenarios[selectedCascade].steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#1b1b1b] border border-[#2C2E33] flex items-center gap-3 text-[12px]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
                    <span className="text-[#e2e2e2]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2C2E33] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#FF3B30] text-black font-mono font-bold text-[11px] hover:bg-white transition-colors uppercase"
          >
            DISMISS MATRIX
          </button>
        </div>
      </div>
    </div>
  );
};
