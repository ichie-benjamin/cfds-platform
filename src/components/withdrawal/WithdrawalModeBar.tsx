import { Sliders, User, Sprout } from "lucide-react";

interface WithdrawalModeBarProps {
  clientMode: "fresh" | "staked";
  onModeChange: (mode: "fresh" | "staked") => void;
}

export function WithdrawalModeBar({ clientMode, onModeChange }: WithdrawalModeBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#5f6b7f]">
        <Sliders className="h-3.5 w-3.5 text-[#FF9800]" />
        Select Your Withdrawal Type
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border-[1.5px] border-[#FF9800]/30 bg-gradient-to-br from-[#3DDBA9]/[0.04] to-[#FF9800]/[0.04] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <div
            className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
            style={{
              background: clientMode === "fresh" ? "#3DDBA9" : "#FF9800",
              boxShadow: `0 0 8px ${clientMode === "fresh" ? "#3DDBA9" : "#FF9800"}`,
            }}
          />
          <div>
            <div className="text-sm font-bold text-white">
              {clientMode === "fresh"
                ? "New Account — No Staked Funds"
                : "Staked Account — Active Positions"}
            </div>
            <div className="text-xs text-[#4a5468]">
              {clientMode === "fresh"
                ? "Standard crypto withdrawal available. No hold period or fees apply."
                : "Early exit penalties may apply. Review terms below."}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[11px] text-[#5f6b7f]">Which best describes you?</span>
          <div className="inline-flex rounded-lg border border-white/[0.06] bg-[#131a28] p-1">
            <button
              type="button"
              onClick={() => onModeChange("fresh")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                clientMode === "fresh"
                  ? "bg-[#3DDBA9] text-[#07080c] shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-[#4a5468]"
              }`}
            >
              <User className="h-3 w-3" />
              New / No Stakes
            </button>
            <button
              type="button"
              onClick={() => onModeChange("staked")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                clientMode === "staked"
                  ? "bg-[#FF9800] text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-[#4a5468]"
              }`}
            >
              <Sprout className="h-3 w-3" />
              Has Staked Funds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
