const TIPS = [
  "Keep your contact info up to date so you never miss security alerts.",
  "Your legal name must match your KYC documents exactly.",
  "Update your address whenever you move to keep statements accurate.",
];

export function ProfileTipsCard() {
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
        Profile Tips
      </div>

      <div className="relative z-10">
        {TIPS.map((tip, i) => (
          <div
            key={i}
            className="flex gap-2.5 border-b py-[7px] last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.02)" }}
          >
            <span
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#00dfa2]"
              style={{ boxShadow: "0 0 6px rgba(0,223,162,0.2)" }}
            />
            <span className="text-[0.71rem] leading-[1.5] text-[#4a5468]">
              {tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
