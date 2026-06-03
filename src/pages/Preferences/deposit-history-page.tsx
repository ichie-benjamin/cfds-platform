import { useEffect, useState } from "react";
import { History, Menu } from "lucide-react";
import DepositHistory from "@/components/deposit-history";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { MarketSidebar } from "@/components/market/MarketSidebar";
import { HelpSupportCard } from "@/components/settings/HelpSupportCard";
import { DepositHistoryHeroCard } from "@/components/deposit-history-ui/DepositHistoryHeroCard";
import { DepositHistoryListCard } from "@/components/deposit-history-ui/DepositHistoryListCard";
import { DepositQuickLinksCard } from "@/components/deposit-history-ui/DepositQuickLinksCard";
import { DepositStatusLegendCard } from "@/components/deposit-history-ui/DepositStatusLegendCard";
import useUserStore from "@/store/userStore";

export default function DepositHistoryPage() {
  // Read user once at the page level; pass slices down as props.
  // No deposit API call — the existing <DepositHistory /> owns that.
  const user = useUserStore((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide MainLayout chrome while this page is mounted (matches accounts/markets pattern)
  useEffect(() => {
    document.body.classList.add("deposit-history-active");
    return () => {
      document.body.classList.remove("deposit-history-active");
    };
  }, []);

  return (
    <>
      <style>{`
        body.deposit-history-active .fixed.top-0.left-0.right-0.z-20,
        body.deposit-history-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.deposit-history-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.deposit-history-active .flex-1.md\\:ml-\\[80px\\] {
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

        {/* Universal platform navbar (matches Markets/Dashboard) */}
        <DashboardNavbar />

        {/* Mobile-only sidebar trigger — mirrors Accounts pattern */}
        <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] bg-[rgba(7,8,12,0.75)] px-3 py-1.5 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Toggle navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
          >
            <Menu className="h-[1.05rem] w-[1.05rem]" />
          </button>
        </div>

        {/* Layout: 60px icon sidebar (matches Markets) + main */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <MarketSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main
            className="overflow-y-auto px-4 py-7 md:px-8"
            style={{ maxHeight: "100%" }}
          >
            {/* Page header — same scale/spacing as Markets */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(0,223,162,0.1)] text-[#00dfa2]">
                  <History className="h-[1.1rem] w-[1.1rem]" />
                </div>
                <div>
                  <h1 className="flex items-center gap-2 font-[Outfit,sans-serif] text-[1.4rem] font-extrabold tracking-[-0.02em] text-[#eef2f7] sm:text-[1.65rem]">
                    Deposit History
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00dfa2]/75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00dfa2]" />
                    </span>
                  </h1>
                  <p className="mt-0.5 text-[0.78rem] text-[#4a5468]">
                    Review every deposit across your trading accounts
                  </p>
                </div>
              </div>
            </div>

            {/* Two-column content */}
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_340px]">
              {/* ── LEFT COLUMN ── */}
              <div className="flex flex-col gap-5">
                <DepositHistoryHeroCard firstName={user?.first_name} />

                <DepositHistoryListCard>
                  {/* Locked, untouched logic component */}
                  <DepositHistory />
                </DepositHistoryListCard>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="flex flex-col gap-5">
                <DepositQuickLinksCard />
                <DepositStatusLegendCard />
                <HelpSupportCard />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
