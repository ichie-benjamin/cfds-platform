import { User as UserIcon } from "lucide-react";

interface AccountSnapshotCardProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string | null;
  accountId?: string;
  planTitle?: string;
  verificationStatus?: string;
}

export function AccountSnapshotCard({
  firstName,
  lastName,
  email,
  avatar,
  accountId,
  planTitle,
  verificationStatus,
}: AccountSnapshotCardProps) {
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "user account";
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "UA";
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
        Account Snapshot
      </div>

      {/* Avatar + identity header */}
      <div className="relative z-10 mb-3.5 flex items-center gap-3 border-b border-white/[0.06] pb-3">
        <div
          className="grid h-[38px] w-[38px] shrink-0 place-items-center overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(135deg,rgba(0,223,162,0.18),rgba(0,223,162,0.08))",
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : firstName || lastName ? (
            <span className="font-[Outfit,sans-serif] text-[0.8rem] font-black text-[#00dfa2]">
              {initials}
            </span>
          ) : (
            <UserIcon className="h-4 w-4 text-[#00dfa2]" />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[0.82rem] font-bold text-[#eef2f7]">
            {fullName}
          </div>
          <div className="truncate text-[0.66rem] text-[#4a5468]">
            {email || "—"}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Row label="Account ID" value={accountId || "—"} mono />
        <Row label="Plan" value={(planTitle || "Basic").toUpperCase()} tone="ok" mono />
        <Row
          label="Verification"
          value={isVerified ? "Verified" : "Incomplete"}
          tone={isVerified ? "ok" : "warn"}
          mono
        />
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
        className={`truncate text-[0.72rem] font-semibold ${
          mono ? "font-[JetBrains_Mono,monospace]" : ""
        }`}
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}
