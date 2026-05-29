import { Zap, Snowflake, Ban, Download } from "lucide-react";

interface ActionRowProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tone: "warn" | "danger" | "accent";
  title: string;
  description: string;
  buttonLabel: string;
}

function ActionRow({
  icon: Icon,
  tone,
  title,
  description,
  buttonLabel,
}: ActionRowProps) {
  const toneColor =
    tone === "warn" ? "#FF9800" : tone === "danger" ? "#f43f5e" : "#00dfa2";
  const toneBg =
    tone === "warn"
      ? "rgba(255,152,0,0.08)"
      : tone === "danger"
        ? "rgba(244,63,94,0.08)"
        : "rgba(0,223,162,0.08)";

  return (
    <div
      className="flex items-center justify-between gap-3.5 border-b py-4 last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex flex-1 items-start gap-3">
        <Icon
          className="h-[0.78rem] w-[0.78rem] shrink-0 translate-y-[3px]"
          style={{ color: toneColor }}
        />
        <div className="min-w-0">
          <h4 className="text-[0.85rem] font-semibold text-[#eef2f7]">
            {title}
          </h4>
          <p className="text-[0.68rem] text-[#4a5468]">{description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled
        className="shrink-0 cursor-not-allowed whitespace-nowrap rounded-lg border px-[18px] py-[8px] text-[0.74rem] font-semibold transition-colors"
        style={{
          borderColor: toneColor + "33", // alpha 0.2
          color: toneColor,
          background: toneBg,
          opacity: 0.55,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export function AccountActionsCard() {
  return (
    <section
      className="relative mb-[18px] overflow-hidden rounded-2xl border border-white/[0.06] p-6"
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

      <div className="relative z-10 mb-[18px] flex items-center gap-2.5 border-b border-white/[0.06] pb-[14px]">
        <Zap className="h-3.5 w-3.5 text-[#00dfa2]" />
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          Account Actions
        </h3>
      </div>

      <div className="relative z-10">
        <ActionRow
          icon={Snowflake}
          tone="warn"
          title="Freeze Account"
          description="Temporarily disable all trading and withdrawals"
          buttonLabel="Freeze"
        />
        <ActionRow
          icon={Ban}
          tone="danger"
          title="Disable Account"
          description="Permanently disable your trading account"
          buttonLabel="Disable"
        />
        <ActionRow
          icon={Download}
          tone="accent"
          title="Export Account Data"
          description="Download all your account information and history"
          buttonLabel="Export"
        />
      </div>
    </section>
  );
}
