import { Clock, CheckCircle, ShieldCheck } from "lucide-react";

const steps = [
  {
    num: "1",
    title: "Request Submitted",
    desc: "Your withdrawal is queued for admin review.",
    time: "Immediate",
    icon: <Clock className="h-3 w-3" />,
  },
  {
    num: "2",
    title: "Admin Approval",
    desc: "Team verifies destination address and amount.",
    time: "Within 2–4 hours",
    icon: <ShieldCheck className="h-3 w-3" />,
  },
  {
    num: "3",
    title: "Crypto Sent",
    desc: "Funds dispatched to your wallet address.",
    time: "Within 24 hours",
    icon: <CheckCircle className="h-3 w-3" />,
  },
];

export function ProcessingTimeline() {
  return (
    <div className="scard">
      <div className="scard-title">
        <Clock
          className="h-[0.85rem] w-[0.85rem]"
          style={{ color: "var(--accent)" }}
        />
        Processing Timeline
      </div>
      <div style={{ position: "relative" }}>
        {steps.map((step) => (
          <div
            key={step.num}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                height: 28,
                width: 28,
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9999px",
                background: "rgba(61,219,169,0.1)",
                border: "1.5px solid rgba(61,219,169,0.3)",
                color: "var(--accent)",
                fontSize: ".72rem",
                fontWeight: 800,
              }}
            >
              {step.num === "3" ? step.icon : step.num}
            </div>
            <div>
              <div style={{ fontSize: ".78rem", color: "var(--t2)" }}>
                <strong style={{ color: "var(--t1)" }}>{step.title}</strong> —{" "}
                {step.desc}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: ".68rem",
                  color: "var(--t4)",
                }}
              >
                {step.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
