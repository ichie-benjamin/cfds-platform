import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  AreaChart as AreaChartIcon,
  Award,
  BarChart3,
  Bell,
  Briefcase,
  ChevronDown,
  CircleCheck,
  Coins,
  Copy as CopyIcon,
  Crosshair,
  Crown,
  Gauge,
  Key,
  Landmark,
  Layers,
  LineChart as LineChartIcon,
  PieChart,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldHalf,
  Trophy,
  UserPlus,
  Users,
  UsersRound,
  Vault,
  Wallet,
  X,
} from "lucide-react";
import useUserStore from "@/store/userStore";
import useSiteSettingsStore from "@/store/siteSettingStore";
import { TickerBar } from "@/components/dashboard/TickerBar";

/* ──────────────────────────────────────────────────────────────
   PRESENTATIONAL DEMO CONSTANTS
   Reference (html_files/fund-managers (1).html) itself embeds
   a hardcoded managers array, demo leaderboard fallback, and
   "representative demo data" notice by design.
   These values are copied from the reference so the UI matches
   1:1. NO store, NO service, NO API, NO external fetch.
   Pure presentation.
   ────────────────────────────────────────────────────────────── */

interface Position {
  pair: string;
  entry: number;
  current: number;
  pnl: number;
  size: number;
}

interface Manager {
  id: number;
  name: string;
  role: string;
  roi: number;
  aum: number;
  followers: number;
  winRate: number;
  since: string;
  mgmtFee: number;
  perfFee: number;
  avatarIdx: number;
  monthlyReturns: number[];
}

const MANAGERS: Manager[] = [
  { id: 1, name: "Alexander Kovac", role: "Verified", roi: 127.4, aum: 78.5,  followers: 1203, winRate: 92.3, since: "Jan 2024", mgmtFee: 1.5,  perfFee: 15, avatarIdx: 0, monthlyReturns: [8, 12, -2, 15, 18, 9, 11, 16, 7, 14, 21, 11] },
  { id: 2, name: "Maria Santoro",  role: "Verified", roi: 89.2,  aum: 45.2,  followers: 876,  winRate: 85.6, since: "Mar 2023", mgmtFee: 1.0,  perfFee: 20, avatarIdx: 1, monthlyReturns: [6, 8, 10, 7, 9, 11, 8, 12, 10, 6, 9, 7] },
  { id: 3, name: "James Chen",     role: "Verified", roi: 156.8, aum: 120.0, followers: 1547, winRate: 88.2, since: "Jul 2022", mgmtFee: 2.0,  perfFee: 25, avatarIdx: 2, monthlyReturns: [12, 15, 9, 18, 22, 16, 13, 19, 14, 20, 17, 15] },
  { id: 4, name: "Sarah Williams", role: "Verified", roi: 203.4, aum: 89.7,  followers: 2103, winRate: 91.0, since: "Sep 2022", mgmtFee: 1.75, perfFee: 20, avatarIdx: 3, monthlyReturns: [14, 18, 12, 20, 25, 19, 16, 22, 18, 24, 21, 19] },
  { id: 5, name: "David Park",     role: "Verified", roi: 78.5,  aum: 56.3,  followers: 923,  winRate: 84.2, since: "Dec 2023", mgmtFee: 1.25, perfFee: 15, avatarIdx: 4, monthlyReturns: [5, 7, 9, 6, 8, 10, 7, 9, 8, 11, 10, 8] },
  { id: 6, name: "Lisa Rosenberg", role: "Verified", roi: 245.6, aum: 145.8, followers: 3012, winRate: 89.8, since: "May 2022", mgmtFee: 2.5,  perfFee: 30, avatarIdx: 5, monthlyReturns: [16, 20, 14, 22, 28, 21, 18, 25, 20, 26, 23, 21] },
];

// Open positions per manager — reference values (presentational only).
const MANAGER_POSITIONS: Record<number, Position[]> = {
  1: [{ pair: "BTC/USD", entry: 42300, current: 51200, pnl: 21.0, size: 0.5 }, { pair: "ETH/USD", entry: 2100, current: 2650, pnl: 26.2, size: 5.0 }, { pair: "SOL/USD", entry: 98, current: 145, pnl: 48.0, size: 25.0 }],
  2: [{ pair: "ETH/USD", entry: 2850, current: 3120, pnl: 9.5, size: 8.0 }, { pair: "LINK/USD", entry: 14.2, current: 18.45, pnl: 29.9, size: 200 }, { pair: "AVAX/USD", entry: 32, current: 48.9, pnl: 52.8, size: 50 }],
  3: [{ pair: "BTC/USD", entry: 38500, current: 67200, pnl: 74.5, size: 1.2 }, { pair: "SOL/USD", entry: 45, current: 189, pnl: 320.0, size: 100 }, { pair: "DOT/USD", entry: 5.8, current: 9.2, pnl: 58.6, size: 500 }, { pair: "ARB/USD", entry: 0.85, current: 1.78, pnl: 109.4, size: 2000 }],
  4: [{ pair: "BTC/USD", entry: 44100, current: 67200, pnl: 52.4, size: 0.8 }, { pair: "ETH/USD", entry: 1650, current: 3890, pnl: 135.8, size: 12 }, { pair: "MATIC/USD", entry: 0.42, current: 0.89, pnl: 111.9, size: 5000 }],
  5: [{ pair: "ETH/USD", entry: 3200, current: 3890, pnl: 21.6, size: 5 }, { pair: "ADA/USD", entry: 0.45, current: 1.15, pnl: 155.6, size: 3000 }],
  6: [{ pair: "BTC/USD", entry: 29800, current: 67200, pnl: 125.5, size: 2.5 }, { pair: "ETH/USD", entry: 1200, current: 3890, pnl: 224.2, size: 20 }, { pair: "SOL/USD", entry: 22, current: 189, pnl: 759.1, size: 150 }, { pair: "DOGE/USD", entry: 0.07, current: 0.42, pnl: 500.0, size: 50000 }],
};

interface ManagerProfile {
  strategy: string;
  risk: "Low" | "Medium" | "High";
  maxDD: string;
  sharpe: string;
  streak: string;
}

const MGR_PROFILES: Record<number, ManagerProfile> = {
  1: { strategy: "Swing Trading",    risk: "Medium", maxDD: "-12.4%", sharpe: "2.14", streak: "8W" },
  2: { strategy: "Conservative",     risk: "Low",    maxDD: "-6.2%",  sharpe: "1.87", streak: "5W" },
  3: { strategy: "Momentum",         risk: "Medium", maxDD: "-15.8%", sharpe: "2.52", streak: "11W" },
  4: { strategy: "Trend Following",  risk: "Medium", maxDD: "-9.1%",  sharpe: "2.89", streak: "14W" },
  5: { strategy: "Value Investing",  risk: "Low",    maxDD: "-5.3%",  sharpe: "1.62", streak: "4W" },
  6: { strategy: "Aggressive Growth", risk: "High",  maxDD: "-22.1%", sharpe: "3.15", streak: "18W" },
};

interface LbTrader {
  rank: number;
  uid: string;
  name: string;
  initials: string;
  avatarIdx: number;
  roi: number;
  pnl: number;
  winRate: number;
  txCount: number;
  followers: number;
  addr: string;
}

type Period = "7d" | "30d" | "90d" | "all";

