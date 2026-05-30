import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  Headphones,
  Info,
  Loader2,
  Menu,
  PackageOpen,
  Rocket,
  Search,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import useSavingsStore, {
  SavingsPeriod,
  UserSaving,
} from "@/store/savingsStore";
import useUserStore from "@/store/userStore";

const MIN_DEPOSIT = 150000;

const TOKEN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  CHZ: "#CD0124",
  ATOM: "#6F7390",
  CRO: "#002D74",
  SOL: "#9945FF",
  DOT: "#E6007A",
  TRX: "#EF0027",
  NEAR: "#00C1DE",
  POL: "#7B3FE4",
  APT: "#2ED8A3",
  ADA: "#0033AD",
  SUI: "#6FBCF0",
  AVAX: "#E84142",
  LINK: "#2A5ADA",
  ARB: "#28A0F0",
  OP: "#FF0420",
  INJ: "#00F2FE",
  XRP: "#3B82F6",
  DOGE: "#C2A633",
};

const FALLBACK_PRODUCTS = [
  { token: "BTC", apy: 15.0 },
  { token: "ETH", apy: 18.42 },
  { token: "CHZ", apy: 15.92 },
  { token: "ATOM", apy: 17.91 },
  { token: "CRO", apy: 20.12 },
  { token: "SOL", apy: 22.15 },
  { token: "DOT", apy: 21.53 },
  { token: "TRX", apy: 19.34 },
  { token: "NEAR", apy: 23.04 },
  { token: "POL", apy: 18.28 },
  { token: "APT", apy: 24.19 },
  { token: "ADA", apy: 19.74 },
  { token: "SUI", apy: 25.0 },
];

const PERFORMANCE_BASE = [
  { sym: "BTC", color: "#F7931A", price: 67234.5 },
  { sym: "ETH", color: "#627EEA", price: 3892.1 },
  { sym: "SOL", color: "#9945FF", price: 189.32 },
  { sym: "ADA", color: "#0033AD", price: 1.15 },
  { sym: "DOT", color: "#E6007A", price: 8.56 },
  { sym: "ATOM", color: "#6F7390", price: 12.34 },
  { sym: "NEAR", color: "#00C1DE", price: 7.89 },
  { sym: "AVAX", color: "#E84142", price: 48.92 },
  { sym: "LINK", color: "#2A5ADA", price: 18.45 },
  { sym: "ARB", color: "#28A0F0", price: 1.78 },
  { sym: "OP", color: "#FF0420", price: 3.45 },
  { sym: "INJ", color: "#00F2FE", price: 56.78 },
  { sym: "SUI", color: "#6FBCF0", price: 2.14 },
];

const FAQS = [
  {
    question: "What is Earn?",
    answer:
      "Earn is a program that allows you to grow your crypto holdings passively. By subscribing your funds to earning plans, your assets are allocated into high-yield strategies managed by professional fund managers. Returns are calculated and distributed daily based on the monthly APY of each token.",
  },
  {
    question: "What is monthly percentage yield?",
    answer:
      "Monthly percentage yield (Monthly APY) represents the rate of return you earn on your subscribed funds over a one-month period. Each token has its own Monthly APY based on market conditions and strategy performance.",
  },
  {
    question: "When does revenue calculation/distribution start?",
    answer:
      "Revenue calculation begins after your subscription is confirmed. Earnings are calculated daily and credited according to the active earning plan.",
  },
  {
    question: "What are the risks?",
    answer:
      "As with all crypto investments, earning programs carry market risk. Token values may fluctuate and past performance does not guarantee future results.",
  },
];

type PerformanceToken = {
  sym: string;
  color: string;
  basePrice: number;
  price: number;
  changeAmt: number;
  sparkData: number[];
};

type EarningProduct = {
  key: string;
  token: string;
  color: string;
  apy: number;
  planId: string | null;
  terms: SavingsPeriod[];
  placeholder: boolean;
};

