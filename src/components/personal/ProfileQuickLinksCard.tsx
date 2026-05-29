import { Link } from "react-router-dom";
import {
  ShieldCheck,
  IdCard,
  Sliders,
  MessageSquare,
} from "lucide-react";

const LINKS = [
  { to: "/main/security", icon: ShieldCheck, label: "Security" },
  { to: "/main/kyc", icon: IdCard, label: "KYC" },
  { to: "/main/settings", icon: Sliders, label: "Prefs" },
  { to: "/main/chat", icon: MessageSquare, label: "Support" },
];

export function ProfileQuickLinksCard() {
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
        Quick Actions
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-1.5">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-[7px] rounded-lg border border-white/[0.06] bg-white/[0.035] px-2.5 py-[9px] text-[0.68rem] font-semibold text-[#4a5468] transition-colors hover:border-[#00dfa2]/[0.12] hover:bg-[#00dfa2]/[0.08] hover:text-[#00dfa2]"
          >
            <Icon className="h-[0.7rem] w-[0.7rem] text-[#3a4556] transition-colors group-hover:text-[#00dfa2]" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