const NAMES_BY_PERIOD: Record<Period, string[]> = {
  "7d":  ["CryptoWhale_BSC","AlphaTrader","BullRunKing","SatoshiPro","DeFi_Master","BSC_Legend","HodlGod","MoonSniper","WhaleAlert","GreenCandle","PolyBull","NightTrader","LayerZero_X","PumpKing","SolFlash","ArbMaster","BTCMaxi","ETHGhost","ChainBreaker","ZeroDelta"],
  "30d": ["DiamondHands","StableYield","ApeInPro","TokenHunter","ChartWizard","SignalKing","FundFlow","RiskOracle","MarketMaker","QuantEdge","VortexFund","SilverBull","RocketCap","BullBazaar","CryptoSage","GammaGuard","MidnightTrader","SwapMaster","LiquidLynx","HexSniper"],
  "90d": ["TitanFund","Nebula_Q","OmegaAlpha","ProphetVision","GreenForest","BlackSwanLabs","CipherOx","VolaticFox","AstroCrypto","OrbitalYield","SolarisCap","RedwoodFund","PhoenixQuant","FrostFunds","SteadyAlpha","ArcticMoon","HelioDesk","NovaFirm","CobaltPro","AzureDelta"],
  "all": ["LegendFund","EverBull","GoldenHodl","CenturionCap","AtlasFund","EpochTrader","KronosCap","HelixMoon","PrimeLineage","EternalBull","ZeroLoss","GranitePro","SteelMoon","ObsidianFund","TitanAlpha","VanguardQ","PatriotBull","SenateCap","PinnacleX","GalaxyHodl"],
};

function buildLeaderboardFor(period: Period): LbTrader[] {
  const profile = {
    "7d":  { roiBase:  240, roiStep: 11, pnlBase:  1_400_000, pnlStep:  60_000, winBase: 93, txBase:   820, txStep:  35, folBase:  6_400, folStep: 260 },
    "30d": { roiBase:  560, roiStep: 24, pnlBase:  4_100_000, pnlStep: 175_000, winBase: 89, txBase:  2_640, txStep: 118, folBase: 11_200, folStep: 440 },
    "90d": { roiBase:  980, roiStep: 42, pnlBase:  9_600_000, pnlStep: 395_000, winBase: 86, txBase:  6_800, txStep: 310, folBase: 18_050, folStep: 720 },
    "all": { roiBase: 1650, roiStep: 72, pnlBase: 24_000_000, pnlStep: 970_000, winBase: 82, txBase: 22_400, txStep: 990, folBase: 28_980, folStep: 1180 },
  }[period];
  const names = NAMES_BY_PERIOD[period];
  return names.map((n, i) => ({
    rank: i + 1,
    uid: `${period}-${i}`,
    name: n,
    initials: n.slice(0, 2).toUpperCase(),
    avatarIdx: i + 6,
    roi: Math.round((profile.roiBase - i * profile.roiStep + (i % 3) * 7) * 10) / 10,
    pnl: Math.round(profile.pnlBase - i * profile.pnlStep + (i % 4) * 30_000),
    winRate: Math.round((profile.winBase - i * 1.8 + (i % 3)) * 10) / 10,
    txCount: Math.round(profile.txBase - i * profile.txStep + (i % 5) * 12),
    followers: Math.round(profile.folBase - i * profile.folStep + (i % 4) * 80),
    addr:
      i < 5
        ? ""
        : "0x" +
          Array.from({ length: 8 })
            .map((_, k) => ((i * 31 + k * 7) % 16).toString(16))
            .join("") +
          "…",
  }));
}

const LEADERBOARDS: Record<Period, LbTrader[]> = {
  "7d": buildLeaderboardFor("7d"),
  "30d": buildLeaderboardFor("30d"),
  "90d": buildLeaderboardFor("90d"),
  "all": buildLeaderboardFor("all"),
};

const SUMMARY_BY_PERIOD: Record<
  Period,
  { activeTraders: string; totalAum: string; avgWinRate: string }
> = {
  "7d":  { activeTraders: "12,847", totalAum: "$2.1B",  avgWinRate: "87.3%" },
  "30d": { activeTraders: "18,204", totalAum: "$4.6B",  avgWinRate: "84.1%" },
  "90d": { activeTraders: "24,571", totalAum: "$8.9B",  avgWinRate: "81.5%" },
  "all": { activeTraders: "41,362", totalAum: "$19.7B", avgWinRate: "78.2%" },
};

/* ──────────────────────────────────────────────────────────────
   NAV — only items with real existing routes in the workspace.
   ────────────────────────────────────────────────────────────── */
const PRIMARY_LINKS = [
  { label: "Dashboard", href: "/main/dashboard", Icon: PieChart },
  { label: "Markets",   href: "/main/market",    Icon: LineChartIcon },
  { label: "Trade",     href: "/main/dashboard", Icon: ArrowLeftRight },
  { label: "Wallet",    href: "/main/wallet",    Icon: Wallet },
];

const MORE_LINKS = [
  { label: "Trading Plans",      href: "/main/trading-plans",    Icon: Layers },
  { label: "Fund Protection",    href: "/main/fund-protection",  Icon: ShieldHalf },
  { label: "Retirement Staking", href: "/main/savings",          Icon: Landmark },
  { label: "Trade Access",       href: "/main/trade-access",     Icon: Key },
];

const SIDEBAR_TOP = [
  { label: "Dashboard", href: "/main/dashboard", Icon: PieChart },
  { label: "Markets",   href: "/main/market",    Icon: LineChartIcon },
  { label: "Trade",     href: "/main/dashboard", Icon: ArrowLeftRight },
  { label: "Wallet",    href: "/main/wallet",    Icon: Wallet },
];

const SIDEBAR_MID = [
  { label: "Fund Managers",      href: "/main/fund-managers",   Icon: UsersRound, active: true },
  { label: "Trading Plans",      href: "/main/trading-plans",   Icon: Layers },
  { label: "Fund Protection",    href: "/main/fund-protection", Icon: ShieldHalf },
  { label: "Retirement Staking", href: "/main/savings",         Icon: Landmark },
];

const SIDEBAR_BOT = [
  { label: "Trade Access", href: "/main/trade-access", Icon: Key },
  { label: "Referral",     href: "/main/referral",     Icon: UserPlus },
];

/* ──────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────── */
function fmtCompact(n: number, prefix = "$"): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  const s =
    abs >= 1e9 ? (abs / 1e9).toFixed(2) + "B"
    : abs >= 1e6 ? (abs / 1e6).toFixed(2) + "M"
    : abs >= 1e3 ? (abs / 1e3).toFixed(1) + "K"
    : abs.toFixed(2);
  return (n < 0 ? "-" : "+") + prefix + s;
}

// Stable avatar URLs matching the reference's AVATAR_POOL (pravatar.cc).
const AVATAR_POOL_IDS = [11, 32, 13, 33, 53, 59, 60, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38];
function avatarUrl(index: number, size = 84): string {
  const id = AVATAR_POOL_IDS[index % AVATAR_POOL_IDS.length];
  return `https://i.pravatar.cc/${size}?img=${id}`;
}

