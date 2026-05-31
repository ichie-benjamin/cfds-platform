import { Wallet, CircleCheck, ChartLine, Clock } from "lucide-react";
import useUserStore from "@/store/userStore";
import { useCurrency } from "@/hooks/useCurrency";

/**
 * Four balance cards matching `.bal-row` / `.bal-card` in the reference.
 * Dynamic values still come from `useUserStore` exactly as before.
 */
export function WalletOverviewPanel() {
  const user = useUserStore((state) => state.user);
  const { formatCurrency } = useCurrency();
  const balance = user?.balance || 0;

  const cards = [
    {
      label: "Net Portfolio",
      value: formatCurrency(balance),
      sub: "Total wallet value",
      icon: Wallet,
      valueColor: "var(--accent-light)",
    },
    {
      label: "Available",
      value: formatCurrency(balance),
      sub: "Ready to trade",
      icon: CircleCheck,
      valueColor: "var(--accent)",
    },
    {
      label: "Trade Balance",
      value: "—",
      sub: "In active positions",
      icon: ChartLine,
      valueColor: "var(--accent)",
    },
    {
      label: "Pending Orders",
      value: "—",
      sub: "Open limit orders",
      icon: Clock,
      valueColor: "var(--accent)",
    },
  ];

  return (
    <div className="bal-row">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bal-card">
            <div className="bci">
              <Icon className="h-[0.78rem] w-[0.78rem]" />
            </div>
            <div className="bc-lbl">{card.label}</div>
            <div className="bc-num" style={{ color: card.valueColor }}>
              {card.value}
            </div>
            <div className="bc-sub">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
