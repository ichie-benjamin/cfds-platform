import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  LayoutGrid,
} from "lucide-react";

const LINKS = [
  { to: "/main/wallet?tab=deposit", icon: ArrowDownCircle, label: "Deposit Funds" },
  { to: "/main/withdrawal", icon: ArrowUpCircle, label: "Withdraw Funds" },
  { to: "/main/accounts", icon: LayoutGrid, label: "Accounts" },
  { to: "/main/wallet", icon: Wallet, label: "Wallet" },
];

export function DepositQuickLinksCard() {
  return (
    <div
      className="rounded-[12px] border border-[rgba(255,255,255,0.05)] p-5 md:p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[#eef2f7]">
          Quick Links
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>

      <div className="space-y-2">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-[#8b97a8] transition-all duration-150 hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#eef2f7]"
          >
            <span className="text-[#4a5468] transition-colors group-hover:text-[#00dfa2]">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-[0.78rem] font-semibold">{label}</span>
            <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}
