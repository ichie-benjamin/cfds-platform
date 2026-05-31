import { Medal } from "lucide-react";
import useUserStore from "@/store/userStore";

const ELITE_THRESHOLD = 100000;

export function GoldTierBanner() {
  const user = useUserStore((state) => state.user);
  const balance = user?.balance || 0;

  if (balance < ELITE_THRESHOLD) return null;

  return (
    <div className="gold-tier-banner">
      <div className="gtb-icon">
        <Medal className="h-[1.05rem] w-[1.05rem]" />
      </div>
      <div className="gtb-text">
        <div className="gtb-title">Diamond Gold Withdrawal Unlocked</div>
        <div className="gtb-desc">
          Your account balance exceeds $100,000. You now have exclusive access
          to physical gold bar (1 oz) withdrawals, delivered insured to your
          door worldwide.
        </div>
      </div>
      <div className="gtb-badge">Diamond Member</div>
    </div>
  );
}