function sparklinePath(values: number[], width: number, height: number, pad = 2): string {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = pad + ((width - pad * 2) * i) / (values.length - 1);
      const y = height - pad - ((height - pad * 2) * (v - min)) / range;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/* ──────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────── */
type SortKey = "roi" | "pnl" | "followers";

export default function FundManagersPage() {
  const user = useUserStore((state) => state.user);
  const settings = useSiteSettingsStore((state) => state.settings);

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "JD";
  const brandName = settings?.name || "1 Trade Market";

  // Preserved state (period / search / sort) — pure UI state, unchanged.
  const [period, setPeriod] = useState<Period>("7d");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("roi");

  // New UI-only state for Details modal.
  const [detailManagerId, setDetailManagerId] = useState<number | null>(null);
  const [investAmount, setInvestAmount] = useState("");

  // Hide MainLayout chrome while this page is mounted.
  useEffect(() => {
    document.body.classList.add("fm-active");
    return () => {
      document.body.classList.remove("fm-active");
    };
  }, []);

  // Load reference fonts (Outfit + Inter + JetBrains Mono).
  useEffect(() => {
    if (document.querySelector<HTMLLinkElement>('link[data-fm-fonts="1"]')) return;
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    preconnect1.dataset.fmFonts = "1";
    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    preconnect2.dataset.fmFonts = "1";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
    fontLink.dataset.fmFonts = "1";
    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(fontLink);
    return () => {
      try {
        document.head.removeChild(preconnect1);
        document.head.removeChild(preconnect2);
        document.head.removeChild(fontLink);
      } catch {
        /* noop */
      }
    };
  }, []);

  // Escape closes modal.
  useEffect(() => {
    if (detailManagerId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailManagerId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [detailManagerId]);

  const activeLeaderboard = LEADERBOARDS[period];
  const top3 = useMemo(() => activeLeaderboard.slice(0, 3), [activeLeaderboard]);
  const rest = useMemo(() => activeLeaderboard.slice(3, 20), [activeLeaderboard]);
  const summary = SUMMARY_BY_PERIOD[period];

  const detailManager = detailManagerId === null
    ? null
    : MANAGERS.find((m) => m.id === detailManagerId) ?? null;

  return (
    <>
      <style>{`
        body.fm-active .fixed.top-0.left-0.right-0.z-20,
        body.fm-active .fixed.top-\\[60px\\].left-0.bottom-0 { display: none !important; }
        body.fm-active .flex.flex-1.pt-\\[90px\\] { padding-top: 0 !important; }
        body.fm-active .flex-1.md\\:ml-\\[80px\\] { margin-left: 0 !important; }

        .fm-ticker-wrap > div {
          height: 34px !important;
          background: rgba(7,8,12,0.65) !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
        }
        .fm-ticker-wrap [data-ticker-price],
        .fm-ticker-wrap span:has(+ [data-ticker-price]) { font-size: 0.68rem !important; }
        .fm-ticker-wrap [data-ticker-price] ~ span { font-size: 0.65rem !important; }

        @keyframes fm-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(1.5); }
        }
        @keyframes fm-spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }

        .fm-live-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #3DDBA9;
          animation: fm-pulse 1.4s ease-in-out infinite;
          box-shadow: 0 0 6px #3DDBA9;
        }

        /* Period tab active gradient */
        .fm-period-tab.active {
          background: linear-gradient(135deg,#3DDBA9,#1A9E78) !important;
          color: #07080c !important;
          box-shadow: 0 2px 8px rgba(61,219,169,.20), inset 0 1px 0 rgba(255,255,255,.20) !important;
        }
        .fm-period-tab:not(.active):hover { color: #eef2f7 !important; background: rgba(255,255,255,.04) !important; }

        /* Sidebar icon active */
        .fm-sb-icon { transition: all .2s; }
        .fm-sb-icon:hover { background: rgba(255,255,255,.06); color: #eef2f7; }
        .fm-sb-icon.on {
          background: linear-gradient(145deg,rgba(61,219,169,.10),rgba(61,219,169,.04));
          color: #3DDBA9;
          border: 1px solid rgba(61,219,169,.12);
          box-shadow: inset 0 1px 1px rgba(255,255,255,.08);
        }
        .fm-sb-icon .tip {
          position: absolute; left: 52px;
          background: rgba(10,13,21,.95);
          border: 1px solid rgba(255,255,255,.1);
          color: #eef2f7; font-size: .68rem; font-weight: 600;
          padding: 4px 10px; border-radius: 6px; white-space: nowrap;
          opacity: 0; pointer-events: none; transition: opacity .15s; z-index: 400;
        }
        .fm-sb-icon:hover .tip { opacity: 1; }

        /* Top nav link active */
        .fm-nav-link.active { color: #3DDBA9 !important; font-weight: 600 !important; }
        .fm-nav-link:hover { color: #eef2f7; background: rgba(255,255,255,.05); }

        /* Dropdown */
        .fm-dd-trigger:hover > .fm-dd { display: block !important; }

        /* Card hover */
        .fm-podium-card { transition: all .3s; }
        .fm-podium-card:hover {
          transform: translateY(-4px);
          border-color: rgba(61,219,169,.20);
          box-shadow: 0 8px 32px rgba(61,219,169,.08), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .fm-podium-card.rank1:hover {
          border-color: rgba(61,219,169,.4);
          box-shadow: 0 8px 36px rgba(61,219,169,.12), inset 0 1px 0 rgba(255,255,255,.10);
        }
        .fm-manager-card { transition: all .3s; }
        .fm-manager-card:hover {
          transform: translateY(-3px);
          border-color: rgba(61,219,169,.20);
          box-shadow: 0 8px 28px rgba(61,219,169,.06);
        }

        /* Table row hover */
        .fm-table tbody tr { transition: background .15s; cursor: pointer; }
        .fm-table tbody tr:hover td { background: rgba(61,219,169,.03); }
        .fm-table tbody tr:active td { background: rgba(61,219,169,.06); }

        /* Buttons */
        .fm-btn-follow {
          background: linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78);
          color: #07080c;
          box-shadow: 0 2px 8px rgba(61,219,169,.15), inset 0 1px 1px rgba(255,255,255,.25);
          transition: all .2s;
        }
        .fm-btn-follow:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(61,219,169,.25), inset 0 1px 1px rgba(255,255,255,.30); }
        .fm-btn-profile { background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.08); box-shadow: inset 0 1px 0 rgba(255,255,255,.06); transition: all .2s; }
        .fm-btn-profile:hover { background: rgba(255,255,255,.06); border-color: rgba(61,219,169,.20); }

        .fm-table-follow {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(61,219,169,.25);
          color: #3DDBA9;
          transition: all .2s;
        }
        .fm-table-follow:hover { background: #3DDBA9; color: #07080c; box-shadow: 0 2px 8px rgba(61,219,169,.20); }

        /* Search box focus */
        .fm-search:focus-within { border-color: rgba(61,219,169,.25) !important; }

        /* Sidebar scrollbar */
        .fm-sb::-webkit-scrollbar { width: 4px; }
        .fm-sb::-webkit-scrollbar-thumb { background: rgba(255,255,255,.06); border-radius: 2px; }

        /* Modal show animation */
        @keyframes fm-modal-in {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .fm-modal { animation: fm-modal-in .25s ease both; }

        /* Responsive */
        @media (max-width: 900px) {
          .fm-nav-links { display: none !important; }
          .fm-nav-brand-name { display: none !important; }
        }
        @media (max-width: 768px) {
          .fm-page-wrap { padding-left: 0 !important; }
          .fm-sb { display: none !important; }
        }
        @media (max-width: 900px) {
          .fm-podium-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .fm-managers-grid { grid-template-columns: 1fr !important; }
          .fm-mm-kpi-4 { grid-template-columns: repeat(2,1fr) !important; }
          .fm-mm-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col overflow-y-auto font-[Inter,system-ui,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
          lineHeight: 1.6,
        }}
      >
        {/* TICKER */}
        <div className="fm-ticker-wrap relative z-[299]">
          <TickerBar />
        </div>

        {/* TOP NAV */}
        <nav
          className="sticky top-0 z-[300] flex h-14 items-center gap-0 px-6"
          style={{
            background: "linear-gradient(145deg,rgba(10,13,21,0.92),rgba(7,8,12,0.95))",
            backdropFilter: "blur(60px)",
            WebkitBackdropFilter: "blur(60px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Brand */}
          <Link to="/main/dashboard" className="mr-7 flex flex-shrink-0 items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[9px] font-[Outfit,sans-serif] text-[0.6rem] font-black tracking-[-0.02em] text-[#07080c]"
              style={{ background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)" }}
            >
              1TM
            </div>
            <span className="fm-nav-brand-name whitespace-nowrap font-[Outfit,sans-serif] text-[0.9rem] font-extrabold text-[#eef2f7]">
              {(() => {
                const parts = brandName.split(" ").filter(Boolean);
                if (parts.length <= 1) return <em className="not-italic text-[#3DDBA9]">{brandName}</em>;
                const lead = parts.slice(0, -1).join(" ");
                const tail = parts.slice(-1)[0];
                return (<>{lead} <em className="not-italic text-[#3DDBA9]">{tail}</em></>);
              })()}
            </span>
          </Link>

          {/* Links */}
          <div className="fm-nav-links flex flex-1 items-center gap-0.5">
            {PRIMARY_LINKS.map((l) => {
              const Icon = l.Icon;
              const active = l.href === "/main/fund-managers";
              return (
                <Link
                  key={l.label}
                  to={l.href}
                  className={`fm-nav-link flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[0.82rem] font-medium text-[#6b7a90] no-underline ${active ? "active" : ""}`}
                >
                  <Icon className="h-[0.78rem] w-[0.78rem]" />
                  {l.label}
                </Link>
              );
            })}
            {/* More dropdown */}
            <div className="fm-dd-trigger group relative">
              <button
                type="button"
                className="fm-nav-link flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[0.82rem] font-medium text-[#6b7a90]"
              >
                More <ChevronDown className="ml-0.5 h-2 w-2 opacity-50" />
              </button>
              <div
                className="fm-dd absolute left-0 top-[calc(100%+8px)] z-[500] hidden min-w-[180px] rounded-xl p-1.5"
                style={{
                  background: "rgba(10,13,21,.97)",
                  backdropFilter: "blur(40px)",
                  border: "1px solid rgba(255,255,255,.10)",
                  boxShadow: "0 16px 40px rgba(0,0,0,.5)",
                }}
              >
                {MORE_LINKS.map((l) => {
                  const Icon = l.Icon;
                  return (
                    <Link
                      key={l.label}
                      to={l.href}
                      className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[0.78rem] font-medium text-[#a3adbf] no-underline transition-all duration-150 hover:bg-[rgba(255,255,255,.06)] hover:text-[#eef2f7]"
                    >
                      <Icon className="h-3 w-3 text-[#6b7a90]" />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link
              to="/main/fund-managers"
              className="fm-nav-link active flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[0.82rem] font-medium no-underline"
            >
              <UsersRound className="h-[0.78rem] w-[0.78rem]" />
              Fund Managers
            </Link>
          </div>

          {/* Right */}
          <div className="ml-auto flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6b7a90] transition-all duration-150 hover:text-[#eef2f7]"
              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}
              aria-label="Search"
            >
              <Search className="h-[0.82rem] w-[0.82rem]" />
            </button>
            <Link
              to="/main/wallet"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-5 py-2 font-[Inter,sans-serif] text-[0.8rem] font-extrabold text-[#07080c] no-underline transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                boxShadow: "0 2px 10px rgba(61,219,169,.15), inset 0 1px 1px rgba(255,255,255,.25)",
              }}
            >
              <Plus className="h-3 w-3" />
              Deposit
            </Link>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-[#6b7a90] transition-all duration-150 hover:text-[#eef2f7]"
              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}
              aria-label="Notifications"
            >
              <Bell className="h-[0.82rem] w-[0.82rem]" />
              <span
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                style={{
                  background: "#3DDBA9",
                  border: "1.5px solid #07080c",
                  boxShadow: "0 0 4px rgba(61,219,169,.30)",
                }}
              />
            </button>
            <div
              className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-[Outfit,sans-serif] text-[0.72rem] font-extrabold text-[#07080c]"
              style={{ background: "linear-gradient(135deg,#3DDBA9,#1A9E78)" }}
              title={`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || "Account"}
            >
              {initials}
            </div>
          </div>
        </nav>

        {/* PAGE WRAP: sidebar + main */}
        <div
          className="fm-page-wrap pl-16"
          style={{ minHeight: "calc(100vh - 56px - 34px)" }}
        >
          {/* SIDEBAR — fixed to viewport so it stays put while main content scrolls */}
          <aside
            className="fm-sb fixed bottom-0 left-0 top-[56px] z-[200] flex w-16 flex-col items-center gap-0.5 overflow-y-auto py-3.5"
            style={{
              background: "linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
              borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {SIDEBAR_TOP.map((l) => (
              <SbIcon key={l.label} href={l.href} Icon={l.Icon} label={l.label} />
            ))}
            <div className="my-1.5 h-px w-6 bg-white/[0.05]" />
            {SIDEBAR_MID.map((l) => (
              <SbIcon key={l.label} href={l.href} Icon={l.Icon} label={l.label} active={l.active} />
            ))}
            <div className="my-1.5 h-px w-6 bg-white/[0.05]" />
            {SIDEBAR_BOT.map((l) => (
              <SbIcon key={l.label} href={l.href} Icon={l.Icon} label={l.label} />
            ))}
            <div className="flex-1" />
            <SbIcon href="/main/settings" Icon={SettingsIcon} label="Settings" />
          </aside>

          {/* MAIN */}
          <main className="px-6 py-5">
            {/* PAGE HEADER */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="font-[Outfit,sans-serif] text-[1.2rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                  Fund Managers
                </h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-[16px] px-2.5 py-[3px] text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#3DDBA9]"
                  style={{
                    background: "rgba(61,219,169,.08)",
                    border: "1px solid rgba(61,219,169,.25)",
                  }}
                >
                  <span className="fm-live-dot" />
                  Live
                </span>
              </div>
            </div>

            {/* CONTROLS BAR */}
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <div
                className="flex gap-0.5 rounded-lg p-[3px]"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`fm-period-tab rounded-md border-none bg-transparent px-3.5 py-1.5 font-[Inter,sans-serif] text-[0.72rem] font-semibold tracking-[0.03em] text-[#6b7a90] ${period === p ? "active" : ""}`}
                  >
                    {p === "all" ? "All" : p.toUpperCase()}
                  </button>
                ))}
              </div>
              <div
                className="fm-search flex max-w-[280px] flex-1 items-center rounded-lg px-2.5"
                style={{
                  minWidth: 180,
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                  transition: "border-color .2s",
                }}
              >
                <Search className="mr-2 h-3 w-3 text-[#4d5b6e]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trader..."
                  className="flex-1 border-none bg-transparent py-[7px] text-[0.75rem] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-lg px-3 py-[7px] font-[Inter,sans-serif] text-[0.72rem] text-[#a3adbf] outline-none transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <option value="roi" style={{ background: "#07080c", color: "#eef2f7" }}>Sort by ROI</option>
                <option value="pnl" style={{ background: "#07080c", color: "#eef2f7" }}>Sort by PnL</option>
                <option value="followers" style={{ background: "#07080c", color: "#eef2f7" }}>Sort by Followers</option>
              </select>
            </div>

            {/* STATS ROW */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              <StatPill Icon={Users}  tone="green"  label="Active Traders" value={summary.activeTraders} />
              <StatPill Icon={Vault}  tone="blue"   label="Total AUM"      value={summary.totalAum} />
              <StatPill Icon={Trophy} tone="orange" label="Avg Win Rate"   value={summary.avgWinRate} />
            </div>

            {/* PLATFORM VERIFIED MANAGERS */}
            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-[Outfit,sans-serif] text-[0.92rem] font-bold text-[#eef2f7]">
                  <CircleCheck className="h-3 w-3 text-[#3DDBA9]" />
                  Platform Verified Managers
                </h2>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1 text-[0.72rem] font-medium text-[#6b7a90] no-underline transition-colors duration-150 hover:text-[#3DDBA9]"
                >
                  Manage <ArrowRight className="h-2 w-2" />
                </a>
              </div>
              <div
                className="fm-managers-grid grid gap-2.5"
                style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}
              >
                {MANAGERS.map((m) => (
                  <ManagerCard
                    key={m.id}
                    manager={m}
                    onDetails={() => setDetailManagerId(m.id)}
                  />
                ))}
              </div>
            </section>

            {/* TOP PERFORMERS */}
            <div className="mt-5">
              <SectionLabel Icon={Crown}>Top Performers - Live Leaderboard</SectionLabel>
              <div
                className="fm-podium-grid grid gap-2.5"
                style={{ gridTemplateColumns: "1fr 1.15fr 1fr" }}
              >
                {top3.map((t, i) => (
                  <PodiumCard key={t.uid} trader={t} rank={(i + 1) as 1 | 2 | 3} />
                ))}
              </div>
            </div>

            {/* LEADERBOARD TABLE */}
            <div className="mt-5">
              <SectionLabel Icon={Award}>Leaderboard Rankings</SectionLabel>
              <div
                className="relative overflow-hidden rounded-xl"
                style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.015))",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "1.5px solid rgba(255,255,255,.07)",
                  boxShadow: "0 4px 20px rgba(0,0,0,.15)",
                }}
              >
                <div
                  className="pointer-events-none absolute left-0 right-0 top-0 h-px"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)" }}
                />
                <div className="overflow-x-auto">
                  <table className="fm-table w-full border-collapse">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,.025)" }}>
                        {["#", "Trader", "ROI (30D)", "PnL", "Win Rate", "Max DD", "Trades", "Followers", "Action"].map((h) => (
                          <th
                            key={h}
                            className="px-3.5 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((t) => (
                        <tr key={t.uid}>
                          <td
                            className="w-9 px-3.5 py-2.5 font-[JetBrains_Mono,monospace] text-[0.72rem] font-bold text-[#6b7a90]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            #{t.rank}
                          </td>
                          <td
                            className="px-3.5 py-2.5 text-[0.75rem] text-[#eef2f7]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="h-[30px] w-[30px] flex-shrink-0 overflow-hidden rounded-full"
                                style={{ border: "1.5px solid rgba(255,255,255,.06)" }}
                              >
                                <img
                                  src={avatarUrl(t.avatarIdx, 60)}
                                  alt={t.name}
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-[0.75rem] font-bold text-[#eef2f7]">{t.name}</div>
                                {t.addr && (
                                  <div className="font-[JetBrains_Mono,monospace] text-[0.6rem] text-[#6b7a90]">
                                    {t.addr}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            className="relative px-3.5 py-2.5 font-[JetBrains_Mono,monospace] text-[0.75rem] font-bold text-[#3DDBA9]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            {t.roi >= 0 ? "+" : ""}{t.roi.toFixed(1)}%
                            <div
                              className="absolute bottom-0.5 left-0 h-[2px] rounded-sm opacity-40"
                              style={{
                                background: "#3DDBA9",
                                width: `${Math.min(100, (t.roi / 380) * 100)}%`,
                              }}
                            />
                          </td>
                          <td
                            className={`px-3.5 py-2.5 font-[JetBrains_Mono,monospace] text-[0.75rem] font-bold ${t.pnl >= 0 ? "text-[#3DDBA9]" : "text-[#E85D5D]"}`}
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            {fmtCompact(t.pnl)}
                          </td>
                          <td
                            className="px-3.5 py-2.5 text-[0.75rem] text-[#eef2f7]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            {t.winRate > 0 ? t.winRate.toFixed(1) + "%" : "—"}
                          </td>
                          <td
                            className="px-3.5 py-2.5 text-[0.75rem] text-[#eef2f7]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            —
                          </td>
                          <td
                            className="px-3.5 py-2.5 text-[0.75rem] text-[#eef2f7]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            {t.txCount > 0 ? t.txCount.toLocaleString() : "—"}
                          </td>
                          <td
                            className="px-3.5 py-2.5 text-[0.75rem] text-[#eef2f7]"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            {t.followers > 0 ? t.followers.toLocaleString() : "—"}
                          </td>
                          <td
                            className="px-3.5 py-2.5"
                            style={{ borderBottom: "1px solid rgba(255,255,255,.035)" }}
                          >
                            <button
                              type="button"
                              className="fm-table-follow cursor-pointer rounded-md px-3 py-1 font-[Inter,sans-serif] text-[0.65rem] font-bold"
                            >
                              Follow
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Demo data notice */}
              <div
                className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.7rem] text-[#6b7a90]"
                style={{
                  background: "rgba(255,255,255,.025)",
                  border: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <CircleCheck className="h-3 w-3 flex-shrink-0 text-[#3DDBA9]" />
                <span>Showing representative demo data — deploy to a web server for real live feed.</span>
              </div>
            </div>

            {/* RISK DISCLAIMER */}
            <div
              className="mt-5 flex items-start gap-2.5 rounded-[10px] px-4 py-3 text-[0.65rem] leading-[1.5] text-[#6b7a90]"
              style={{
                background: "rgba(255,255,255,.02)",
                border: "1px solid rgba(255,255,255,.04)",
              }}
            >
              <AlertTriangle className="mt-[1px] h-3 w-3 flex-shrink-0 text-[#E8A94D]" />
              <div>
                <strong className="text-[#a3adbf]">Risk Disclosure:</strong>{" "}
                Past performance does not guarantee future results. Copy trading and managed fund investments carry significant risk. Never invest more than you can afford to lose. All ROI and PnL figures shown are historical and may not reflect current or future outcomes. 1 Trade Market does not provide financial advice.
              </div>
            </div>

            <div className="h-8" />
          </main>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {detailManager && (
        <DetailsModal
          manager={detailManager}
          investAmount={investAmount}
          onInvestAmountChange={setInvestAmount}
          onClose={() => {
            setDetailManagerId(null);
            setInvestAmount("");
          }}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   LOCAL SUBCOMPONENTS
   ────────────────────────────────────────────────────────────── */

interface SbIconProps {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}
function SbIcon({ href, Icon, label, active }: SbIconProps) {
  return (
    <Link
      to={href}
      className={`fm-sb-icon relative flex h-[42px] w-[42px] items-center justify-center rounded-xl text-[#6b7a90] no-underline ${active ? "on" : ""}`}
      aria-label={label}
    >
      <Icon className="h-[0.85rem] w-[0.85rem]" />
      <span className="tip">{label}</span>
    </Link>
  );
}

interface StatPillProps {
  Icon: React.ComponentType<{ className?: string }>;
  tone: "green" | "blue" | "orange";
  label: string;
  value: string;
}
function StatPill({ Icon, tone, label, value }: StatPillProps) {
  const toneStyle = {
    green:  { bg: "linear-gradient(145deg,rgba(61,219,169,.20),rgba(61,219,169,.08))", color: "#3DDBA9" },
    blue:   { bg: "linear-gradient(145deg,rgba(91,141,239,.20),rgba(91,141,239,.08))", color: "#5B8DEF" },
    orange: { bg: "linear-gradient(145deg,rgba(232,169,77,.20),rgba(232,169,77,.08))", color: "#E8A94D" },
  }[tone];
  return (
    <div
      className="relative flex items-center gap-2 overflow-hidden rounded-[9px] px-3.5 py-2"
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,.04),transparent)" }}
      />
      <div
        className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg"
        style={{
          background: toneStyle.bg,
          color: toneStyle.color,
          boxShadow: "0 3px 8px rgba(0,0,0,.20), inset 0 1px 1px rgba(255,255,255,.15)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{ background: "linear-gradient(180deg,rgba(255,255,255,.12),transparent)" }}
        />
        <Icon className="relative h-[0.65rem] w-[0.65rem]" />
      </div>
      <div className="relative">
        <div className="text-[0.68rem] font-semibold text-[#a3adbf]">{label}</div>
        <div className="font-[JetBrains_Mono,monospace] text-[0.88rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
          {value}
        </div>
      </div>
    </div>
  );
}

interface SectionLabelProps {
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}
function SectionLabel({ Icon, children }: SectionLabelProps) {
  return (
    <div className="mb-2.5 flex items-center gap-2 font-[Outfit,sans-serif] text-[0.88rem] font-bold text-[#eef2f7]">
      <Icon className="h-3 w-3 text-[#3DDBA9]" />
      {children}
    </div>
  );
}

/* ─── MANAGER CARD ─── */
interface ManagerCardProps {
  manager: Manager;
  onDetails: () => void;
}
function ManagerCard({ manager, onDetails }: ManagerCardProps) {
  // Preserved behavior: Copy Trade toggles a local "following" state.
  const [following, setFollowing] = useState(false);
  const sparkW = 240;
  const sparkH = 30;

  return (
    <div
      className="fm-manager-card relative overflow-hidden rounded-xl p-3.5"
      style={{
        background: "linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.015))",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "1.5px solid rgba(255,255,255,.07)",
        boxShadow: "0 4px 16px rgba(0,0,0,.15)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,.04),transparent)" }}
      />

      {/* Verified badge */}
      <span
        className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md px-2 py-[3px] text-[0.58rem] font-bold uppercase tracking-[0.04em] text-[#3DDBA9]"
        style={{
          background: "rgba(61,219,169,.08)",
          border: "1px solid rgba(61,219,169,.20)",
        }}
      >
        <CircleCheck className="h-[0.55rem] w-[0.55rem]" />
        Verified
      </span>

      {/* Header */}
      <div className="relative mb-2.5 flex items-center gap-2.5">
        <div
          className="h-[42px] w-[42px] flex-shrink-0 overflow-hidden rounded-full"
          style={{
            border: "2px solid rgba(255,255,255,.06)",
            boxShadow: "0 3px 10px rgba(0,0,0,.20)",
          }}
        >
          <img
            src={avatarUrl(manager.avatarIdx, 84)}
            alt={manager.name}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>
        <div>
          <div className="mb-[2px] text-[0.78rem] font-bold text-[#eef2f7]">{manager.name}</div>
          <div className="inline-flex items-center gap-[3px] text-[0.58rem] font-semibold text-[#3DDBA9]">
            <CircleCheck className="h-[0.5rem] w-[0.5rem]" />
            {manager.role}
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="relative mb-2 font-[JetBrains_Mono,monospace] text-[1.4rem] font-extrabold leading-none tracking-[-0.02em] text-[#3DDBA9]">
        {manager.roi > 0 ? "+" : ""}{manager.roi.toFixed(1)}%
      </div>

      {/* Stats */}
      <div className="relative mb-2 grid grid-cols-3 gap-1.5">
        <ManagerStatCell label="ROI 12M" value={`${manager.roi.toFixed(1)}%`} />
        <ManagerStatCell label="AUM" value={`${manager.aum.toFixed(1)}M`} />
        <ManagerStatCell label="Win Rate" value={`${manager.winRate.toFixed(1)}%`} />
      </div>

      {/* Sparkline */}
      <div
        className="relative mb-2 h-9 rounded-[7px] p-[3px]"
        style={{
          background: "rgba(255,255,255,.02)",
          border: "1px solid rgba(255,255,255,.04)",
        }}
      >
        <svg
          viewBox={`0 0 ${sparkW} ${sparkH}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d={`${sparklinePath(manager.monthlyReturns, sparkW, sparkH)} L${sparkW - 2},${sparkH - 2} L2,${sparkH - 2} Z`}
            fill="rgba(61,219,169,0.10)"
          />
          <path
            d={sparklinePath(manager.monthlyReturns, sparkW, sparkH)}
            fill="none"
            stroke="#3DDBA9"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Footer meta */}
      <div className="relative mb-2 flex justify-between text-[0.62rem] text-[#a3adbf]">
        <span>Followers: {manager.followers.toLocaleString()}</span>
        <span>Fee: {manager.mgmtFee}% + {manager.perfFee}%</span>
      </div>

      {/* Buttons (Copy Trade preserves existing toggle behavior) */}
      <div className="relative flex gap-1.5">
        <button
          type="button"
          onClick={() => setFollowing((v) => !v)}
          className="fm-btn-follow flex-1 cursor-pointer rounded-lg border-none px-2 py-2 text-[0.68rem] font-extrabold"
        >
          {following ? "Following" : "Copy Trade"}
        </button>
        <button
          type="button"
          onClick={onDetails}
          className="fm-btn-profile flex-1 cursor-pointer rounded-lg px-2 py-2 text-[0.68rem] font-bold text-[#eef2f7]"
        >
          Details
        </button>
      </div>
    </div>
  );
}

function ManagerStatCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[7px] p-1.5 text-center"
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.04)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,.03),transparent)" }}
      />
      <div className="relative text-[0.55rem] font-medium uppercase tracking-[0.04em] text-[#4d5b6e]">
        {label}
      </div>
      <div className="relative font-[JetBrains_Mono,monospace] text-[0.7rem] font-bold text-[#eef2f7]">
        {value}
      </div>
    </div>
  );
}

/* ─── PODIUM CARD ─── */
function PodiumCard({ trader, rank }: { trader: LbTrader; rank: 1 | 2 | 3 }) {
  const rankStyle =
    rank === 1
      ? {
          background: "linear-gradient(145deg,rgba(61,219,169,.06),rgba(61,219,169,.02))",
          borderColor: "rgba(61,219,169,.25)",
        }
      : rank === 2
        ? { borderColor: "rgba(192,192,192,.15)" }
        : { borderColor: "rgba(205,127,50,.12)" };

  const badgeStyle =
    rank === 1
      ? { background: "linear-gradient(135deg,#6EECC4,#3DDBA9)", color: "#07080c" }
      : rank === 2
        ? { background: "linear-gradient(135deg,#d4d4d4,#a0a0a0)", color: "#1a1a1a" }
        : { background: "linear-gradient(135deg,#D4A574,#CD7F32)", color: "#fff" };

  const avatarBorder =
    rank === 1
      ? "2px solid rgba(61,219,169,.35)"
      : rank === 2
        ? "2px solid rgba(192,192,192,.20)"
        : "2px solid rgba(205,127,50,.20)";

  return (
    <div
      className={`fm-podium-card rank${rank} relative cursor-pointer overflow-hidden rounded-[14px] p-4`}
      style={{
        background:
          rank === 1
            ? "linear-gradient(145deg,rgba(61,219,169,.06),rgba(61,219,169,.02))"
            : "linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.015))",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: `1.5px solid ${rankStyle.borderColor}`,
        boxShadow: "0 4px 20px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[14px]"
        style={{
          background:
            rank === 1
              ? "linear-gradient(180deg,rgba(61,219,169,.06),transparent)"
              : rank === 2
                ? "linear-gradient(180deg,rgba(192,192,192,.04),transparent)"
                : "linear-gradient(180deg,rgba(205,127,50,.04),transparent)",
        }}
      />

      {/* Rank badge */}
      <div
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full font-[Outfit,sans-serif] text-[0.82rem] font-extrabold"
        style={{
          ...badgeStyle,
          boxShadow: "0 3px 10px rgba(0,0,0,.30), inset 0 1px 1px rgba(255,255,255,.20)",
        }}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </div>

      {/* Top row */}
      <div className="relative mb-2.5 flex items-center gap-2.5">
        <div
          className="h-[42px] w-[42px] flex-shrink-0 overflow-hidden rounded-full"
          style={{ border: avatarBorder, boxShadow: "0 3px 10px rgba(0,0,0,.20)" }}
        >
          <img
            src={avatarUrl(trader.avatarIdx, 84)}
            alt={trader.name}
            loading="lazy"
            className="block h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[0.82rem] font-bold text-[#eef2f7]">{trader.name}</div>
          <div className="truncate font-[JetBrains_Mono,monospace] text-[0.62rem] text-[#6b7a90]">
            {trader.addr || (trader.uid ? trader.uid.slice(0, 10) + "…" : "BSC Network")}
          </div>
        </div>
      </div>

      {/* ROI */}
      <div className="relative mb-1.5 font-[JetBrains_Mono,monospace] text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-[#3DDBA9]">
        {trader.roi >= 0 ? "+" : ""}{trader.roi.toFixed(1)}%
      </div>

      {/* ROI bar */}
      <div
        className="relative mb-2.5 h-[3px] w-full overflow-hidden rounded-[2px]"
        style={{ background: "rgba(255,255,255,.04)" }}
      >
        <div
          className="h-full rounded-[2px]"
          style={{
            width: `${Math.min(100, (trader.roi / 380) * 100)}%`,
            background: "linear-gradient(90deg,#3DDBA9,#6EECC4)",
          }}
        />
      </div>

      {/* Stat chips */}
      <div className="relative mb-3 grid grid-cols-2 gap-[5px]">
        <PodiumStatChip label="PnL" value={fmtCompact(trader.pnl).replace("$", "")} />
        <PodiumStatChip label="Win" value={trader.winRate > 0 ? trader.winRate.toFixed(1) + "%" : "—"} />
        <PodiumStatChip label="Trades" value={trader.txCount > 0 ? trader.txCount.toLocaleString() : "—"} />
        <PodiumStatChip label="Followers" value={trader.followers > 0 ? trader.followers.toLocaleString() : "—"} />
      </div>

      {/* Buttons */}
      <div className="relative flex gap-1.5">
        <button
          type="button"
          className="fm-btn-follow flex-1 cursor-pointer rounded-lg border-none px-2 py-2 font-[Inter,sans-serif] text-[0.72rem] font-extrabold"
        >
          Follow
        </button>
        <button
          type="button"
          className="fm-btn-profile flex-1 cursor-pointer rounded-lg px-2 py-2 font-[Inter,sans-serif] text-[0.72rem] font-bold text-[#eef2f7]"
        >
          <LineChartIcon className="mr-1 inline h-[0.55rem] w-[0.55rem]" />
          Performance
        </button>
      </div>
    </div>
  );
}

function PodiumStatChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[7px] px-2 py-1.5 text-center"
      style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.05)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,.03),transparent)" }}
      />
      <span className="relative mb-[1px] block text-[0.58rem] font-medium uppercase tracking-[0.04em] text-[#4d5b6e]">
        {label}
      </span>
      <span className="relative block font-[JetBrains_Mono,monospace] text-[0.72rem] font-bold text-[#eef2f7]">
        {value}
      </span>
    </div>
  );
}

/* ─── DETAILS MODAL ─── */
interface DetailsModalProps {
  manager: Manager;
  investAmount: string;
  onInvestAmountChange: (v: string) => void;
  onClose: () => void;
}
function DetailsModal({
  manager,
  investAmount,
  onInvestAmountChange,
  onClose,
}: DetailsModalProps) {
  const profile = MGR_PROFILES[manager.id] ?? {
    strategy: "Mixed", risk: "Medium" as const, maxDD: "-10%", sharpe: "1.5", streak: "3W",
  };
  const positions = MANAGER_POSITIONS[manager.id] ?? [];
  const totalPnl = manager.aum * (manager.roi / 100); // millions
  const investNum = parseFloat(investAmount) || 0;
  const annualFee = Math.round(investNum * (manager.mgmtFee / 100));

  const riskTone =
    profile.risk === "Low"
      ? { bg: "rgba(52,199,123,.08)", border: "rgba(52,199,123,.20)", color: "#34C77B" }
      : profile.risk === "High"
        ? { bg: "rgba(232,93,93,.08)", border: "rgba(232,93,93,.20)", color: "#E85D5D" }
        : { bg: "rgba(232,169,77,.08)", border: "rgba(232,169,77,.20)", color: "#E8A94D" };

  // Cumulative returns for line chart
  const cum: number[] = [];
  let running = 0;
  manager.monthlyReturns.forEach((r) => {
    running += r;
    cum.push(running);
  });
  const W = 400;
  const H = 200;
  const pad = 30;
  const cMin = Math.min(...cum);
  const cMax = Math.max(...cum);
  const cRange = cMax - cMin || 1;
  const linePoints = cum.map((v, i) => {
    const x = pad + ((W - pad * 2) * i) / (cum.length - 1);
    const y = H - pad - ((H - pad * 2) * (v - cMin)) / cRange;
    return { x, y };
  });
  const linePath = linePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${(W - pad).toFixed(2)},${(H - pad).toFixed(2)} L${pad.toFixed(2)},${(H - pad).toFixed(2)} Z`;

  // Monthly bar chart
  const maxAbs = Math.max(...manager.monthlyReturns.map((v) => Math.abs(v)), 1);
  const M_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div
      className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto px-6 py-10"
      style={{
        background: "rgba(0,0,0,.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${manager.name} details`}
    >
      <div
        className="fm-modal relative w-full max-w-[780px] overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(145deg,rgba(14,17,26,.98),rgba(10,13,21,.99))",
          border: "1.5px solid rgba(255,255,255,.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,.60)",
        }}
      >
        {/* Top accent strip */}
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background: "linear-gradient(90deg,#1A9E78,#3DDBA9,#6EECC4,#3DDBA9)",
            zIndex: 1,
          }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-[2] flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7a90] transition-all duration-150 hover:bg-white/[0.08] hover:text-[#eef2f7]"
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
          }}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Body */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3.5">
            <div
              className="h-14 w-14 overflow-hidden rounded-full"
              style={{
                border: "2.5px solid rgba(61,219,169,.25)",
                boxShadow: "0 4px 16px rgba(61,219,169,.10)",
              }}
            >
              <img
                src={avatarUrl(manager.avatarIdx, 112)}
                alt={manager.name}
                className="block h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="mb-0.5 font-[Outfit,sans-serif] text-[1.05rem] font-extrabold text-[#eef2f7]">
                {manager.name}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[0.68rem] text-[#6b7a90]">
                <span className="inline-flex items-center gap-[3px] font-semibold text-[#3DDBA9]">
                  <CircleCheck className="h-[0.55rem] w-[0.55rem]" />
                  Verified Manager
                </span>
                <span className="text-[#4d5b6e]">|</span>
                <span>Since {manager.since}</span>
                <span
                  className="inline-flex items-center gap-[3px] rounded px-2 py-[2px] text-[0.58rem] font-semibold uppercase tracking-[0.04em]"
                  style={{
                    background: "rgba(91,141,239,.08)",
                    border: "1px solid rgba(91,141,239,.20)",
                    color: "#5B8DEF",
                  }}
                >
                  <Crosshair className="h-[0.55rem] w-[0.55rem]" />
                  {profile.strategy}
                </span>
                <span
                  className="inline-flex items-center gap-[3px] rounded px-2 py-[2px] text-[0.58rem] font-semibold uppercase tracking-[0.04em]"
                  style={{
                    background: riskTone.bg,
                    border: `1px solid ${riskTone.border}`,
                    color: riskTone.color,
                  }}
                >
                  <Gauge className="h-[0.55rem] w-[0.55rem]" />
                  {profile.risk} Risk
                </span>
              </div>
            </div>
          </div>

          {/* KPI: 4 cols */}
          <div className="fm-mm-kpi-4 mb-4 grid grid-cols-4 gap-2">
            <ModalKpi label="Current ROI" value={`+${manager.roi.toFixed(1)}%`} accent />
            <ModalKpi label="Total PnL" value={`+$${totalPnl.toFixed(1)}M`} accent />
            <ModalKpi label="Win Rate" value={`${manager.winRate.toFixed(1)}%`} />
            <ModalKpi label="Followers" value={manager.followers.toLocaleString()} />
          </div>

          {/* KPI: 3 cols */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <ModalKpi label="AUM" value={`$${manager.aum.toFixed(1)}M`} />
            <ModalKpi label="Mgmt Fee" value={`${manager.mgmtFee}%`} />
            <ModalKpi label="Performance Fee" value={`${manager.perfFee}%`} />
          </div>

          {/* Charts grid */}
          <div className="fm-mm-grid mb-3.5 grid gap-2.5" style={{ gridTemplateColumns: "2fr 1fr" }}>
            <GlassPanel>
              <GlassPanelTitle Icon={AreaChartIcon}>Performance Chart</GlassPanelTitle>
              <div className="relative h-[200px] w-full overflow-hidden rounded-md" style={{ background: "rgba(7,8,12,.5)" }}>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((gi) => {
                    const gy = pad + ((H - pad * 2) * gi) / 4;
                    return (
                      <line key={gi} x1={pad} x2={W - pad} y1={gy} y2={gy} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    );
                  })}
                  <defs>
                    <linearGradient id={`fm-area-${manager.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(61,219,169,0.15)" />
                      <stop offset="100%" stopColor="rgba(61,219,169,0.01)" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill={`url(#fm-area-${manager.id})`} />
                  <path d={linePath} fill="none" stroke="#3DDBA9" strokeWidth="2.5" />
                  {linePoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={3} fill="#3DDBA9" />
                  ))}
                  {/* Month labels */}
                  {M_LABELS.map((lab, i) => {
                    const x = pad + ((W - pad * 2) * i) / (M_LABELS.length - 1);
                    return (
                      <text key={i} x={x} y={H - 6} fill="rgba(107,122,144,.6)" fontSize="9" textAnchor="middle">
                        {lab}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </GlassPanel>

            <GlassPanel>
              <GlassPanelTitle Icon={BarChart3}>Monthly Returns</GlassPanelTitle>
              <div className="flex h-[160px] items-end gap-[3px] pt-2">
                {manager.monthlyReturns.map((v, i) => {
                  const pct = (Math.abs(v) / maxAbs) * 100;
                  const color = v >= 0 ? "#3DDBA9" : "#E85D5D";
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center justify-end gap-[2px]">
                      <div
                        className="font-[JetBrains_Mono,monospace] text-[0.55rem] font-bold"
                        style={{ color }}
                      >
                        {v >= 0 ? "+" : ""}{v}%
                      </div>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 20,
                          height: `${Math.max(4, pct * 1.2)}px`,
                          background: color,
                          borderRadius: "3px 3px 0 0",
                          opacity: 0.7,
                        }}
                      />
                      <div className="text-[0.5rem] text-[#4d5b6e]">{M_LABELS[i]}</div>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </div>

          {/* Open positions */}
          <GlassPanel className="mb-3.5">
            <GlassPanelTitle Icon={Briefcase}>
              Open Positions{" "}
              <span className="ml-1 text-[0.62rem] font-medium text-[#6b7a90]">
                ({positions.length} active)
              </span>
            </GlassPanelTitle>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: "rgba(255,255,255,.02)" }}>
                  {["Pair", "Entry", "Current", "PnL", "Size"].map((h) => (
                    <th
                      key={h}
                      className="px-2.5 py-[7px] text-left text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]"
                      style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2.5 py-3.5 text-center text-[0.72rem] text-[#6b7a90]">
                      No open positions
                    </td>
                  </tr>
                ) : (
                  positions.map((p, i) => (
                    <tr key={i}>
                      <td
                        className="px-2.5 py-[7px] font-[JetBrains_Mono,monospace] text-[0.7rem] font-bold text-[#eef2f7]"
                        style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}
                      >
                        {p.pair}
                      </td>
                      <td
                        className="px-2.5 py-[7px] font-[JetBrains_Mono,monospace] text-[0.7rem] text-[#eef2f7]"
                        style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}
                      >
                        ${p.entry.toLocaleString()}
                      </td>
                      <td
                        className="px-2.5 py-[7px] font-[JetBrains_Mono,monospace] text-[0.7rem] text-[#eef2f7]"
                        style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}
                      >
                        ${p.current.toLocaleString()}
                      </td>
                      <td
                        className="px-2.5 py-[7px] font-[JetBrains_Mono,monospace] text-[0.7rem]"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,.03)",
                          color: p.pnl >= 0 ? "#3DDBA9" : "#E85D5D",
                        }}
                      >
                        {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(1)}%
                      </td>
                      <td
                        className="px-2.5 py-[7px] font-[JetBrains_Mono,monospace] text-[0.7rem] text-[#eef2f7]"
                        style={{ borderBottom: "1px solid rgba(255,255,255,.03)" }}
                      >
                        {p.size.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </GlassPanel>

          {/* Invest panel — UI-only */}
          <GlassPanel>
            <GlassPanelTitle Icon={Coins}>Invest with this Manager</GlassPanelTitle>
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="mb-[3px] block text-[0.65rem] text-[#6b7a90]">Amount (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={investAmount}
                  onChange={(e) => onInvestAmountChange(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-lg px-3 py-2.5 font-[JetBrains_Mono,monospace] text-[0.85rem] text-[#eef2f7] outline-none transition-colors duration-200"
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(61,219,169,.30)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,.08)")}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="mb-[2px] text-[0.58rem] uppercase tracking-[0.06em] text-[#6b7a90]">
                    Your Investment
                  </div>
                  <div className="font-[JetBrains_Mono,monospace] text-[1rem] font-extrabold text-[#eef2f7]">
                    ${investNum.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <div className="mb-[2px] text-[0.58rem] uppercase tracking-[0.06em] text-[#6b7a90]">
                    Est. Annual Fee
                  </div>
                  <div className="font-[JetBrains_Mono,monospace] text-[1rem] font-extrabold text-[#E85D5D]">
                    ${annualFee.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-lg border-none px-3 py-2.5 font-[Inter,sans-serif] text-[0.78rem] font-extrabold text-[#07080c] transition-all duration-200 hover:-translate-y-px"
                style={{
                  background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                  boxShadow: "0 2px 8px rgba(61,219,169,.15), inset 0 1px 1px rgba(255,255,255,.25)",
                }}
              >
                Invest Now
              </button>
            </div>
          </GlassPanel>

          {/* Bottom actions */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex flex-[2] cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none px-3 py-2.5 font-[Inter,sans-serif] text-[0.78rem] font-extrabold text-[#07080c] transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                boxShadow: "0 2px 8px rgba(61,219,169,.15), inset 0 1px 1px rgba(255,255,255,.25)",
              }}
            >
              <CopyIcon className="h-3 w-3" />
              Start Copy Trading
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 font-[Inter,sans-serif] text-[0.78rem] font-bold text-[#eef2f7] transition-all duration-200"
              style={{
                background: "rgba(255,255,255,.035)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <X className="h-3 w-3" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[10px] p-3.5 ${className}`}
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)" }}
      />
      {children}
    </div>
  );
}

function GlassPanelTitle({
  Icon,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-center gap-1.5 font-[Outfit,sans-serif] text-[0.78rem] font-bold text-[#eef2f7]">
      <Icon className="h-[0.68rem] w-[0.68rem] text-[#3DDBA9]" />
      {children}
    </div>
  );
}

function ModalKpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[9px] px-2.5 py-2.5 text-center"
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,.035),transparent)" }}
      />
      <div className="relative mb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
        {label}
      </div>
      <div
        className="relative font-[JetBrains_Mono,monospace] text-[1rem] font-extrabold tracking-[-0.02em]"
        style={{ color: accent ? "#3DDBA9" : "#eef2f7" }}
      >
        {value}
      </div>
    </div>
  );
}
