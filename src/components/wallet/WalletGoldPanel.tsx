import { useState } from "react";
import { Medal, Lock, Truck, BadgeCheck } from "lucide-react";
import useUserStore from "@/store/userStore";
import { useCurrency } from "@/hooks/useCurrency";

const ELITE_THRESHOLD = 100000;

const GOLD_SPECS: Array<{ label: string; value: string; sub: string }> = [
  {
    label: "Purity",
    value: "999.9 Fine Gold",
    sub: "LBMA London certified",
  },
  {
    label: "Refinery",
    value: "PAMP Suisse",
    sub: "Swiss-assay hallmark",
  },
  {
    label: "Current Spot Price",
    value: "$2,018 / oz",
    sub: "Updated live",
  },
  {
    label: "Delivery",
    value: "7 - 14 Business Days",
    sub: "Insured, tracked worldwide",
  },
];

const DELIVERY_STEPS: Array<{ title: string; desc: string }> = [
  {
    title: "Order Placed",
    desc: "Funds deducted, order forwarded to our Swiss vault partner.",
  },
  {
    title: "Compliance Review",
    desc: "FINMA anti-money-laundering review — completed within 24h.",
  },
  {
    title: "Bar Allocated & Sealed",
    desc: "Your specific bar is allocated with serial number and assay certificate.",
  },
  {
    title: "Brinks Insured Dispatch",
    desc: "Shipped via Brinks Global Services with full insurance and tracking.",
  },
  {
    title: "Signature Delivery",
    desc: "Delivered to your address, signature required upon receipt.",
  },
];

const QTY_OPTIONS: Array<{ oz: number; desc: string; popular?: boolean }> = [
  { oz: 1, desc: "Troy Ounce Bar" },
  { oz: 5, desc: "5 oz Bar", popular: true },
  { oz: 10, desc: "10 oz Bar" },
];
const SPOT_PRICE = 2018;
const PREMIUM_PER_OZ = 5;

