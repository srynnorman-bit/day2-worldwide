import React, { useState } from 'react';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatorId: string;
  operatorClearance: string;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  onClose,
  operatorId,
  operatorClearance,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [commandLogs, setCommandLogs] = useState<string[]>([
    '[21:04:12 UTC] SEC_AUTH_OK: Operator OP-9481 credential validated.',
    '[21:08:33 UTC] RADAR_KU_SYNC: Near-Earth Object trajectory vector refined.',
    '[21:14:02 UTC] RING_OF_FIRE: Supervolcano micro-seismic swarm flagged.',
  ]);

  if (!isOpen) return null;

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const time = new Date().toISOString().slice(11, 19);
    const cmd = commandInput.trim().toUpperCase();
    let response = `[${time} UTC] CMD_EXEC: "${cmd}" — Executed with clearance ${operatorClearance}.`;

    if (cmd === 'HELP') {
      response = `[${time} UTC] AVAILABLE COMMANDS: STATUS, PURGE_CACHE, RECALIBRATE_RADAR, OVERRIDE_DEFCON, DUMP_BUFFER`;
    } else if (cmd === 'STATUS') {
      response = `[${time} UTC] SYSTEM: ALL 11 PLANETARY HAZARD MATRICES ONLINE. TELEMETRY HEALTH: 99.8%`;
    } else if (cmd === 'PURGE_CACHE') {
      response = `[${time} UTC] BUFFER_PURGED: Local sensor buffer flushed and resynchronized.`;
    }

    setCommandLogs((prev) => [...prev, `> ${commandInput}`, response]);
    setCommandInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#131313] border border-[#00F2FF] w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_0_30px_rgba(0,242,255,0.2)]">
        {/* Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2C2E33] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">badge</span>
            <h2 className="font-headline font-bold text-[18px] uppercase tracking-wider text-[#e2e2e2]">
              OPERATOR CLEARANCE & AUDIT LOG
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] text-[#cfc4c5] hover:text-[#00F2FF] border border-[#2C2E33]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 font-mono">
          {/* Operator Profile Header Card */}
          <div className="bg-[#0e0e0e] border border-[#2C2E33] p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2a2a2a] border border-[#00F2FF] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00F2FF] text-[28px]">
                  security
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#e2e2e2]">{operatorId}</span>
                <span className="text-[11px] text-[#00F2FF]">{operatorClearance}</span>
                <span className="text-[10px] text-[#757575]">FACILITY: NORAD PLANETARY DEFENSE BUNKER 7</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#757575] block">AUTH STATUS</span>
              <span className="text-[11px] font-bold text-[#39FF14]">SECURE_ENCRYPTED</span>
            </div>
          </div>

          {/* Command Terminal & Audit Logs */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-[#cfc4c5] tracking-wider">
              REAL-TIME OPERATOR TERMINAL & AUDIT LOGS
            </span>

            <div className="h-48 bg-[#000000] border border-[#2C2E33] p-3 overflow-y-auto space-y-1 text-[11px] text-[#cfc4c5]">
              {commandLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('>') ? 'text-[#00F2FF]' : ''}>
                  {log}
                </div>
              ))}
            </div>

            <form onSubmit={handleRunCommand} className="flex gap-2 mt-1">
              <span className="p-2 bg-[#1b1b1b] border border-[#2C2E33] text-[#00F2FF] text-[12px]">
                &gt;
              </span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="ENTER COMMAND (e.g. HELP, STATUS, PURGE_CACHE)..."
                className="flex-1 bg-[#0e0e0e] border border-[#2C2E33] px-3 py-2 text-[11px] text-[#e2e2e2] placeholder-[#757575] focus:border-[#00F2FF] outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#00F2FF] text-black font-bold text-[11px] hover:bg-white transition-colors"
              >
                EXECUTE
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2C2E33] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#1b1b1b] text-[#e2e2e2] border border-[#2C2E33] hover:border-[#00F2FF] font-mono font-bold text-[11px] transition-colors"
          >
            DISMISS CONSOLE
          </button>
        </div>
      </div>
    </div>
  );
};
