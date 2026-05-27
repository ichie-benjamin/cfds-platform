interface ProfileIdentityCardProps {
  accountId?: string;
  planTitle?: string;
  verificationStatus?: string;
  country?: string | null;
  phone?: string;
}

export function ProfileIdentityCard({
  accountId,
  planTitle,
  verificationStatus,
  country,
  phone,
}: ProfileIdentityCardProps) {
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
          Identity
        </span>
        <div className="h-px flex-1 bg-white/[0.04]" />
      </div>

      <div className="space-y-3">
        <Row label="Account ID" value={accountId || "—"} />
        <Row label="Plan" value={planTitle || "Basic"} />
        <Row
          label="Verification"
          value={verificationStatus || "—"}
          highlight={verificationStatus === "verified" ? "#00dfa2" : "#FF9800"}
        />
        <Row label="Country" value={country || "—"} />
        <Row label="Phone" value={phone || "—"} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.04] py-2 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8b97a8]">
        {label}
      </span>
      <span
        className="truncate text-xs font-bold capitalize"
        style={{ color: highlight || "#d7dde5" }}
      >
        {value}
      </span>
    </div>
  );
}