export function WalletGoldPanel() {
  const user = useUserStore((state) => state.user);
  const { formatCurrency } = useCurrency();
  const balance = user?.balance || 0;
  const isElite = balance >= ELITE_THRESHOLD;
  const progressPct = Math.min(100, (balance / ELITE_THRESHOLD) * 100);
  const [selectedOz, setSelectedOz] = useState<number>(1);
  const total = selectedOz * (SPOT_PRICE + PREMIUM_PER_OZ);

  if (!isElite) {
    return (
      <div className="gold-locked">
        <div className="gl-icon">
          <Lock className="h-4 w-4" />
        </div>
        <div className="gl-title">Physical Gold Withdrawals — Diamond Only</div>
        <div className="gl-desc">
          Physical gold bar withdrawals are available exclusively to Diamond
          members with an account balance of at least{" "}
          {formatCurrency(ELITE_THRESHOLD)}. Delivered insured to your door
          worldwide.
        </div>
        <div className="gl-progress">
          <div className="glp-row">
            <span className="glp-label">Current Balance</span>
            <span className="glp-val">{formatCurrency(balance)}</span>
          </div>
          <div className="glp-row">
            <span className="glp-label">Diamond Threshold</span>
            <span className="glp-val">{formatCurrency(ELITE_THRESHOLD)}</span>
          </div>
          <div className="glp-bar">
            <div className="glp-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gold-card">
      {/* Header */}
      <div className="gc-header">
        <div className="gc-icon">
          <Medal className="h-4 w-4" />
        </div>
        <div>
          <div className="gc-title">Physical Gold Bar Withdrawal</div>
          <div className="gc-sub">
            LBMA-certified 999.9 fine gold, insured worldwide delivery
          </div>
        </div>
        <div className="gc-badge">Diamond Only</div>
      </div>

      {/* Specs grid */}
      <div className="gold-specs">
        {GOLD_SPECS.map((spec) => (
          <div key={spec.label} className="gs-item">
            <div className="gs-label">{spec.label}</div>
            <div className="gs-val">{spec.value}</div>
            <div className="gs-sub">{spec.sub}</div>
          </div>
        ))}
      </div>

      {/* Quantity selector */}
      <div className="flabel" style={{ position: "relative", marginBottom: 6 }}>
        Select Quantity
      </div>
      <div className="gold-qty">
        {QTY_OPTIONS.map((opt) => {
          const isOn = selectedOz === opt.oz;
          const price = opt.oz * (SPOT_PRICE + PREMIUM_PER_OZ);
          return (
            <div
              key={opt.oz}
              className={`gq-opt ${isOn ? "on" : ""}`}
              onClick={() => setSelectedOz(opt.oz)}
            >
              <div className="gq-weight">{opt.oz} oz</div>
              <div className="gq-desc">{opt.desc}</div>
              <div className="gq-price">${price.toLocaleString()}</div>
              {opt.popular && <div className="gq-premium">Popular</div>}
            </div>
          );
        })}
      </div>

      {/* Fee summary */}
      <div
        className="fee-box"
        style={{
          marginTop: 10,
          border: "1.5px solid rgba(61,219,169,0.3)",
          background:
            "linear-gradient(135deg,rgba(61,219,169,.04),rgba(7,12,24,.6))",
        }}
      >
        <div className="fb-row">
          <span className="fb-k">Gold quantity</span>
          <span className="fb-val" style={{ color: "var(--accent-light)" }}>
            {selectedOz} oz ({(selectedOz * 31.1).toFixed(1)}g)
          </span>
        </div>
        <div className="fb-row">
          <span className="fb-k">Gold spot price</span>
          <span className="fb-val">${SPOT_PRICE.toLocaleString()} / oz</span>
        </div>
        <div className="fb-row">
          <span className="fb-k">Premium + handling</span>
          <span className="fb-val" style={{ color: "var(--t2)" }}>
            +${PREMIUM_PER_OZ} / oz
          </span>
        </div>
        <div className="fb-row">
          <span className="fb-k">Insured shipping</span>
          <span className="fb-val" style={{ color: "var(--accent)" }}>
            Free (Diamond)
          </span>
        </div>
        <div
          className="fb-row"
          style={{
            borderTop: "1px solid rgba(61,219,169,0.3)",
            paddingTop: 6,
            marginTop: 3,
          }}
        >
          <span
            className="fb-k"
            style={{ color: "var(--accent-light)", fontWeight: 700 }}
          >
            Total deducted
          </span>
          <span
            className="fb-val"
            style={{ color: "var(--accent-light)", fontSize: ".88rem" }}
          >
            ${total.toLocaleString()}.00
          </span>
        </div>
      </div>

      {/* KYC notice */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "12px 14px",
          background: "rgba(61,219,169,0.08)",
          border: "1px solid rgba(61,219,169,0.25)",
          borderRadius: 10,
          marginTop: 14,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "rgba(61,219,169,0.12)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BadgeCheck className="h-4 w-4" />
        </div>
        <div
          style={{
            fontSize: ".75rem",
            color: "var(--t2)",
            lineHeight: 1.6,
          }}
        >
          Gold delivery requires a verified KYC Level 3 account and a confirmed
          postal address. Please contact support to initiate a gold delivery
          request once your details are up to date.
        </div>
      </div>

      {/* Delivery steps */}
      <div
        className="scard-title"
        style={{
          marginTop: 16,
          marginBottom: 8,
          paddingBottom: 0,
          border: "none",
        }}
      >
        <Truck
          className="h-[0.85rem] w-[0.85rem]"
          style={{ color: "var(--accent)" }}
        />
        Delivery Process
      </div>
      <div className="gold-delivery-steps">
        {DELIVERY_STEPS.map((s, i) => (
          <div key={s.title} className="gds-item">
            <div className="gds-num">{i + 1}</div>
            <div>
              <div className="gds-title">{s.title}</div>
              <div className="gds-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
