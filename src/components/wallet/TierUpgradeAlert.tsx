import { ArrowUp, X, Trophy, Coins, Info } from "lucide-react";
import { useState } from "react";
import useUserStore from "@/store/userStore";
import { useCurrency } from "@/hooks/useCurrency";

/**
 * Presentational tier upgrade banner. Mirrors the reference's
 * `.tier-upgrade-alert` block. Shown when the user balance is between
 * the "current tier" floor and the next tier's threshold.
 *
 * Tier names/amounts are visual only and not wired to a backend API.
 */

const TIER_THRESHOLDS: Array<{ name: string; min: number }> = [
  { name: "Gold", min: 10000 },
  { name: "Gold Plus", min: 50000 },
  { name: "Platinum", min: 100000 },
  { name: "Diamond", min: 250000 },
];

export function TierUpgradeAlert() {
  const user = useUserStore((s) => s.user);
  const balance = user?.balance || 0;
  const { formatCurrency } = useCurrency();
  const [dismissed, setDismissed] = useState(false);

  // Find the next tier above current balance
  const nextTier = TIER_THRESHOLDS.find((t) => t.min > balance);
  if (!nextTier || dismissed) return null;
  const remaining = nextTier.min - balance;

  return (
    <div className="tier-upgrade-alert">
      <div className="tua-topbar">
        <div className="tua-label-pill">
          <ArrowUp className="h-3 w-3" />
          Tier Upgrade
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="tua-close"
        >
          <X className="h-3 w-3" />
          Dismiss
        </button>
      </div>
      <div className="tua-body">
        <div className="tua-left">
          <div className="tua-icon">
            <Trophy className="h-[1.1rem] w-[1.1rem]" />
          </div>
          <div>
            <div className="tua-heading">
              Upgrading to{" "}
              <span style={{ color: "var(--accent-light)" }}>
                {nextTier.name}
              </span>
            </div>
            <div className="tua-sub">
              Deposit at least the required minimum below to instantly unlock
              your new tier and all exclusive benefits.
            </div>
          </div>
        </div>
        <div className="tua-amtbox">
          <div className="tua-amt-label">
            <Coins className="mr-1 inline h-3 w-3" />
            Minimum Deposit Required
          </div>
          <div className="tua-amount">{formatCurrency(remaining)}</div>
          <div className="tua-amt-note">
            to activate{" "}
            <span style={{ color: "var(--accent)" }}>{nextTier.name}</span>
          </div>
        </div>
      </div>
      <div className="tua-strip">
        <Info className="h-3 w-3" style={{ color: "var(--accent)" }} />
        <span>
          Your deposit will be reviewed and your tier upgraded within{" "}
          <strong>minutes</strong> of confirmation. All current tier benefits
          remain active until then.
        </span>
      </div>
    </div>
  );
}

export default TierUpgradeAlert;
