import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Menu,
  BadgeDollarSign,
  Coins,
  Landmark,
  BriefcaseBusiness,
} from "lucide-react";
import { TickerBar } from "@/components/dashboard/TickerBar";
import { AccountsSidebar } from "@/components/accounts/AccountsSidebar";
import { HelpSupportCard } from "@/components/settings/HelpSupportCard";
import { YourWalletsCard } from "@/components/accounts/YourWalletsCard";
import { TransferFundsCard } from "@/components/accounts/TransferFundsCard";
import { TradingPlanCard } from "@/components/accounts/TradingPlanCard";
import { AccountsQuickLinksCard } from "@/components/accounts/AccountsQuickLinksCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
import useUserStore from "@/store/userStore";

export default function AccountsPage() {
  // Read user once at the page level; pass slices down as props.
  const user = useUserStore((state) => state.user);
  const accounts = user?.accounts || [];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  // Mirror Dashboard's safe-fallback shape (TradingDashboard.tsx lines 49-57)
  const balance = user?.balance || 0;
  const tradesSummary = user?.trades_summary || {
    total_pnl: 0,
    total_wins: 0,
    total_losses: 0,
    trades_count: 0,
    total_deposit: 0,
    win_rate: 0,
  };

  // Hide MainLayout chrome while this page is mounted (matches security/settings pattern)
  useEffect(() => {
    document.body.classList.add("accounts-active");
    return () => {
      document.body.classList.remove("accounts-active");
    };
  }, []);

  return (
    <>
      <style>{`
        body.accounts-active .fixed.top-0.left-0.right-0.z-20,
        body.accounts-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.accounts-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.accounts-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
        }}
      >
        {/* Top scrolling ticker bar (reused from Markets) */}
        <TickerBar />

        {/* Mobile-only sidebar trigger — mirrors MarketHeader's trigger */}
        <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] bg-[rgba(7,8,12,0.75)] px-3 py-1.5 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Toggle navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
          >
            <Menu className="h-[1.05rem] w-[1.05rem]" />
          </button>
        </div>

        {/* Layout: icon-only sidebar + main */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <AccountsSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main
            className="overflow-y-auto p-5 md:p-9"
            style={{ maxHeight: "100%" }}
          >
            {/* Page header */}
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00dfa2]/10">
                <Wallet className="h-5 w-5 text-[#00dfa2]" />
              </div>
              <div>
                <h1 className="font-[Outfit,sans-serif] text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                  Accounts
                </h1>
                <p className="mt-0.5 text-[0.87rem] text-[#4a5468]">
                  View your wallets and move funds between them
                </p>
              </div>
            </div>

            {/* ═══ DASHBOARD-STYLE STAT PANELS ═══ */}
            {/* Mirrors TradingDashboard.tsx lines 199-276 — same grid, same components, same data shape. */}
            <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_0.9fr]">
              {/* Account Balance — special card (mirrors Dashboard) */}
              <div className="scard relative overflow-hidden rounded-2xl border-[1.5px] border-white/[0.06] bg-[#111319] p-[22px_24px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(175deg,rgba(255,255,255,0.03),transparent_40%)]" />
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                      Account Balance
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(0,223,162,0.1)] text-[#00dfa2]">
                      <BadgeDollarSign className="h-[0.82rem] w-[0.82rem]" />
                    </div>
                  </div>

                  <div className="mb-4 font-mono text-[1.45rem] font-extrabold tracking-[-0.02em] text-[#00dfa2]">
                    {formatCurrency(balance)}
                  </div>

                  <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-[14px]">
                    <div className="flex items-center justify-between text-[0.78rem]">
                      <span className="font-medium text-[#4a5468]">Leverage</span>
                      <span className="font-mono font-bold text-[#00dfa2]">
                        1:{user?.account_type?.leverage || "1"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[0.78rem]">
                      <span className="font-medium text-[#4a5468]">
                        {user?.custom_wallet || "Credit Balance"}
                      </span>
                      <span className="font-mono font-bold text-[#8b97a8]">
                        {formatCurrency(user?.credit_balance || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[0.78rem]">
                      <span className="font-medium text-[#4a5468]">
                        Account Type
                      </span>
                      <span className="font-mono font-bold text-[#00dfa2]">
                        {user?.account_type?.title || "Starter"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] border-none bg-[linear-gradient(135deg,#00dfa2,#00b881)] py-3 text-[0.82rem] font-bold tracking-[0.02em] text-[#07080c] shadow-[0_4px_16px_rgba(0,223,162,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,223,162,0.3)]"
                    onClick={() => navigate("/trading")}
                  >
                    Open Trade Room
                  </Button>
                </div>
              </div>

              <StatCard
                title="Total PNL"
                value={formatCurrency(tradesSummary.total_pnl)}
                icon={<Coins className="h-5 w-5" />}
                footnote="Based on current exchange rate"
                metaValue={`${tradesSummary.win_rate.toFixed(2)}%`}
                iconTone="blue"
              />

              <StatCard
                title="Total Deposits"
                value={formatCurrency(tradesSummary.total_deposit || 0)}
                icon={<Landmark className="h-5 w-5" />}
                metaValue={`No deposits yet`}
                iconTone="violet"
              />

              <StatCard
                title="Profitable Orders"
                value={`${tradesSummary.total_wins}`}
                secondaryValue={`/${tradesSummary.trades_count}`}
                icon={<BriefcaseBusiness className="h-3 w-3" />}
                metaValue={`No orders placed`}
                iconTone="amber"
              />
            </div>

            {/* Two-column content */}
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
              {/* ── LEFT COLUMN ── */}
              <div className="flex flex-col gap-5">
                <YourWalletsCard accounts={accounts} />

                <TransferFundsCard accounts={accounts} />
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="flex flex-col gap-5">
                <TradingPlanCard
                  planTitle={user?.account_type?.title}
                  leverage={user?.account_type?.leverage}
                  image={user?.account_type?.image}
                  color={user?.account_type?.color}
                />
                <AccountsQuickLinksCard />
                <HelpSupportCard />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
