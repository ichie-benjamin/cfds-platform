import { Lightbulb } from "lucide-react";

const TIPS = [
  "Keep your contact details up to date so you never miss security alerts.",
  "Use a clear profile photo — it helps support verify you faster.",
  "Your legal name and date of birth must match your KYC documents.",
  "Update your address whenever you move to keep statements accurate.",
];

export function ProfileTipsCard() {
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
          Profile Tips
        </span>
        <div className="h-px flex-1 bg-white/[0.04]" />
        <Lightbulb className="h-3.5 w-3.5 text-[#FF9800]/80" />
      </div>

      <ul className="space-y-2.5">
        {TIPS.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00dfa2]/60" />
            <span className="text-[11px] leading-relaxed text-[#8b97a8]">
              {tip}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
