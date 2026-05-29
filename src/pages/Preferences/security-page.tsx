import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { SecuritySidebar } from "@/components/security/SecuritySidebar";
import { SecurityScoreCard } from "@/components/security/SecurityScoreCard";
import { TwoFactorSection } from "@/components/security/TwoFactorSection";
import { PasswordChangeCard } from "@/components/security/PasswordChangeCard";
import { AntiPhishingCard } from "@/components/security/AntiPhishingCard";
import { WithdrawalWhitelistCard } from "@/components/security/WithdrawalWhitelistCard";
import { DeviceManagementCard } from "@/components/security/DeviceManagementCard";
import { LoginActivityCard } from "@/components/security/LoginActivityCard";
import { AccountActionsCard } from "@/components/security/AccountActionsCard";
import { TrustBadgesFooter } from "@/components/security/TrustBadgesFooter";

export default function SecurityPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide MainLayout chrome while security page is mounted
  useEffect(() => {
    document.body.classList.add("security-active");
    return () => {
      document.body.classList.remove("security-active");
    };
  }, []);

  return (
    <>
      <style>{`
        body.security-active .fixed.top-0.left-0.right-0.z-20,
        body.security-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.security-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.security-active .flex-1.md\\:ml-\\[80px\\] {
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
        {/* Top scrolling ticker bar (matches Market page) */}
        <TickerBar />

        {/* Dashboard navbar */}
        <DashboardNavbar />

        {/* Layout: secondary sidebar + main */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <SecuritySidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main
            className="overflow-y-auto p-5 md:p-9"
            style={{ maxHeight: "100%" }}
          >
            {/* Page header */}
            <div className="mb-8 flex items-start gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Toggle navigation"
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
              >
                <Menu className="h-[1.05rem] w-[1.05rem]" />
              </button>
              <div>
                <h1 className="font-[Outfit,sans-serif] text-[28px] font-bold text-[#eef2f7]">
                  Security Settings
                </h1>
                <p className="mt-2 text-[14px] text-[#8b97a8]">
                  Protect your account with advanced security features
                </p>
              </div>
            </div>

            {/* Security Score */}
            <SecurityScoreCard />

            {/* 2FA */}
            <TwoFactorSection />

            {/* Password & Login (real, working — extracted shared component) */}
            <PasswordChangeCard />

            {/* Anti-Phishing Code */}
            <AntiPhishingCard />

            {/* Withdrawal Whitelist */}
            <WithdrawalWhitelistCard />

            {/* Device Management */}
            <DeviceManagementCard />

            {/* Login Activity Log */}
            <LoginActivityCard />

            {/* Account Actions */}
            <AccountActionsCard />

            {/* Trust badges footer */}
            <TrustBadgesFooter />
          </main>
        </div>
      </div>
    </>
  );
}
