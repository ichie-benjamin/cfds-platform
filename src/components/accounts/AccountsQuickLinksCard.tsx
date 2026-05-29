import { Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowDown,
  ArrowUp,
  History,
  PieChart,
} from "lucide-react";

const LINKS = [
  { to: "/main/wallet?tab=deposit", icon: ArrowDown, label: "Deposit Funds" },
  { to: "/main/withdrawal", icon: ArrowUp, label: "Withdraw Funds" },
  { to: "/main/deposit-history", icon: History, label: "Deposit History" },
  { to: "/main/savings", icon: PieChart, label: "Earning" },
];

export function AccountsQuickLinksCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.03),transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-3.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
          Quick Links
        </div>

        <div className="flex flex-col gap-1">
          {LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[0.82rem] font-medium text-[#8b97a8] transition-all hover:bg-white/[0.04] hover:text-[#eef2f7]"
            >
              <span className="grid w-4 place-items-center text-[0.78rem] text-[#00dfa2]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1">{label}</span>
              <ChevronRight className="h-[0.68rem] w-[0.68rem] text-[#4a5468] transition-all group-hover:translate-x-[3px] group-hover:text-[#eef2f7]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
