import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export function HelpSupportCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
        border: "1px solid rgba(0,223,162,0.08)",
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

      <div className="relative z-10 mb-3.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#8b97a8]">
        Need Help?
      </div>

      <p className="relative z-10 mb-3 text-[0.72rem] leading-[1.5] text-[#4a5468]">
        Our support team can help with account configuration and troubleshooting.
      </p>

      <Link
        to="/main/chat"
        className="relative z-10 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-[9px] text-[0.76rem] font-bold text-[#07080c] transition-all hover:shadow-[0_4px_16px_rgba(0,223,162,0.25)]"
        style={{
          background: "linear-gradient(135deg,#00dfa2,#00b881)",
        }}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Contact Support
      </Link>
    </div>
  );
}
