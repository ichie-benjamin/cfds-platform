import { useEffect, useState } from "react";
import { Wallet, Menu } from "lucide-react";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { AccountsSidebar } from "@/components/accounts/AccountsSidebar";
import { HelpSupportCard } from "@/components/settings/HelpSupportCard";
import { AccountsHeroCard } from "@/components/accounts/AccountsHeroCard";
import { YourWalletsCard } from "@/components/accounts/YourWalletsCard";
import { TransferFundsCard } from "@/components/accounts/TransferFundsCard";
import { TradingPlanCard } from "@/components/accounts/TradingPlanCard";
import { AccountsQuickLinksCard } from "@/components/accounts/AccountsQuickLinksCard";
import useUserStore from "@/store/userStore";

export default function AccountsPage() {
  // Read user once at the page level; pass slices down as props.
  const user = useUserStore((state) => state.user);
  const accounts = user?.accounts || [];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        @keyframes accounts-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .accounts-active .accounts-status-pulse {
          animation: accounts-pulse 2s ease-in-out infinite;
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

        {/* Universal platform navbar (matches Dashboard) */}
        <DashboardNavbar />

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
            <div className="mb-7 flex items-center gap-3.5">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(0,223,162,0.1)",
                  color: "#00dfa2",
                }}
              >
                <Wallet className="h-[1.1rem] w-[1.1rem]" />
              </div>
              <div>
                <h1 className="font-[Outfit,sans-serif] text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                  Accounts
                </h1>
                <p className="mt-0.5 text-[0.82rem] text-[#4a5468]">
                  View your wallets and move funds between them
                </p>
              </div>
            </div>

            {/* Two-column content (1fr 300px on desktop, stacked below) */}
            <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
              {/* ── LEFT COLUMN ── */}
              <div className="flex flex-col">
                {/* Hero replaces the previous dashboard stat tiles */}
                <AccountsHeroCard
                  firstName={user?.first_name}
                  accounts={accounts}
                  verificationStatus={user?.verification_status}
                />

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
