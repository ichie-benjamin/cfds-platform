import { Link } from "react-router-dom";
import {
  ShieldCheck,
  IdCard,
  Sliders,
  MessageSquare,
} from "lucide-react";

const LINKS = [
  { to: "/main/security", icon: ShieldCheck, label: "Security Settings" },
  { to: "/main/kyc", icon: IdCard, label: "KYC Verification" },
  { to: "/main/settings", icon: Sliders, label: "Preferences" },
  { to: "/main/chat", icon: MessageSquare, label: "Contact Support" },
];

export function ProfileQuickLinksCard() {
  return (
    <div className="px-1">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5f6b82]">
          Quick Actions
        </span>
        <div className="h-px flex-1 bg-white/[0.04]" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="group flex items-center gap-2.5 rounded-xl bg-white/[0.015] px-3 py-2.5 transition-all hover:bg-[#00dfa2]/[0.05]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#00dfa2]/[0.08] text-[#00dfa2] transition-colors group-hover:bg-[#00dfa2]/[0.16]">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="truncate text-[11px] font-semibold leading-tight text-[#8b97a8] transition-colors group-hover:text-[#eef2f7]">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
