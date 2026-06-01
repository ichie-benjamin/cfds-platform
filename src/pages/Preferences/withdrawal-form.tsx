import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useDataStore from "@/store/dataStore";
import useUserStore from "@/store/userStore";
import { WireTransferConfirmationModal } from "@/components/withdrawal/WireTransferConfirmationModal.tsx";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TriangleAlert,
  ChartPie,
  Coins,
  Info,
  ShieldCheck,
  CircleCheck,
  Wallet as WalletIcon,
  Gift,
  Trophy,
  ChartLine,
  Truck,
  Star,
  BadgeCheck,
} from "lucide-react";
import { WithdrawalModeBar } from "@/components/withdrawal/WithdrawalModeBar";
import { CoinGrid } from "@/components/withdrawal/CoinGrid";
import { WithdrawalSummary } from "@/components/withdrawal/WithdrawalSummary";
import { ProcessingTimeline } from "@/components/withdrawal/ProcessingTimeline";
import { PenaltySchedule } from "@/components/withdrawal/PenaltySchedule";
import { StakedWithdrawalPanel } from "@/components/withdrawal/StakedWithdrawalPanel";
import { WithdrawalFAQ } from "@/components/withdrawal/WithdrawalFAQ";
import { ContributePanel } from "@/components/deposit/ContributePanel";
import type { WalletView } from "@/components/wallet/WalletSidebar";
import { MarketSidebar } from "@/components/market/MarketSidebar";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { WalletOverviewPanel } from "@/components/wallet/WalletOverviewPanel";
import { WalletOverviewExtras } from "@/components/wallet/WalletOverviewExtras";
import { WalletGoldPanel } from "@/components/wallet/WalletGoldPanel";
import { WalletTransactionHistory } from "@/components/wallet/WalletTransactionHistory";
import { GoldTierBanner } from "@/components/wallet/GoldTierBanner";
import { WalletThemeStyles } from "@/components/wallet/WalletThemeStyles";
import { TierUpgradeAlert } from "@/components/wallet/TierUpgradeAlert";

// ── Schemas (unchanged) ──────────────────────────────────────────────

const baseWithdrawalSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  method: z.string().min(1, "Payment method is required"),
});

const cryptoWithdrawalSchema = baseWithdrawalSchema.extend({
  network: z.string().min(1, "Network is required"),
  wallet_address: z.string().min(1, "Wallet address is required"),
  // These fields should not be included in crypto validation
  bank_name: z.string().optional(),
  bank_address: z.string().optional(),
  iban_number: z.string().optional(),
  account_number: z.string().optional(),
  account_name: z.string().optional(),
  swiftcode: z.string().optional(),
});

const wireTransferWithdrawalSchema = baseWithdrawalSchema.extend({
  bank_name: z.string().min(1, "Bank name is required"),
  bank_address: z.string().min(1, "Bank address is required"),
  account_number: z.string().min(1, "Account number is required"),
  account_name: z.string().min(1, "Account name is required"),
  iban_number: z.string().optional(),
  swiftcode: z.string().optional(),
  // These fields should not be included in wire transfer validation
  network: z.string().optional(),
  wallet_address: z.string().optional(),
});

const combinedSchema = z.discriminatedUnion("method", [
  cryptoWithdrawalSchema.extend({ method: z.literal("crypto") }),
  wireTransferWithdrawalSchema.extend({ method: z.literal("wire_transfer") }),
]);

type WithdrawalFormData = z.infer<typeof combinedSchema>;

// ── Component ────────────────────────────────────────────────────────

