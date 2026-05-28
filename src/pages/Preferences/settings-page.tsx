import { useEffect, useRef, useState, useCallback } from "react";
import { Menu, Lock, ShieldCheck } from "lucide-react";

import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { AccountsSidebar } from "@/components/accounts/AccountsSidebar";

// Functional components — UNCHANGED, simply re-composed
import { PasswordChangeCard } from "@/components/security/PasswordChangeCard";
import { SecurityScoreCard } from "@/components/security/SecurityScoreCard";
import { TwoFactorSection } from "@/components/security/TwoFactorSection";
import { AccountActionsCard } from "@/components/security/AccountActionsCard";
import { LoginActivityCard } from "@/components/security/LoginActivityCard";
import { TrustBadgesFooter } from "@/components/security/TrustBadgesFooter";
import { PersonalInfoForm } from "@/components/personal/PersonalInfoForm";
import { ProfileCompletionCard } from "@/components/personal/ProfileCompletionCard";
import { ProfileIdentityCard } from "@/components/personal/ProfileIdentityCard";
import { ProfileContactCard } from "@/components/personal/ProfileContactCard";
import { ProfileTipsCard } from "@/components/personal/ProfileTipsCard";
import { ProfileQuickLinksCard } from "@/components/personal/ProfileQuickLinksCard";
import { AccountSnapshotCard } from "@/components/settings/AccountSnapshotCard";
import { SettingsQuickLinksCard } from "@/components/settings/SettingsQuickLinksCard";
import { SettingsTipsCard } from "@/components/settings/SettingsTipsCard";
import { HelpSupportCard } from "@/components/settings/HelpSupportCard";

// New presentational wrappers
import { SettingsUserCard } from "@/components/settings/SettingsUserCard";
import { SettingsTabs, type SettingsTabId } from "@/components/settings/SettingsTabs";
import { AccountOverviewCard } from "@/components/settings/AccountOverviewCard";
import { LocalizationSection } from "@/components/settings/LocalizationSection";
import { VerificationOverviewCard } from "@/components/settings/VerificationOverviewCard";
import { PreferencesPanel } from "@/components/settings/PreferencesPanel";

import useUserStore from "@/store/userStore";

