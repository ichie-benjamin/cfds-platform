import { History, ShieldCheck, Zap, Clock } from "lucide-react";

interface DepositHistoryHeroCardProps {
  firstName?: string;
}

export function DepositHistoryHeroCard({ firstName }: DepositHistoryHeroCardProps) {
  return (
    <div
      className="rounded-[12px] border border-[rgba(255,255,255,0.05)] p-5 md:p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))",
      }}
    >
      <div className="flex flex-col gap-5">
        {/* Identity / intro */}
        <div className="flex items-center gap-4">
          <div
            className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,223,162,0.18) 0%, rgba(0,223,162,0.02) 60%, transparent 80%)",
            }}
          >
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#0a0d15]">
              <History className="h-[1.1rem] w-[1.1rem] text-[#00dfa2]" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-[Outfit,sans-serif] text-[0.95rem] font-extrabold tracking-[-0.01em] text-[#eef2f7]">
              {firstName ? `${firstName}'s deposits` : "Deposit history"}
            </h2>
            <p className="mt-0.5 truncate text-[0.72rem] text-[#8b97a8]">
              Track every deposit you&apos;ve made across your trading accounts
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#00dfa2]/20 bg-[#00dfa2]/[0.08] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.06em] text-[#00dfa2]">
              <ShieldCheck className="h-3 w-3" />
              Secure ledger
            </span>
          </div>
        </div>

        {/* Service info tiles (static, no data dependency) */}
        <div className="grid grid-cols-3 gap-2">
          <InfoTile icon={Zap} label="Processing" value="Instant" accent />
          <InfoTile icon={Clock} label="Window" value="24/7" />
          <InfoTile icon={ShieldCheck} label="Transport" value="SSL" />
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-2 py-3 text-center">
      <Icon
        className={`h-3.5 w-3.5 ${accent ? "text-[#00dfa2]" : "text-[#4a5468]"}`}
      />
      <span
        className={`font-mono text-[0.78rem] font-extrabold ${
          accent ? "text-[#00dfa2]" : "text-[#eef2f7]"
        }`}
      >
        {value}
      </span>
      <span className="text-[0.55rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
        {label}
      </span>
    </div>
  );
}