type PendingSubscription = {
  product: EarningProduct;
  period: SavingsPeriod;
  amount: number;
  monthly: number;
};

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseMoney(value: string | number | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTokenColor(token: string): string {
  return TOKEN_COLORS[token.toUpperCase()] || "#5B8DEF";
}

function getTokenInitials(token: string): string {
  return token.slice(0, 2).toUpperCase();
}

function periodDays(period: string, title?: string): number | null {
  const normalized = period.toLowerCase();
  const titleText = (title || "").toLowerCase();
  if (normalized === "flexible" || titleText.includes("flexible")) return null;
  if (normalized.includes("1_month") || titleText.includes("30")) return 30;
  if (normalized.includes("2_month") || titleText.includes("60")) return 60;
  if (normalized.includes("3_month") || titleText.includes("90")) return 90;
  if (normalized.includes("6_month") || titleText.includes("180")) return 180;
  if (normalized.includes("12_month") || titleText.includes("360")) return 360;

  const numericMatch = titleText.match(/(\d+)/);
  return numericMatch ? Number(numericMatch[1]) : null;
}

function formatTerm(period: SavingsPeriod): string {
  const days = periodDays(period.period, period.title);
  if (days === null) return "Flexible";
  return `${days} Days`;
}

function getDefaultPeriod(product: EarningProduct): SavingsPeriod {
  return (
    product.terms.find((term) => periodDays(term.period, term.title) === null) ||
    product.terms[0] ||
    { period: "flexible", title: "Flexible", roi: product.apy }
  );
}

function buildFallbackPeriod(apy: number): SavingsPeriod {
  return { period: "flexible", title: "Flexible", roi: apy };
}

function buildInitialPerformanceTokens(): PerformanceToken[] {
  return PERFORMANCE_BASE.map((token, index) => {
    const directionSeed = index % 3 === 0 ? 0.5 : index % 4 === 0 ? -0.3 : 0.2;
    const changeAmt = token.price * (directionSeed + Math.random() - 0.42) * 0.03;
    return {
      sym: token.sym,
      color: token.color,
      basePrice: token.price,
      price: token.price + changeAmt,
      changeAmt,
      sparkData: Array.from({ length: 8 }, () => Math.random()),
    };
  });
}

function getSavingClaimData(saving: UserSaving) {
  return {
    amount: saving.amount,
    period:
      saving.days === 30
        ? "1_month"
        : saving.days === 90
          ? "3_months"
          : saving.days === 180
            ? "6_months"
            : saving.days === 360
              ? "12_months"
              : "flexible",
    roi: saving.roi,
    plan_id: saving.id,
  };
}

function ShellStyles() {
  return (
    <style>{`
      @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap");

      body.savings-active .fixed.top-0.left-0.right-0.z-20,
      body.savings-active .fixed.top-\\[60px\\].left-0.bottom-0 {
        display: none !important;
      }
      body.savings-active .flex.flex-1.pt-\\[90px\\] {
        padding-top: 0 !important;
      }
      body.savings-active .flex-1.md\\:ml-\\[80px\\] {
        margin-left: 0 !important;
      }

      .earning-page {
        --earn-accent:#00dfa2;
        --earn-accent-light:#00ffc3;
        --earn-accent-dark:#00b881;
        --earn-accent-dim:rgba(0,223,162,0.1);
        --earn-bg:#07080c;
        --earn-bg2:#0a0d15;
        --earn-t1:#eef2f7;
        --earn-t2:#8b97a8;
        --earn-t3:#4a5468;
        --earn-t4:#3a4556;
        --earn-green:#1ED760;
        --earn-green-dim:rgba(30,215,96,.1);
        --earn-red:#f43f5e;
        --earn-red-dim:rgba(244,63,94,.1);
        --earn-orange:#FF9800;
        --earn-heading:"Outfit","Plus Jakarta Sans",sans-serif;
        --earn-sans:"Inter","Plus Jakarta Sans",-apple-system,sans-serif;
        --earn-mono:"JetBrains Mono",monospace;
        background: linear-gradient(135deg,var(--earn-bg) 0%,var(--earn-bg2) 100%);
        color: var(--earn-t1);
        font-family: var(--earn-sans);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      .earning-page input,
      .earning-page select,
      .earning-page button {
        font-family: var(--earn-sans);
      }

      .earning-page input,
      .earning-page select {
        font-size: .84rem !important;
      }

      .earning-main {
        padding: 28px 32px;
        overflow-y: auto;
        max-height: 100%;
      }

      .earning-content-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 24px;
      }

      .earning-left-col,
      .earning-right-col {
        min-width: 0;
      }

      .earning-right-col {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .earning-pg-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 28px;
      }

      .earning-pg-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--earn-accent-dim);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--earn-accent);
      }

      .earning-pg-icon svg {
        width: 1.1rem;
        height: 1.1rem;
      }

      .earning-pg-header h1 {
        font-family: var(--earn-heading);
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: -.03em;
        margin: 0;
      }

      .earning-pg-header p {
        font-size: .82rem;
        color: var(--earn-t3);
        margin-top: 2px;
      }

      .earning-gcard,
      .earning-rcard {
        background: linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02));
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04);
      }

      .earning-gcard {
        padding: 24px;
      }

      .earning-rcard {
        padding: 20px;
        background: linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));
      }

      .earning-gcard::before,
      .earning-rcard::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 100%;
        background: linear-gradient(175deg,rgba(255,255,255,.03),transparent 40%);
        pointer-events: none;
        border-radius: 16px;
      }

      .earning-card-body {
        position: relative;
        z-index: 1;
      }

      .earning-mb-28 {
        margin-bottom: 28px;
      }

      .earning-user-wallet-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
        flex-wrap: wrap;
        gap: 20px;
      }

      .earning-uwc-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .earning-uwc-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg,var(--earn-accent-dim),rgba(0,223,162,0.06));
        border: 1.5px solid rgba(0,223,162,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--earn-accent);
      }

      .earning-uwc-icon svg {
        width: 1.2rem;
        height: 1.2rem;
      }

      .earning-uwc-info h2 {
        font-family: var(--earn-heading);
        font-size: 1.1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .03em;
        margin-bottom: 2px;
      }

      .earning-uwc-info p {
        font-size: .78rem;
        color: var(--earn-t3);
        max-width: 340px;
        line-height: 1.5;
      }

      .earning-uwc-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 20px;
        font-size: .7rem;
        font-weight: 700;
        background: rgba(255,152,0,.08);
        color: var(--earn-orange);
        border: 1px solid rgba(255,152,0,.2);
        margin-top: 8px;
        letter-spacing: .04em;
      }

      .earning-uwc-badge.active {
        background: rgba(30,215,96,.08);
        color: var(--earn-green);
        border-color: rgba(30,215,96,.2);
      }

      .earning-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 8px currentColor;
        animation: earning-pulse 2s ease-in-out infinite;
      }

      @keyframes earning-pulse {
        0%,100% { opacity: 1; }
        50% { opacity: .4; }
      }

      .earning-uwc-right {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .earning-uwc-stat {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px;
        padding: 16px 22px;
        text-align: center;
        min-width: 130px;
        position: relative;
        overflow: hidden;
      }

      .earning-uwc-stat::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);
      }

      .earning-stat-value {
        font-family: var(--earn-mono);
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .earning-stat-value.accent {
        color: var(--earn-accent);
      }

      .earning-stat-label {
        font-size: .68rem;
        font-weight: 700;
        color: var(--earn-t3);
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .earning-sec-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      .earning-sec-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .earning-sec-left svg {
        color: var(--earn-accent);
        width: .92rem;
        height: .92rem;
      }

      .earning-sec-left h3 {
        font-family: var(--earn-heading);
        font-size: 1.05rem;
        font-weight: 700;
      }

      .earning-sec-count {
        font-family: var(--earn-mono);
        font-size: .72rem;
        font-weight: 600;
        color: var(--earn-t3);
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        padding: 4px 12px;
        border-radius: 20px;
      }

      .earning-live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--earn-green);
        box-shadow: 0 0 8px var(--earn-green);
        display: inline-block;
        animation: earning-pulse 2s ease-in-out infinite;
      }

      .earning-deposit-desc {
        font-size: .82rem;
        color: var(--earn-t3);
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .earning-form-group label {
        display: block;
        font-size: .72rem;
        font-weight: 600;
        color: var(--earn-t3);
        text-transform: uppercase;
        letter-spacing: .06em;
        margin-bottom: 8px;
      }

      .earning-form-group input,
      .earning-form-group select,
      .earning-search-wrap input,
      .earning-filter-select {
        width: 100%;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        padding: 12px 16px;
        color: var(--earn-t1);
        outline: none;
        transition: border-color .2s, box-shadow .2s;
      }

      .earning-form-group input:focus,
      .earning-form-group select:focus,
      .earning-search-wrap input:focus,
      .earning-filter-select:focus {
        border-color: var(--earn-accent);
        box-shadow: 0 0 0 3px rgba(0,223,162,0.08);
      }

      .earning-form-group input::placeholder,
      .earning-search-wrap input::placeholder {
        color: var(--earn-t3);
      }

      .earning-form-group select,
      .earning-filter-select {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b97a8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
      }

      .earning-form-group select option,
      .earning-filter-select option {
        background: var(--earn-bg2);
        color: var(--earn-t1);
      }

      .earning-min-notice {
        font-size: .72rem;
        color: var(--earn-t3);
        margin-top: 6px;
      }

      .earning-primary-btn {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg,var(--earn-accent),var(--earn-accent-dark));
        color: #07080c;
        font-size: .88rem;
        font-weight: 800;
        cursor: pointer;
        transition: all .2s;
        letter-spacing: .02em;
        box-shadow: 0 4px 16px rgba(0,223,162,.2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
      }

      .earning-primary-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0,223,162,.3);
      }

      .earning-primary-btn:disabled {
        opacity: .45;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .earning-perf-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 14px;
      }

      .earning-perf-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 16px;
        position: relative;
        transition: all .2s;
      }

      .earning-perf-card:hover {
        background: rgba(255,255,255,0.05);
        border-color: rgba(255,255,255,0.08);
      }

      .earning-perf-card.up {
        border-left: 3px solid var(--earn-green);
      }

      .earning-perf-card.dn {
        border-left: 3px solid var(--earn-red);
      }

      .earning-perf-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

      .earning-token-icon,
      .earning-perf-token-icon {
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #fff;
        flex-shrink: 0;
      }

      .earning-perf-token-icon {
        width: 32px;
        height: 32px;
        font-size: .68rem;
      }

      .earning-token-icon {
        width: 28px;
        height: 28px;
        font-size: .6rem;
      }

      .earning-perf-token-name {
        font-family: var(--earn-heading);
        font-size: .88rem;
        font-weight: 700;
      }

      .earning-perf-price {
        font-family: var(--earn-mono);
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .earning-perf-change {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .earning-perf-amount {
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: var(--earn-mono);
        font-size: .78rem;
        font-weight: 600;
      }

      .earning-perf-amount svg {
        width: .75rem;
        height: .75rem;
      }

      .earning-perf-pct {
        font-family: var(--earn-mono);
        font-size: .72rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 6px;
      }

      .earning-perf-amount.up {
        color: var(--earn-green);
      }

      .earning-perf-amount.dn {
        color: var(--earn-red);
      }

      .earning-perf-pct.up {
        background: var(--earn-green-dim);
        color: var(--earn-green);
      }

      .earning-perf-pct.dn {
        background: var(--earn-red-dim);
        color: var(--earn-red);
      }

      .earning-sparkline {
        display: flex;
        align-items: flex-end;
        gap: 2px;
        height: 24px;
        margin-top: 10px;
      }

      .earning-spark-bar {
        width: 4px;
        border-radius: 2px;
        transition: height .3s;
      }

      .earning-products-card {
        padding: 0;
        overflow: hidden;
      }

      .earning-products-toolbar-wrap {
        padding: 16px 20px;
      }

      .earning-products-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .earning-search-wrap {
        flex: 1;
        min-width: 180px;
        position: relative;
      }

      .earning-search-wrap input {
        padding: 10px 14px 10px 36px;
        font-size: .82rem !important;
      }

      .earning-search-wrap svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--earn-t3);
        width: .78rem;
        height: .78rem;
      }

      .earning-filter-select {
        width: auto;
        padding: 10px 32px 10px 14px;
        color: var(--earn-t2);
        font-size: .82rem !important;
      }

      .earning-table-wrap {
        overflow-x: auto;
      }

      .earning-ptable,
      .earning-growth-table {
        width: 100%;
        border-collapse: collapse;
      }

      .earning-ptable thead th {
        font-size: .68rem;
        font-weight: 700;
        color: var(--earn-t4);
        text-transform: uppercase;
        letter-spacing: .08em;
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .earning-ptable tbody td {
        padding: 14px 16px;
        font-size: .84rem;
        border-bottom: 1px solid rgba(255,255,255,0.03);
        vertical-align: middle;
        transition: background .15s;
      }

      .earning-ptable tbody tr:last-child td {
        border-bottom: none;
      }

      .earning-ptable tbody tr.earning-product-row {
        transition: background .15s;
        cursor: pointer;
      }

      .earning-ptable tbody tr.earning-product-row:hover td {
        background: rgba(255,255,255,0.025);
      }

      .earning-ptable tbody tr.earning-product-row:nth-child(4n+1) td {
        background: rgba(255,255,255,0.01);
      }

      .earning-token-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .earning-token-name {
        font-weight: 600;
      }

      .earning-apy-val {
        font-family: var(--earn-mono);
        font-weight: 700;
        color: var(--earn-green);
      }

      .earning-term-val {
        font-size: .82rem;
        color: var(--earn-t2);
      }

      .earning-expand-chevron {
        transition: transform .2s;
        color: var(--earn-t3);
        width: .78rem;
        height: .78rem;
      }

      .earning-expand-chevron.open {
        transform: rotate(180deg);
        color: var(--earn-accent);
      }

      .earning-expand-row td {
        padding: 0 !important;
        background: rgba(255,255,255,0.02);
      }

      .earning-expand-content {
        padding: 20px 24px;
      }

      .earning-expand-title {
        font-family: var(--earn-heading);
        font-size: .95rem;
        font-weight: 700;
        margin-bottom: 14px;
      }

      .earning-expand-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      .earning-earnings-calc {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .earning-calc-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .earning-calc-label {
        font-size: .72rem;
        font-weight: 600;
        color: var(--earn-t3);
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      .earning-calc-val {
        font-family: var(--earn-mono);
        font-size: .88rem;
        font-weight: 700;
        color: var(--earn-green);
      }

      .earning-subscribe-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .earning-subscribe-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg,var(--earn-accent),var(--earn-accent-dark));
        color: #07080c;
        font-size: .84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all .2s;
        box-shadow: 0 4px 16px rgba(0,223,162,.2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .earning-subscribe-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0,223,162,.3);
      }

      .earning-subscribe-btn:disabled {
        opacity: .4;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .earning-sub-note {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: .72rem;
        color: var(--earn-orange);
      }

      .earning-sub-note svg {
        width: .78rem;
        height: .78rem;
      }

      .earning-growth-table {
        min-width: 760px;
      }

      .earning-growth-table thead th {
        font-size: .68rem;
        font-weight: 700;
        color: var(--earn-t4);
        text-transform: uppercase;
        letter-spacing: .08em;
        padding: 12px 14px;
        text-align: left;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .earning-growth-table tbody td {
        padding: 12px 14px;
        font-size: .82rem;
        border-bottom: 1px solid rgba(255,255,255,0.03);
      }

      .earning-growth-val {
        font-family: var(--earn-mono);
        font-weight: 600;
        color: var(--earn-green);
      }

      .earning-empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--earn-t3);
        font-size: .88rem;
      }

      .earning-empty-state svg {
        width: 2rem;
        height: 2rem;
        color: var(--earn-t4);
        margin: 0 auto 12px;
        display: block;
      }

      .earning-small-action {
        border: 1px solid rgba(0,223,162,0.24);
        background: rgba(0,223,162,0.1);
        color: var(--earn-accent);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: .72rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all .2s;
      }

      .earning-small-action:hover:not(:disabled) {
        background: rgba(0,223,162,0.16);
      }

      .earning-small-action:disabled {
        opacity: .55;
        cursor: not-allowed;
      }

      .earning-faq-title {
        font-family: var(--earn-heading);
        font-size: 1.1rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 20px;
      }

      .earning-faq-item {
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }

      .earning-faq-item:last-child {
        border-bottom: none;
      }

      .earning-faq-q {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 16px 0;
        cursor: pointer;
        font-size: .88rem;
        font-weight: 600;
        color: var(--earn-t1);
        transition: color .2s;
        background: transparent;
        border: none;
        text-align: left;
      }

      .earning-faq-q:hover {
        color: var(--earn-accent);
      }

      .earning-faq-q svg {
        transition: transform .3s;
        color: var(--earn-t3);
        width: .72rem;
        height: .72rem;
        flex-shrink: 0;
      }

      .earning-faq-q.open svg {
        transform: rotate(180deg);
        color: var(--earn-accent);
      }

      .earning-faq-a {
        max-height: 0;
        overflow: hidden;
        transition: max-height .3s ease;
        font-size: .82rem;
        color: var(--earn-t3);
        line-height: 1.7;
      }

      .earning-faq-a.open {
        max-height: 220px;
      }

      .earning-faq-a-inner {
        padding: 0 0 16px 0;
      }

      .earning-rcard-label {
        font-size: .68rem;
        font-weight: 700;
        color: var(--earn-accent);
        text-transform: uppercase;
        letter-spacing: .08em;
        margin-bottom: 14px;
      }

      .earning-plan-icon-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
      }

      .earning-plan-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg,var(--earn-accent-dim),rgba(0,223,162,0.06));
        border: 1px solid rgba(0,223,162,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--earn-accent);
      }

      .earning-plan-icon svg {
        width: 1.1rem;
        height: 1.1rem;
      }

      .earning-plan-name {
        font-family: var(--earn-heading);
        font-size: 1rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .04em;
        margin-top: 12px;
      }

      .earning-plan-sub {
        font-size: .72rem;
        color: var(--earn-t3);
        margin-bottom: 14px;
      }

      .earning-plan-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-top: 1px solid rgba(255,255,255,0.04);
      }

      .earning-pr-label {
        font-size: .72rem;
        font-weight: 700;
        color: var(--earn-t3);
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .earning-pr-value {
        font-family: var(--earn-mono);
        font-size: .82rem;
        font-weight: 700;
        color: var(--earn-t1);
        text-align: right;
      }

      .earning-pr-value.accent {
        color: var(--earn-accent);
      }

      .earning-start-btn,
      .earning-help-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg,var(--earn-accent),var(--earn-accent-dark));
        color: #07080c;
        font-size: .84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all .2s;
        box-shadow: 0 4px 16px rgba(0,223,162,.15);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 14px;
      }

      .earning-help-btn {
        margin-top: 0;
        padding: 10px;
        font-size: .82rem;
      }

      .earning-start-btn:hover,
      .earning-help-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0,223,162,.25);
      }

      .earning-qlinks {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .earning-qlink {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: .82rem;
        font-weight: 500;
        color: var(--earn-t2);
        transition: all .15s;
      }

      .earning-qlink:hover {
        background: rgba(255,255,255,0.04);
        color: var(--earn-t1);
      }

      .earning-qlink-icon {
        width: 16px;
        display: inline-flex;
        justify-content: center;
        color: var(--earn-accent);
      }

      .earning-qlink-icon svg {
        width: .78rem;
        height: .78rem;
      }

      .earning-qlink .earning-arrow {
        margin-left: auto;
        color: var(--earn-t3);
        transition: transform .15s;
      }

      .earning-qlink:hover .earning-arrow {
        transform: translateX(3px);
        color: var(--earn-t1);
      }

      .earning-help-text {
        font-size: .8rem;
        color: var(--earn-t3);
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .earning-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .earning-modal-card {
        background: linear-gradient(145deg,rgba(15,18,28,0.98),rgba(10,13,21,0.98));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 32px;
        max-width: 440px;
        width: 100%;
        position: relative;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
      }

      .earning-modal-card::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 100%;
        background: linear-gradient(175deg,rgba(255,255,255,.04),transparent 40%);
        pointer-events: none;
        border-radius: 20px;
      }

      .earning-modal-inner {
        position: relative;
        z-index: 1;
      }

      .earning-modal-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: var(--earn-accent-dim);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--earn-accent);
        margin: 0 auto 16px;
      }

      .earning-modal-icon svg {
        width: 1.4rem;
        height: 1.4rem;
      }

      .earning-modal-title {
        font-family: var(--earn-heading);
        font-size: 1.2rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: 20px;
      }

      .earning-modal-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 10px 0;
        border-top: 1px solid rgba(255,255,255,0.05);
      }

      .earning-modal-label {
        font-size: .78rem;
        font-weight: 600;
        color: var(--earn-t3);
        text-transform: uppercase;
        letter-spacing: .04em;
      }

      .earning-modal-value {
        font-family: var(--earn-mono);
        font-size: .88rem;
        font-weight: 700;
        color: var(--earn-t1);
        text-align: right;
      }

      .earning-modal-value.accent {
        color: var(--earn-accent);
      }

      .earning-modal-warning {
        font-size: .76rem;
        color: var(--earn-t3);
        line-height: 1.6;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 10px;
        padding: 12px;
        margin: 20px 0;
      }

      .earning-modal-btns {
        display: flex;
        gap: 12px;
      }

      .earning-modal-ghost,
      .earning-modal-confirm {
        flex: 1;
        padding: 12px;
        border-radius: 10px;
        font-size: .84rem;
        font-weight: 700;
        cursor: pointer;
        transition: all .2s;
      }

      .earning-modal-ghost {
        border: 1px solid rgba(255,255,255,0.1);
        background: transparent;
        color: var(--earn-t2);
      }

      .earning-modal-ghost:hover {
        background: rgba(255,255,255,0.04);
        color: var(--earn-t1);
      }

      .earning-modal-confirm {
        border: none;
        background: linear-gradient(135deg,var(--earn-accent),var(--earn-accent-dark));
        color: #07080c;
        box-shadow: 0 4px 16px rgba(0,223,162,.2);
      }

      .earning-modal-confirm:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(0,223,162,.3);
      }

      .earning-modal-confirm:disabled {
        opacity: .5;
        cursor: not-allowed;
        transform: none;
      }

      @media (max-width: 1100px) {
        .earning-content-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .earning-perf-grid {
          grid-template-columns: repeat(2,1fr);
        }
      }

      @media (max-width: 768px) {
        .earning-main {
          padding: 16px;
        }

        .earning-pg-header {
          margin-bottom: 22px;
        }

        .earning-user-wallet-card {
          align-items: stretch;
        }

        .earning-uwc-left,
        .earning-uwc-right {
          width: 100%;
        }

        .earning-uwc-stat {
          flex: 1;
          min-width: 110px;
        }
      }

      @media (max-width: 600px) {
        .earning-perf-grid,
        .earning-expand-form {
          grid-template-columns: 1fr;
        }

        .earning-products-toolbar {
          align-items: stretch;
        }

        .earning-search-wrap,
        .earning-filter-select {
          width: 100%;
        }

        .earning-filter-select {
          min-width: 100%;
        }
      }
    `}</style>
  );
}

export default function SavingsPage() {
  const {
    plans,
    userSavings,
    isLoading,
    error,
    fetchPlans,
    fetchUserSavings,
    createSaving,
    claimSaving,
  } = useSavingsStore();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [productFilter, setProductFilter] = React.useState("all");
  const [termFilter, setTermFilter] = React.useState("all");
  const [expandedProduct, setExpandedProduct] = React.useState<string | null>(null);
  const [amountsByProduct, setAmountsByProduct] = React.useState<Record<string, string>>({});
  const [termsByProduct, setTermsByProduct] = React.useState<Record<string, string>>({});
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [pendingSubscription, setPendingSubscription] =
    React.useState<PendingSubscription | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);
  const [performanceTokens, setPerformanceTokens] = React.useState<PerformanceToken[]>(
    buildInitialPerformanceTokens
  );

  React.useEffect(() => {
    document.body.classList.add("savings-active");
    return () => {
      document.body.classList.remove("savings-active");
    };
  }, []);

  React.useEffect(() => {
    fetchPlans();
    fetchUserSavings();
  }, [fetchPlans, fetchUserSavings]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setPerformanceTokens((current) =>
        current.map((token) => {
          const delta = token.basePrice * (Math.random() * 0.006 - 0.003);
          const price = Math.max(0.01, token.price + delta);
          return {
            ...token,
            price,
            changeAmt: price - token.basePrice,
            sparkData: [...token.sparkData.slice(1), Math.random()],
          };
        })
      );
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  const earningBalance = parseMoney(user?.savings_balance);
  const totalEarned = userSavings.reduce(
    (total, saving) => total + parseMoney(saving.earned),
    0
  );
  const activePlans = userSavings.length;
  const hasMinimumDeposit = earningBalance >= MIN_DEPOSIT;

  const products = React.useMemo<EarningProduct[]>(() => {
    if (plans.length > 0) {
      return plans.map((plan) => {
        const apy = Math.max(
          ...plan.periods.map((period) => Number(period.roi) || 0),
          0
        );

        return {
          key: plan.id,
          token: plan.currency.toUpperCase(),
          color: getTokenColor(plan.currency),
          apy,
          planId: plan.id,
          terms: plan.periods.length > 0 ? plan.periods : [buildFallbackPeriod(apy)],
          placeholder: false,
        };
      });
    }

    return FALLBACK_PRODUCTS.map((product) => ({
      key: `placeholder-${product.token}`,
      token: product.token,
      color: getTokenColor(product.token),
      apy: product.apy,
      planId: null,
      terms: [buildFallbackPeriod(product.apy)],
      placeholder: true,
    }));
  }, [plans]);

  const uniqueTokens = React.useMemo(
    () => Array.from(new Set(products.map((product) => product.token))).sort(),
    [products]
  );

  const filteredProducts = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (query && !product.token.toLowerCase().includes(query)) return false;
      if (productFilter !== "all" && product.token !== productFilter) return false;
      if (termFilter !== "all") {
        const hasTerm = product.terms.some(
          (term) => String(periodDays(term.period, term.title)) === termFilter
        );
        if (!hasTerm) return false;
      }
      return true;
    });
  }, [productFilter, products, searchTerm, termFilter]);

  const handleDeposit = () => {
    const amount = parseMoney(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }

    if (amount < MIN_DEPOSIT) {
      toast.error("Minimum deposit is $150,000.");
      return;
    }

    navigate("/main/wallet?tab=deposit");
  };

  const selectedPeriodFor = React.useCallback(
    (product: EarningProduct) => {
      const selectedPeriodId = termsByProduct[product.key];
      return (
        product.terms.find((term) => term.period === selectedPeriodId) ||
        getDefaultPeriod(product)
      );
    },
    [termsByProduct]
  );

  const amountFor = (product: EarningProduct) =>
    parseMoney(amountsByProduct[product.key]);

  const openSubscriptionModal = (product: EarningProduct) => {
    const amount = amountFor(product);
    const period = selectedPeriodFor(product);

    if (!product.planId) {
      toast.error("Live earning plan data is not available yet.");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Please enter a subscription amount.");
      return;
    }

    if (!hasMinimumDeposit) {
      toast.error("Deposit minimum $150,000 to subscribe.");
      return;
    }

    setPendingSubscription({
      product,
      period,
      amount,
      monthly: amount * ((Number(period.roi) || product.apy) / 100),
    });
  };

  const confirmSubscription = async () => {
    if (!pendingSubscription?.product.planId) return;

    try {
      setIsSubmitting(true);
      await createSaving({
        amount: pendingSubscription.amount,
        period: pendingSubscription.period.period,
        roi: Number(pendingSubscription.period.roi) || pendingSubscription.product.apy,
        plan_id: pendingSubscription.product.planId,
      });
      toast.success(`Successfully subscribed to ${pendingSubscription.product.token} Earning.`);
      setPendingSubscription(null);
      setExpandedProduct(null);
      setAmountsByProduct((current) => ({
        ...current,
        [pendingSubscription.product.key]: "",
      }));
    } catch (subscriptionError) {
      const axiosError = subscriptionError as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Failed to create savings plan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async (saving: UserSaving) => {
    try {
      setClaimingId(saving.id);
      await claimSaving(saving.id, getSavingClaimData(saving));
      toast.success("Earnings claimed successfully");
    } catch (claimError) {
      toast.error(
        claimError instanceof Error ? claimError.message : "Failed to claim earnings"
      );
    } finally {
      setClaimingId(null);
    }
  };

  const scrollToDeposit = () => {
    document.getElementById("earning-deposit-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <ShellStyles />
      <div className="earning-page fixed inset-0 z-30 flex flex-col">
        <TickerBar />
        <DashboardNavbar />

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="earning-main">
            <div className="earning-pg-header">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
                className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
              >
                <Menu className="h-[1.1rem] w-[1.1rem]" />
              </button>
              <div className="earning-pg-icon">
                <Coins />
              </div>
              <div>
                <h1>Earning</h1>
                <p>Put your crypto to work and earn daily rewards</p>
              </div>
            </div>

            <div className="earning-content-grid">
              <div className="earning-left-col">
                <section className="earning-gcard earning-user-wallet-card">
                  <div className="earning-card-body earning-uwc-left">
                    <div className="earning-uwc-icon">
                      <Coins />
                    </div>
                    <div className="earning-uwc-info">
                      <h2>Earning Account</h2>
                      <p>Deposit funds to start earning. Minimum deposit: $150,000</p>
                      <div
                        className={`earning-uwc-badge${hasMinimumDeposit ? " active" : ""}`}
                      >
                        <span className="earning-badge-dot" />
                        {hasMinimumDeposit ? "ACTIVE" : "REQUIRES DEPOSIT"}
                      </div>
                    </div>
                  </div>

                  <div className="earning-card-body earning-uwc-right">
                    <div className="earning-uwc-stat">
                      <div className="earning-stat-value accent">
                        {formatMoney(earningBalance)}
                      </div>
                      <div className="earning-stat-label">Earning Balance</div>
                    </div>
                    <div className="earning-uwc-stat">
                      <div className="earning-stat-value">
                        {formatMoney(totalEarned)}
                      </div>
                      <div className="earning-stat-label">Total Earned</div>
                    </div>
                    <div className="earning-uwc-stat">
                      <div className="earning-stat-value">{activePlans}</div>
                      <div className="earning-stat-label">Active Plans</div>
                    </div>
                  </div>
                </section>

                <div className="earning-sec-header">
                  <div className="earning-sec-left">
                    <ArrowDown />
                    <h3>Deposit to Earning Account</h3>
                  </div>
                </div>

                <section
                  className="earning-gcard earning-mb-28"
                  id="earning-deposit-section"
                >
                  <div className="earning-card-body">
                    <p className="earning-deposit-desc">
                      To participate in the Earning program, deposit a minimum of
                      $150,000 directly to your earning balance. This deposit is
                      separate from your trading balance.
                    </p>
                    <div className="earning-form-group">
                      <label htmlFor="earning-deposit-amount">Amount (USD)</label>
                      <input
                        id="earning-deposit-amount"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="Enter deposit amount"
                        value={depositAmount}
                        onChange={(event) => setDepositAmount(event.target.value)}
                      />
                    </div>
                    <div className="earning-min-notice">
                      Minimum deposit: $150,000
                    </div>
                    <button
                      type="button"
                      className="earning-primary-btn"
                      onClick={handleDeposit}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Proceed to Deposit
                    </button>
                  </div>
                </section>

                <div className="earning-sec-header">
                  <div className="earning-sec-left">
                    <BarChart3 />
                    <h3>Market Performance</h3>
                    <span className="earning-live-dot" />
                  </div>
                </div>

                <section className="earning-gcard earning-mb-28">
                  <div className="earning-card-body earning-perf-grid">
                    {performanceTokens.map((token) => {
                      const isUp = token.changeAmt >= 0;
                      const pct = (token.changeAmt / token.basePrice) * 100;
                      const price =
                        token.price >= 100
                          ? token.price.toFixed(2)
                          : token.price >= 1
                            ? token.price.toFixed(4)
                            : token.price.toFixed(6);

                      return (
                        <div
                          className={`earning-perf-card ${isUp ? "up" : "dn"}`}
                          key={token.sym}
                        >
                          <div className="earning-perf-top">
                            <div
                              className="earning-perf-token-icon"
                              style={{ background: token.color }}
                            >
                              {getTokenInitials(token.sym)}
                            </div>
                            <div className="earning-perf-token-name">
                              {token.sym}
                            </div>
                          </div>
                          <div className="earning-perf-price">${price}</div>
                          <div className="earning-perf-change">
                            <span
                              className={`earning-perf-amount ${isUp ? "up" : "dn"}`}
                            >
                              {isUp ? <ArrowUp /> : <ArrowDown />}
                              {isUp ? "+" : "-"}$
                              {Math.abs(token.changeAmt).toFixed(2)}
                            </span>
                            <span
                              className={`earning-perf-pct ${isUp ? "up" : "dn"}`}
                            >
                              {isUp ? "+" : ""}
                              {pct.toFixed(2)}%
                            </span>
                          </div>
                          <div className="earning-sparkline">
                            {token.sparkData.map((value, index) => (
                              <span
                                className="earning-spark-bar"
                                key={`${token.sym}-${index}`}
                                style={{
                                  height: `${4 + value * 20}px`,
                                  background: isUp ? "#1ED760" : "#f43f5e",
                                  opacity: 0.3 + value * 0.7,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="earning-sec-header">
                  <div className="earning-sec-left">
                    <PackageOpen />
                    <h3>Products</h3>
                  </div>
                  <div className="earning-sec-count">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </div>
                </div>

                <section className="earning-gcard earning-products-card earning-mb-28">
                  <div className="earning-card-body">
                    <div className="earning-products-toolbar-wrap">
                      <div className="earning-products-toolbar">
                        <div className="earning-search-wrap">
                          <Search />
                          <input
                            type="text"
                            placeholder="Search tokens..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                          />
                        </div>
                        <select
                          className="earning-filter-select"
                          value={productFilter}
                          onChange={(event) => setProductFilter(event.target.value)}
                          aria-label="Filter products"
                        >
                          <option value="all">All products</option>
                          {uniqueTokens.map((token) => (
                            <option key={token} value={token}>
                              {token}
                            </option>
                          ))}
                        </select>
                        <select
                          className="earning-filter-select"
                          value={termFilter}
                          onChange={(event) => setTermFilter(event.target.value)}
                          aria-label="Filter terms"
                        >
                          <option value="all">All terms</option>
                          <option value="30">30 Days</option>
                          <option value="60">60 Days</option>
                          <option value="90">90 Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="earning-table-wrap">
                      <table className="earning-ptable">
                        <thead>
                          <tr>
                            <th>Token</th>
                            <th>Monthly APY</th>
                            <th>Term</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isLoading && plans.length === 0 ? (
                            <tr>
                              <td colSpan={4}>
                                <div className="earning-empty-state">
                                  <Loader2 className="animate-spin" />
                                  Loading earning products
                                </div>
                              </td>
                            </tr>
                          ) : filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={4}>
                                <div className="earning-empty-state">
                                  <Search />
                                  No products match your filters
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((product) => {
                              const selectedPeriod = selectedPeriodFor(product);
                              const amount = amountFor(product);
                              const roi = Number(selectedPeriod.roi) || product.apy;
                              const monthly = amount * (roi / 100);
                              const isExpanded = expandedProduct === product.key;
                              const disableSubscribe =
                                !product.planId ||
                                !amount ||
                                amount <= 0 ||
                                !hasMinimumDeposit ||
                                isSubmitting;

                              return (
                                <React.Fragment key={product.key}>
                                  <tr
                                    className="earning-product-row"
                                    onClick={() =>
                                      setExpandedProduct(
                                        isExpanded ? null : product.key
                                      )
                                    }
                                  >
                                    <td>
                                      <div className="earning-token-cell">
                                        <div
                                          className="earning-token-icon"
                                          style={{ background: product.color }}
                                        >
                                          {getTokenInitials(product.token)}
                                        </div>
                                        <span className="earning-token-name">
                                          {product.token}
                                        </span>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="earning-apy-val">
                                        {roi.toFixed(2)}%
                                      </span>
                                    </td>
                                    <td>
                                      <span className="earning-term-val">
                                        {formatTerm(selectedPeriod)}
                                      </span>
                                    </td>
                                    <td>
                                      <ChevronDown
                                        className={`earning-expand-chevron${
                                          isExpanded ? " open" : ""
                                        }`}
                                      />
                                    </td>
                                  </tr>

                                  {isExpanded && (
                                    <tr className="earning-expand-row">
                                      <td colSpan={4}>
                                        <div className="earning-expand-content">
                                          <div className="earning-expand-title">
                                            Subscribe to {product.token} Earning
                                          </div>
                                          <div className="earning-expand-form">
                                            <div className="earning-form-group">
                                              <label
                                                htmlFor={`amount-${product.key}`}
                                              >
                                                Amount (USD)
                                              </label>
                                              <input
                                                id={`amount-${product.key}`}
                                                type="number"
                                                min="0"
                                                step="100"
                                                placeholder="Enter amount"
                                                value={
                                                  amountsByProduct[product.key] ||
                                                  ""
                                                }
                                                onClick={(event) =>
                                                  event.stopPropagation()
                                                }
                                                onChange={(event) =>
                                                  setAmountsByProduct(
                                                    (current) => ({
                                                      ...current,
                                                      [product.key]:
                                                        event.target.value,
                                                    })
                                                  )
                                                }
                                              />
                                            </div>

                                            <div className="earning-form-group">
                                              <label htmlFor={`term-${product.key}`}>
                                                Term
                                              </label>
                                              <select
                                                id={`term-${product.key}`}
                                                value={selectedPeriod.period}
                                                onClick={(event) =>
                                                  event.stopPropagation()
                                                }
                                                onChange={(event) =>
                                                  setTermsByProduct((current) => ({
                                                    ...current,
                                                    [product.key]:
                                                      event.target.value,
                                                  }))
                                                }
                                              >
                                                {product.terms.map((term) => (
                                                  <option
                                                    key={term.period}
                                                    value={term.period}
                                                  >
                                                    {formatTerm(term)} -{" "}
                                                    {Number(term.roi).toFixed(2)}%
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>

                                          <div className="earning-expand-form">
                                            <div className="earning-earnings-calc">
                                              <div className="earning-calc-row">
                                                <span className="earning-calc-label">
                                                  Est. Daily Earnings
                                                </span>
                                                <span className="earning-calc-val">
                                                  {formatMoney(monthly / 30)}
                                                </span>
                                              </div>
                                              <div className="earning-calc-row">
                                                <span className="earning-calc-label">
                                                  Est. Monthly Earnings
                                                </span>
                                                <span className="earning-calc-val">
                                                  {formatMoney(monthly)}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="earning-subscribe-row">
                                            <button
                                              type="button"
                                              className="earning-subscribe-btn"
                                              disabled={disableSubscribe}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                openSubscriptionModal(product);
                                              }}
                                            >
                                              {isSubmitting ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <Rocket className="h-4 w-4" />
                                              )}
                                              Subscribe
                                            </button>

                                            {!hasMinimumDeposit && (
                                              <div className="earning-sub-note">
                                                <Info />
                                                Deposit minimum $150,000 to
                                                subscribe
                                              </div>
                                            )}
                                            {!product.planId && (
                                              <div className="earning-sub-note">
                                                <Info />
                                                Live earning plan data unavailable
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {error && (
                      <div className="px-5 pb-5 text-[0.78rem] font-semibold text-[#f43f5e]">
                        {error}
                      </div>
                    )}
                  </div>
                </section>

                <div className="earning-sec-header">
                  <div className="earning-sec-left">
                    <TrendingUp />
                    <h3>Daily Growth Tracker</h3>
                  </div>
                </div>

                <section className="earning-gcard earning-mb-28">
                  <div className="earning-card-body">
                    {userSavings.length === 0 ? (
                      <div className="earning-empty-state">
                        <Sprout />
                        Subscribe to an earning plan to see your daily growth
                      </div>
                    ) : (
                      <div className="earning-table-wrap">
                        <table className="earning-growth-table">
                          <thead>
                            <tr>
                              <th>Token</th>
                              <th>Amount</th>
                              <th>Day 1</th>
                              <th>Day 2</th>
                              <th>Day 3</th>
                              <th>Day 4</th>
                              <th>Day 5</th>
                              <th>Day 6</th>
                              <th>Day 7</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userSavings.map((saving) => {
                              const amount = parseMoney(
                                saving.usd_amount || saving.amount
                              );
                              const roi = Number(saving.roi) || 0;
                              const daily = amount * (roi / 100) / 30;
                              const canClaim = saving.days === 0;

                              return (
                                <tr key={saving.id}>
                                  <td>
                                    <span className="font-bold">
                                      {saving.currency}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="font-mono">
                                      {formatMoney(amount)}
                                    </span>
                                  </td>
                                  {Array.from({ length: 7 }, (_, index) => {
                                    const variance = 0.96 + ((index + 1) % 5) * 0.02;
                                    return (
                                      <td key={`${saving.id}-${index}`}>
                                        <span className="earning-growth-val">
                                          +{formatMoney(daily * variance)}
                                        </span>
                                      </td>
                                    );
                                  })}
                                  <td>
                                    {canClaim ? (
                                      <button
                                        type="button"
                                        className="earning-small-action"
                                        onClick={() => handleClaim(saving)}
                                        disabled={claimingId === saving.id}
                                      >
                                        {claimingId === saving.id && (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        )}
                                        Claim
                                      </button>
                                    ) : (
                                      <span className="earning-term-val">
                                        Locked {saving.days} days
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>

                <section className="earning-gcard earning-mb-28">
                  <div className="earning-card-body">
                    <div className="earning-faq-title">FAQ</div>
                    {FAQS.map((item, index) => {
                      const isOpen = openFaq === index;
                      return (
                        <div className="earning-faq-item" key={item.question}>
                          <button
                            type="button"
                            className={`earning-faq-q${isOpen ? " open" : ""}`}
                            onClick={() => setOpenFaq(isOpen ? null : index)}
                          >
                            {item.question}
                            <ChevronDown />
                          </button>
                          <div className={`earning-faq-a${isOpen ? " open" : ""}`}>
                            <div className="earning-faq-a-inner">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="earning-right-col">
                <section className="earning-rcard">
                  <div className="earning-card-body">
                    <div className="earning-rcard-label">Earning Overview</div>
                    <div className="earning-plan-icon-wrap">
                      <div className="earning-plan-icon">
                        <Coins />
                      </div>
                    </div>
                    <div className="earning-plan-name">Earning Program</div>
                    <div className="earning-plan-sub">
                      Grow your portfolio passively
                    </div>
                    <div>
                      <div className="earning-plan-row">
                        <span className="earning-pr-label">Earning Balance</span>
                        <span className="earning-pr-value accent">
                          {formatMoney(earningBalance)}
                        </span>
                      </div>
                      <div className="earning-plan-row">
                        <span className="earning-pr-label">Total Earned</span>
                        <span className="earning-pr-value">
                          {formatMoney(totalEarned)}
                        </span>
                      </div>
                      <div className="earning-plan-row">
                        <span className="earning-pr-label">Active Plans</span>
                        <span className="earning-pr-value">{activePlans}</span>
                      </div>
                      <div className="earning-plan-row">
                        <span className="earning-pr-label">Min Deposit</span>
                        <span className="earning-pr-value">$150,000</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="earning-start-btn"
                      onClick={scrollToDeposit}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      Start Earning
                    </button>
                  </div>
                </section>

                <section className="earning-rcard">
                  <div className="earning-card-body">
                    <div className="earning-rcard-label">Quick Links</div>
                    <div className="earning-qlinks">
                      <Link className="earning-qlink" to="/main/wallet?tab=deposit">
                        <span className="earning-qlink-icon">
                          <ArrowDown />
                        </span>
                        Deposit Funds
                        <span className="earning-arrow">
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </Link>
                      <Link className="earning-qlink" to="/main/accounts">
                        <span className="earning-qlink-icon">
                          <Wallet />
                        </span>
                        Accounts
                        <span className="earning-arrow">
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </Link>
                      <Link className="earning-qlink" to="/main/welcome-bonus">
                        <span className="earning-qlink-icon">
                          <Gift />
                        </span>
                        Welcome Bonus
                        <span className="earning-arrow">
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </Link>
                      <Link className="earning-qlink" to="/main/trading-plans">
                        <span className="earning-qlink-icon">
                          <Clock />
                        </span>
                        Trading Plans
                        <span className="earning-arrow">
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="earning-rcard">
                  <div className="earning-card-body">
                    <div className="earning-rcard-label">Need Help?</div>
                    <p className="earning-help-text">
                      Can't find a setting? Our support team can help with account
                      configuration and troubleshooting.
                    </p>
                    <Link className="earning-help-btn" to="/main/chat">
                      <Headphones className="h-3.5 w-3.5" />
                      Contact Support
                    </Link>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {pendingSubscription && (
        <div
          className="earning-page earning-modal-overlay"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setPendingSubscription(null);
            }
          }}
        >
          <div className="earning-modal-card">
            <div className="earning-modal-inner">
              <div className="earning-modal-icon">
                <CheckCircle2 />
              </div>
              <div className="earning-modal-title">Confirm Subscription</div>
              <div>
                <div className="earning-modal-row">
                  <span className="earning-modal-label">Token</span>
                  <span className="earning-modal-value">
                    {pendingSubscription.product.token}
                  </span>
                </div>
                <div className="earning-modal-row">
                  <span className="earning-modal-label">Amount</span>
                  <span className="earning-modal-value">
                    {formatMoney(pendingSubscription.amount)}
                  </span>
                </div>
                <div className="earning-modal-row">
                  <span className="earning-modal-label">Monthly APY</span>
                  <span className="earning-modal-value accent">
                    {Number(pendingSubscription.period.roi).toFixed(2)}%
                  </span>
                </div>
                <div className="earning-modal-row">
                  <span className="earning-modal-label">Est. Monthly Earnings</span>
                  <span className="earning-modal-value accent">
                    {formatMoney(pendingSubscription.monthly)}
                  </span>
                </div>
              </div>
              <div className="earning-modal-warning">
                By subscribing, your funds will be allocated to this earning plan.
                Existing savings account rules and backend validation still apply.
              </div>
              <div className="earning-modal-btns">
                <button
                  type="button"
                  className="earning-modal-ghost"
                  onClick={() => setPendingSubscription(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="earning-modal-confirm"
                  onClick={confirmSubscription}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Confirming..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