export default function SettingsPage() {
  const user = useUserStore((state) => state.user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("overview");
  const mainRef = useRef<HTMLElement | null>(null);

  // Hide MainLayout chrome while this page is mounted (matches existing pattern)
  useEffect(() => {
    document.body.classList.add("settings-active");
    return () => {
      document.body.classList.remove("settings-active");
    };
  }, []);

  // Scroll-to-section helper for the quick action tiles in the top user card
  const goToSection = useCallback(
    (tab: SettingsTabId, anchorId?: string) => {
      setActiveTab(tab);
      if (!anchorId) {
        mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // Defer until tab content has rendered
      requestAnimationFrame(() => {
        const el = document.getElementById(anchorId);
        const main = mainRef.current;
        if (el && main) {
          const rect = el.getBoundingClientRect();
          const mainRect = main.getBoundingClientRect();
          main.scrollTo({
            top: main.scrollTop + (rect.top - mainRect.top) - 80,
            behavior: "smooth",
          });
        }
      });
    },
    []
  );

  return (
    <>
      <style>{`
        body.settings-active .fixed.top-0.left-0.right-0.z-20,
        body.settings-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.settings-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.settings-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(180deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
        }}
      >
        {/* Top scrolling ticker bar */}
        <TickerBar />

        {/* Dashboard navbar */}
        <DashboardNavbar />

        {/* Mobile-only sidebar trigger */}
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
            ref={mainRef}
            className="overflow-y-auto p-5 md:p-9"
            style={{ maxHeight: "100%" }}
          >
            {/* Page header */}
            <div className="mb-6">
              <h1 className="font-[Outfit,sans-serif] text-[1.55rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                Settings
              </h1>
              <p className="mt-0.5 text-[0.82rem] text-[#4a5468]">
                Manage your account, security, and preferences
              </p>
            </div>

            {/* Top user card */}
            <SettingsUserCard
              firstName={user?.first_name}
              lastName={user?.last_name}
              email={user?.email}
              avatar={user?.avatar}
              planTitle={user?.account_type?.title}
              verificationStatus={user?.verification_status}
              onSecurity={() => setActiveTab("security")}
              onLanguage={() => goToSection("overview", "settings-language-anchor")}
              onCurrency={() => goToSection("overview", "settings-currency-anchor")}
            />

            {/* Tabs */}
            <SettingsTabs active={activeTab} onChange={setActiveTab} />

            {/* ─────────────── OVERVIEW TAB ─────────────── */}
            {activeTab === "overview" && (
              <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
                <div className="flex flex-col">
                  <AccountOverviewCard
                    accountStatus={user?.status}
                    verificationStatus={user?.verification_status}
                    planTitle={user?.account_type?.title}
                  />
                  <LocalizationSection
                    currencyAnchorId="settings-currency-anchor"
                    languageAnchorId="settings-language-anchor"
                  />
                </div>
                <div className="flex flex-col gap-3.5">
                  <AccountSnapshotCard
                    firstName={user?.first_name}
                    lastName={user?.last_name}
                    email={user?.email}
                    avatar={user?.avatar}
                    accountId={user?.account_id}
                    planTitle={user?.account_type?.title}
                    verificationStatus={user?.verification_status}
                  />
                  <SettingsQuickLinksCard />
                  <SettingsTipsCard />
                  <HelpSupportCard />
                </div>
              </div>
            )}

            {/* ─────────────── PROFILE TAB ─────────────── */}
            {activeTab === "profile" && (
              <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
                <div className="flex flex-col gap-5">
                  <PersonalInfoForm />
                  <ProfileCompletionCard
                    fields={{
                      first_name: user?.first_name,
                      last_name: user?.last_name,
                      email: user?.email,
                      phone: user?.phone,
                      country: user?.country,
                      address: user?.address,
                      birth_date: user?.birth_date,
                      avatar: user?.avatar,
                    }}
                  />
                </div>
                <div className="flex flex-col gap-3.5">
                  <ProfileIdentityCard
                    accountId={user?.account_id}
                    planTitle={user?.account_type?.title}
                    verificationStatus={user?.verification_status}
                    country={user?.country}
                    phone={user?.phone}
                  />
                  <ProfileContactCard
                    email={user?.email}
                    phone={user?.phone}
                  />
                  <ProfileTipsCard />
                  <ProfileQuickLinksCard />
                </div>
              </div>
            )}

            {/* ─────────────── SECURITY TAB ─────────────── */}
            {activeTab === "security" && (
              <div className="flex flex-col">
                <SecurityScoreCard />
                <TwoFactorSection />

                <section className="mb-6">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                      style={{
                        background: "rgba(0,223,162,0.1)",
                        color: "#00dfa2",
                      }}
                    >
                      <Lock className="h-[0.88rem] w-[0.88rem]" />
                    </div>
                    <h2 className="text-[1.05rem] font-extrabold text-[#eef2f7]">
                      Password &amp; Login
                    </h2>
                  </div>
                  <PasswordChangeCard />
                </section>

                <AccountActionsCard />
                <LoginActivityCard />
                <TrustBadgesFooter />
              </div>
            )}

            {/* ─────────────── VERIFICATION TAB ─────────────── */}
            {activeTab === "verification" && (
              <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
                <VerificationOverviewCard
                  verificationStatus={user?.verification_status}
                />
                <div className="flex flex-col gap-3.5">
                  <AccountSnapshotCard
                    firstName={user?.first_name}
                    lastName={user?.last_name}
                    email={user?.email}
                    avatar={user?.avatar}
                    accountId={user?.account_id}
                    planTitle={user?.account_type?.title}
                    verificationStatus={user?.verification_status}
                  />
                  <ProfileTipsCard />
                  <SettingsQuickLinksCard />
                </div>
              </div>
            )}

            {/* ─────────────── PREFERENCES TAB ─────────────── */}
            {activeTab === "preferences" && (
              <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
                <PreferencesPanel />
                <div className="flex flex-col gap-3.5">
                  <SettingsTipsCard />
                  <div
                    className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5"
                    style={{
                      background:
                        "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
                    }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#00dfa2]" />
                      <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
                        Note
                      </span>
                    </div>
                    <p className="text-[0.72rem] leading-relaxed text-[#4a5468]">
                      Toggles on this tab are visual previews — preferences
                      sync will be enabled when the corresponding backend is
                      available. Theme, currency, and language already persist
                      via the Overview tab.
                    </p>
                  </div>
                  <HelpSupportCard />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
