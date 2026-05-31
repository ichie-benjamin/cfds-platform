import { Receipt } from "lucide-react";

interface WithdrawalSummaryProps {
  coinSymbol: string;
  coinName: string;
  amount: string;
  network: string;
}

export function WithdrawalSummary({
  coinSymbol,
  coinName,
  amount,
  network,
}: WithdrawalSummaryProps) {
  const usdVal = parseFloat(amount.replace(/,/g, "")) || 0;
  // Presentational placeholder rate
  const cryptoAmount = usdVal > 0 ? (usdVal / 84210).toFixed(8) : "0.00000000";
  const feeEstimate = usdVal > 0 ? "~$4.20" : "$0.00";

  return (
    <div className="fee-box" style={{ marginTop: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: ".68rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "var(--accent)",
        }}
      >
        <Receipt className="h-3 w-3" />
        Withdrawal Summary
      </div>
      <div className="fb-row">
        <span className="fb-k">Asset</span>
        <span className="fb-val">{`${coinSymbol} — ${coinName}`}</span>
      </div>
      <div className="fb-row">
        <span className="fb-k">USD Value</span>
        <span className="fb-val">
          {usdVal > 0
            ? `$${usdVal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : "$0.00"}
        </span>
      </div>
      <div className="fb-row">
        <span className="fb-k">Crypto Amount</span>
        <span className="fb-val">
          {cryptoAmount} {coinSymbol}
        </span>
      </div>
      <div className="fb-row">
        <span className="fb-k">Network</span>
        <span className="fb-val">{network || "—"}</span>
      </div>
      <div className="fb-row">
        <span className="fb-k">Network Fee</span>
        <span className="fb-val" style={{ color: "var(--orange)" }}>
          {feeEstimate}
        </span>
      </div>
      <div className="fb-row">
        <span className="fb-k">Exit Fee</span>
        <span className="fb-val" style={{ color: "var(--accent)" }}>
          None (no staked funds)
        </span>
      </div>
      <div
        className="fb-row"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 8,
          marginTop: 4,
        }}
      >
        <span className="fb-k" style={{ color: "var(--t2)", fontWeight: 700 }}>
          You Receive
        </span>
        <span
          className="fb-val"
          style={{ color: "var(--accent)", fontSize: ".88rem" }}
        >
          ~{cryptoAmount} {coinSymbol}
        </span>
      </div>
    </div>
  );
}

