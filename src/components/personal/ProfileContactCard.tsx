import * as React from "react";
import { Mail, Phone } from "lucide-react";

interface ProfileContactCardProps {
  email?: string;
  phone?: string;
}

export function ProfileContactCard({ email, phone }: ProfileContactCardProps) {
  return (
    <div
      className="relative rounded-2xl border border-white/[0.04] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] md:p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5f6b82]">
          Contact
        </span>
        <div className="h-px flex-1 bg-white/[0.04]" />
      </div>

      <div className="space-y-3">
        <Item icon={<Mail className="h-3.5 w-3.5" />} label={email || "—"} />
        <Item icon={<Phone className="h-3.5 w-3.5" />} label={phone || "—"} />
      </div>
    </div>
  );
}

function Item({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5 text-[#d7dde5]">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00dfa2]/[0.08] text-[#00dfa2]">
        {icon}
      </span>
      <span className="flex-1 truncate text-xs font-semibold text-[#d7dde5]">
        {label}
      </span>
      <span className="rounded-full bg-[#00dfa2]/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#00dfa2]">
        Primary
      </span>
    </div>
  );
}
