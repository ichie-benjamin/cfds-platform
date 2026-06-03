import type { ReactNode } from "react";
import { ListOrdered } from "lucide-react";

interface DepositHistoryListCardProps {
  children: ReactNode;
}

export function DepositHistoryListCard({ children }: DepositHistoryListCardProps) {
  return (
    <div
      className="rounded-[12px] border border-[rgba(255,255,255,0.05)] p-5 md:p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))",
      }}
    >
      <div className="mb-5 flex items-center gap-2">
        <ListOrdered className="h-3.5 w-3.5 text-[#00dfa2]" />
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[#eef2f7]">
          Transactions
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>

      {/* Slot: renders the locked <DepositHistory /> untouched */}
      <div className="deposit-history-slot">{children}</div>
    </div>
  );
}
