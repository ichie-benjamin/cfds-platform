const DOCS = [
  "Valid passport or driver's license",
  "Proof of address (utility bill, less than 3 months old)",
];

export function RequiredDocumentsCard() {
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
        Required Documents
      </div>

      <div className="relative z-10">
        {DOCS.map((doc, i) => (
          <div
            key={i}
            className="flex gap-[9px] border-b py-[7px] last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.02)" }}
          >
            <span
              className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-[#00dfa2]"
              style={{ boxShadow: "0 0 6px rgba(0,223,162,0.2)" }}
            />
            <span className="text-[0.71rem] leading-[1.5] text-[#4a5468]">
              {doc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
