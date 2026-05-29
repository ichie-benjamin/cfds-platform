import { Link } from "react-router-dom";
import {
  UserCircle,
  ShieldCheck,
  IdCard,
  ArrowDownToLine,
} from "lucide-react";

const LINKS = [
  { to: "/main/personal", icon: UserCircle, label: "Personal Information" },
  { to: "/main/security", icon: ShieldCheck, label: "Security Settings" },
  { to: "/main/kyc", icon: IdCard, label: "KYC Verification" },
  { to: "/main/withdrawal", icon: ArrowDownToLine, label: "Withdraw Funds" },
];

export function SettingsQuickLinksCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />

      <div className="relative z-10 mb-3.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
        Quick Links
      </div>

      <div className="relative z-10">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="group mb-px flex items-center gap-2.5 rounded-lg px-3 py-[9px] text-[0.78rem] font-medium text-[#4a5468] transition-colors hover:bg-white/[0.06] hover:text-[#00dfa2]"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#3a4556] transition-colors group-hover:text-[#00dfa2]" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
