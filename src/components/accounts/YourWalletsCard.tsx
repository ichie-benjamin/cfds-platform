import { Wallet } from "lucide-react";
import { AccountsTable } from "@/components/account/accounts-table";
import type { UserAccount } from "@/store/userStore";

interface YourWalletsCardProps {
  accounts: UserAccount[];
}

export function YourWalletsCard({ accounts }: YourWalletsCardProps) {
  return (
    <section className="mb-7">
      {/* .sec-header */}
      <div className="mb-[18px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-[0.92rem] w-[0.92rem] text-[#00dfa2]" />
          <h3 className="font-[Outfit,sans-serif] text-[1.05rem] font-bold text-[#eef2f7]">
            Your Wallets
          </h3>
        </div>
        <span
          className="rounded-[20px] border border-white/[0.06] px-3 py-1 font-[JetBrains_Mono,monospace] text-[0.72rem] font-semibold text-[#4a5468]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {accounts.length} wallet{accounts.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* .gcard with padding:0 */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
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

        {accounts.length === 0 ? (
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-[#4a5468]">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-[0.84rem] font-semibold text-[#eef2f7]">
              No wallets yet
            </p>
            <p className="max-w-[260px] text-[0.72rem] text-[#4a5468]">
              Your trading and credit wallets will appear here once your
              account is provisioned.
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            <AccountsTable accounts={accounts} />
          </div>
        )}
      </div>
    </section>
  );
}
