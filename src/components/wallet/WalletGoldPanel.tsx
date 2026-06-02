import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Medal,
  Lock,
  ArrowRight,
  ArrowUp,
  Info,
  X,
} from "lucide-react";

const GOLD_SPECS: Array<{ label: string; value: string; sub: string }> = [
  { label: "Purity", value: "999.9 Fine Gold", sub: "LBMA London certified" },
  { label: "Refinery", value: "PAMP Suisse", sub: "Swiss-assay hallmark" },
  { label: "Current Spot Price", value: "$2,018 / oz", sub: "Updated live" },
  { label: "Delivery", value: "7 - 14 Business Days", sub: "Insured, tracked worldwide" },
];

const QTY_OPTIONS: Array<{ oz: number; desc: string; popular?: boolean }> = [
  { oz: 1, desc: "Troy Ounce Bar" },
  { oz: 5, desc: "5 oz Bar", popular: true },
  { oz: 10, desc: "10 oz Bar" },
];

const SPOT_PRICE = 2018;
const PREMIUM_PER_OZ = 5;

// Reference hardcodes this. UI-only — does not change the user's real tier
// stored on userStore or affect any business logic.
const CURRENT_USER_TIER = "Gold Plus";

export function WalletGoldPanel() {
  const [selectedOz, setSelectedOz] = useState<number>(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const total = selectedOz * (SPOT_PRICE + PREMIUM_PER_OZ);

  return (
    <>
      <div className="gold-card" style={{ marginBottom: 0 }}>
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
        <div className="flabel" style={{ marginBottom: 6 }}>
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedOz(opt.oz);
                  }
                }}
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
      </div>

      {/* Continue button — opens the Diamond Account Required modal.
          Does NOT call any withdrawal API. */}
      <div className="step-nav" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="sn-next"
          onClick={() => setShowUpgradeModal(true)}
        >
          <span>Continue to Delivery Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {showUpgradeModal && (
        <GoldUpgradeModal
          tier={CURRENT_USER_TIER}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}

function GoldUpgradeModal({
  tier,
  onClose,
}: {
  tier: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gold-upgrade-title"
    >
      <div
        style={{
          background:
            "linear-gradient(145deg,rgba(15,20,32,.98),rgba(10,13,21,.98))",
          border: "1px solid rgba(61,219,169,.2)",
          borderRadius: 14,
          padding: "28px 32px",
          maxWidth: 380,
          width: "90%",
          textAlign: "center",
          boxShadow:
            "0 20px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "none",
            border: "none",
            color: "var(--t3)",
            fontSize: ".9rem",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(232,169,77,.1)",
            border: "1.5px solid rgba(232,169,77,.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <Lock style={{ fontSize: "1.2rem", color: "#E8A94D" }} className="h-5 w-5" />
        </div>

        <div
          id="gold-upgrade-title"
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--t1)",
            marginBottom: 6,
            fontFamily: "var(--heading)",
          }}
        >
          Diamond Account Required
        </div>
        <div
          style={{
            fontSize: ".75rem",
            color: "var(--t3)",
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          Physical gold withdrawal is exclusively available for Diamond tier
          accounts and above. Upgrade your account to unlock this premium
          feature.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 14px",
            background: "rgba(232,169,77,.06)",
            border: "1px solid rgba(232,169,77,.15)",
            borderRadius: 8,
            marginBottom: 18,
          }}
        >
          <Info
            style={{ color: "#E8A94D", flexShrink: 0 }}
            className="h-3 w-3"
          />
          <span
            style={{
              fontSize: ".68rem",
              color: "var(--t2)",
              lineHeight: 1.5,
            }}
          >
            Your current tier:{" "}
            <strong style={{ color: "var(--t1)" }}>{tier}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate("/main/trading-plans");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 18px",
            width: "100%",
            background:
              "linear-gradient(135deg,var(--accent-light),var(--accent),var(--accent-dark))",
            color: "#07080c",
            fontSize: ".78rem",
            fontWeight: 800,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            boxShadow:
              "inset 0 1px 2px rgba(255,255,255,.25),0 4px 16px rgba(61,219,169,.2)",
            transition: "all .2s",
          }}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span>Upgrade Account</span>
        </button>
      </div>
    </div>
  );
}
