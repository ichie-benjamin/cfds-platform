import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { TickerBar } from "@/components/dashboard/TickerBar";
import useAssetStore from "@/store/assetStore";
import useUserStore from "@/store/userStore";
import useSiteSettingsStore from "@/store/siteSettingStore";
import {
  Bell,
  Leaf,
  ShieldCheck,
  DollarSign,
  ChartLine,
  Calculator,
  Edit3,
  PieChart as PieIcon,
  Star,
  Coins,
  Play,
  Gift,
  Hourglass,
  BarChart3,
  History,
  Info,
  AlertTriangle,
  FileText,
  Gavel,
  Clock,
  Lock,
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Menu,
  X as XIcon,
  Check,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
// STATIC CONTENT (presentational only — from html_files/crypto-ira.html)
// ───────────────────────────────────────────────────────────────

const NAV_LINKS: { label: string; to: string; external?: boolean; active?: boolean }[] = [
  { label: "Dashboard", to: "/main/dashboard" },
  { label: "Markets", to: "/main/market" },
  { label: "Trade Room", to: "/trading", external: true },
  { label: "Wallet", to: "/main/wallet" },
  { label: "Managed Portfolio", to: "#mp-top", active: true },
];

const FOOTER_LINKS = [
  { label: "Dashboard", to: "/main/dashboard" },
  { label: "Markets", to: "/main/market" },
  { label: "Trading Plans", to: "/main/trading-plans" },
  { label: "Welcome Bonus", to: "/main/welcome-bonus" },
  { label: "Fund Protection", to: "/main/fund-protection" },
  { label: "Fund Managers", to: "/main/fund-managers" },
  { label: "Security", to: "/main/security" },
  { label: "Contact Support", to: "/main/chat" },
];

const HERO_STATS = [
  { value: "$100K–$10B", label: "Flexible Entry Range", live: false },
  { value: "24/7", label: "Actively Managed", live: true },
  { value: "Real-Time", label: "Tax-Efficient Positioning", live: false },
];

// Static APY lookup — workspace Asset type does not include staking APY,
// values copied verbatim from crypto-ira.html reference.
const STAKING_APY_BY_SYMBOL: Record<string, number> = {
  BTC: 0,
  ETH: 2.5,
  BNB: 1.92,
  SOL: 6.24,
  XRP: 0,
  ADA: 2.0,
  DOGE: 0,
  DOT: 10.0,
  AVAX: 4.5,
  LINK: 0,
  MATIC: 5.5,
  LTC: 0,
  TRX: 4.85,
  ATOM: 18.5,
  XLM: 0,
  NEAR: 9.0,
  ALGO: 5.0,
  XTZ: 5.5,
  EGLD: 7.5,
  ICP: 8.5,
};

// Calculator allocation presets (presentational only).
const ALLOC_PRESETS: Record<
  "conservative" | "balanced" | "growth" | "custom",
  { label: string; weight: number }[]
> = {
  conservative: [
    { label: "BTC", weight: 50 },
    { label: "ETH", weight: 30 },
    { label: "USDC", weight: 20 },
  ],
  balanced: [
    { label: "BTC", weight: 40 },
    { label: "ETH", weight: 30 },
    { label: "SOL", weight: 15 },
    { label: "BNB", weight: 10 },
    { label: "Other", weight: 5 },
  ],
  growth: [
    { label: "BTC", weight: 30 },
    { label: "ETH", weight: 25 },
    { label: "SOL", weight: 20 },
    { label: "AVAX", weight: 10 },
    { label: "DOT", weight: 8 },
    { label: "Other", weight: 7 },
  ],
  custom: [
    { label: "BTC", weight: 25 },
    { label: "ETH", weight: 25 },
    { label: "SOL", weight: 25 },
    { label: "Other", weight: 25 },
  ],
};

const STRATEGY_RATE: Record<"conservative" | "balanced", number> = {
  conservative: 0.07,
  balanced: 0.13,
};

const COMPARISON_ROWS = [
  { f: "Entry Range", c: "$100K–$1M", b: "$100K–$10B", a: "$500K–$10B" },
  { f: "Risk Profile", c: "Very Low", b: "Low–Medium", a: "Medium–High" },
  { f: "Strategy", c: "Capital Preservation", b: "Diversified Growth", a: "Maximum Exposure" },
  { f: "Rebalancing", c: "Monthly", b: "Quarterly", a: "As Needed" },
  { f: "Hedging", c: "100%", b: "50%", a: "10%" },
  { f: "Target Horizon", c: "3–5 years", b: "10–20 years", a: "5–10 years" },
  { f: "Reporting", c: "Monthly", b: "Weekly", a: "Daily" },
];

const FEATURE_CARDS: {
  tone: "green" | "gold";
  title: string;
  desc: string;
  bullets: string[];
}[] = [
  {
    tone: "green",
    title: "Actively Managed Strategy",
    desc:
      "Our team continuously monitors market conditions and rebalances your portfolio to maintain optimal diversification across Bitcoin, Ethereum, and other digital assets.",
    bullets: [
      "Diversified asset exposure",
      "Hedging & yield positions",
      "Quarterly rebalancing",
      "Risk management",
    ],
  },
  {
    tone: "gold",
    title: "Tax-Efficient Positioning",
    desc:
      "Leverage crypto-friendly jurisdictions and tax optimization strategies to maximize your after-tax returns while maintaining full regulatory compliance.",
    bullets: [
      "Strategic positioning",
      "Tax-loss harvesting",
      "Transparent reporting",
      "Optimized yield",
    ],
  },
];

const HOW_STEPS: { num: string; title: string; desc: string; chips: string[]; done?: boolean }[] = [
  {
    num: "1",
    title: "Begin Managed Portfolio",
    desc: "Complete KYC verification and choose your strategy type.",
    chips: ["5 min KYC", "No hidden fees"],
  },
  {
    num: "2",
    title: "Fund Your Account",
    desc: "Deposit via wire, ACH, or crypto transfers.",
    chips: ["Multiple methods", "Instant processing"],
  },
  {
    num: "3",
    title: "Build Portfolio",
    desc: "Select preset allocation or customize your holdings.",
    chips: ["4 presets", "Full control"],
  },
  {
    num: "✓",
    title: "Watch It Grow",
    desc: "Track daily PnL and rebalancing activity in real-time.",
    chips: ["Real-time PnL", "Tax reports"],
    done: true,
  },
];

const STAKING_REWARDS: { icon: string; asset: string; apy: string; on: boolean }[] = [
  { icon: "Ξ", asset: "Ethereum", apy: "2.50%", on: false },
  { icon: "◎", asset: "Solana", apy: "6.24%", on: false },
  { icon: "●", asset: "Polkadot", apy: "10.00%", on: true },
  { icon: "₳", asset: "Cardano", apy: "2.00%", on: false },
  { icon: "▲", asset: "Avalanche", apy: "4.50%", on: false },
];

const TIMELINE_PHASES = [
  { label: "Phase 1", value: "Deposit", desc: "Initial funding confirmation" },
  { label: "Phase 2", value: "3 Months", desc: "Lock-up period" },
  { label: "Phase 3", value: "6 Months", desc: "Initial maturity" },
  { label: "Phase 4", value: "12 Months", desc: "Standard term" },
  { label: "Phase 5", value: "Full Access", desc: "Unlimited withdrawals" },
];

const PENALTY_ROWS = [
  { timing: "Before 3 months", pct: "15%", tax: "Ordinary Income", time: "5–7 days" },
  { timing: "3–6 months", pct: "10%", tax: "Ordinary Income", time: "3–5 days" },
  { timing: "6–12 months", pct: "5%", tax: "Capital Gains", time: "2–3 days" },
  { timing: "After 12 months", pct: "0%", tax: "Capital Gains", time: "1–2 days" },
];

const INFO_CARDS = [
  {
    title: "Auto-Renewal",
    desc: "Your portfolio automatically renews upon maturity unless you request withdrawal.",
  },
  {
    title: "Withdrawal Process",
    desc: "Request withdrawals via your dashboard. Funds arrive in your bank account within 1–2 business days.",
  },
];

const PORTFOLIO_HOLDINGS = [
  { sym: "BTC", color: "#F7931A", shares: 2.45, value: 240000 },
  { sym: "ETH", color: "#627EEA", shares: 32.1, value: 110000 },
  { sym: "SOL", color: "#14F195", shares: 280.4, value: 50000 },
  { sym: "BNB", color: "#F3BA2F", shares: 65.2, value: 40000 },
  { sym: "AVAX", color: "#E84142", shares: 410.0, value: 18500 },
  { sym: "DOT", color: "#E6007A", shares: 1900.0, value: 17750 },
  { sym: "ADA", color: "#0033AD", shares: 24500.0, value: 20100 },
  { sym: "MATIC", color: "#8247E5", shares: 32500.0, value: 20150 },
  { sym: "USDC", color: "#2775CA", shares: 15000.0, value: 15000 },
  { sym: "LINK", color: "#375BD2", shares: 100, value: 2845 },
];

const PORTFOLIO_TOTAL = PORTFOLIO_HOLDINGS.reduce((s, h) => s + h.value, 0);

const PORTFOLIO_PERF: { day: string; v: number }[] = (() => {
  const arr: { day: string; v: number }[] = [];
  let v = 480000;
  for (let i = 1; i <= 30; i++) {
    v += (Math.sin(i / 4) + 0.4) * 1500 + (i * 350);
    arr.push({ day: `D${i}`, v: Math.round(v) });
  }
  return arr;
})();

const DAILY_PNL_BREAKDOWN = [
  { sym: "BTC", pnl: 4820.5, pct: 2.1 },
  { sym: "ETH", pnl: -1240.3, pct: -1.2 },
  { sym: "SOL", pnl: 2105.7, pct: 4.4 },
  { sym: "BNB", pnl: 580.1, pct: 1.5 },
  { sym: "AVAX", pnl: 320.4, pct: 1.7 },
  { sym: "DOT", pnl: -210.0, pct: -1.1 },
  { sym: "ADA", pnl: 740.2, pct: 3.7 },
  { sym: "MATIC", pnl: 645.5, pct: 3.2 },
];

type TxType = "contributions" | "withdrawals" | "rebalances" | "all";

const TRANSACTIONS: {
  date: string;
  type: Exclude<TxType, "all">;
  desc: string;
  amount: string;
  status: "Completed" | "Pending";
}[] = [
  { date: "2026-04-22", type: "contributions", desc: "Initial wire transfer", amount: "+$200,000.00", status: "Completed" },
  { date: "2026-04-23", type: "rebalances", desc: "Quarterly rebalance — Q2", amount: "—", status: "Completed" },
  { date: "2026-04-24", type: "contributions", desc: "Monthly contribution", amount: "+$10,000.00", status: "Completed" },
  { date: "2026-04-25", type: "withdrawals", desc: "Partial withdrawal request", amount: "-$5,000.00", status: "Pending" },
  { date: "2026-04-19", type: "rebalances", desc: "Risk-off rebalance", amount: "—", status: "Completed" },
  { date: "2026-04-15", type: "contributions", desc: "ACH deposit", amount: "+$25,000.00", status: "Completed" },
  { date: "2026-04-10", type: "withdrawals", desc: "Maturity withdrawal", amount: "-$12,000.00", status: "Completed" },
];

const DISCLAIMERS: { icon: React.ElementType; title: string; desc: string }[] = [
  {
    icon: AlertTriangle,
    title: "Risk Warning",
    desc:
      "Digital asset investments carry substantial risk. Past performance does not guarantee future results. Crypto markets are volatile. Only invest what you can afford to lose. 1 Trade Market is not liable for losses.",
  },
  {
    icon: FileText,
    title: "Tax Information",
    desc:
      "1 Trade Market provides tax reporting tools for U.S. and international markets. Consult a tax professional regarding your specific situation. Crypto gains are subject to capital gains tax.",
  },
  {
    icon: Gavel,
    title: "Regulatory Compliance",
    desc:
      "1 Trade Market operates under regulated frameworks in supported jurisdictions. All client assets are held in compliant custody. We comply with AML/KYC regulations.",
  },
  {
    icon: Clock,
    title: "Early Exit Terms",
    desc:
      "Early withdrawals before maturity incur penalties (15% before 3m, 10% at 3–6m, 5% at 6–12m). No penalties after 12 months. Processing: 1–7 business days.",
  },
];

const revealProps = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0";
  if (Math.abs(n) >= 1_000_000_000)
    return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtPriceCell(rate: string | number): string {
  const n = typeof rate === "number" ? rate : Number(rate);
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1000)
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

function fmtMarketCap(cap: string | null): string {
  if (!cap) return "—";
  const n = Number(cap);
  if (!Number.isFinite(n) || n === 0) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function smoothScroll(href: string) {
  if (typeof window === "undefined") return;
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ───────────────────────────────────────────────────────────────
// PAGE
// ───────────────────────────────────────────────────────────────

export default function ManagedPortfolioPage() {
  const assets = useAssetStore((s) => s.assets);
  const fetchAssets = useAssetStore((s) => s.fetchAssets);
  const isLoadingAssets = useAssetStore((s) => s.isLoading);
  const user = useUserStore((s) => s.user);
  const settings = useSiteSettingsStore((s) => s.settings);
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "JD";
  const brandName = settings?.name || "1 Trade Market";

  // Calculator state (presentational only)
  const [contribAmount, setContribAmount] = useState(50000);
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP">("USD");
  const [freq, setFreq] = useState<"once" | "monthly" | "quarterly" | "annually">("once");
  const [stratType, setStratType] = useState<"conservative" | "balanced">("balanced");
  const [preset, setPreset] = useState<"conservative" | "balanced" | "growth" | "custom">("balanced");
  const [allocations, setAllocations] = useState(ALLOC_PRESETS["balanced"]);
  const [projYears, setProjYears] = useState(15);

  // Position calculator
  const [posCalcAmount, setPosCalcAmount] = useState(100000);

  // Staking toggles (local UI state only)
  const [stakingOn, setStakingOn] = useState<boolean[]>(
    STAKING_REWARDS.map((s) => s.on),
  );

  // Transaction filter
  const [txFilter, setTxFilter] = useState<TxType>("all");

  // Mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide MainLayout chrome
  useEffect(() => {
    document.body.classList.add("mp-active");
    return () => {
      document.body.classList.remove("mp-active");
    };
  }, []);

  // Page-scoped fonts
  useEffect(() => {
    if (document.querySelector<HTMLLinkElement>('link[data-mp-fonts="1"]'))
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
    link.dataset.mpFonts = "1";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch {
        /* noop */
      }
    };
  }, []);

  // Ensure assets are fetched (read-only consumption — same pattern as MarketPage)
  useEffect(() => {
    if (!assets || assets.length === 0) {
      fetchAssets().catch(() => {
        /* noop — store handles error state */
      });
    }
  }, [assets, fetchAssets]);

  // Update allocations when preset changes
  useEffect(() => {
    setAllocations(ALLOC_PRESETS[preset]);
  }, [preset]);

  const allocTotal = allocations.reduce((s, a) => s + a.weight, 0);

  // Pick top markets (first 8 by market_cap descending if available, else first 8)
  const topMarkets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    const list = [...assets];
    list.sort((a, b) => {
      const av = Number(a.market_cap || 0);
      const bv = Number(b.market_cap || 0);
      return bv - av;
    });
    return list.slice(0, 8);
  }, [assets]);

  // Eligible Assets (Top 20)
  const eligibleAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    const list = [...assets];
    list.sort((a, b) => Number(b.market_cap || 0) - Number(a.market_cap || 0));
    return list.slice(0, 20);
  }, [assets]);

  // Position calculator output
  const positionRows = useMemo(() => {
    if (!eligibleAssets.length) return [];
    return allocations
      .map((a) => {
        const asset = eligibleAssets.find(
          (x) => x.symbol.toUpperCase() === a.label.toUpperCase(),
        );
        const price = Number(asset?.rate || 0);
        const usd = (posCalcAmount * a.weight) / 100;
        const units = price > 0 ? usd / price : 0;
        return {
          label: a.label,
          weight: a.weight,
          price,
          usd,
          units,
          color: asset?.symbol === "BTC" ? "#F7931A" : asset?.symbol === "ETH" ? "#627EEA" : "#00dfa2",
        };
      })
      .filter((r) => r.weight > 0);
  }, [allocations, eligibleAssets, posCalcAmount]);

  // Projection chart data
  const projection = useMemo(() => {
    const rate = STRATEGY_RATE[stratType];
    const points: { year: number; v: number }[] = [];
    let principal = contribAmount;
    let perPeriod = 0;
    if (freq === "monthly") perPeriod = contribAmount;
    if (freq === "quarterly") perPeriod = contribAmount;
    if (freq === "annually") perPeriod = contribAmount;
    if (freq === "once") principal = contribAmount;
    let v = freq === "once" ? principal : 0;
    for (let y = 0; y <= projYears; y++) {
      points.push({ year: y, v: Math.round(v) });
      v = v * (1 + rate);
      if (freq === "monthly") v += perPeriod * 12;
      else if (freq === "quarterly") v += perPeriod * 4;
      else if (freq === "annually") v += perPeriod;
    }
    return points;
  }, [contribAmount, freq, stratType, projYears]);

  const projValue = projection[projection.length - 1]?.v || 0;
  const projInitial = freq === "once"
    ? contribAmount
    : freq === "monthly"
      ? contribAmount * 12 * projYears
      : freq === "quarterly"
        ? contribAmount * 4 * projYears
        : contribAmount * projYears;
  const projGrowth =
    projInitial > 0 ? ((projValue - projInitial) / projInitial) * 100 : 0;

  const filteredTx =
    txFilter === "all"
      ? TRANSACTIONS
      : TRANSACTIONS.filter((t) => t.type === txFilter);

  const currencySymbol =
    currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  const brandParts = brandName.split(" ").filter(Boolean);
  const brandHead =
    brandParts.length > 1 ? brandParts.slice(0, -1).join(" ") : "";
  const brandTail = brandParts[brandParts.length - 1] || brandName;

  const pieData = PORTFOLIO_HOLDINGS.map((h) => ({
    name: h.sym,
    value: h.value,
    color: h.color,
  }));

  return (
    <div
      className="mp-root w-full"
      id="mp-top"
      style={{
        background: "linear-gradient(135deg, #07080c 0%, #0a0d15 100%)",
        color: "#eef2f7",
        fontFamily: "Inter, -apple-system, 'Helvetica Neue', sans-serif",
      }}
    >
      <style>{`
        body.mp-active .fixed.top-0.left-0.right-0.z-20,
        body.mp-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.mp-active .flex.flex-1.pt-\\[90px\\] { padding-top: 0 !important; }
        body.mp-active .flex-1.md\\:ml-\\[80px\\] { margin-left: 0 !important; }

        .mp-root { line-height: 1.6; overflow-x: hidden; }

        /* Ticker */
        .mp-ticker-wrap { position: relative; z-index: 299; }
        .mp-ticker-wrap > div {
          height: 34px !important;
          background: rgba(7,8,12,0.65) !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
        }

        /* Nav */
        .mp-nav {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .mp-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 16px;
        }
        .mp-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #eef2f7;
          text-decoration: none;
          flex-shrink: 0;
        }
        .mp-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.78rem;
          color: #000;
          font-family: 'Outfit', sans-serif;
        }
        .mp-logo-text {
          font-weight: 800;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
        }
        .mp-logo-text em { font-style: normal; color: #00dfa2; }

        .mp-nav-links { display: flex; align-items: center; gap: 28px; }
        .mp-nav-link {
          color: #8b97a8;
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          transition: color 0.2s ease;
        }
        .mp-nav-link:hover { color: #00dfa2; }
        .mp-nav-link.active { color: #00dfa2; }

        .mp-nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .mp-nav-icon {
          color: #8b97a8;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .mp-nav-icon:hover { color: #00dfa2; }
        .mp-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.78rem;
          flex-shrink: 0;
        }
        .mp-hamburger {
          display: none;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #8b97a8;
          cursor: pointer;
        }
        .mp-mobile-menu {
          padding: 16px 24px 20px;
          background: rgba(7,8,12,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mp-mobile-menu .mp-nav-link {
          padding: 10px 4px;
          text-align: left;
        }

        /* Container + sections */
        .mp-container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .mp-sec { padding: 80px 0; position: relative; }
        .mp-sec-dark { background: rgba(255,255,255,0.01); }
        .mp-sec-header { text-align: center; margin-bottom: 40px; }
        .mp-sec-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0,223,162,0.1);
          border: 1px solid rgba(0,223,162,0.25);
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #00ffc3;
          margin-bottom: 16px;
        }
        .mp-sec-title {
          font-size: clamp(1.8rem, 3.2vw, 2.4rem);
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .mp-sec-desc {
          font-size: 1rem;
          color: #8b97a8;
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Glass card */
        .mp-glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* Hero */
        .mp-hero {
          padding: 80px 0 64px;
          position: relative;
          overflow: hidden;
          text-align: center;
        }
        .mp-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,223,162,0.12), transparent 65%);
          pointer-events: none;
        }
        .mp-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(0,223,162,0.01) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,223,162,0.01) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
        .mp-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 880px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .mp-promo-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(0,223,162,0.1);
          border: 1px solid rgba(0,223,162,0.25);
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #00dfa2;
          margin-bottom: 24px;
        }
        .mp-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1ED760;
          animation: mp-pulse 2s infinite;
        }
        @keyframes mp-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(30,215,96,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(30,215,96,0); }
        }
        .mp-h1 {
          font-size: clamp(2.2rem, 4.6vw, 3.4rem);
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
          line-height: 1.12;
          margin-bottom: 20px;
        }
        .mp-h1 .mp-accent {
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .mp-hero-sub {
          font-size: 1.05rem;
          color: #8b97a8;
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .mp-hero-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .mp-btn {
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          text-decoration: none;
          border: none;
          white-space: nowrap;
        }
        .mp-btn-accent {
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
          box-shadow: 0 8px 32px rgba(0,223,162,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .mp-btn-accent:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(0,223,162,0.4), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .mp-btn-outline {
          background: rgba(255,255,255,0.04);
          color: #eef2f7;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .mp-btn-outline:hover {
          border-color: #00dfa2;
          color: #00dfa2;
          background: rgba(0,223,162,0.06);
        }
        .mp-hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }
        .mp-hero-stat {
          padding: 22px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          backdrop-filter: blur(40px);
        }
        .mp-hero-stat-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.35rem;
          font-weight: 800;
          color: #00dfa2;
          margin-bottom: 6px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }
        .mp-hero-stat-lab {
          font-size: 0.78rem;
          color: #8b97a8;
          font-weight: 600;
        }
        .mp-hero-fineprint {
          font-size: 0.82rem;
          color: #4a5468;
        }

        /* Price grid (Top Markets, Staking) */
        .mp-price-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .mp-price-card {
          padding: 20px;
        }
        .mp-pc-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .mp-pc-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          color: #eef2f7;
          font-size: 0.9rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mp-pc-icon img { width: 100%; height: 100%; object-fit: cover; }
        .mp-pc-meta { display: flex; flex-direction: column; min-width: 0; }
        .mp-pc-sym {
          font-weight: 800;
          color: #eef2f7;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
        }
        .mp-pc-name { font-size: 0.78rem; color: #8b97a8; }
        .mp-pc-price {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.15rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 4px;
        }
        .mp-pc-change {
          font-size: 0.82rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mp-pc-change.up { color: #1ED760; }
        .mp-pc-change.down { color: #f43f5e; }

        /* Calculator */
        .mp-calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .mp-calc-card { padding: 28px; }
        .mp-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
          color: #eef2f7;
          margin-bottom: 20px;
        }
        .mp-card-title svg { color: #00dfa2; }
        .mp-input-group { margin-bottom: 18px; }
        .mp-input-group:last-child { margin-bottom: 0; }
        .mp-input-label {
          display: block;
          font-size: 0.78rem;
          color: #8b97a8;
          margin-bottom: 8px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .mp-input,
        .mp-select {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #eef2f7;
          font-size: 0.92rem;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mp-input:focus,
        .mp-select:focus {
          outline: none;
          border-color: #00dfa2;
          box-shadow: 0 0 0 3px rgba(0,223,162,0.15);
        }
        .mp-radio-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mp-radio-btn,
        .mp-pill,
        .mp-preset-btn {
          padding: 9px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #8b97a8;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          font-family: inherit;
          flex: 1;
          min-width: 0;
        }
        .mp-radio-btn.active,
        .mp-pill.active,
        .mp-preset-btn.active {
          background: rgba(0,223,162,0.15);
          color: #00dfa2;
          border-color: rgba(0,223,162,0.4);
        }
        .mp-radio-btn:hover:not(.active),
        .mp-pill:hover:not(.active),
        .mp-preset-btn:hover:not(.active) {
          color: #eef2f7;
          border-color: rgba(255,255,255,0.16);
        }
        .mp-button-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .mp-button-group .mp-preset-btn { flex: 1; }
        .mp-timeline-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .mp-timeline-pills .mp-pill { flex: 0 0 auto; padding: 8px 14px; }

        .mp-alloc-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .mp-alloc-row:last-child { margin-bottom: 0; }
        .mp-alloc-label {
          width: 70px;
          font-size: 0.85rem;
          color: #eef2f7;
          font-weight: 600;
          flex-shrink: 0;
        }
        .mp-alloc-bar-wrap {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .mp-alloc-bar {
          height: 100%;
          background: linear-gradient(90deg, #00dfa2, #00ffc3);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .mp-alloc-pct {
          width: 44px;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          color: #00dfa2;
          flex-shrink: 0;
        }
        .mp-alloc-total {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #8b97a8;
          font-weight: 600;
        }
        .mp-alloc-total span:last-child { color: #00dfa2; font-family: 'JetBrains Mono', monospace; }

        .mp-projection-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 18px;
        }
        .mp-projection-stat {
          padding: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          text-align: center;
        }
        .mp-projection-stat-lab {
          font-size: 0.72rem;
          color: #8b97a8;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .mp-projection-stat-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.2rem;
          font-weight: 800;
          color: #00dfa2;
        }

        .mp-protection-banner {
          padding: 24px;
          background: linear-gradient(135deg, rgba(30,215,96,0.08), rgba(30,215,96,0.02));
          border: 1px solid rgba(30,215,96,0.18);
          border-radius: 16px;
          margin-top: 20px;
        }
        .mp-protection-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .mp-badge-protection {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 0.78rem;
          color: #8b97a8;
          font-weight: 600;
        }
        .mp-badge-protection svg { color: #1ED760; }

        /* Features */
        .mp-feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .mp-feature-card { padding: 32px; }
        .mp-feature-card h3 {
          font-size: 1.3rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 12px;
          color: #eef2f7;
        }
        .mp-feature-card p {
          color: #8b97a8;
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .mp-pillar-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }
        .mp-pillar-icon.green {
          background: rgba(30,215,96,0.1);
          color: #1ED760;
          border: 1px solid rgba(30,215,96,0.2);
        }
        .mp-pillar-icon.gold {
          background: rgba(240,180,41,0.1);
          color: #F0B429;
          border: 1px solid rgba(240,180,41,0.2);
        }
        .mp-feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .mp-feature-list-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          color: #8b97a8;
        }
        .mp-feature-list-item svg { color: #1ED760; flex-shrink: 0; }

        /* Tables */
        .mp-table-wrap {
          width: 100%;
          padding: 8px;
          overflow-x: auto;
          border-radius: 16px;
        }
        .mp-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.9rem;
          min-width: 600px;
        }
        .mp-table thead { background: rgba(255,255,255,0.04); }
        .mp-table th {
          padding: 14px 16px;
          text-align: center;
          font-size: 0.72rem;
          color: #8b97a8;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-family: 'Outfit', sans-serif;
        }
        .mp-table td {
          padding: 14px 16px;
          color: #eef2f7;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .mp-table tbody tr:last-child td { border-bottom: none; }
        .mp-table tbody tr:hover td { background: rgba(0,223,162,0.03); }
        .mp-table-card {
          display: none;
        }
        .mp-mini-card {
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          margin-bottom: 10px;
          font-size: 0.88rem;
        }
        .mp-mini-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
        }
        .mp-mini-row span:first-child { color: #8b97a8; }
        .mp-mini-row span:last-child { color: #eef2f7; font-weight: 600; }

        /* How it works */
        .mp-how-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .mp-how-step {
          padding: 28px 22px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          text-align: center;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .mp-how-step:hover {
          transform: translateY(-4px);
          border-color: rgba(0,223,162,0.3);
        }
        .mp-how-num {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 2px solid rgba(0,223,162,0.3);
          color: #00dfa2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          font-weight: 900;
          font-size: 1.3rem;
          font-family: 'Outfit', sans-serif;
        }
        .mp-how-num.done {
          background: linear-gradient(135deg, rgba(30,215,96,0.2), rgba(30,215,96,0.05));
          color: #1ED760;
          border-color: rgba(30,215,96,0.5);
        }
        .mp-how-title {
          font-weight: 800;
          font-size: 1rem;
          margin-bottom: 8px;
          font-family: 'Outfit', sans-serif;
          color: #eef2f7;
        }
        .mp-how-desc {
          color: #8b97a8;
          font-size: 0.88rem;
          line-height: 1.55;
          margin-bottom: 14px;
        }
        .mp-how-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
        .mp-chip {
          padding: 4px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          font-size: 0.7rem;
          color: #8b97a8;
        }

        /* Reward / staking */
        .mp-reward-card {
          padding: 24px 20px;
          text-align: center;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .mp-reward-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0,223,162,0.3);
        }
        .mp-staking-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(0,223,162,0.1);
          border: 1px solid rgba(0,223,162,0.25);
          color: #00dfa2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          font-size: 1.4rem;
          font-weight: 800;
        }
        .mp-staking-asset {
          font-weight: 700;
          color: #eef2f7;
          margin-bottom: 6px;
          font-family: 'Outfit', sans-serif;
        }
        .mp-staking-apy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.6rem;
          font-weight: 900;
          color: #1ED760;
          margin-bottom: 4px;
          line-height: 1;
        }
        .mp-staking-label {
          font-size: 0.74rem;
          color: #8b97a8;
          margin-bottom: 14px;
        }
        .mp-toggle {
          width: 44px;
          height: 24px;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          position: relative;
          cursor: pointer;
          transition: background 0.2s ease;
          margin: 0 auto;
        }
        .mp-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #eef2f7;
          transition: transform 0.2s ease;
        }
        .mp-toggle.active {
          background: rgba(0,223,162,0.4);
          border-color: rgba(0,223,162,0.5);
        }
        .mp-toggle.active::after {
          transform: translateX(20px);
          background: #00dfa2;
        }

        /* Position calculator */
        .mp-position-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .mp-position-card { padding: 20px; }
        .mp-position-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-weight: 800;
          color: #eef2f7;
          font-family: 'Outfit', sans-serif;
        }
        .mp-position-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 0.85rem;
        }
        .mp-position-row span:first-child { color: #8b97a8; }
        .mp-position-row span:last-child {
          color: #eef2f7;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }

        /* Maturity timeline */
        .mp-timeline {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .mp-timeline-step { padding: 22px 18px; text-align: center; }
        .mp-timeline-label {
          font-size: 0.72rem;
          color: #00dfa2;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .mp-timeline-value {
          font-weight: 800;
          color: #eef2f7;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 4px;
        }
        .mp-timeline-desc { font-size: 0.78rem; color: #8b97a8; }

        .mp-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .mp-info-card { padding: 22px; }
        .mp-info-card h4 {
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 8px;
          font-family: 'Outfit', sans-serif;
        }
        .mp-info-card p { color: #8b97a8; font-size: 0.92rem; }

        /* Portfolio overview */
        .mp-stat-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .mp-stat-card { padding: 24px; }
        .mp-stat-card-label {
          font-size: 0.78rem;
          color: #8b97a8;
          font-weight: 600;
          margin-bottom: 10px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .mp-stat-card-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.65rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 8px;
        }
        .mp-stat-card-change {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }
        .mp-stat-card-change.positive { color: #1ED760; }
        .mp-stat-card-change.negative { color: #f43f5e; }
        .mp-stat-card-change.neutral { color: #8b97a8; }
        .mp-portfolio-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr 1fr;
          gap: 20px;
        }
        .mp-portfolio-chart { padding: 22px; }
        .mp-portfolio-chart h3 {
          font-size: 1rem;
          font-weight: 800;
          margin-bottom: 16px;
          font-family: 'Outfit', sans-serif;
          color: #eef2f7;
        }
        .mp-holdings-table {
          width: 100%;
          font-size: 0.86rem;
        }
        .mp-holdings-table th {
          padding: 8px 0;
          color: #8b97a8;
          font-weight: 600;
          font-size: 0.74rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mp-holdings-table td {
          padding: 8px 0;
          color: #eef2f7;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .mp-holdings-table tbody tr:last-child td { border-bottom: none; }

        .mp-daily-pnl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .mp-pnl-card {
          padding: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
        }
        .mp-pnl-sym {
          font-weight: 800;
          font-size: 0.92rem;
          color: #eef2f7;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 4px;
        }
        .mp-pnl-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.05rem;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .mp-pnl-pct {
          font-size: 0.78rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Transaction history */
        .mp-history-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          justify-content: center;
        }
        .mp-filter-btn {
          padding: 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #8b97a8;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          font-family: inherit;
        }
        .mp-filter-btn.active {
          background: rgba(0,223,162,0.15);
          color: #00dfa2;
          border-color: rgba(0,223,162,0.4);
        }
        .mp-filter-btn:hover:not(.active) { color: #eef2f7; border-color: rgba(255,255,255,0.16); }
        .mp-status-pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .mp-status-pill.completed { background: rgba(30,215,96,0.1); color: #1ED760; border: 1px solid rgba(30,215,96,0.2); }
        .mp-status-pill.pending { background: rgba(240,180,41,0.1); color: #F0B429; border: 1px solid rgba(240,180,41,0.2); }

        /* Disclaimers */
        .mp-disclaimer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .mp-disclaimer-card { padding: 26px; }
        .mp-disclaimer-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 12px;
          font-family: 'Outfit', sans-serif;
        }
        .mp-disclaimer-title svg { color: #00dfa2; }
        .mp-disclaimer-content { color: #8b97a8; font-size: 0.92rem; line-height: 1.7; }

        /* Footer */
        .mp-footer {
          background: #07080c;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 32px 0;
        }
        .mp-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .mp-footer p { color: #8b97a8; font-size: 0.85rem; margin: 0; }
        .mp-footer-links {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
        }
        .mp-footer-link {
          color: #8b97a8;
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.2s ease;
        }
        .mp-footer-link:hover { color: #00dfa2; }

        /* Responsive */
        @media (max-width: 1024px) {
          .mp-calc-grid { grid-template-columns: 1fr; }
          .mp-feature-grid { grid-template-columns: 1fr; }
          .mp-how-grid { grid-template-columns: repeat(2, 1fr); }
          .mp-timeline { grid-template-columns: repeat(2, 1fr); }
          .mp-portfolio-grid { grid-template-columns: 1fr; }
          .mp-disclaimer-grid { grid-template-columns: 1fr; }
          .mp-info-grid { grid-template-columns: 1fr; }
          .mp-stat-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .mp-sec { padding: 56px 0; }
          .mp-nav-links { display: none; }
          .mp-hamburger { display: flex; }
          .mp-hero-stats { grid-template-columns: 1fr; }
          .mp-hero { padding: 56px 0 48px; }
          .mp-how-grid { grid-template-columns: 1fr; }
          .mp-timeline { grid-template-columns: 1fr; }
          .mp-feature-list { grid-template-columns: 1fr; }
          .mp-table { display: none; }
          .mp-table-card { display: block; }
        }
        @media (max-width: 600px) {
          .mp-h1 { font-size: 2.05rem; }
          .mp-hero-buttons .mp-btn { width: 100%; }
        }
      `}</style>

      {/* ─── TICKER (reused TickerBar) ─── */}
      <div className="mp-ticker-wrap">
        <TickerBar />
      </div>

      {/* ─── NAV ─── */}
      <nav className="mp-nav">
        <div className="mp-nav-inner">
          <Link to="/main/dashboard" className="mp-logo" aria-label={brandName}>
            <div className="mp-logo-icon">1TM</div>
            <div className="mp-logo-text">
              {brandHead ? (
                <>
                  {brandHead} <em>{brandTail}</em>
                </>
              ) : (
                <em>{brandTail}</em>
              )}
            </div>
          </Link>
          <div className="mp-nav-links">
            {NAV_LINKS.map((l) =>
              l.to.startsWith("#") ? (
                <button
                  key={l.label}
                  type="button"
                  className={`mp-nav-link${l.active ? " active" : ""}`}
                  onClick={() => smoothScroll(l.to)}
                >
                  {l.label}
                </button>
              ) : l.external ? (
                <a
                  key={l.label}
                  href={l.to}
                  className={`mp-nav-link${l.active ? " active" : ""}`}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`mp-nav-link${l.active ? " active" : ""}`}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
          <div className="mp-nav-right">
            <Bell className="mp-nav-icon h-5 w-5" aria-label="Notifications" />
            <div className="mp-avatar" aria-label="User initials">
              {initials}
            </div>
            <button
              type="button"
              className="mp-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              key="mp-mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="mp-mobile-menu">
                {NAV_LINKS.map((l) =>
                  l.to.startsWith("#") ? (
                    <button
                      key={l.label}
                      type="button"
                      className={`mp-nav-link${l.active ? " active" : ""}`}
                      onClick={() => {
                        setMenuOpen(false);
                        smoothScroll(l.to);
                      }}
                    >
                      {l.label}
                    </button>
                  ) : l.external ? (
                    <a
                      key={l.label}
                      href={l.to}
                      className={`mp-nav-link${l.active ? " active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      to={l.to}
                      className={`mp-nav-link${l.active ? " active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── 1. HERO ─── */}
      <section className="mp-hero">
        <div className="mp-hero-inner">
          <motion.div {...revealProps}>
            <div className="mp-promo-badge">
              <span className="mp-live-dot" />
              <Leaf className="h-3.5 w-3.5" />
              Actively Managed Digital Asset Strategy
            </div>
            <h1 className="mp-h1">
              Managed Portfolio —{" "}
              <span className="mp-accent">A Stable Approach</span> to Long-Term
              Growth
            </h1>
            <p className="mp-hero-sub">
              Diversified digital assets managed by professionals. Our actively
              managed strategy combines hedging, yield positions, and
              rebalancing to provide stable long-term growth with transparent
              performance tracking.
            </p>
            <div className="mp-hero-buttons">
              <Link to="/main/chat" className="mp-btn mp-btn-accent">
                Start Managed Portfolio
              </Link>
              <button
                type="button"
                className="mp-btn mp-btn-outline"
                onClick={() => smoothScroll("#mp-calculator")}
              >
                Calculate Returns
              </button>
            </div>
            <div className="mp-hero-stats">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="mp-hero-stat">
                  <div className="mp-hero-stat-val">
                    {s.live && <span className="mp-live-dot" />}
                    {s.value}
                  </div>
                  <div className="mp-hero-stat-lab">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mp-hero-fineprint">
              Transparent performance tracking with daily PnL reports and
              rebalancing statements.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. TOP MARKETS (live data: useAssetStore) ─── */}
      <section className="mp-sec">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <ChartLine className="h-3.5 w-3.5" />
              Real-Time Markets
            </div>
            <h2 className="mp-sec-title">Top Markets</h2>
            <p className="mp-sec-desc">
              Track the most liquid and tradeable digital assets in real time
            </p>
          </motion.div>
          {isLoadingAssets && topMarkets.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#8b97a8",
                padding: "32px 0",
              }}
            >
              Loading markets…
            </div>
          ) : topMarkets.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#8b97a8",
                padding: "32px 0",
              }}
            >
              No markets available.
            </div>
          ) : (
            <div className="mp-price-grid">
              {topMarkets.map((a) => {
                const ch = Number(a.change_percent || 0);
                const up = ch >= 0;
                return (
                  <motion.div
                    key={a.id || a.symbol}
                    {...revealProps}
                    className="mp-glass mp-price-card"
                  >
                    <div className="mp-pc-head">
                      <div className="mp-pc-icon">
                        {a.image ? (
                          <img src={a.image} alt={a.symbol} />
                        ) : (
                          a.symbol?.slice(0, 2) || "?"
                        )}
                      </div>
                      <div className="mp-pc-meta">
                        <span className="mp-pc-sym">{a.symbol}</span>
                        <span className="mp-pc-name">{a.name}</span>
                      </div>
                    </div>
                    <div className="mp-pc-price">${fmtPriceCell(a.rate)}</div>
                    <div className={`mp-pc-change ${up ? "up" : "down"}`}>
                      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {up ? "+" : ""}
                      {ch.toFixed(2)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. PORTFOLIO CALCULATOR (Plan Your Investment) ─── */}
      <section className="mp-sec mp-sec-dark" id="mp-calculator">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Calculator className="h-3.5 w-3.5" />
              Plan Your Investment
            </div>
            <h2 className="mp-sec-title">Portfolio Calculator</h2>
            <p className="mp-sec-desc">
              Customize your allocation and project your returns over time
            </p>
          </motion.div>

          <div className="mp-calc-grid">
            {/* Left column */}
            <div>
              <motion.div {...revealProps} className="mp-glass mp-calc-card">
                <div className="mp-card-title">
                  <Edit3 className="h-4 w-4" /> Contribution Details
                </div>
                <div className="mp-input-group">
                  <label className="mp-input-label" htmlFor="mp-contrib">
                    Initial Investment
                  </label>
                  <input
                    id="mp-contrib"
                    type="number"
                    className="mp-input"
                    value={contribAmount}
                    min={100}
                    onChange={(e) => setContribAmount(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="mp-input-group">
                  <label className="mp-input-label" htmlFor="mp-currency">
                    Currency
                  </label>
                  <select
                    id="mp-currency"
                    className="mp-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as typeof currency)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div className="mp-input-group">
                  <label className="mp-input-label">Frequency</label>
                  <div className="mp-radio-group">
                    {(["once", "monthly", "quarterly", "annually"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`mp-radio-btn${freq === f ? " active" : ""}`}
                        onClick={() => setFreq(f)}
                      >
                        {f === "once" ? "One-time" : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mp-input-group">
                  <label className="mp-input-label">Strategy Type</label>
                  <div className="mp-radio-group">
                    {(["conservative", "balanced"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`mp-radio-btn${stratType === t ? " active" : ""}`}
                        onClick={() => setStratType(t)}
                      >
                        {t === "conservative" ? "Conservative" : "Balanced Growth"}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                {...revealProps}
                className="mp-glass mp-calc-card"
                style={{ marginTop: 20 }}
              >
                <div className="mp-card-title">
                  <PieIcon className="h-4 w-4" /> Portfolio Allocation
                </div>
                <div className="mp-input-group">
                  <label className="mp-input-label">Preset Strategy</label>
                  <div className="mp-button-group">
                    {(["conservative", "balanced", "growth", "custom"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`mp-preset-btn${preset === p ? " active" : ""}`}
                        onClick={() => setPreset(p)}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  {allocations.map((a) => (
                    <div key={a.label} className="mp-alloc-row">
                      <span className="mp-alloc-label">{a.label}</span>
                      <div className="mp-alloc-bar-wrap">
                        <div
                          className="mp-alloc-bar"
                          style={{ width: `${Math.min(100, a.weight)}%` }}
                        />
                      </div>
                      <span className="mp-alloc-pct">{a.weight}%</span>
                    </div>
                  ))}
                </div>
                <div className="mp-alloc-total">
                  <span>Total Allocation:</span>
                  <span>{allocTotal}%</span>
                </div>
              </motion.div>
            </div>

            {/* Right column */}
            <div>
              <motion.div {...revealProps} className="mp-glass mp-calc-card">
                <div className="mp-card-title">
                  <ChartLine className="h-4 w-4" /> Projected Returns
                </div>
                <div className="mp-input-group">
                  <label className="mp-input-label">Timeline</label>
                  <div className="mp-timeline-pills">
                    {[5, 10, 15, 20, 25, 30].map((y) => (
                      <button
                        key={y}
                        type="button"
                        className={`mp-pill${projYears === y ? " active" : ""}`}
                        onClick={() => setProjYears(y)}
                      >
                        {y}Y
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <AreaChart data={projection}>
                      <defs>
                        <linearGradient id="mpProj" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00dfa2" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#00dfa2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="year"
                        tick={{ fill: "#4a5468", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      />
                      <YAxis
                        tick={{ fill: "#4a5468", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        tickFormatter={(v) => fmtMoney(v as number)}
                        width={60}
                      />
                      <ReTooltip
                        contentStyle={{
                          background: "#0a0d15",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#eef2f7",
                        }}
                        formatter={(v: number) => fmtMoney(v)}
                        labelFormatter={(y) => `Year ${y}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#00dfa2"
                        strokeWidth={2}
                        fill="url(#mpProj)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mp-projection-stats">
                  <div className="mp-projection-stat">
                    <div className="mp-projection-stat-lab">Projected Value</div>
                    <div className="mp-projection-stat-val">
                      {currencySymbol}
                      {fmtMoney(projValue).replace("$", "")}
                    </div>
                  </div>
                  <div className="mp-projection-stat">
                    <div className="mp-projection-stat-lab">Total Growth</div>
                    <div className="mp-projection-stat-val">{projGrowth.toFixed(1)}%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...revealProps} className="mp-protection-banner">
                <div className="mp-card-title">
                  <ShieldCheck className="h-4 w-4" /> How Your Capital is Protected
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#8b97a8",
                    marginBottom: 16,
                  }}
                >
                  Your assets are secured through industry-leading custody
                  solutions and regulatory compliance.
                </p>
                <div className="mp-protection-badges">
                  <div className="mp-badge-protection">
                    <Lock className="h-3.5 w-3.5" /> Cold Storage
                  </div>
                  <div className="mp-badge-protection">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Insured $250K
                  </div>
                  <div className="mp-badge-protection">
                    <Award className="h-3.5 w-3.5" /> Licensed
                  </div>
                </div>
                <Link
                  to="/main/wallet?tab=deposit"
                  className="mp-btn mp-btn-accent"
                  style={{ width: "100%" }}
                >
                  Contribute Now
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. WHY MANAGED PORTFOLIO ─── */}
      <section className="mp-sec">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Star className="h-3.5 w-3.5" />
              Why Choose Us
            </div>
            <h2 className="mp-sec-title">Why Managed Portfolio</h2>
            <p className="mp-sec-desc">
              Discover the benefits of active management and professional
              oversight
            </p>
          </motion.div>

          <div className="mp-feature-grid">
            {FEATURE_CARDS.map((f) => (
              <motion.div key={f.title} {...revealProps} className="mp-glass mp-feature-card">
                <div className={`mp-pillar-icon ${f.tone}`}>
                  {f.tone === "green" ? (
                    <ShieldCheck className="h-7 w-7" />
                  ) : (
                    <DollarSign className="h-7 w-7" />
                  )}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <ul className="mp-feature-list">
                  {f.bullets.map((b) => (
                    <li key={b} className="mp-feature-list-item">
                      <Check className="h-3.5 w-3.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...revealProps}
            className="mp-glass"
            style={{ marginTop: 40, padding: 8 }}
          >
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Feature</th>
                    <th>Conservative</th>
                    <th>Balanced Growth</th>
                    <th>Aggressive</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((r) => (
                    <tr key={r.f}>
                      <td style={{ textAlign: "left", color: "#8b97a8" }}>
                        {r.f}
                      </td>
                      <td>{r.c}</td>
                      <td>{r.b}</td>
                      <td>{r.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mp-table-card">
              {COMPARISON_ROWS.map((r) => (
                <div key={r.f} className="mp-mini-card">
                  <div
                    className="mp-mini-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 8 }}
                  >
                    <span style={{ color: "#00dfa2", fontWeight: 700 }}>{r.f}</span>
                    <span />
                  </div>
                  <div className="mp-mini-row">
                    <span>Conservative</span>
                    <span>{r.c}</span>
                  </div>
                  <div className="mp-mini-row">
                    <span>Balanced Growth</span>
                    <span>{r.b}</span>
                  </div>
                  <div className="mp-mini-row">
                    <span>Aggressive</span>
                    <span>{r.a}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 5. ELIGIBLE ASSETS (live + static APY map) ─── */}
      <section className="mp-sec mp-sec-dark">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Coins className="h-3.5 w-3.5" />
              Portfolio Contents
            </div>
            <h2 className="mp-sec-title">Eligible Assets (Top 20)</h2>
            <p className="mp-sec-desc">
              All assets available for inclusion in your managed portfolio
            </p>
          </motion.div>

          <motion.div {...revealProps} className="mp-glass" style={{ padding: 8 }}>
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: "left" }}>Asset</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th>Market Cap</th>
                    <th>Staking APY</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ color: "#8b97a8" }}>
                        Loading assets…
                      </td>
                    </tr>
                  ) : (
                    eligibleAssets.map((a, i) => {
                      const ch = Number(a.change_percent || 0);
                      const up = ch >= 0;
                      const apy = STAKING_APY_BY_SYMBOL[a.symbol?.toUpperCase()] ?? 0;
                      return (
                        <tr key={a.id || a.symbol}>
                          <td style={{ color: "#4a5468" }}>{i + 1}</td>
                          <td style={{ textAlign: "left" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="mp-pc-icon" style={{ width: 28, height: 28, fontSize: 0.8 + "rem" }}>
                                {a.image ? <img src={a.image} alt={a.symbol} /> : a.symbol?.slice(0, 2)}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ color: "#eef2f7", fontWeight: 700 }}>{a.symbol}</span>
                                <span style={{ color: "#8b97a8", fontSize: "0.78rem" }}>{a.name}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontFamily: "JetBrains Mono, monospace" }}>${fmtPriceCell(a.rate)}</td>
                          <td>
                            <span
                              className={`mp-pc-change ${up ? "up" : "down"}`}
                              style={{ justifyContent: "center" }}
                            >
                              {up ? "+" : ""}
                              {ch.toFixed(2)}%
                            </span>
                          </td>
                          <td>{fmtMarketCap(a.market_cap)}</td>
                          <td style={{ color: apy > 0 ? "#1ED760" : "#8b97a8", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
                            {apy > 0 ? `${apy.toFixed(2)}%` : "—"}
                          </td>
                          <td>
                            <Link
                              to="/main/wallet?tab=deposit"
                              className="mp-btn mp-btn-outline"
                              style={{ padding: "8px 14px", fontSize: "0.78rem" }}
                            >
                              Add
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mp-table-card">
              {eligibleAssets.map((a, i) => {
                const ch = Number(a.change_percent || 0);
                const up = ch >= 0;
                const apy = STAKING_APY_BY_SYMBOL[a.symbol?.toUpperCase()] ?? 0;
                return (
                  <div key={a.id || a.symbol} className="mp-mini-card">
                    <div
                      className="mp-mini-row"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 8 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "#4a5468" }}>{i + 1}</span>
                        <span style={{ color: "#eef2f7", fontWeight: 700 }}>{a.symbol}</span>
                        <span style={{ color: "#8b97a8", fontSize: "0.78rem" }}>{a.name}</span>
                      </div>
                      <span className={`mp-pc-change ${up ? "up" : "down"}`}>
                        {up ? "+" : ""}
                        {ch.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mp-mini-row">
                      <span>Price</span>
                      <span>${fmtPriceCell(a.rate)}</span>
                    </div>
                    <div className="mp-mini-row">
                      <span>Market Cap</span>
                      <span>{fmtMarketCap(a.market_cap)}</span>
                    </div>
                    <div className="mp-mini-row">
                      <span>Staking APY</span>
                      <span style={{ color: apy > 0 ? "#1ED760" : "#8b97a8" }}>
                        {apy > 0 ? `${apy.toFixed(2)}%` : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 6. HOW IT WORKS ─── */}
      <section className="mp-sec">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Play className="h-3.5 w-3.5" />
              Getting Started
            </div>
            <h2 className="mp-sec-title">How It Works</h2>
            <p className="mp-sec-desc">
              Four simple steps to start your managed portfolio journey
            </p>
          </motion.div>

          <div className="mp-how-grid">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.05 }}
                className="mp-how-step"
              >
                <div className={`mp-how-num${s.done ? " done" : ""}`}>{s.num}</div>
                <div className="mp-how-title">{s.title}</div>
                <div className="mp-how-desc">{s.desc}</div>
                <div className="mp-how-chips">
                  {s.chips.map((c) => (
                    <span key={c} className="mp-chip">
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...revealProps}
            className="mp-glass"
            style={{
              padding: 22,
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <ShieldCheck
              className="h-7 w-7"
              style={{ color: "#00dfa2", flexShrink: 0 }}
            />
            <div>
              <strong style={{ color: "#eef2f7" }}>
                Your Investment is Protected.
              </strong>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#8b97a8",
                  marginTop: 4,
                }}
              >
                We use cold storage custody, regulatory licensing, and insurance
                coverage up to $250K per account.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 7. STAKING & YIELD ─── */}
      <section className="mp-sec mp-sec-dark">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Gift className="h-3.5 w-3.5" />
              Earn More
            </div>
            <h2 className="mp-sec-title">Staking &amp; Yield Opportunities</h2>
            <p className="mp-sec-desc">
              Maximize returns with integrated staking and yield protocols
            </p>
          </motion.div>

          <div className="mp-price-grid">
            {STAKING_REWARDS.map((s, i) => (
              <motion.div
                key={s.asset}
                {...revealProps}
                className="mp-glass mp-reward-card"
              >
                <div className="mp-staking-icon">{s.icon}</div>
                <div className="mp-staking-asset">{s.asset}</div>
                <div className="mp-staking-apy">{s.apy}</div>
                <div className="mp-staking-label">Annual APY</div>
                <button
                  type="button"
                  className={`mp-toggle${stakingOn[i] ? " active" : ""}`}
                  aria-pressed={stakingOn[i]}
                  aria-label={`Toggle staking for ${s.asset}`}
                  onClick={() =>
                    setStakingOn((prev) =>
                      prev.map((v, idx) => (idx === i ? !v : v)),
                    )
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. POSITION CALCULATOR (Size Your Position) ─── */}
      <section className="mp-sec">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Calculator className="h-3.5 w-3.5" />
              Size Your Position
            </div>
            <h2 className="mp-sec-title">Position Calculator</h2>
            <p className="mp-sec-desc">
              See exactly what your allocation looks like in units and USD
            </p>
          </motion.div>

          <motion.div
            {...revealProps}
            className="mp-glass"
            style={{ padding: 24, marginBottom: 28 }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <label className="mp-input-label" htmlFor="mp-poscalc">
                  Investment Amount (USD)
                </label>
                <input
                  id="mp-poscalc"
                  type="number"
                  className="mp-input"
                  value={posCalcAmount}
                  min={100}
                  onChange={(e) => setPosCalcAmount(Number(e.target.value) || 0)}
                />
              </div>
              <button
                type="button"
                className="mp-btn mp-btn-accent"
                style={{ height: 46 }}
                onClick={() => setPosCalcAmount((v) => v)}
              >
                Calculate
              </button>
            </div>
          </motion.div>

          <div className="mp-position-grid">
            {positionRows.length === 0 ? (
              <div style={{ color: "#8b97a8", textAlign: "center", gridColumn: "1 / -1" }}>
                {assets.length === 0
                  ? "Loading market prices…"
                  : "No allocation rows for this preset."}
              </div>
            ) : (
              positionRows.map((r) => (
                <motion.div
                  key={r.label}
                  {...revealProps}
                  className="mp-glass mp-position-card"
                >
                  <div className="mp-position-head">
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: r.color,
                        color: "#000",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      {r.label.slice(0, 2)}
                    </span>
                    {r.label} <span style={{ color: "#00dfa2", marginLeft: "auto" }}>{r.weight}%</span>
                  </div>
                  <div className="mp-position-row">
                    <span>USD Value</span>
                    <span>{fmtMoney(r.usd)}</span>
                  </div>
                  <div className="mp-position-row">
                    <span>Price</span>
                    <span>${fmtPriceCell(r.price)}</span>
                  </div>
                  <div className="mp-position-row">
                    <span>Units</span>
                    <span>
                      {r.units > 0
                        ? r.units.toLocaleString("en-US", {
                            maximumFractionDigits: 6,
                          })
                        : "—"}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── 9. MATURITY & HOLD REQUIREMENTS ─── */}
      <section className="mp-sec mp-sec-dark">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Hourglass className="h-3.5 w-3.5" />
              Terms &amp; Conditions
            </div>
            <h2 className="mp-sec-title">Maturity &amp; Hold Requirements</h2>
            <p className="mp-sec-desc">
              Understand the phases and withdrawal terms for your investment
            </p>
          </motion.div>

          <div className="mp-timeline">
            {TIMELINE_PHASES.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.04 }}
                className="mp-glass mp-timeline-step"
              >
                <div className="mp-timeline-label">{p.label}</div>
                <div className="mp-timeline-value">{p.value}</div>
                <div className="mp-timeline-desc">{p.desc}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...revealProps}
            className="mp-glass"
            style={{ marginTop: 32, padding: 8 }}
          >
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Timing</th>
                    <th>Penalty %</th>
                    <th>Tax Treatment</th>
                    <th>Processing Time</th>
                  </tr>
                </thead>
                <tbody>
                  {PENALTY_ROWS.map((r) => (
                    <tr key={r.timing}>
                      <td>{r.timing}</td>
                      <td>{r.pct}</td>
                      <td>{r.tax}</td>
                      <td>{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mp-table-card">
              {PENALTY_ROWS.map((r) => (
                <div key={r.timing} className="mp-mini-card">
                  <div
                    className="mp-mini-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 8 }}
                  >
                    <span style={{ color: "#00dfa2", fontWeight: 700 }}>{r.timing}</span>
                    <span />
                  </div>
                  <div className="mp-mini-row"><span>Penalty</span><span>{r.pct}</span></div>
                  <div className="mp-mini-row"><span>Tax Treatment</span><span>{r.tax}</span></div>
                  <div className="mp-mini-row"><span>Processing Time</span><span>{r.time}</span></div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mp-info-grid" style={{ marginTop: 32 }}>
            {INFO_CARDS.map((c) => (
              <motion.div key={c.title} {...revealProps} className="mp-glass mp-info-card">
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. PORTFOLIO OVERVIEW ─── */}
      <section className="mp-sec">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <BarChart3 className="h-3.5 w-3.5" />
              Your Portfolio
            </div>
            <h2 className="mp-sec-title">Portfolio Overview</h2>
            <p className="mp-sec-desc">
              Real-time dashboard of your holdings, performance, and daily
              movements
            </p>
          </motion.div>

          <div className="mp-stat-cards">
            <motion.div {...revealProps} className="mp-glass mp-stat-card">
              <div className="mp-stat-card-label">Total Portfolio Value</div>
              <div className="mp-stat-card-value">${PORTFOLIO_TOTAL.toLocaleString()}</div>
              <div className="mp-stat-card-change positive">
                <ArrowUp className="h-3.5 w-3.5" /> 8.4%
              </div>
            </motion.div>
            <motion.div {...revealProps} className="mp-glass mp-stat-card">
              <div className="mp-stat-card-label">24h PnL</div>
              <div className="mp-stat-card-value">+$7,762.10</div>
              <div className="mp-stat-card-change positive">
                <ArrowUp className="h-3.5 w-3.5" /> 1.4%
              </div>
            </motion.div>
            <motion.div {...revealProps} className="mp-glass mp-stat-card">
              <div className="mp-stat-card-label">Total Contributions</div>
              <div className="mp-stat-card-value">$500,000.00</div>
              <div className="mp-stat-card-change neutral">
                {PORTFOLIO_HOLDINGS.length} holdings
              </div>
            </motion.div>
          </div>

          <div className="mp-portfolio-grid">
            <motion.div {...revealProps} className="mp-glass mp-portfolio-chart">
              <h3>Performance</h3>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <ReLineChart data={PORTFOLIO_PERF}>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#4a5468", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fill: "#4a5468", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      tickFormatter={(v) => fmtMoney(v as number)}
                      width={50}
                    />
                    <ReTooltip
                      contentStyle={{
                        background: "#0a0d15",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#eef2f7",
                      }}
                      formatter={(v: number) => fmtMoney(v)}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#00dfa2"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div {...revealProps} className="mp-glass mp-portfolio-chart">
              <h3>Holdings Allocation</h3>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      stroke="#0a0d15"
                      strokeWidth={2}
                    >
                      {pieData.map((p) => (
                        <Cell key={p.name} fill={p.color} />
                      ))}
                    </Pie>
                    <ReTooltip
                      contentStyle={{
                        background: "#0a0d15",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#eef2f7",
                      }}
                      formatter={(v: number, n: string) => [`$${v.toLocaleString()}`, n]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "0.72rem", color: "#8b97a8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div {...revealProps} className="mp-glass mp-portfolio-chart">
              <h3>Top Holdings</h3>
              <table className="mp-holdings-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Asset</th>
                    <th style={{ textAlign: "right" }}>Shares</th>
                    <th style={{ textAlign: "right" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {PORTFOLIO_HOLDINGS.slice(0, 6).map((h) => (
                    <tr key={h.sym}>
                      <td style={{ textAlign: "left" }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: h.color,
                            marginRight: 8,
                          }}
                        />
                        {h.sym}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {h.shares.toLocaleString("en-US", {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        ${h.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>

          <h3
            style={{
              marginTop: 32,
              marginBottom: 18,
              color: "#eef2f7",
              textAlign: "center",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 800,
            }}
          >
            Daily PnL Breakdown
          </h3>
          <div className="mp-daily-pnl-grid">
            {DAILY_PNL_BREAKDOWN.map((p) => {
              const up = p.pnl >= 0;
              return (
                <motion.div key={p.sym} {...revealProps} className="mp-pnl-card">
                  <div className="mp-pnl-sym">{p.sym}</div>
                  <div
                    className="mp-pnl-val"
                    style={{ color: up ? "#1ED760" : "#f43f5e" }}
                  >
                    {up ? "+" : ""}${Math.abs(p.pnl).toFixed(2)}
                  </div>
                  <div
                    className="mp-pnl-pct"
                    style={{ color: up ? "#1ED760" : "#f43f5e" }}
                  >
                    {up ? "+" : ""}
                    {p.pct.toFixed(2)}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 11. TRANSACTION HISTORY ─── */}
      <section className="mp-sec mp-sec-dark">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <History className="h-3.5 w-3.5" />
              Track Activity
            </div>
            <h2 className="mp-sec-title">Transaction History</h2>
            <p className="mp-sec-desc">
              Complete audit trail of all contributions, withdrawals, and
              rebalancing
            </p>
          </motion.div>

          <div className="mp-history-controls">
            {(
              [
                { k: "all", l: "All" },
                { k: "contributions", l: "Contributions" },
                { k: "withdrawals", l: "Withdrawals" },
                { k: "rebalances", l: "Rebalances" },
              ] as const
            ).map((b) => (
              <button
                key={b.k}
                type="button"
                className={`mp-filter-btn${txFilter === b.k ? " active" : ""}`}
                onClick={() => setTxFilter(b.k)}
              >
                {b.l}
              </button>
            ))}
          </div>

          <motion.div {...revealProps} className="mp-glass" style={{ padding: 8 }}>
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th style={{ textAlign: "left" }}>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t, i) => (
                    <tr key={`${t.date}-${i}`}>
                      <td style={{ fontFamily: "JetBrains Mono, monospace", color: "#8b97a8" }}>
                        {t.date}
                      </td>
                      <td style={{ textTransform: "capitalize", color: "#00dfa2", fontWeight: 700 }}>
                        {t.type}
                      </td>
                      <td style={{ textAlign: "left", color: "#8b97a8" }}>{t.desc}</td>
                      <td
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: t.amount.startsWith("-") ? "#f43f5e" : t.amount.startsWith("+") ? "#1ED760" : "#8b97a8",
                          fontWeight: 700,
                        }}
                      >
                        {t.amount}
                      </td>
                      <td>
                        <span
                          className={`mp-status-pill ${
                            t.status === "Completed" ? "completed" : "pending"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mp-table-card">
              {filteredTx.map((t, i) => (
                <div key={`${t.date}-${i}-mob`} className="mp-mini-card">
                  <div
                    className="mp-mini-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 8 }}
                  >
                    <span style={{ color: "#eef2f7", fontWeight: 700 }}>{t.date}</span>
                    <span
                      className={`mp-status-pill ${
                        t.status === "Completed" ? "completed" : "pending"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="mp-mini-row">
                    <span>Type</span>
                    <span style={{ textTransform: "capitalize", color: "#00dfa2" }}>{t.type}</span>
                  </div>
                  <div className="mp-mini-row">
                    <span>Description</span>
                    <span style={{ textAlign: "right", maxWidth: "60%" }}>{t.desc}</span>
                  </div>
                  <div className="mp-mini-row">
                    <span>Amount</span>
                    <span
                      style={{
                        color: t.amount.startsWith("-") ? "#f43f5e" : t.amount.startsWith("+") ? "#1ED760" : "#8b97a8",
                        fontWeight: 700,
                      }}
                    >
                      {t.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 12. IMPORTANT DISCLOSURES ─── */}
      <section className="mp-sec">
        <div className="mp-container">
          <motion.div {...revealProps} className="mp-sec-header">
            <div className="mp-sec-label">
              <Info className="h-3.5 w-3.5" />
              Legal &amp; Compliance
            </div>
            <h2 className="mp-sec-title">Important Disclosures</h2>
            <p className="mp-sec-desc">
              Please review these critical disclosures before proceeding
            </p>
          </motion.div>

          <div className="mp-disclaimer-grid">
            {DISCLAIMERS.map((d) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.title}
                  {...revealProps}
                  className="mp-glass mp-disclaimer-card"
                >
                  <div className="mp-disclaimer-title">
                    <Icon className="h-5 w-5" />
                    {d.title}
                  </div>
                  <div className="mp-disclaimer-content">{d.desc}</div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            {...revealProps}
            style={{
              marginTop: 36,
              textAlign: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              justifyContent: "center",
            }}
          >
            <Link to="/main/chat" className="mp-btn mp-btn-accent">
              Talk to Support
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/main/wallet?tab=deposit" className="mp-btn mp-btn-outline">
              Fund Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mp-footer">
        <div className="mp-footer-inner">
          <p>© 2024–2026 {brandName}. All rights reserved.</p>
          <div className="mp-footer-links">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="mp-footer-link">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
