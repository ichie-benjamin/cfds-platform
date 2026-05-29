import { Mail, Phone } from "lucide-react";

interface ProfileContactCardProps {
  email?: string;
  phone?: string;
}

export function ProfileContactCard({ email, phone }: ProfileContactCardProps) {
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
        Contact
      </div>

      <div className="relative z-10">
        <CtRow icon={<Mail className="h-3 w-3" />} value={email || "—"} />
        <CtRow icon={<Phone className="h-3 w-3" />} value={phone || "—"} />
      </div>
    </div>
  );
}

function CtRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-white/[0.06] py-2.5 last:border-0">
      <span className="grid h-4 w-4 place-items-center text-[#3a4556]">
        {icon}
      </span>
      <span className="flex-1 truncate text-[0.76rem] font-medium text-[#eef2f7]">
        {value}
      </span>
      <span className="rounded-md bg-[#00dfa2]/[0.08] px-1.5 py-px text-[0.5rem] font-bold uppercase tracking-[0.04em] text-[#00dfa2]">
        Primary
      </span>
    </div>
  );
}
