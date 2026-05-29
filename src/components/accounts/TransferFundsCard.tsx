import { ArrowLeftRight } from "lucide-react";
import { TransferForm } from "@/components/account/transfer-form";
import type { UserAccount } from "@/store/userStore";

interface TransferFundsCardProps {
  accounts: UserAccount[];
}

export function TransferFundsCard({ accounts }: TransferFundsCardProps) {
  return (
    <section className="mt-7">
      {/* .sec-header */}
      <div className="mb-[18px] flex items-center gap-2.5">
        <ArrowLeftRight className="h-[0.92rem] w-[0.92rem] text-[#00dfa2]" />
        <h3 className="font-[Outfit,sans-serif] text-[1.05rem] font-bold text-[#eef2f7]">
          Transfer Between Wallets
        </h3>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
        style={{
          background:
            "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(175deg,rgba(255,255,255,0.03),transparent 40%)",
          }}
        />

        <div className="relative z-10">
          <p className="mb-4 text-[0.82rem] leading-[1.6] text-[#4a5468]">
            Move funds between your wallets instantly. Transfers are free and
            settle immediately — no fees, no waiting.
          </p>
          <div className="mb-4 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
            Transfer Funds Between Your Accounts
          </div>

          {/* Existing form — handlers/state UNCHANGED */}
          <TransferForm accounts={accounts} />
        </div>
      </div>
    </section>
  );
}
