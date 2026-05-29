interface VerificationStatusCardProps {
  verificationStatus?: string;
}

interface ScRowProps {
  label: string;
  value: string;
  tone?: "default" | "ok" | "warn";
}

function ScRow({ label, value, tone = "default" }: ScRowProps) {
  const valueColor =
    tone === "ok" ? "#00dfa2" : tone === "warn" ? "#FF9800" : "#eef2f7";
  return (
    <div
      className="flex items-center justify-between border-b py-2 text-[0.76rem] last:border-b-0"
      style={{ borderColor: "rgba(255,255,255,0.025)" }}
    >
      <span className="font-medium text-[#4a5468]">{label}</span>
      <span
        className="font-[JetBrains_Mono,monospace] text-[0.72rem] font-semibold"
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}

export function VerificationStatusCard({
  verificationStatus,
}: VerificationStatusCardProps) {
  const isVerified =
    verificationStatus === "verified" || verificationStatus === "approved";
  const level = isVerified ? "Level 2 · Verified" : "Level 1 · Basic";
  const progressPercent = isVerified ? 100 : 50;
  const dailyLimit = isVerified ? "$10,000" : "$2,000";
  const monthlyLimit = isVerified ? "$50,000" : "$10,000";

  return (
    <div
      className="relative mb-3.5 overflow-hidden rounded-2xl border border-white/[0.06] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />

      <div className="relative z-10 mb-3.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
        Verification Status
      </div>

      <div className="relative z-10">
        <ScRow label="Level" value={level} tone={isVerified ? "ok" : "default"} />

        {/* .prg */}
        <div className="mb-4 mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[0.7rem]">
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[#4a5468]">
              Progress
            </span>
            <span className="font-[JetBrains_Mono,monospace] font-bold text-[#00dfa2]">
              {progressPercent}%
            </span>
          </div>
          <div
            className="h-[6px] overflow-hidden rounded-[3px]"
            style={{ background: "rgba(255,255,255,0.035)" }}
          >
            <div
              className="h-full rounded-[3px]"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #00dfa2, #00ffc3)",
              }}
            />
          </div>
        </div>

        <ScRow label="Daily Limit" value={dailyLimit} />
        <ScRow label="Monthly Limit" value={monthlyLimit} />
      </div>
    </div>
  );
}
