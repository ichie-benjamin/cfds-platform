import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useTradeStore from "@/store/tradeStore";

interface TradingStrengthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradingStrengthModal({ open, onOpenChange }: TradingStrengthModalProps) {
  const accountSummary = useTradeStore((state) => state.accountSummary);

  const rawLevel = accountSummary?.marginLevel;
  let pct = 75;
  if (rawLevel) {
    const parsed = typeof rawLevel === "string" ? parseFloat(rawLevel) : rawLevel;
    if (!isNaN(parsed)) {
      pct = Math.min(100, Math.max(0, parsed > 200 ? 100 : (parsed / 200) * 100));
    }
  }

  const isCritical = pct <= 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-8 text-center">
        <DialogTitle className="text-lg font-extrabold">
          {isCritical ? "Critical Trading Strength" : "Low Trading Strength"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
          {isCritical
            ? "Your trading strength is critically low. You are at high risk of liquidation. Add funds immediately."
            : "Your trading strength is below the recommended level. Consider adding funds to improve your margin utilization and reduce liquidation risk."}
        </DialogDescription>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden my-4">
          <div
            className={`h-full rounded-full transition-all duration-400 ${
              isCritical ? "bg-red-500" : "bg-orange-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/main/wallet?tab=deposit" className="flex-1">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-background font-extrabold">
              Add Funds
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
