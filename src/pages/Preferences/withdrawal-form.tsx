import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useState, useEffect, useRef, useMemo } from "react";
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
  ArrowLeft,
  ArrowRight,
  ClipboardPaste,
  Tag,
  Lock,
  Send,
  ChevronDown,
  X,
  Check,
  CircleAlert,
  Inbox,
  Clock,
  Plus,
  Mail,
} from "lucide-react";
import { WithdrawalModeBar } from "@/components/withdrawal/WithdrawalModeBar";
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

// ── Presentation-only metadata for the Withdraw wizard ───────────────
// Mirrors the COINS array in html_files/wallet (2).html. Used only for
// display (dropdown rows, network tabs, available label, fee preview).
// Does NOT change API payloads or stored values.
type WitCoinMeta = {
  sym: string;
  name: string;
  glyph: string;
  color: string;
  bg: string;
  price: string;
  bal: string;
  balanceLabel: string;
  networks: string[];
  witBal: number;
  fee: number;
};
const WIT_COINS: WitCoinMeta[] = [
  { sym: "BTC",   name: "Bitcoin",       glyph: "₿", color: "#F7931A", bg: "rgba(247,147,26,0.13)",  price: "$84,210", bal: "1.4800 BTC",   balanceLabel: "1.4800 BTC ($124,631)",  networks: ["Bitcoin (BTC)", "Lightning", "ERC-20"],                                       witBal: 1.48,    fee: 0.00005 },
  { sym: "ETH",   name: "Ethereum",      glyph: "Ξ", color: "#627EEA", bg: "rgba(98,126,234,0.13)",  price: "$3,182",  bal: "14.20 ETH",    balanceLabel: "14.20 ETH ($45,184)",    networks: ["ERC-20", "Base", "Arbitrum", "Optimism"],                                     witBal: 14.2,    fee: 0.001 },
  { sym: "USDT",  name: "Tether USD",    glyph: "₮", color: "#26A17B", bg: "rgba(38,161,123,0.13)",  price: "$1.00",   bal: "28,400 USDT",  balanceLabel: "28,400 USDT ($28,400)",  networks: ["ERC-20", "TRC-20", "BEP-20", "Solana", "Polygon", "Avalanche C-Chain", "Arbitrum", "Optimism"], witBal: 28400, fee: 1 },
  { sym: "BNB",   name: "BNB Chain",     glyph: "B", color: "#F3BA2F", bg: "rgba(243,186,47,0.13)",  price: "$608",    bal: "18.4 BNB",     balanceLabel: "18.4 BNB ($11,187)",     networks: ["BEP-20", "ERC-20"],                                                            witBal: 18.4,    fee: 0.001 },
  { sym: "SOL",   name: "Solana",        glyph: "◎", color: "#9945FF", bg: "rgba(153,69,255,0.13)",  price: "$182",    bal: "42.0 SOL",     balanceLabel: "42.0 SOL ($7,644)",      networks: ["Solana", "ERC-20"],                                                            witBal: 42,      fee: 0.00025 },
  { sym: "XRP",   name: "Ripple XRP",    glyph: "✕", color: "#00AAE4", bg: "rgba(0,170,228,0.13)",   price: "$2.18",   bal: "5,200 XRP",    balanceLabel: "5,200 XRP ($11,336)",    networks: ["XRP Ledger", "ERC-20"],                                                        witBal: 5200,    fee: 0.2 },
  { sym: "USDC",  name: "USD Coin",      glyph: "$", color: "#2775CA", bg: "rgba(39,117,202,0.13)",  price: "$1.00",   bal: "10,000 USDC",  balanceLabel: "10,000 USDC ($10,000)",  networks: ["ERC-20", "Solana", "BEP-20", "Polygon"],                                       witBal: 10000,   fee: 1 },
  { sym: "ADA",   name: "Cardano",       glyph: "A", color: "#0033AD", bg: "rgba(0,51,173,0.13)",    price: "$0.74",   bal: "12,400 ADA",   balanceLabel: "12,400 ADA ($9,176)",    networks: ["Cardano", "ERC-20"],                                                           witBal: 12400,   fee: 1 },
  { sym: "DOGE",  name: "Dogecoin",      glyph: "Ð", color: "#BA9F33", bg: "rgba(186,159,51,0.13)",  price: "$0.18",   bal: "4,200 DOGE",   balanceLabel: "4,200 DOGE ($756)",      networks: ["Dogecoin", "ERC-20"],                                                          witBal: 4200,    fee: 1 },
  { sym: "MATIC", name: "Polygon",       glyph: "M", color: "#8247E5", bg: "rgba(130,71,229,0.13)",  price: "$1.02",   bal: "2,800 MATIC",  balanceLabel: "2,800 MATIC ($2,856)",   networks: ["Polygon", "ERC-20"],                                                           witBal: 2800,    fee: 0.1 },
  { sym: "DOT",   name: "Polkadot",      glyph: "D", color: "#E6007A", bg: "rgba(230,0,122,0.13)",   price: "$9.84",   bal: "380 DOT",      balanceLabel: "380 DOT ($3,739)",       networks: ["Polkadot", "ERC-20"],                                                          witBal: 380,     fee: 0.1 },
  { sym: "AVAX",  name: "Avalanche",     glyph: "A", color: "#E84120", bg: "rgba(232,65,32,0.13)",   price: "$38.20",  bal: "120 AVAX",     balanceLabel: "120 AVAX ($4,584)",      networks: ["C-Chain", "X-Chain", "ERC-20"],                                                witBal: 120,     fee: 0.01 },
  { sym: "LINK",  name: "Chainlink",     glyph: "L", color: "#2A5ADA", bg: "rgba(42,90,218,0.13)",   price: "$18.40",  bal: "280 LINK",     balanceLabel: "280 LINK ($5,152)",      networks: ["ERC-20", "BEP-20"],                                                            witBal: 280,     fee: 0.1 },
  { sym: "UNI",   name: "Uniswap",       glyph: "U", color: "#FF007A", bg: "rgba(255,0,122,0.13)",   price: "$12.60",  bal: "150 UNI",      balanceLabel: "150 UNI ($1,890)",       networks: ["ERC-20"],                                                                      witBal: 150,     fee: 0.1 },
  { sym: "LTC",   name: "Litecoin",      glyph: "Ł", color: "#BFBBBB", bg: "rgba(191,187,187,0.13)", price: "$92",     bal: "22 LTC",       balanceLabel: "22 LTC ($2,024)",        networks: ["Litecoin", "ERC-20"],                                                          witBal: 22,      fee: 0.001 },
  { sym: "BCH",   name: "Bitcoin Cash",  glyph: "Ƀ", color: "#8DC351", bg: "rgba(141,195,81,0.13)",  price: "$480",    bal: "6 BCH",        balanceLabel: "6 BCH ($2,880)",         networks: ["Bitcoin Cash", "ERC-20"],                                                      witBal: 6,       fee: 0.001 },
  { sym: "XLM",   name: "Stellar",       glyph: "✶", color: "#14B6E7", bg: "rgba(20,182,231,0.13)",  price: "$0.14",   bal: "8,000 XLM",    balanceLabel: "8,000 XLM ($1,120)",     networks: ["Stellar", "ERC-20"],                                                           witBal: 8000,    fee: 0.00001 },
  { sym: "ATOM",  name: "Cosmos",        glyph: "⚛", color: "#6F7CBA", bg: "rgba(111,124,186,0.13)", price: "$10.20",  bal: "120 ATOM",     balanceLabel: "120 ATOM ($1,224)",      networks: ["Cosmos", "ERC-20"],                                                            witBal: 120,     fee: 0.005 },
  { sym: "TRX",   name: "TRON",          glyph: "T", color: "#EF0027", bg: "rgba(239,0,39,0.13)",    price: "$0.14",   bal: "18,000 TRX",   balanceLabel: "18,000 TRX ($2,520)",    networks: ["TRC-20", "ERC-20"],                                                            witBal: 18000,   fee: 1 },
  { sym: "FIL",   name: "Filecoin",      glyph: "F", color: "#42C1CA", bg: "rgba(66,193,202,0.13)",  price: "$5.80",   bal: "90 FIL",       balanceLabel: "90 FIL ($522)",          networks: ["Filecoin", "ERC-20"],                                                          witBal: 90,      fee: 0.001 },
];
const WIT_COIN_META: Record<string, WitCoinMeta> = Object.fromEntries(
  WIT_COINS.map((c) => [c.sym, c]),
);

