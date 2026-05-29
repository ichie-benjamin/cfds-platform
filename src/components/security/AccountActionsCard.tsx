import { Zap, Snowflake, Ban, Download } from "lucide-react";

type Tone = "warn" | "danger" | "accent";

const TONE: Record<Tone, { color: string; border: string; hoverBg: string }> = {
  warn: {
    color: "#FF9800",
    border: "rgba(255, 152, 0, 0.2)",
    hoverBg: "rgba(255, 152, 0, 0.06)",
  },
  danger: {
    color: "#f43f5e",
    border: "rgba(244, 63, 94, 0.2)",
    hoverBg: "rgba(244, 63, 94, 0.08)",
  },
  accent: {
    color: "#00dfa2",
    border: "rgba(0, 223, 162, 0.2)",
    hoverBg: "rgba(0, 223, 162, 0.08)",
  },
};

interface ArowProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tone: Tone;
  title: string;
  description: string;
  buttonLabel: string;
  buttonIcon?: React.ComponentType<{ className?: string }>;
}

function Arow({
  icon: Icon,
  tone,
  title,
  description,
  buttonLabel,
  buttonIcon: BIcon,
}: ArowProps) {
  const t = TONE[tone];
  return (
    <div
      className="flex items-center justify-between gap-[14px] border-b border-white/[0.06] py-4 last:border-b-0"
    >
      <div className="flex flex-1 items-center gap-3">
        <Icon
          className="h-[0.78rem] w-[0.78rem] shrink-0"
          style={{ color: t.color }}
        />
        <div className="min-w-0">
          <h4 className="mb-[1px] text-[0.85rem] font-semibold text-[#eef2f7]">
            {title}
          </h4>
          <p className="text-[0.68rem] text-[#4a5468]">{description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled
        className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-lg border bg-transparent px-[18px] py-2 text-[0.74rem] font-semibold opacity-60"
        style={{
          borderColor: t.border,
          color: t.color,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = t.hoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
        }}
      >
        {BIcon && <BIcon className="h-3 w-3" />}
        {buttonLabel}
      </button>
    </div>
  );
}

export function AccountActionsCard() {
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
        <Zap className="h-[0.85rem] w-[0.85rem] shrink-0 text-[#00dfa2]" />
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          Account Actions
        </h3>
      </div>

      <div className="relative z-10">
        <Arow
          icon={Snowflake}
          tone="warn"
          title="Freeze Account"
          description="Temporarily disable all trading and withdrawals"
          buttonLabel="Freeze"
        />
        <Arow
          icon={Ban}
          tone="danger"
          title="Disable Account"
          description="Permanently disable your 1 Trade Market account"
          buttonLabel="Disable"
        />
        <Arow
          icon={Download}
          tone="accent"
          title="Export Account Data"
          description="Download all your account information and history"
          buttonLabel="Export"
          buttonIcon={Download}
        />
      </div>
    </section>
  );
}
