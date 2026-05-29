import { Link } from "react-router-dom";
import { ArrowRight, Crown } from "lucide-react";

interface TradingPlanCardProps {
  planTitle?: string;
  leverage?: number;
  image?: string;
  color?: string;
}

export function TradingPlanCard({
  planTitle,
  leverage,
  image,
  color,
}: TradingPlanCardProps) {
  const accent = color || "#00dfa2";
  const planName = planTitle || "Basic";
  const initial = planName.charAt(0).toUpperCase();

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.03),transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-3.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
          Trading Plan
        </div>

        <div className="mb-1 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border font-[Outfit,sans-serif] text-[1.1rem] font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,223,162,0.1), rgba(0,223,162,0.06))",
              borderColor: "rgba(0,223,162,0.15)",
              color: accent,
            }}
          >
            {image ? (
              <img
                src={image}
                alt={planName}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
        </div>

        <div className="mt-3 font-[Outfit,sans-serif] text-[1rem] font-extrabold uppercase tracking-[0.04em] text-[#eef2f7]">
          {planName}
        </div>
        <div className="mb-3.5 text-[0.72rem] text-[#4a5468]">
          Current account plan
        </div>

        <div className="flex flex-col">
          <PlanRow label="Plan" value={planName.toUpperCase()} />
          <PlanRow
            label="Leverage"
            value={leverage ? `1:${leverage}` : "1:1"}
            accentColor={accent}
          />
        </div>

        <Link
          to="/main/marketplace"
          className="group mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all"
          style={{
            borderColor: "rgba(0,223,162,0.2)",
            background: "rgba(0,223,162,0.06)",
            color: "#00dfa2",
          }}
        >
          <Crown className="h-3.5 w-3.5" />
          <span className="flex-1 text-[0.76rem] font-bold">Upgrade Plan</span>
          <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
        </Link>
      </div>
    </div>
  );
}

function PlanRow({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between border-t py-2.5"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
        {label}
      </span>
      <span
        className="font-[JetBrains_Mono,monospace] text-[0.82rem] font-bold"
        style={{ color: accentColor || "#eef2f7" }}
      >
        {value}
      </span>
    </div>
  );
}