// ── Cryptocurrency dropdown (Withdraw Step 1) ────────────────────────
// Mirrors the `coin-trigger` / `coin-menu` pattern from
// html_files/wallet (2).html (lines 1669-1683 + lines 218-243 CSS).
function WitCoinDropdown({
  selectedCoin,
  onSelect,
}: {
  selectedCoin: string;
  onSelect: (symbol: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      setSearch("");
    }
  }, [open]);

  const selected = WIT_COIN_META[selectedCoin] ?? WIT_COINS[0];
  const q = search.trim().toLowerCase();
  const list = q
    ? WIT_COINS.filter(
        (c) =>
          c.sym.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q),
      )
    : WIT_COINS;

  return (
    <div className="coin-drop-wrap" ref={wrapRef}>
      <div
        className={`coin-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <div
          className="ct-logo"
          style={{ background: selected.bg, color: selected.color }}
        >
          {selected.glyph}
        </div>
        <div className="ct-info">
          <div className="ct-sym">{selected.sym}</div>
          <div className="ct-name">{selected.name}</div>
        </div>
        <div
          className="ct-price"
          style={{ color: "var(--accent)", fontSize: ".75rem" }}
        >
          {selected.bal}
        </div>
        <ChevronDown className={`ct-arrow ${open ? "open" : ""} h-3 w-3`} />
      </div>
      <div className={`coin-menu ${open ? "open" : ""}`}>
        <div className="cm-search">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by name or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
        </div>
        <div className="cm-list" role="listbox">
          {list.length === 0 ? (
            <div className="cm-empty">No coins match “{search}”</div>
          ) : (
            list.map((coin) => (
              <div
                key={coin.sym}
                role="option"
                aria-selected={selectedCoin === coin.sym}
                className={`cm-item ${selectedCoin === coin.sym ? "sel" : ""}`}
                onClick={() => {
                  onSelect(coin.sym);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <span className="cm-sym" style={{ color: coin.color }}>
                  {coin.sym}
                </span>
                <span className="cm-nm">{coin.name}</span>
                <span className="cm-pr">{coin.price}</span>
                <span className="cm-bal">{coin.bal}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

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

  // Trade Balance gate acknowledgement — UI-only. Mirrors `witAcctApproved`
  // in the reference. Does NOT cancel real trades or call any API.
  const [witTradeAcknowledged, setWitTradeAcknowledged] = useState(false);

  // Snapshot of a successful withdrawal submission. When set, Step 3
  // renders the reference "Withdrawal Submitted" confirmation card
  // instead of the form. UI-only — captured AFTER the existing
  // submitWithdrawal API call succeeds; never replaces or fakes it.
  type WitSubmittedSnapshot = {
    coin: string;
    network: string;
    amount: string;
    address: string;
    fee: number;
  };
  const [witSubmittedSnapshot, setWitSubmittedSnapshot] =
    useState<WitSubmittedSnapshot | null>(null);
  // Wrapper that resets the acknowledgement on any account change
  const pickWitAccount = (id: WitAccount) => {
    setSelectedWitAccount(id);
    setWitTradeAcknowledged(false);
  };

  // Withdraw wizard UI-flow state (matches reference wallet (2).html)
  const [witStep, setWitStep] = useState<1 | 2 | 3>(1);
  const initialMeta = WIT_COIN_META["BTC"];
  const [selectedNetwork, setSelectedNetwork] = useState<string>(
    initialMeta.networks[0],
  );
  const [witMemo, setWitMemo] = useState<string>("");

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

  const watchedAmount = form.watch("amount");

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

  // Reset wizard to Step 1 whenever the Withdraw tab is (re)entered
  useEffect(() => {
    if (viewMode === "wit") {
      setWitStep(1);
      setWitTradeAcknowledged(false);
      setWitSubmittedSnapshot(null);
    }
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

      // Capture a snapshot for the confirmation panel BEFORE resetting the
      // form. UI-only — no extra API call, no fake processing.
      const meta = WIT_COIN_META[selectedCoin];
      setWitSubmittedSnapshot({
        coin: selectedCoin,
        network: selectedNetwork || values.network || "",
        amount: String(values.amount ?? "0"),
        address: String(values.wallet_address ?? ""),
        fee: meta?.fee ?? 0.00005,
      });

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

  const handleCoinSelect = (symbol: string) => {
    setSelectedCoin(symbol);
    // Pick the first network for this coin from the reference metadata, so
    // the network tabs in Step 1 always start on a valid value.
    const meta = WIT_COIN_META[symbol];
    const firstNet = meta?.networks[0] ?? selectedNetwork;
    setSelectedNetwork(firstNet);
    // Sync to react-hook-form so the submitted payload always matches the UI
    form.setValue("network", firstNet, { shouldValidate: true });
  };

  const handleNetworkSelect = (net: string) => {
    setSelectedNetwork(net);
    form.setValue("network", net, { shouldValidate: true });
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        form.setValue("wallet_address", text, { shouldValidate: true });
      }
    } catch {
      // Clipboard permission denied — silently ignore (matches reference UX).
    }
  };

  const setAmountPct = (pct: number) => {
    const meta = WIT_COIN_META[selectedCoin];
    if (!meta) return;
    const v = (meta.witBal * pct).toFixed(6);
    form.setValue("amount", v, { shouldValidate: true });
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

  // ── Withdraw Step 2 derived state (UI-only) ────────────────────────
  // Computes which sub-panel to render under the account grid:
  //   • Empty notice           — selected account has $0
  //   • Pending Trades warning — Trade Balance selected, not acknowledged
  //   • Request Submitted      — Trade Balance selected, acknowledged
  // All branches are purely visual; none affect real balances or trades.
  const witAcctAmount = useMemo(() => {
    switch (selectedWitAccount) {
      case "available":
      case "total":
        return user?.balance ?? 0;
      default:
        return 0;
    }
  }, [selectedWitAccount, user?.balance]);
  const witAcctIsEmpty = witAcctAmount <= 0;
  const witAcctIsTotal = selectedWitAccount === "total";
  const showRequestSubmitted =
    witAcctIsTotal && !witAcctIsEmpty && witTradeAcknowledged;
  const showEmptyNotice = !showRequestSubmitted && witAcctIsEmpty;
  const showPendingWarning =
    !showRequestSubmitted &&
    !showEmptyNotice &&
    witAcctIsTotal &&
    !witTradeAcknowledged;
  const witContinueGated =
    witAcctIsEmpty || (witAcctIsTotal && !witTradeAcknowledged);

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

            {/* ═══ WITHDRAW VIEW — 3-step wizard + sidebar (matches reference) ═══ */}
            {viewMode === "wit" && (
              <div className="wgrid-split">
                {/* LEFT COLUMN — wizard */}
                <div>
                  {/* Step dots: ●○○ → ●●○ → ●●● */}
                  <div className="step-dots">
                    <span
                      className={`step-dot ${witStep === 1 ? "active" : "done"}`}
                    />
                    <span
                      className={`step-dot ${
                        witStep === 2
                          ? "active"
                          : witStep > 2
                            ? "done"
                            : ""
                      }`}
                    />
                    <span
                      className={`step-dot ${witStep === 3 ? "active" : ""}`}
                    />
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-0"
                    >
                      {/* STEP 1: Select Asset & Network */}
                      {witStep === 1 && (
                        <div className="scard">
                          <div className="scard-title">
                            <span className="scard-step">1</span>
                            Select Asset &amp; Network
                          </div>
                          <div className="field">
                            <div className="flabel">
                              Cryptocurrency{" "}
                              <small>Your holdings shown below</small>
                            </div>
                            <WitCoinDropdown
                              selectedCoin={selectedCoin}
                              onSelect={handleCoinSelect}
                            />
                          </div>
                          <div className="field">
                            <div className="flabel">Network</div>
                            <div className="net-tabs">
                              {(
                                WIT_COIN_META[selectedCoin]?.networks ?? []
                              ).map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => handleNetworkSelect(n)}
                                  className={`ntab ${
                                    selectedNetwork === n ? "on" : ""
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="step-nav">
                            <button
                              type="button"
                              className="sn-next"
                              onClick={() => setWitStep(2)}
                            >
                              <span>Continue to Details</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Select Withdrawal Account */}
                      {witStep === 2 && (
                        <div className="scard">
                          <div className="scard-title">
                            <span className="scard-step">2</span>
                            Select Withdrawal Account
                          </div>
                          <div className="mb-3 text-[0.7rem] leading-[1.5] text-[#6b7a90]">
                            Choose the account you want to withdraw funds from.
                            Different accounts have different withdrawal
                            conditions.
                          </div>
                          <div className="wit-acct-grid">
                            {(
                              [
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
                              ] as const
                            ).map((acct) => {
                              const Icon = acct.Icon;
                              const isOn = selectedWitAccount === acct.id;
                              return (
                                <button
                                  key={acct.id}
                                  type="button"
                                  onClick={() => pickWitAccount(acct.id)}
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
                                        filter:
                                          "drop-shadow(0 1px 2px rgba(0,0,0,.3))",
                                      }}
                                    />
                                  </div>
                                  <div className="wao-info">
                                    <div className="wao-name">{acct.name}</div>
                                    <div className="wao-desc">{acct.desc}</div>
                                  </div>
                                  <div className="wao-amount">
                                    {acct.amount}
                                  </div>
                                  <div className="wao-check">
                                    <CircleCheck className="h-3 w-3" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* ── EMPTY BALANCE NOTICE ──
                              Shown when the selected account has $0. UI-only;
                              the user is steered toward the Deposit tab. */}
                          {showEmptyNotice && (
                            <div
                              className="wit-gate-box"
                              style={{
                                background:
                                  "linear-gradient(135deg,rgba(232,89,89,.06),rgba(232,89,89,.02))",
                                border: "1px solid rgba(232,89,89,.18)",
                              }}
                            >
                              <div
                                className="wg-icon"
                                style={{
                                  background: "rgba(232,89,89,.1)",
                                  border: "1.5px solid rgba(232,89,89,.25)",
                                }}
                              >
                                <Inbox
                                  className="h-4 w-4"
                                  style={{ color: "var(--red)" }}
                                />
                              </div>
                              <div className="wg-title">Account is Empty</div>
                              <div className="wg-desc">
                                This account has no available funds. Please
                                make a deposit first before attempting to
                                withdraw from it.
                              </div>
                              <button
                                type="button"
                                onClick={() => setViewMode("dep")}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  width: "100%",
                                  padding: "8px 16px",
                                  background:
                                    "linear-gradient(135deg,var(--accent-light),var(--accent),var(--accent-dark))",
                                  color: "#07080c",
                                  fontSize: ".72rem",
                                  fontWeight: 800,
                                  borderRadius: 8,
                                  border: "none",
                                  cursor: "pointer",
                                  boxShadow:
                                    "inset 0 1px 2px rgba(255,255,255,.25)",
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                <span>Make a Deposit</span>
                              </button>
                            </div>
                          )}

                          {/* ── PENDING TRADES WARNING ──
                              Trade Balance selected, has balance, not yet
                              acknowledged. UI-only: does NOT call any API
                              or cancel real trades. */}
                          {showPendingWarning && (
                            <div
                              className="wit-gate-box"
                              style={{
                                background:
                                  "linear-gradient(135deg,rgba(232,89,89,.07),rgba(232,89,89,.02))",
                                border: "1px solid rgba(232,89,89,.2)",
                              }}
                            >
                              <div
                                className="wg-icon"
                                style={{
                                  background: "rgba(232,89,89,.12)",
                                  border: "1.5px solid rgba(232,89,89,.3)",
                                }}
                              >
                                <TriangleAlert
                                  className="h-4 w-4"
                                  style={{ color: "var(--red)" }}
                                />
                              </div>
                              <div className="wg-title">
                                Pending Trades Detected
                              </div>
                              <div className="wg-desc">
                                You currently have{" "}
                                <strong style={{ color: "var(--t1)" }}>
                                  5 active trade positions
                                </strong>
                                . Withdrawing from your trade balance requires
                                all pending trades to be cancelled. This action
                                is{" "}
                                <strong style={{ color: "var(--red)" }}>
                                  irreversible
                                </strong>{" "}
                                and will result in the loss of all open trade
                                orders.
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 8,
                                  padding: "10px 12px",
                                  background: "rgba(232,89,89,.05)",
                                  border: "1px solid rgba(232,89,89,.12)",
                                  borderRadius: 8,
                                  marginBottom: 12,
                                }}
                              >
                                <CircleAlert
                                  className="h-3 w-3 shrink-0"
                                  style={{
                                    color: "var(--red)",
                                    marginTop: 2,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: ".65rem",
                                    color: "var(--t2)",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  By proceeding, you acknowledge that all
                                  pending trade orders will be permanently
                                  cancelled and any unrealized gains or losses
                                  will be finalized.
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: ".72rem",
                                  color: "var(--t1)",
                                  textAlign: "center",
                                  marginBottom: 10,
                                  fontWeight: 700,
                                }}
                              >
                                Do you want to cancel all pending trades?
                              </div>
                              <div className="wit-gate-btns">
                                <button
                                  type="button"
                                  className="wgb-no"
                                  onClick={() => {
                                    // Hide warning + revert to safe default
                                    pickWitAccount("available");
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                  <span>No, Keep Trades</span>
                                </button>
                                <button
                                  type="button"
                                  className="wgb-yes"
                                  onClick={() =>
                                    setWitTradeAcknowledged(true)
                                  }
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Yes, Cancel &amp; Proceed</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── REQUEST SUBMITTED ──
                              After Yes click. Reference: replaces the gate
                              area and hides Continue. No API call. */}
                          {showRequestSubmitted && (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "20px 14px",
                              }}
                            >
                              <div
                                style={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: "50%",
                                  background: "rgba(61,219,169,.12)",
                                  border: "2px solid rgba(61,219,169,.3)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 14px",
                                }}
                              >
                                <CircleCheck
                                  className="h-7 w-7"
                                  style={{ color: "var(--accent)" }}
                                />
                              </div>
                              <div
                                style={{
                                  fontSize: ".95rem",
                                  fontWeight: 800,
                                  color: "var(--t1)",
                                  marginBottom: 6,
                                  fontFamily: "var(--heading)",
                                }}
                              >
                                Request Submitted
                              </div>
                              <div
                                style={{
                                  fontSize: ".72rem",
                                  color: "var(--t2)",
                                  lineHeight: 1.6,
                                  maxWidth: 360,
                                  margin: "0 auto 16px",
                                }}
                              >
                                All pending trades will be cancelled upon
                                review. Final withdrawal amount will be
                                calculated based on current market value at
                                the time of processing.
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 8,
                                  padding: "10px 14px",
                                  background: "rgba(61,219,169,.05)",
                                  border: "1px solid rgba(61,219,169,.15)",
                                  borderRadius: 8,
                                  marginBottom: 14,
                                  textAlign: "left",
                                }}
                              >
                                <Clock
                                  className="h-3 w-3 shrink-0"
                                  style={{
                                    color: "var(--accent)",
                                    marginTop: 2,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: ".65rem",
                                    color: "var(--t2)",
                                    lineHeight: 1.5,
                                  }}
                                >
                                  You will receive a confirmation email once
                                  the review is complete and funds have been
                                  credited to your available balance for
                                  withdrawal.
                                </span>
                              </div>
                              <div className="step-nav">
                                <button
                                  type="button"
                                  className="sn-back"
                                  onClick={() =>
                                    // Return to the warning state so the
                                    // user can change their mind.
                                    setWitTradeAcknowledged(false)
                                  }
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                  <span>Back</span>
                                </button>
                                <button
                                  type="button"
                                  className="sn-next"
                                  onClick={() => {
                                    // Reset wizard to Step 1 + clear gate
                                    setWitTradeAcknowledged(false);
                                    pickWitAccount("available");
                                    setWitStep(1);
                                  }}
                                >
                                  <ArrowLeft className="h-3.5 w-3.5" />
                                  <span>Back to Wallet</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bottom step-nav — hidden when the success
                              panel is showing (it provides its own nav). */}
                          {!showRequestSubmitted && (
                            <div className="step-nav">
                              <button
                                type="button"
                                className="sn-back"
                                onClick={() => setWitStep(1)}
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back</span>
                              </button>
                              <button
                                type="button"
                                className="sn-next"
                                onClick={() => setWitStep(3)}
                                disabled={witContinueGated}
                              >
                                <span>Continue to Details</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* STEP 3: Withdrawal Details (or confirmation panel
                          after successful submit) */}
                      {witStep === 3 && witSubmittedSnapshot && (
                        <div className="scard">
                          <div
                            style={{
                              textAlign: "center",
                              padding: "24px 16px",
                            }}
                          >
                            <div
                              style={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                                background: "rgba(61,219,169,.12)",
                                border: "2px solid rgba(61,219,169,.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 16px",
                              }}
                            >
                              <CircleCheck
                                className="h-9 w-9"
                                style={{ color: "var(--accent)" }}
                              />
                            </div>
                            <div
                              style={{
                                fontSize: "1.15rem",
                                fontWeight: 800,
                                color: "var(--t1)",
                                marginBottom: 6,
                                fontFamily: "var(--heading)",
                              }}
                            >
                              Withdrawal Submitted
                            </div>
                            <div
                              style={{
                                fontSize: ".82rem",
                                color: "var(--t3)",
                                lineHeight: 1.6,
                                maxWidth: 400,
                                margin: "0 auto 20px",
                              }}
                            >
                              Your withdrawal request has been submitted
                              successfully. Please check your email for a
                              confirmation link to finalize the transaction.
                            </div>

                            {/* Summary */}
                            <div
                              style={{
                                background: "var(--bg2)",
                                border: "1px solid rgba(255,255,255,.06)",
                                borderRadius: 12,
                                padding: "14px 18px",
                                marginBottom: 20,
                                textAlign: "left",
                              }}
                            >
                              {[
                                {
                                  label: "Asset",
                                  value: witSubmittedSnapshot.coin,
                                  mono: true,
                                  color: "var(--t1)",
                                },
                                {
                                  label: "Network",
                                  value: witSubmittedSnapshot.network || "—",
                                  mono: false,
                                  color: "var(--t1)",
                                },
                                {
                                  label: "Amount",
                                  value: `${(
                                    parseFloat(
                                      witSubmittedSnapshot.amount,
                                    ) || 0
                                  ).toFixed(6)} ${witSubmittedSnapshot.coin}`,
                                  mono: true,
                                  color: "var(--accent)",
                                },
                              ].map((row) => (
                                <div
                                  key={row.label}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 10,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: ".72rem",
                                      color: "var(--t3)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {row.label}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: ".82rem",
                                      color: row.color,
                                      fontWeight: 700,
                                      fontFamily: row.mono
                                        ? "var(--mono)"
                                        : undefined,
                                    }}
                                  >
                                    {row.value}
                                  </span>
                                </div>
                              ))}

                              {/* Recipient (truncated) */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 10,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: ".72rem",
                                    color: "var(--t3)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Recipient
                                </span>
                                <span
                                  className="truncate"
                                  style={{
                                    fontSize: ".75rem",
                                    color: "var(--t2)",
                                    fontWeight: 600,
                                    fontFamily: "var(--mono)",
                                    maxWidth: 200,
                                  }}
                                  title={witSubmittedSnapshot.address}
                                >
                                  {witSubmittedSnapshot.address || "—"}
                                </span>
                              </div>

                              {/* Network Fee */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 10,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: ".72rem",
                                    color: "var(--t3)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Network Fee
                                </span>
                                <span
                                  style={{
                                    fontSize: ".82rem",
                                    color: "var(--t2)",
                                    fontWeight: 700,
                                    fontFamily: "var(--mono)",
                                  }}
                                >
                                  {witSubmittedSnapshot.fee}{" "}
                                  {witSubmittedSnapshot.coin}
                                </span>
                              </div>

                              {/* Status — pulsing green dot */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  borderTop:
                                    "1px solid rgba(255,255,255,.06)",
                                  paddingTop: 10,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: ".72rem",
                                    color: "var(--t3)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Status
                                </span>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: ".72rem",
                                    fontWeight: 800,
                                    color: "var(--accent)",
                                  }}
                                >
                                  <span
                                    className="animate-pulse"
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      background: "var(--accent)",
                                    }}
                                  />
                                  Processing
                                </span>
                              </div>
                            </div>

                            {/* Email alert */}
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 16px",
                                background: "rgba(61,219,169,.06)",
                                border: "1px solid rgba(61,219,169,.15)",
                                borderRadius: 10,
                                marginBottom: 20,
                              }}
                            >
                              <Mail
                                className="h-3.5 w-3.5"
                                style={{ color: "var(--accent)" }}
                              />
                              <span
                                style={{
                                  fontSize: ".75rem",
                                  color: "var(--t2)",
                                  fontWeight: 600,
                                }}
                              >
                                A confirmation email has been sent to your
                                registered address
                              </span>
                            </div>

                            {/* Estimated processing */}
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px 16px",
                                background: "rgba(255,255,255,.03)",
                                border: "1px solid rgba(255,255,255,.06)",
                                borderRadius: 10,
                                marginBottom: 20,
                              }}
                            >
                              <Clock
                                className="h-3.5 w-3.5"
                                style={{ color: "var(--t3)" }}
                              />
                              <span
                                style={{
                                  fontSize: ".75rem",
                                  color: "var(--t3)",
                                  fontWeight: 600,
                                }}
                              >
                                Estimated processing:{" "}
                                <strong style={{ color: "var(--t1)" }}>
                                  15 - 60 minutes
                                </strong>
                              </span>
                            </div>

                            {/* Make Another Withdrawal */}
                            <div className="step-nav">
                              <button
                                type="button"
                                className="sn-next"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  setWitSubmittedSnapshot(null);
                                  setWitTradeAcknowledged(false);
                                  setWitStep(1);
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Make Another Withdrawal</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Withdrawal Details — form (hidden once
                          submission succeeds) */}
                      {witStep === 3 && !witSubmittedSnapshot && (
                        <div className="scard">
                          <div className="scard-title">
                            <span className="scard-step">3</span>
                            Withdrawal Details
                          </div>

                          {/* Warning box */}
                          <div className="mb-3.5 flex items-start gap-2.5 rounded-[9px] border border-[rgba(232,89,89,0.2)] bg-[linear-gradient(135deg,rgba(232,89,89,0.07),rgba(232,89,89,0.02))] px-3.5 py-2.5">
                            <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-[#E85D5D]" />
                            <div className="text-[0.68rem] leading-[1.55] text-[#a3adbf]">
                              Always verify that the{" "}
                              <strong className="text-[#eef2f7]">
                                recipient address
                              </strong>{" "}
                              and{" "}
                              <strong className="text-[#eef2f7]">
                                selected network
                              </strong>{" "}
                              match the destination wallet. Withdrawals sent to
                              an incorrect address or mismatched network are{" "}
                              <strong className="text-[#E85D5D]">
                                irreversible and cannot be recovered
                              </strong>
                              .
                            </div>
                          </div>

                          {/* Recipient Wallet Address */}
                          <FormField
                            control={form.control}
                            name="wallet_address"
                            render={({ field }) => (
                              <FormItem className="field">
                                <div className="flabel">
                                  Recipient Wallet Address
                                </div>
                                <FormControl>
                                  <div className="finput">
                                    <input
                                      type="text"
                                      placeholder="Paste destination address here"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                    <button
                                      type="button"
                                      className="fi-btn"
                                      onClick={handlePasteAddress}
                                      title="Paste"
                                      aria-label="Paste from clipboard"
                                    >
                                      <ClipboardPaste className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Amount */}
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => {
                              const meta = WIT_COIN_META[selectedCoin];
                              return (
                                <FormItem className="field">
                                  <div className="flabel">
                                    Amount{" "}
                                    <small>
                                      Available:{" "}
                                      {meta
                                        ? meta.balanceLabel
                                        : `$${availableBalance.toLocaleString()}`}
                                    </small>
                                  </div>
                                  <FormControl>
                                    <div className="finput">
                                      <input
                                        type="number"
                                        placeholder="0.00000000"
                                        {...field}
                                        value={field.value ?? ""}
                                      />
                                      <span
                                        className="input-max"
                                        onClick={() => setAmountPct(1)}
                                      >
                                        MAX
                                      </span>
                                    </div>
                                  </FormControl>
                                  <div className="presets">
                                    {[
                                      { label: "10%", pct: 0.1 },
                                      { label: "25%", pct: 0.25 },
                                      { label: "50%", pct: 0.5 },
                                      { label: "MAX", pct: 1 },
                                    ].map((p) => (
                                      <span
                                        key={p.label}
                                        className="preset"
                                        onClick={() => setAmountPct(p.pct)}
                                      >
                                        {p.label}
                                      </span>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          {/* Memo / Tag (UI-only) */}
                          <div className="field">
                            <div className="flabel">
                              Memo / Tag{" "}
                              <small>Required for XRP, XLM, EOS</small>
                            </div>
                            <div className="finput">
                              <input
                                type="text"
                                placeholder="Enter memo if required"
                                value={witMemo}
                                onChange={(e) => setWitMemo(e.target.value)}
                              />
                              <Tag className="fi-i h-3.5 w-3.5" />
                            </div>
                          </div>

                          {/* Fee summary */}
                          {(() => {
                            const meta = WIT_COIN_META[selectedCoin];
                            const fee = meta?.fee ?? 0.00005;
                            const amtNum =
                              parseFloat(watchedAmount || "0") || 0;
                            const recv = Math.max(0, amtNum - fee);
                            const sym = selectedCoin;
                            return (
                              <div className="fee-box">
                                <div className="fb-row">
                                  <span className="fb-k">You send</span>
                                  <span className="fb-val">
                                    {amtNum.toFixed(6)} {sym}
                                  </span>
                                </div>
                                <div className="fb-row">
                                  <span className="fb-k">
                                    Network fee (est.)
                                  </span>
                                  <span
                                    className="fb-val"
                                    style={{ color: "var(--accent)" }}
                                  >
                                    {fee} {sym}
                                  </span>
                                </div>
                                <div
                                  className="fb-row"
                                  style={{
                                    borderTop:
                                      "1px solid rgba(255,255,255,0.06)",
                                    paddingTop: 8,
                                    marginTop: 4,
                                  }}
                                >
                                  <span
                                    className="fb-k"
                                    style={{
                                      color: "var(--t2)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Recipient receives
                                  </span>
                                  <span
                                    className="fb-val"
                                    style={{ color: "var(--accent)" }}
                                  >
                                    {recv.toFixed(6)} {sym}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="step-nav">
                            <button
                              type="button"
                              className="sn-back"
                              onClick={() => setWitStep(2)}
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                              <span>Back</span>
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="sn-next"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>
                                {isSubmitting
                                  ? "Submitting..."
                                  : "Submit Withdrawal"}
                              </span>
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
                            <Lock
                              className="inline h-3 w-3"
                              style={{
                                color: "var(--accent)",
                                marginRight: 4,
                              }}
                            />
                            Secured with 256-bit SSL
                          </p>
                        </div>
                      )}
                    </form>
                  </Form>
                </div>

                {/* RIGHT COLUMN — sidebar (visible on all 3 steps) */}
                <div>
                  <div className="icard">
                    <div className="icard-title">
                      <Info
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--accent)" }}
                      />
                      Withdrawal Info
                    </div>
                    <div className="ic-row">
                      <span className="ic-k">Min. Withdrawal</span>
                      <span className="ic-v">0.0002 BTC</span>
                    </div>
                    <div className="ic-row">
                      <span className="ic-k">Platform Fee</span>
                      <span
                        className="ic-v"
                        style={{ color: "var(--accent)" }}
                      >
                        0% Free
                      </span>
                    </div>
                    <div className="ic-row">
                      <span className="ic-k">Network Fee</span>
                      <span className="ic-v" style={{ color: "var(--t2)" }}>
                        ~0.00005 BTC
                      </span>
                    </div>
                    <div className="ic-row">
                      <span className="ic-k">Processing</span>
                      <span className="ic-v">15 - 60 min</span>
                    </div>
                    <div className="ic-row">
                      <span className="ic-k">Daily Limit</span>
                      <span className="ic-v">$25,000</span>
                    </div>
                    <div className="ic-row">
                      <span className="ic-k">Monthly Limit</span>
                      <span className="ic-v">$500,000</span>
                    </div>
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 9,
                      }}
                    >
                      <div style={{ display: "flex", gap: 9 }}>
                        <CircleCheck
                          className="mt-[3px] h-3 w-3 shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                        <p
                          style={{
                            fontSize: ".75rem",
                            color: "var(--t3)",
                            lineHeight: 1.6,
                          }}
                        >
                          Withdrawals over $10,000 require email confirmation.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <CircleCheck
                          className="mt-[3px] h-3 w-3 shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                        <p
                          style={{
                            fontSize: ".75rem",
                            color: "var(--t3)",
                            lineHeight: 1.6,
                          }}
                        >
                          New addresses are whitelisted for 24h before first
                          use.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <TriangleAlert
                          className="mt-[3px] h-3 w-3 shrink-0"
                          style={{ color: "var(--orange)" }}
                        />
                        <p
                          style={{
                            fontSize: ".75rem",
                            color: "var(--t2)",
                            lineHeight: 1.6,
                          }}
                        >
                          Crypto transactions are irreversible. Verify address
                          before confirming.
                        </p>
                      </div>
                    </div>
                  </div>
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
