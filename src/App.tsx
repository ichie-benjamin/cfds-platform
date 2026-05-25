import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { BaseLayout } from "@/components/BaseLayout.tsx";
import { SiteProvider } from "@/components/provider/SiteProvider.tsx";
import LoadingScreen from "./components/loading-screen";
import WebSocketInitializer from "@/components/WebSocketInitializer.tsx";
import useSiteSettingsStore from "@/store/siteSettingStore";
import { OnlineStatusInitializer } from "@/components/OnlineStatusInitializer.tsx";
import { ChatNotificationListener } from "@/components/ChatNotificationListener.tsx";
import TranslationErrorBoundary from "@/components/TranslationErrorBoundary.tsx";
import LiveTraderStatusWatcher from "@/components/LiveTraderStatusWatcher";

const TradingRouter = lazy(() => import("./components/routing/TradingRouter"));
const AdminChat = lazy(() => import("@/pages/admin/AdminChat.tsx"));
const AutoLoginPage = lazy(() => import("./pages/auth/auto-login"));
const SignUpPage = lazy(() => import("@/pages/auth/signup-page.tsx"));
const CountryResidencePage = lazy(() => import("@/pages/auth/country-page.tsx"));
const Test = lazy(() => import("./pages/test"));
const RegisterPage = lazy(() => import("./pages/auth/register-page"));
const LoginPage = lazy(() => import("./pages/auth/login-page"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/forgot-password-page"),
);
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const MarketplacePage = lazy(() => import("@/pages/marketplace/marketplace-page.tsx"));
const MarketPage = lazy(() => import("@/pages/market/MarketPage"));
const MT4Layout = lazy(() => import("./layouts/MT4Layout"));
const MainContent = lazy(() => import("./components/mt4/main-content"));
const PersonalInformation = lazy(
  () => import("./pages/Preferences/PersonalInformation"),
);
const NotFound = lazy(() => import("./pages/NotFound"));
const TradingDashboard = lazy(
  () => import("./pages/Preferences/TradingDashboard"),
);
const WithdrawalForm = lazy(
  () => import("./pages/Preferences/withdrawal-form"),
);
const AccountsPage = lazy(() => import("./pages/Preferences/accounts-page"));
const LiveChat = lazy(() => import("./pages/Preferences/live-chat"));
const SettingsPage = lazy(() => import("./pages/Preferences/settings-page"));
const SecurityPage = lazy(() => import("./pages/Preferences/security-page"));
const KYCWelcomePage = lazy(() => import("./pages/Preferences/kyc-welcome-page"));
const KYCFlowPage = lazy(() => import("./pages/Preferences/kyc-flow-page"));
const KYCAwaitingPage = lazy(() => import("./pages/Preferences/kyc-awaiting-page"));
const SavingsPage = lazy(() => import("./pages/Preferences/savings-page"));
const DepositHistoryPage = lazy(
  () => import("./pages/Preferences/deposit-history-page"),
);
const KYCPartners = lazy(() => import("./pages/Preferences/KYCPartners"));
const TradingPlansPage = lazy(
  () => import("./pages/Preferences/trading-plans-page"),
);
const TradeAccessPage = lazy(
  () => import("./pages/Preferences/trade-access-page"),
);
const FundManagersPage = lazy(
  () => import("./pages/Preferences/fund-managers-page"),
);
const FundProtectionPage = lazy(
  () => import("./pages/Preferences/fund-protection-page"),
);
const SocialResponsibilityPage = lazy(
  () => import("./pages/Preferences/social-responsibility-page"),
);
const WelcomeBonusPage = lazy(
  () => import("./pages/Preferences/welcome-bonus-page"),
);
const ReferralPage = lazy(
  () => import("./pages/Preferences/referral-page"),
);
const ManagedPortfolioPage = lazy(
  () => import("./pages/Preferences/managed-portfolio-page"),
);
const RewardsPage = lazy(
  () => import("./pages/Preferences/rewards-page"),
);
const TradingPlatformLight = lazy(() =>
  import("./components/mt4-light/trading-platform-light").then((module) => ({
    default: module.TradingPlatformLight,
  })),
);

const queryClient = new QueryClient();

const App = () => {
  const settings = useSiteSettingsStore((state) => state.settings);

  // Update favicon when settings change
  useEffect(() => {
    if (settings?.favicon) {
      const link =
        (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = settings.favicon;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
  }, [settings?.favicon]);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingScreen />}>
        <Toaster position="top-right" />
        <BrowserRouter>
          <SiteProvider>
            <BaseLayout>
              <TranslationErrorBoundary>
                <WebSocketInitializer />
                <OnlineStatusInitializer />
                <ChatNotificationListener />
                <LiveTraderStatusWatcher />
                <Routes>
                  <Route
                    path="/admin/chat"
                    element={
                      <ProtectedRoute>
                        <AdminChat />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/main"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      index
                      element={<Navigate to="/main/dashboard" replace />}
                    />
                    <Route
                      path="/main/dashboard"
                      element={<TradingDashboard />}
                    />
                    <Route
                      path="/main/personal"
                      element={<PersonalInformation />}
                    />

                    <Route
                      path="/main/deposit/*"
                      element={
                        <Navigate
                          to="/main/withdrawal?tab=deposit"
                          replace
                        />
                      }
                    />

                    <Route
                      path="/main/market"
                      element={<MarketPage />}
                    />
                    <Route
                      path="/main/marketplace"
                      element={<MarketplacePage />}
                    />

                    {/* Placeholder routes for other sections */}
                    <Route
                      path="/main/withdrawal"
                      element={<WithdrawalForm />}
                    />
                    <Route
                      path="/main/wallet"
                      element={<WithdrawalForm />}
                    />
                    <Route
                      path="/main/deposit-history"
                      element={<DepositHistoryPage />}
                    />
                    <Route
                      path="/main/verification"
                      element={<Navigate to="/main/kyc" replace />}
                    />
                    <Route
                      path="/main/kyc-partners"
                      element={<KYCPartners />}
                    />
                    <Route path="/main/accounts" element={<AccountsPage />} />
                    <Route path="/main/chat" element={<LiveChat />} />
                    <Route path="/main/savings" element={<SavingsPage />} />
                    <Route path="/main/settings" element={<SettingsPage />} />
                    <Route path="/main/security" element={<SecurityPage />} />
                    <Route path="/main/kyc" element={<KYCWelcomePage />} />
                    <Route path="/main/kyc/flow" element={<KYCFlowPage />} />
                    <Route path="/main/kyc/awaiting" element={<KYCAwaitingPage />} />
                    <Route
                      path="/main/trading-plans"
                      element={<TradingPlansPage />}
                    />
                    <Route
                      path="/main/trade-access"
                      element={<TradeAccessPage />}
                    />
                    <Route
                      path="/main/fund-managers"
                      element={<FundManagersPage />}
                    />
                    <Route
                      path="/main/fund-protection"
                      element={<FundProtectionPage />}
                    />
                    <Route
                      path="/main/social-responsibility"
                      element={<SocialResponsibilityPage />}
                    />
                    <Route
                      path="/main/welcome-bonus"
                      element={<WelcomeBonusPage />}
                    />
                    <Route
                      path="/main/referral"
                      element={<ReferralPage />}
                    />
                    <Route
                      path="/main/managed-portfolio"
                      element={<ManagedPortfolioPage />}
                    />
                    <Route
                      path="/main/rewards"
                      element={<RewardsPage />}
                    />
                    <Route path="/main/test" element={<Test />} />
                  </Route>

                  <Route
                    path="trading/*"
                    element={
                      <ProtectedRoute>
                        <TradingRouter />
                      </ProtectedRoute>
                    }
                  />

                  {/* Authentication Routes */}
                  <Route path="/auto-login" element={<AutoLoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/" element={<LoginPage />} />
                  <Route
                    path="/register/country-residence"
                    element={<CountryResidencePage />}
                  />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />

                  <Route
                    path="/mt4"
                    element={
                      <ProtectedRoute>
                        <MT4Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<MainContent />} />
                  </Route>

                  <Route
                    path="mt4-light"
                    element={
                      <ProtectedRoute>
                        <TradingPlatformLight />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TranslationErrorBoundary>
            </BaseLayout>
          </SiteProvider>
        </BrowserRouter>
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
