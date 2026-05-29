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
  const isVerified =
    verificationStatus === "verified" || verificationStatus === "approved";

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
        Identity
      </div>

      <div className="relative z-10">
        <Row label="Account ID" value={accountId || "—"} mono />
        <Row
          label="Plan"
          value={(planTitle || "Basic").toUpperCase()}
          tone="ok"
          mono
        />
        <Row
          label="Verification"
          value={isVerified ? "Verified" : "Incomplete"}
          tone={isVerified ? "ok" : "warn"}
          mono
        />
        <Row label="Country" value={country || "—"} mono />
        <Row label="Phone" value={phone || "—"} mono />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
  mono?: boolean;
}) {
  const valueColor =
    tone === "ok" ? "#00dfa2" : tone === "warn" ? "#FF9800" : "#eef2f7";
  return (
    <div
      className="flex items-center justify-between gap-3 border-b py-2 last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.025)" }}
    >
      <span className="text-[0.76rem] font-medium text-[#4a5468]">{label}</span>
      <span
        className={`truncate text-[0.72rem] font-semibold capitalize ${
          mono ? "font-[JetBrains_Mono,monospace]" : ""
        }`}
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}
