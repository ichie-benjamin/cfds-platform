import { CheckCircle2, Clock3, XCircle, Info } from "lucide-react";

const ROWS = [
  {
    key: "approved",
    icon: CheckCircle2,
    label: "Approved",
    chipClass: "bg-green-500/20 text-green-400",
    description: "Funds have been credited to your trading account.",
  },
  {
    key: "pending",
    icon: Clock3,
    label: "Pending",
    chipClass: "bg-yellow-500/20 text-yellow-400",
    description: "Awaiting confirmation. This usually takes a few minutes.",
  },
  {
    key: "rejected",
    icon: XCircle,
    label: "Rejected",
    chipClass: "bg-red-500/20 text-red-400",
    description: "The deposit could not be processed. Contact support if unsure.",
  },
] as const;

export function DepositStatusLegendCard() {
  return (
    <div
      className="rounded-[12px] border border-[rgba(255,255,255,0.05)] p-5 md:p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-[#00dfa2]" />
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[#eef2f7]">
          Status Guide
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>

      <ul className="space-y-2.5">
        {ROWS.map(({ key, icon: Icon, label, chipClass, description }) => (
          <li
            key={key}
            className="flex items-start gap-3 rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-3"
          >
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4a5468]" />
            <div className="min-w-0 flex-1">
              <span
                className={`inline-block rounded px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.06em] ${chipClass}`}
              >
                {label}
              </span>
              <p className="mt-1.5 text-[0.72rem] leading-snug text-[#8b97a8]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
