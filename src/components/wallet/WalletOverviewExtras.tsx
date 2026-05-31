import { Zap, ChartLine, ChartBar } from "lucide-react";

const STRENGTH_PCT = 72;

const STRENGTH_STATS = [
  { label: "Win Rate", value: "68%", color: "var(--accent)" },
  { label: "Avg Trade", value: "$482", color: "var(--t1)" },
  { label: "Trades", value: "142", color: "var(--t1)" },
  { label: "Streak", value: "+5", color: "var(--accent)" },
];

export function WalletOverviewExtras() {
  return (
    <>
      {/* Trading Strength */}
      <div className="scard">
        <div className="scard-title">
          <Zap className="h-[0.85rem] w-[0.85rem]" style={{ color: "var(--accent)" }} />
          Trading Strength
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
            position: "relative",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 8,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${STRENGTH_PCT}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg,var(--accent),var(--accent-light))",
                borderRadius: 4,
                transition: "width .8s",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: ".78rem",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {STRENGTH_PCT}%
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            position: "relative",
          }}
        >
          {STRENGTH_STATS.map((s) => (
            <div
              key={s.label}
              style={{
                textAlign: "center",
                padding: 6,
                background: "rgba(255,255,255,.03)",
                borderRadius: 6,
              }}
            >
              <div
                style={{
                  fontSize: ".55rem",
                  fontWeight: 700,
                  color: "var(--t3)",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "var(--mono)",
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Realised / Unrealised P&L */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div className="scard" style={{ marginBottom: 0 }}>
          <div className="scard-title">
            <ChartLine
              className="h-[0.85rem] w-[0.85rem]"
              style={{ color: "var(--accent)" }}
            />
            Realised P&amp;L
          </div>
          <div
            style={{
              position: "relative",
              fontFamily: "var(--mono)",
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            +$342.18
          </div>
          <div
            style={{
              position: "relative",
              fontSize: ".7rem",
              color: "var(--t3)",
              marginTop: 3,
            }}
          >
            This month
          </div>
        </div>
        <div className="scard" style={{ marginBottom: 0 }}>
          <div className="scard-title">
            <ChartBar
              className="h-[0.85rem] w-[0.85rem]"
              style={{ color: "var(--accent)" }}
            />
            Unrealised P&amp;L
          </div>
          <div
            style={{
              position: "relative",
              fontFamily: "var(--mono)",
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--accent)",
            }}
          >
            +$1,204.30
          </div>
          <div
            style={{
              position: "relative",
              fontSize: ".7rem",
              color: "var(--t3)",
              marginTop: 3,
            }}
          >
            Open positions
          </div>
        </div>
      </div>
    </>
  );
}
