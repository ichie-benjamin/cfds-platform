import { PieChart, History, CalendarCheck } from "lucide-react";

interface AccountOverviewCardProps {
  accountStatus?: string;
  verificationStatus?: string;
  planTitle?: string;
}

export function AccountOverviewCard({
  accountStatus,
  verificationStatus,
  planTitle,
}: AccountOverviewCardProps) {
  const isActive = (accountStatus || "active").toLowerCase() === "active";
  const isVerified =
    verificationStatus === "verified" || verificationStatus === "approved";

  return (
    <section
      className="relative mb-[18px] overflow-hidden rounded-2xl border border-white/[0.06] p-6"
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

      <div className="relative z-10 mb-[18px] flex items-center gap-2.5 border-b border-white/[0.06] pb-[14px]">
        <PieChart className="h-3.5 w-3.5 text-[#00dfa2]" />
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          Account Overview
        </h3>
        <span
          className={`rounded-full px-2.5 py-[3px] text-[0.55rem] font-bold uppercase tracking-[0.04em] ${
            isActive
              ? "bg-[#00dfa2]/[0.08] text-[#00dfa2]"
              : "bg-[#FF9800]/[0.08] text-[#FF9800]"
          }`}
        >
          {isActive ? "Active" : accountStatus || "—"}
        </span>
      </div>

      <div className="relative z-10 mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label="Account Status"
          value={isActive ? "Active" : accountStatus || "—"}
          valueClass={isActive ? "text-[#00dfa2]" : "text-[#FF9800]"}
          sub={planTitle ? `Plan · ${planTitle}` : undefined}
        />
        <StatTile
          label="Security Level"
          value="Basic"
          valueClass="text-[#FF9800]"
          sub="Enable 2FA to upgrade"
        />
        <StatTile
          label="KYC Status"
          value={isVerified ? "Verified" : "Pending"}
          valueClass={isVerified ? "text-[#00dfa2]" : "text-[#FF9800]"}
          sub={isVerified ? "All set" : "Action required"}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoItem
          icon={<History className="h-3.5 w-3.5 text-[#00dfa2]" />}
          title="Last Login"
          desc="Today · This session"
        />
        <InfoItem
          icon={<CalendarCheck className="h-3.5 w-3.5 text-[#00dfa2]" />}
          title="Account Plan"
          desc={planTitle ? `${planTitle}` : "Standard"}
        />
      </div>
    </section>
  );
}

function StatTile({
  label,
  value,
  valueClass,
  sub,
}: {
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-4 text-center transition-colors hover:border-white/[0.12]">
      <div className="mb-[5px] text-[0.58rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
        {label}
      </div>
      <div
        className={`font-[Outfit,sans-serif] text-[0.92rem] font-extrabold ${
          valueClass ?? "text-[#eef2f7]"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-[2px] text-[0.58rem] text-[#3a4556]">{sub}</div>
      )}
    </div>
  );
}

function InfoItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.035] px-4 py-3.5 transition-colors hover:border-white/[0.12]">
      <span className="grid h-4 w-4 place-items-center">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[0.8rem] font-semibold text-[#eef2f7]">
          {title}
        </div>
        <div className="truncate text-[0.62rem] text-[#4a5468]">{desc}</div>
      </div>
    </div>
  );
}