export default function WithdrawalForm() {
  const { data, fetchData } = useDataStore();
  const user = useUserStore((state) => state.user);
  const availableBalance = user?.balance || 0;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formValues, setFormValues] = useState<WithdrawalFormData | null>(null);

  // UI-only state (does NOT overlap with any submitted form field)
  const [activeMode, setActiveMode] = useState<"deposit" | "withdraw">("withdraw");
  const [clientMode, setClientMode] = useState<"fresh" | "staked">("fresh");
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [selectedCoinName, setSelectedCoinName] = useState("Bitcoin");

  // New UI-only view state for wallet panels (HTML match)
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialView: WalletView =
    tabParam === "deposit" || tabParam === "dep"
      ? "dep"
      : tabParam === "withdraw" || tabParam === "wit"
        ? "wit"
        : tabParam === "gold" || tabParam === "overview"
          ? (tabParam as WalletView)
          : "overview";
  const [viewMode, setViewMode] = useState<WalletView>(initialView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reference-parity UI-only state (does NOT affect submission)
  type WitAccount = "available" | "bonus" | "reward" | "total";
  const [selectedWitAccount, setSelectedWitAccount] =
    useState<WitAccount>("available");

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      amount: "",
      method: "crypto",
      network: "",
      wallet_address: "",
      bank_name: "",
      bank_address: "",
      account_number: "",
      account_name: "",
      swiftcode: "",
      iban_number: "",
    },
  });

  const method = form.watch("method");
  const watchedAmount = form.watch("amount");
  const watchedNetwork = form.watch("network");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set default network if available
  useEffect(() => {
    if (data?.crypto_networks?.length) {
      const currentNetwork = form.getValues("network");
      if (!currentNetwork) {
        form.setValue("network", data.crypto_networks[0], {
          shouldValidate: true,
        });
      }
    }
  }, [data?.crypto_networks, form]);

  // Hide the parent MainLayout header + sidebar while this page is mounted
  useEffect(() => {
    document.body.classList.add("wallet-active");
    return () => {
      document.body.classList.remove("wallet-active");
    };
  }, []);

  // Keep activeMode (deposit/withdraw) in sync with viewMode so existing
  // withdrawal/deposit logic still drives the form behaviour exactly as before.
  useEffect(() => {
    if (viewMode === "dep") setActiveMode("deposit");
    else if (viewMode === "wit") setActiveMode("withdraw");
  }, [viewMode]);

  // This function prepares the form submission and shows modal for wire transfers
  async function onSubmit(values: WithdrawalFormData) {
    if (values.method === "wire_transfer") {
      setFormValues(values);
      setShowConfirmationModal(true);
      return;
    }

    // For crypto withdrawals, proceed directly
    await submitWithdrawal(values);
  }

  // This function actually submits the form data
  async function submitWithdrawal(values: WithdrawalFormData) {
    try {
      setIsSubmitting(true);
      await axiosInstance.post("/user/withdrawal/store", values);
      toast.success("Withdrawal request submitted successfully");
      form.reset();
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: unknown) {
      // Extract error message from API response
      let errorMessage = "Failed to submit withdrawal request";

      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };

      if (err?.response?.data) {
        const responseData = err.response.data;
        errorMessage = responseData.message || responseData.error || errorMessage;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setShowConfirmationModal(false);
    }
  }

  // Handle confirmation from the modal
  const handleConfirm = () => {
    if (formValues) {
      submitWithdrawal(formValues);
    }
  };

  const handleCoinSelect = (symbol: string, name: string, network: string) => {
    setSelectedCoin(symbol);
    setSelectedCoinName(name);
    // Sync to react-hook-form so the submitted payload always matches the UI
    form.setValue("network", network, { shouldValidate: true });
  };

  type Tab = {
    id: WalletView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  };
  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: ChartPie },
    { id: "dep", label: "Deposit", icon: ArrowDownToLine },
    { id: "wit", label: "Withdraw", icon: ArrowUpFromLine },
    { id: "gold", label: "Physical Gold", icon: Coins, tag: "Elite" },
  ];

  return (
    <>
      <WalletThemeStyles />

      <div
        className="wallet-root fixed inset-0 z-30 flex flex-col"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
        }}
      >
        {/* Platform ticker bar (kept) */}
        <TickerBar />

        {/* Platform navbar (kept) */}
        <DashboardNavbar />

        {/* Layout: platform sidebar + main */}
        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <MarketSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="wmain overflow-y-auto" style={{ maxHeight: "100%" }}>
            {/* Page Head */}
            <div className="pg-head">
              <h1>
                <ChartPie
                  className="h-4 w-4"
                  style={{ color: "var(--accent)" }}
                />
                My Wallet
              </h1>
              <p>Manage your portfolio, deposit, and withdraw funds</p>
            </div>

            {/* Mode Switch (5 tabs) */}
            <div className="mode-switch">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = viewMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id)}
                    className={`ms-btn ${active ? "on" : ""}`}
                  >
                    <Icon className="h-[0.82rem] w-[0.82rem]" />
                    <span>{tab.label}</span>
                    {tab.tag && <span className="ms-tag">{tab.tag}</span>}
                  </button>
                );
              })}
            </div>

            {/* Gold tier banner (conditional on user.balance) */}
            <GoldTierBanner />

            {/* Tier upgrade banner — UI-only, derived from user.balance */}
            {viewMode === "dep" && <TierUpgradeAlert />}

            {/* ═══ OVERVIEW VIEW ═══ */}
            {viewMode === "overview" && (
              <>
                <WalletOverviewPanel />
                <WalletOverviewExtras />
              </>
            )}

            {/* ═══ GOLD VIEW ═══ */}
            {viewMode === "gold" && (
              <div className="wgrid-split">
                <div>
                  <WalletGoldPanel />
                </div>
                <div className="flex flex-col gap-3">
                  {/* Delivery Process (sidebar — matches reference) */}
                  <div className="rounded-[10px] border border-[rgba(61,219,169,0.3)] bg-[rgba(255,255,255,0.025)] p-3.5">
                    <div className="mb-2.5 flex items-center gap-2 text-[0.78rem] font-bold text-[#eef2f7]">
                      <Truck className="h-3.5 w-3.5 text-[#3DDBA9]" />
                      Delivery Process
                    </div>
                    <div className="flex flex-col">
                      {[
                        { t: "Order Placed", d: "Funds deducted, order forwarded to our Swiss vault partner." },
                        { t: "Compliance Review", d: "FINMA anti-money-laundering review — completed within 24h." },
                        { t: "Bar Allocated & Sealed", d: "Your specific bar is allocated with serial number and assay certificate." },
                        { t: "Brinks Insured Dispatch", d: "Shipped via Brinks Global Services with full insurance and tracking." },
                        { t: "Signature Delivery", d: "Delivered to your address, signature required upon receipt." },
                      ].map((s, i, arr) => (
                        <div key={s.t} className="relative flex gap-2.5 py-2">
                          {i < arr.length - 1 && (
                            <span className="absolute left-[11px] top-[34px] bottom-0 w-[1.5px] bg-[rgba(61,219,169,0.3)]" />
                          )}
                          <div className="z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[rgba(61,219,169,0.3)] bg-[rgba(61,219,169,0.1)] text-[0.62rem] font-extrabold text-[#6EECC4]">
                            {i + 1}
                          </div>
                          <div>
                            <div className="mb-[1px] text-[0.75rem] font-bold text-[#eef2f7]">{s.t}</div>
                            <div className="text-[0.65rem] leading-[1.5] text-[#4d5b6e]">{s.d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gold Specification (existing card) */}
                  <div className="icard" style={{ borderColor: "rgba(61,219,169,0.3)" }}>
                    <div className="icard-title">
                      <BadgeCheck className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                      Gold Specification
                    </div>
                    <div className="ic-row"><span className="ic-k">Purity</span><span className="ic-v" style={{ color: "var(--accent-light)" }}>999.9 Fine (24K)</span></div>
                    <div className="ic-row"><span className="ic-k">Certification</span><span className="ic-v">LBMA Good Delivery</span></div>
                    <div className="ic-row"><span className="ic-k">Refinery</span><span className="ic-v">PAMP Suisse</span></div>
                    <div className="ic-row"><span className="ic-k">Bar Origin</span><span className="ic-v">Switzerland / UK</span></div>
                    <div className="ic-row"><span className="ic-k">Insurance</span><span className="ic-v" style={{ color: "var(--accent)" }}>100% via Brinks</span></div>
                    <div className="ic-row"><span className="ic-k">Assay Certificate</span><span className="ic-v" style={{ color: "var(--accent)" }}>Included</span></div>
                    <div className="ic-row"><span className="ic-k">Serial Number</span><span className="ic-v" style={{ color: "var(--accent)" }}>Unique per bar</span></div>
                  </div>

                  {/* Diamond Eligibility (matches reference) */}
                  <div className="rounded-[10px] border border-[rgba(61,219,169,0.3)] bg-gradient-to-br from-[rgba(61,219,169,.05)] to-[rgba(6,10,20,.8)] p-3.5">
                    <div className="mb-2.5 flex items-center gap-2 text-[0.78rem] font-bold text-[#eef2f7]">
                      <Star className="h-3.5 w-3.5 text-[#3DDBA9]" />
                      Diamond Eligibility
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        "Minimum $100,000 total deposit balance required.",
                        "KYC Level 3 verification with address proof.",
                        "Account must be active for at least 30 days.",
                        "Maximum 3 gold withdrawals per calendar month.",
                      ].map((line) => (
                        <div key={line} className="flex items-start gap-2.5">
                          <CircleCheck className="mt-[3px] h-3 w-3 shrink-0 text-[#3DDBA9]" />
                          <p className="text-[0.75rem] leading-[1.6] text-[#6b7a90]">{line}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3.5 flex items-center gap-2.5 rounded-[9px] border border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.08)] px-3.5 py-3">
                      <CircleCheck className="h-3.5 w-3.5 text-[#3DDBA9]" />
                      <span className="text-[0.78rem] font-bold text-[#3DDBA9]">
                        Your account qualifies — balance: ${(user?.balance ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ DEPOSIT VIEW — full width, no sidebar (matches reference) ═══ */}
            {viewMode === "dep" && (
              <>
                {activeMode === "withdraw" && (
                  <WithdrawalModeBar
                    clientMode={clientMode}
                    onModeChange={setClientMode}
                  />
                )}
                <ContributePanel
                  onDepositSuccess={() => setRefreshTrigger((p) => p + 1)}
                />
              </>
            )}

            {/* ═══ WITHDRAW VIEW (4 numbered steps + sidebar — matches reference) ═══ */}
            {viewMode === "wit" && (
              <div className="wgrid-split">
                {/* LEFT COLUMN */}
                <div>
                  {/* Step dots indicator (Tailwind, matches reference) */}
                  <div className="mb-3.5 flex items-center justify-center gap-2">
                    <span className="h-2 w-6 rounded-[4px] bg-[#3DDBA9] shadow-[0_0_8px_rgba(61,219,169,0.45)]" />
                    <span className="h-2 w-2 rounded-full border border-white/[0.10] bg-white/[0.10]" />
                    <span className="h-2 w-2 rounded-full border border-white/[0.10] bg-white/[0.10]" />
                    <span className="h-2 w-2 rounded-full border border-white/[0.10] bg-white/[0.10]" />
                  </div>

                  <WithdrawalModeBar
                    clientMode={clientMode}
                    onModeChange={setClientMode}
                  />

                  {clientMode === "fresh" ? (
                    <>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-0"
                        >
                          {/* STEP 1: Select Asset & Network */}
                          <div className="scard">
                            <div className="scard-title">
                              <span className="scard-step">1</span>
                              Select Asset & Network
                            </div>
                            <div className="field">
                              <CoinGrid
                                selectedCoin={selectedCoin}
                                formNetwork={watchedNetwork || ""}
                                onCoinSelect={handleCoinSelect}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="network"
                              render={({ field }) => (
                                <FormItem className="field">
                                  <div className="flabel">Network</div>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-[0.82rem] text-[#eef2f7] focus:ring-0 focus:border-[rgba(61,219,169,0.5)]">
                                        <SelectValue placeholder="Select network" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="border-white/[0.08] bg-[#0a0d15]">
                                      {data?.crypto_networks?.map(
                                        (network) => (
                                          <SelectItem
                                            key={network}
                                            value={network}
                                          >
                                            {network}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* STEP 2: Select Withdrawal Account (UI-only, reference parity) */}
                          <div className="scard">
                            <div className="scard-title">
                              <span className="scard-step">2</span>
                              Select Withdrawal Account
                            </div>
                            <div className="mb-3 text-[0.7rem] leading-[1.5] text-[#6b7a90]">
                              Choose the account you want to withdraw funds from. Different accounts have different withdrawal conditions.
                            </div>
                            <div className="wit-acct-grid">
                              {([
                                {
                                  id: "available" as const,
                                  name: "Available Balance",
                                  desc: "Funds ready for instant withdrawal",
                                  amount: `$${(user?.balance ?? 0).toLocaleString()}`,
                                  Icon: WalletIcon,
                                  iconColor: "#6EECC4",
                                  iconBg:
                                    "linear-gradient(145deg,rgba(61,219,169,.2),rgba(61,219,169,.08))",
                                  iconBorder: "rgba(61,219,169,.3)",
                                },
                                {
                                  id: "bonus" as const,
                                  name: "Bonus Balance",
                                  desc: "Promotional and referral bonuses",
                                  amount: "$0.00",
                                  Icon: Gift,
                                  iconColor: "#d4f06a",
                                  iconBg:
                                    "linear-gradient(145deg,rgba(200,230,78,.18),rgba(200,230,78,.06))",
                                  iconBorder: "rgba(200,230,78,.3)",
                                },
                                {
                                  id: "reward" as const,
                                  name: "Reward Balance",
                                  desc: "Earning rewards",
                                  amount: "$0.00",
                                  Icon: Trophy,
                                  iconColor: "#7ba8f5",
                                  iconBg:
                                    "linear-gradient(145deg,rgba(91,141,239,.18),rgba(91,141,239,.06))",
                                  iconBorder: "rgba(91,141,239,.3)",
                                },
                                {
                                  id: "total" as const,
                                  name: "Trade Balance",
                                  desc: "Withdraw from active trade portfolio",
                                  amount: `$${(user?.balance ?? 0).toLocaleString()}`,
                                  Icon: ChartLine,
                                  iconColor: "#f0be6a",
                                  iconBg:
                                    "linear-gradient(145deg,rgba(232,169,77,.18),rgba(232,169,77,.06))",
                                  iconBorder: "rgba(232,169,77,.3)",
                                },
                              ] as const).map((acct) => {
                                const Icon = acct.Icon;
                                const isOn = selectedWitAccount === acct.id;
                                return (
                                  <button
                                    key={acct.id}
                                    type="button"
                                    onClick={() => setSelectedWitAccount(acct.id)}
                                    className={`wit-acct-opt ${isOn ? "on" : ""}`}
                                  >
                                    <div
                                      className="wao-icon"
                                      style={{
                                        background: acct.iconBg,
                                        borderColor: acct.iconBorder,
                                      }}
                                    >
                                      <Icon
                                        className="h-3.5 w-3.5"
                                        style={{
                                          color: acct.iconColor,
                                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
                                        }}
                                      />
                                    </div>
                                    <div className="wao-info">
                                      <div className="wao-name">{acct.name}</div>
                                      <div className="wao-desc">{acct.desc}</div>
                                    </div>
                                    <div className="wao-amount">{acct.amount}</div>
                                    <div className="wao-check">
                                      <CircleCheck className="h-3 w-3" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* STEP 3: Withdrawal Method & Bank Details */}
                          <div className="scard">
                            <div className="scard-title">
                              <span className="scard-step">3</span>
                              Withdrawal Method
                            </div>
                            <FormField
                              control={form.control}
                              name="method"
                              render={({ field }) => (
                                <FormItem className="field">
                                  <div className="flabel">Payment Method</div>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-[0.82rem] text-[#eef2f7] focus:ring-0 focus:border-[rgba(61,219,169,0.5)]">
                                        <SelectValue placeholder="Select payment method" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="border-white/[0.08] bg-[#0a0d15]">
                                      <SelectItem value="crypto">
                                        Cryptocurrency
                                      </SelectItem>
                                      <SelectItem value="wire_transfer">
                                        Wire Transfer
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Crypto fields */}
                            {method === "crypto" && (
                              <FormField
                                control={form.control}
                                name="wallet_address"
                                render={({ field }) => (
                                  <FormItem className="field">
                                    <div className="flabel">
                                      Destination Wallet Address
                                    </div>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter your external wallet address (e.g. bc1q...)"
                                        {...field}
                                        className="font-mono text-[0.78rem]"
                                      />
                                    </FormControl>
                                    <div
                                      className="mt-1.5 flex items-center gap-1"
                                      style={{
                                        fontSize: ".7rem",
                                        color: "var(--t3)",
                                      }}
                                    >
                                      <TriangleAlert
                                        className="h-3 w-3"
                                        style={{ color: "var(--orange)" }}
                                      />
                                      Double-check the address and network.
                                      Transactions cannot be reversed.
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            {/* Wire transfer fields */}
                            {method === "wire_transfer" && (
                              <div className="space-y-0">
                                <FormField
                                  control={form.control}
                                  name="bank_name"
                                  render={({ field }) => (
                                    <FormItem className="field">
                                      <div className="flabel">Bank Name</div>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter bank name"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="bank_address"
                                  render={({ field }) => (
                                    <FormItem className="field">
                                      <div className="flabel">Bank Address</div>
                                      <FormControl>
                                        <Input
                                          placeholder="Enter bank address"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="wgrid-2">
                                  <FormField
                                    control={form.control}
                                    name="account_number"
                                    render={({ field }) => (
                                      <FormItem className="field">
                                        <div className="flabel">
                                          Account Number
                                        </div>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter account number"
                                            {...field}
                                            className="font-mono"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="account_name"
                                    render={({ field }) => (
                                      <FormItem className="field">
                                        <div className="flabel">
                                          Account Name
                                        </div>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter account name"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <div className="wgrid-2">
                                  <FormField
                                    control={form.control}
                                    name="iban_number"
                                    render={({ field }) => (
                                      <FormItem className="field">
                                        <div className="flabel">
                                          IBAN Number
                                        </div>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter IBAN Number"
                                            {...field}
                                            className="font-mono"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="swiftcode"
                                    render={({ field }) => (
                                      <FormItem className="field">
                                        <div className="flabel">Swift Code</div>
                                        <FormControl>
                                          <Input
                                            placeholder="Enter SWIFT code"
                                            {...field}
                                            className="font-mono"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* STEP 4: Withdrawal Details */}
                          <div className="scard">
                            <div className="scard-title">
                              <span className="scard-step">4</span>
                              Withdrawal Details
                            </div>

                            <FormField
                              control={form.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem className="field">
                                  <div className="flabel">
                                    Amount{" "}
                                    <small>
                                      Available: ${availableBalance.toLocaleString()}
                                    </small>
                                  </div>
                                  <FormControl>
                                    <div className="finput">
                                      <Input
                                        placeholder="0.00"
                                        {...field}
                                        type="number"
                                        className="font-mono pr-12"
                                      />
                                      <span
                                        className="input-max"
                                        onClick={() =>
                                          form.setValue(
                                            "amount",
                                            String(availableBalance),
                                            { shouldValidate: true },
                                          )
                                        }
                                      >
                                        MAX
                                      </span>
                                    </div>
                                  </FormControl>
                                  <div className="presets">
                                    {["1000", "5000", "10000"].map((v) => (
                                      <span
                                        key={v}
                                        className="preset"
                                        onClick={() =>
                                          form.setValue("amount", v, {
                                            shouldValidate: true,
                                          })
                                        }
                                      >
                                        ${Number(v).toLocaleString()}
                                      </span>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <WithdrawalSummary
                              coinSymbol={selectedCoin}
                              coinName={selectedCoinName}
                              amount={watchedAmount || "0"}
                              network={watchedNetwork || ""}
                            />

                            <div className="step-nav" style={{ marginTop: 14 }}>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-sub btn-wit"
                                style={{ flex: 1 }}
                              >
                                <ArrowUpFromLine className="h-4 w-4" />
                                {isSubmitting
                                  ? "Submitting..."
                                  : "Submit Withdrawal"}
                              </button>
                              <button
                                type="button"
                                onClick={() => form.reset()}
                                className="btn-sub btn-outline"
                                style={{ flex: "0 0 auto", padding: "10px 18px" }}
                              >
                                Reset
                              </button>
                            </div>
                            <p
                              style={{
                                textAlign: "center",
                                fontSize: ".72rem",
                                color: "var(--t4)",
                                marginTop: 8,
                              }}
                            >
                              <ShieldCheck
                                className="inline h-3 w-3"
                                style={{ color: "var(--accent)", marginRight: 4 }}
                              />
                              Secured with 256-bit SSL
                            </p>
                          </div>
                        </form>
                      </Form>

                      <ProcessingTimeline />
                    </>
                  ) : (
                    <StakedWithdrawalPanel />
                  )}

                  <WithdrawalFAQ />
                </div>

                {/* RIGHT COLUMN */}
                <div>
                  <div className="icard">
                    <div className="icard-title">
                      <Info
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--accent)" }}
                      />
                      Withdrawal Info
                    </div>
                    <div className="ic-row"><span className="ic-k">Min. Withdrawal</span><span className="ic-v">0.0002 BTC</span></div>
                    <div className="ic-row"><span className="ic-k">Platform Fee</span><span className="ic-v" style={{ color: "var(--accent)" }}>0% Free</span></div>
                    <div className="ic-row"><span className="ic-k">Network Fee</span><span className="ic-v" style={{ color: "var(--t2)" }}>~0.00005 BTC</span></div>
                    <div className="ic-row"><span className="ic-k">Processing</span><span className="ic-v">15 - 60 min</span></div>
                    <div className="ic-row"><span className="ic-k">Daily Limit</span><span className="ic-v">$25,000</span></div>
                    <div className="ic-row"><span className="ic-k">Monthly Limit</span><span className="ic-v">$500,000</span></div>
                    <div className="lbar-wrap">
                      <div className="lb-head">
                        <span className="lb-lbl">Daily Used</span>
                        <span className="lb-val">$8,500 / $25,000</span>
                      </div>
                      <div className="lb-track">
                        <div className="lb-fill" style={{ width: "34%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="icard">
                    <div className="icard-title">
                      <ShieldCheck
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--accent)" }}
                      />
                      Security
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      <div style={{ display: "flex", gap: 9 }}>
                        <CircleCheck
                          className="mt-[3px] h-3 w-3 shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                        <p style={{ fontSize: ".75rem", color: "var(--t3)", lineHeight: 1.6 }}>
                          Withdrawals over $10,000 require email confirmation.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <CircleCheck
                          className="mt-[3px] h-3 w-3 shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                        <p style={{ fontSize: ".75rem", color: "var(--t3)", lineHeight: 1.6 }}>
                          New addresses are whitelisted for 24h before first use.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <TriangleAlert
                          className="mt-[3px] h-3 w-3 shrink-0"
                          style={{ color: "var(--orange)" }}
                        />
                        <p style={{ fontSize: ".75rem", color: "var(--t2)", lineHeight: 1.6 }}>
                          Crypto transactions are irreversible. Verify address before confirming.
                        </p>
                      </div>
                    </div>
                  </div>

                  {activeMode === "withdraw" && <PenaltySchedule />}
                </div>
              </div>
            )}

            {/* Shared bottom Transaction History — visible on ALL tabs (matches reference) */}
            <WalletTransactionHistory key={refreshTrigger} />

            {/* Shared bottom Risk Warning — visible on ALL tabs (matches reference) */}
            <div className="risk-bar">
              <TriangleAlert
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: "var(--orange)", marginTop: 2 }}
              />
              <p>
                <strong style={{ color: "var(--orange)" }}>Risk Warning:</strong>{" "}
                Digital asset trading carries a high level of risk. The value of
                cryptocurrencies can fluctuate significantly and you may lose some
                or all of your invested capital. Physical gold values also fluctuate
                with market conditions.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Wire Transfer Confirmation Modal */}
      <WireTransferConfirmationModal
        open={showConfirmationModal}
        isCard={false}
        onOpenChange={setShowConfirmationModal}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
