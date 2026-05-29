import { Wallet } from "lucide-react";
import type { UserAccount } from "@/store/userStore";

interface AccountsHeroCardProps {
  firstName?: string;
  accounts: UserAccount[];
  verificationStatus?: string;
}

export function AccountsHeroCard({
  accounts,
  verificationStatus,
}: AccountsHeroCardProps) {
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (Number(acc.balance) || 0),
    0
  );
  const activeCount = accounts.filter((a) => a.status === "active").length;
  const primaryCurrency = accounts[0]?.currency || "USD";
  const isVerified =
    verificationStatus === "approved" || verificationStatus === "verified";

  return (
    <div
      className="relative mb-7 flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-2xl border border-white/[0.06] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
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

      {/* uwc-left */}
      <div className="relative z-10 flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[1.5px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,223,162,0.1), rgba(0,223,162,0.06))",
            borderColor: "rgba(0,223,162,0.2)",
            color: "#00dfa2",
          }}
        >
          <Wallet className="h-[1.2rem] w-[1.2rem]" />
        </div>

        <div className="min-w-0">
          <h2 className="font-[Outfit,sans-serif] text-[1.1rem] font-bold uppercase tracking-[0.03em] text-[#eef2f7]">
            User's Wallets
          </h2>
          <p
            className="mt-[2px] text-[0.78rem] leading-[1.5] text-[#4a5468]"
            style={{ maxWidth: "340px" }}
          >
            Manage balances and move funds between your wallets
          </p>
          <div
            className="mt-2 inline-flex items-center gap-1.5 rounded-[20px] border px-[14px] py-[5px] text-[0.7rem] font-bold uppercase tracking-[0.04em]"
            style={
              isVerified
                ? {
                    background: "rgba(30,215,96,0.08)",
                    color: "#1ED760",
                    borderColor: "rgba(30,215,96,0.2)",
                  }
                : {
                    background: "rgba(255,152,0,0.08)",
                    color: "#FF9800",
                    borderColor: "rgba(255,152,0,0.2)",
                  }
            }
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: isVerified ? "#1ED760" : "#FF9800",
                boxShadow: `0 0 8px ${isVerified ? "#1ED760" : "#FF9800"}`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            {isVerified ? "Verified" : "Unverified"}
          </div>
        </div>
      </div>

      {/* uwc-right */}
      <div className="relative z-10 flex flex-wrap gap-4">
        <Stat
          label="Total Balance"
          value={`$${totalBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          accent
        />
        <Stat
          label="Active"
          value={`${activeCount}/${accounts.length || 0}`}
        />
        <Stat label="Currency" value={primaryCurrency} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="relative min-w-[130px] overflow-hidden rounded-xl border border-white/[0.06] px-[22px] py-4 text-center"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />
      <div
        className={`mb-1 font-[JetBrains_Mono,monospace] text-[1.2rem] font-bold ${
          accent ? "text-[#00dfa2]" : "text-[#eef2f7]"
        }`}
      >
        {value}
      </div>
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
        {label}
      </div>
    </div>
  );
}
