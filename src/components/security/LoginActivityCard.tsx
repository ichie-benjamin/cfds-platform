import { History, Clock } from "lucide-react";

export function LoginActivityCard() {
  return (
    <section
      className="relative mb-[18px] overflow-hidden rounded-2xl border border-white/[0.06] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
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

      {/* sec-hd */}
      <div className="relative z-10 mb-[18px] flex items-center gap-2.5 border-b border-white/[0.06] pb-[14px]">
        <History className="h-[0.85rem] w-[0.85rem] shrink-0 text-[#00dfa2]" />
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          Login Activity Log
        </h3>
      </div>

      {/* .log-hdr */}
      <div
        className="relative z-10 mb-1.5 grid items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.6rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]"
        style={{
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr 0.8fr",
          background: "rgba(255,255,255,0.035)",
        }}
      >
        <span>Date</span>
        <span>IP Address</span>
        <span>Location</span>
        <span>Device</span>
        <span>Status</span>
      </div>

      {/* .empty */}
      <div className="relative z-10 px-4 py-8 text-center">
        <div
          className="mx-auto mb-3.5 grid h-12 w-12 place-items-center rounded-[12px] border border-white/[0.06]"
          style={{
            background: "rgba(255,255,255,0.035)",
            color: "#3a4556",
          }}
        >
          <Clock className="h-[1.1rem] w-[1.1rem]" />
        </div>
        <div className="mb-[3px] text-[0.85rem] font-semibold text-[#8b97a8]">
          No login activity
        </div>
        <div className="text-[0.7rem] text-[#4a5468]">
          Your recent login history will appear here
        </div>
      </div>
    </section>
  );
}
