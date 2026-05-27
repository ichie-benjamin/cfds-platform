import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TickerBar } from "@/components/dashboard/TickerBar";
import useUserStore from "@/store/userStore";
import useSiteSettingsStore from "@/store/siteSettingStore";
import {
  Bell,
  ListTodo,
  TrendingUp,
  Gift,
  Wallet as WalletIcon,
  Settings as SettingsIcon,
  Headphones,
  HelpCircle,
  Coins,
  Check,
  Hourglass,
  Trophy,
  Lock,
  ArrowDown,
  ChartLine,
  Shield,
  BarChart3,
  Mountain,
  Users,
  IdCard,
  Rocket,
  CalendarCheck,
  Crown,
  Percent,
  Inbox,
  Share2,
  Flame,
  ChevronDown,
  Menu,
  X as XIcon,
  Circle,
} from "lucide-react";

// ───────────────────────────────────────────────────────────────
// STATIC CONTENT (presentational only — from html_files/rewards.html)
// ───────────────────────────────────────────────────────────────

type TabKey = "tasks" | "earn" | "promo";

const NAV_LINKS: { label: string; to: string; external?: boolean; active?: boolean }[] = [
  { label: "Dashboard", to: "/main/dashboard" },
  { label: "Markets", to: "/main/market" },
  { label: "Trade Room", to: "/trading", external: true },
  { label: "Wallet", to: "/main/wallet" },
  { label: "Rewards", to: "#rw-top", active: true },
];

const FOOTER_LINKS = [
  { label: "Dashboard", to: "/main/dashboard" },
  { label: "Markets", to: "/main/market" },
  { label: "Trading Plans", to: "/main/trading-plans" },
  { label: "Welcome Bonus", to: "/main/welcome-bonus" },
  { label: "Referral", to: "/main/referral" },
  { label: "Fund Protection", to: "/main/fund-protection" },
  { label: "Security", to: "/main/security" },
  { label: "Contact Support", to: "/main/chat" },
];

const BAL_CARDS = [
  {
    tone: "green",
    icon: Coins,
    label: "Total Earned",
    value: "$0.00",
    sub: "All time",
  },
  {
    tone: "amber",
    icon: Check,
    label: "Available",
    value: "$0.00",
    sub: "Ready to redeem",
  },
  {
    tone: "orange",
    icon: Hourglass,
    label: "Pending",
    value: "$0.00",
    sub: "In progress",
  },
  {
    tone: "blue",
    icon: Trophy,
    label: "Tasks Completed",
    value: "0/11",
    sub: "Progress",
  },
];

type StepDef = {
  num: string;
  title: string;
  sub: string;
  locked: boolean;
  lockMsg?: string;
  cards: {
    icon: React.ElementType;
    title: string;
    bonus?: string;
    desc: string;
    progress: string;
    cta?: { label: string; tone: "green" | "amber" };
    tone: "green" | "amber";
  }[];
};

const TASK_STEPS: StepDef[] = [
  {
    num: "1",
    title: "Step 1: Get Started",
    sub: "Unlock your first rewards",
    locked: false,
    cards: [
      {
        icon: ArrowDown,
        title: "+$10 Deposit Bonus",
        desc: "Make your first deposit of $30 USD or more",
        progress: "0 / $30 deposited",
        cta: { label: "Deposit Now", tone: "green" },
        tone: "green",
      },
      {
        icon: ChartLine,
        title: "+$20 Trading Bonus",
        desc: "Execute at least one spot or futures trade",
        progress: "0 / 1 trade completed",
        cta: { label: "Trade Now", tone: "amber" },
        tone: "amber",
      },
    ],
  },
  {
    num: "2",
    title: "Step 2: Build Momentum",
    sub: "Increase trading activity",
    locked: true,
    lockMsg: "Complete Step 1",
    cards: [
      {
        icon: BarChart3,
        title: "Reach $1,000 Volume",
        bonus: "+$50",
        desc: "Trade $1,000 USD worth in value",
        progress: "$0 / $1,000",
        tone: "green",
      },
      {
        icon: Coins,
        title: "Trade 3 Different Pairs",
        bonus: "+$30",
        desc: "Trade at least 3 different trading pairs",
        progress: "0 / 3 pairs",
        tone: "green",
      },
      {
        icon: Shield,
        title: "Enable 2FA Security",
        bonus: "+$20",
        desc: "Secure your account with two-factor authentication",
        progress: "0 / 1",
        tone: "green",
      },
    ],
  },
  {
    num: "3",
    title: "Step 3: Master Trading",
    sub: "Advanced trading milestones",
    locked: true,
    lockMsg: "Complete Step 2",
    cards: [
      {
        icon: Mountain,
        title: "Reach $10,000 Volume",
        bonus: "+$100",
        desc: "Trade $10,000 USD worth in value",
        progress: "$0 / $10,000",
        tone: "green",
      },
      {
        icon: Users,
        title: "Refer a Friend",
        bonus: "+$75",
        desc: "Invite someone to join 1 Trade Market",
        progress: "0 / 1 referral",
        tone: "green",
      },
      {
        icon: IdCard,
        title: "Complete Advanced KYC",
        bonus: "+$50",
        desc: "Verify your identity with advanced verification",
        progress: "0 / 1",
        tone: "green",
      },
    ],
  },
  {
    num: "4",
    title: "Step 4: Pro Trader",
    sub: "Reach elite trading status",
    locked: true,
    lockMsg: "Complete Step 3",
    cards: [
      {
        icon: Rocket,
        title: "Reach $100,000 Volume",
        bonus: "+$500",
        desc: "Trade $100,000 USD worth in value",
        progress: "$0 / $100,000",
        tone: "green",
      },
      {
        icon: CalendarCheck,
        title: "Trade 30 Consecutive Days",
        bonus: "+$200",
        desc: "Trade every day for 30 days straight",
        progress: "0 / 30 days",
        tone: "green",
      },
      {
        icon: Crown,
        title: "Reach VIP Silver Tier",
        bonus: "+$300",
        desc: "Achieve Silver VIP status",
        progress: "0 / 1",
        tone: "green",
      },
    ],
  },
];

const CASHBACK_TIERS = [
  { tier: "$0 - $10,000", rate: "0.1%", highlight: false },
  { tier: "$10,001 - $50,000", rate: "0.2%", highlight: false },
  { tier: "$50,001 - $250,000", rate: "0.35%", highlight: false },
  { tier: "$250,000+", rate: "0.5%", highlight: true },
];

const TOP_TRADERS = [
  {
    rank: 1,
    name: "Sarah Chen",
    volume: "$125,400",
    earned: "$627.00",
    tone: "amber",
    highlight: true,
  },
  { rank: 2, name: "Marcus Johnson", volume: "$98,200", earned: "$491.00", tone: "blue", highlight: false },
  { rank: 3, name: "Emily Rodriguez", volume: "$87,600", earned: "$438.00", tone: "orange", highlight: false },
  { rank: 4, name: "David Kim", volume: "$72,300", earned: "$361.50", tone: "purple", highlight: false },
  { rank: 5, name: "Jessica Wong", volume: "$65,800", earned: "$329.00", tone: "green", highlight: false },
];

const FAQS = [
  {
    q: "What is the Reward Center?",
    a: "The Reward Center is your hub for earning bonuses and cashback through trading. Complete tasks, trade consistently, and unlock higher rewards. Every action brings you closer to bigger payouts!",
  },
  {
    q: "What is Trading Bonus?",
    a: "Trading Bonuses are rewards given when you complete specific trading milestones like your first trade, reaching certain volumes, or trading consecutive days. These bonuses are credited to your account as USD.",
  },
  {
    q: "What is Cashback?",
    a: "Cashback is a percentage of your trading fees returned to you based on your volume tier. The more you trade, the higher your tier and the more cashback you earn. It's automatically added to your account daily.",
  },
  {
    q: "How to redeem rewards?",
    a: "Redeeming rewards is simple. Go to your Wallet, click \"Redeem Rewards\", select your preferred withdrawal method, and confirm. Most withdrawals process within 24–48 hours to your chosen account.",
  },
  {
    q: "Are there any terms and conditions?",
    a: "Yes. All rewards are subject to our Terms of Service. Some bonuses may have holding periods, trading requirements, or expiration dates. Check the specific task details for complete terms applicable to that reward.",
  },
  {
    q: "Can I combine multiple rewards?",
    a: "Absolutely! You can stack bonuses, cashback, and promotions. Complete trader tasks for bonuses, trade regularly for cashback, and apply promo codes for extra rewards. They all add up in your account!",
  },
  {
    q: "What are VIP tiers?",
    a: "VIP tiers unlock exclusive rewards and higher cashback rates. Start at Bronze and progress through Silver, Gold, Platinum, and Diamond. Each tier requires higher trading volumes but offers better rates and exclusive perks.",
  },
  {
    q: "How often is cashback credited?",
    a: "Cashback is calculated daily based on your trading activity from the previous day. It's automatically added to your available rewards balance by 2 AM UTC each day. You can check your earnings in the Rewards Center.",
  },
];

const revealProps = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

function smoothScroll(href: string) {
  if (typeof window === "undefined") return;
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ───────────────────────────────────────────────────────────────
// PAGE
// ───────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const user = useUserStore((s) => s.user);
  const settings = useSiteSettingsStore((s) => s.settings);
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "JD";
  const brandName = settings?.name || "1 Trade Market";

  // Local UI state — no backend
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    "1": true,
  });
  const [openFaq, setOpenFaq] = useState(-1);
  const [promoCode, setPromoCode] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide MainLayout chrome
  useEffect(() => {
    document.body.classList.add("rw-active");
    return () => {
      document.body.classList.remove("rw-active");
    };
  }, []);

  // Page-scoped fonts
  useEffect(() => {
    if (document.querySelector<HTMLLinkElement>('link[data-rw-fonts="1"]'))
      return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
    link.dataset.rwFonts = "1";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch {
        /* noop */
      }
    };
  }, []);

  const brandParts = brandName.split(" ").filter(Boolean);
  const brandHead =
    brandParts.length > 1 ? brandParts.slice(0, -1).join(" ") : "";
  const brandTail = brandParts[brandParts.length - 1] || brandName;

  const toggleStep = (num: string) => {
    const step = TASK_STEPS.find((s) => s.num === num);
    if (!step || step.locked) return;
    setExpandedSteps((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  return (
    <div
      className="rw-root w-full"
      id="rw-top"
      style={{
        background: "linear-gradient(135deg, #07080c 0%, #0a0d15 100%)",
        color: "#eef2f7",
        fontFamily: "Inter, -apple-system, 'Helvetica Neue', sans-serif",
      }}
    >
      <style>{`
        body.rw-active .fixed.top-0.left-0.right-0.z-20,
        body.rw-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.rw-active .flex.flex-1.pt-\\[90px\\] { padding-top: 0 !important; }
        body.rw-active .flex-1.md\\:ml-\\[80px\\] { margin-left: 0 !important; }

        .rw-root { line-height: 1.6; overflow-x: hidden; min-height: 100vh; }

        /* Ticker */
        .rw-ticker-wrap { position: relative; z-index: 299; }
        .rw-ticker-wrap > div {
          height: 34px !important;
          background: rgba(7,8,12,0.65) !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
        }

        /* Nav */
        .rw-nav {
          position: sticky;
          top: 0;
          z-index: 200;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .rw-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
          gap: 16px;
        }
        .rw-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #eef2f7;
          text-decoration: none;
          flex-shrink: 0;
        }
        .rw-logo-icon {
          width: 38px;
          height: 38px;
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
        .rw-logo-text {
          font-weight: 800;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
          white-space: nowrap;
        }
        .rw-logo-text em { font-style: normal; color: #00dfa2; }
        .rw-nav-links { display: flex; align-items: center; gap: 22px; }
        .rw-nav-link {
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
        .rw-nav-link:hover { color: #eef2f7; }
        .rw-nav-link.active { color: #00dfa2; }
        .rw-nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .rw-nav-icon { color: #8b97a8; transition: color 0.2s ease; cursor: pointer; }
        .rw-nav-icon:hover { color: #00dfa2; }
        .rw-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.78rem;
        }
        .rw-hamburger {
          display: none;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #8b97a8;
          cursor: pointer;
        }
        .rw-mobile-menu {
          padding: 14px 24px 18px;
          background: rgba(7,8,12,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .rw-mobile-menu .rw-nav-link { padding: 10px 0; text-align: left; }

        /* Layout */
        .rw-layout {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 0;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 94px);
        }

        /* Icon-only sidebar (Market style) */
        .rw-sidebar {
          padding: 18px 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          border-right: 1px solid rgba(255,255,255,0.05);
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          position: sticky;
          top: 94px;
          align-self: flex-start;
          height: calc(100vh - 94px);
          z-index: 180;
          overflow: visible;
        }
        .rw-sb-icon {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5468;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          text-decoration: none;
        }
        .rw-sb-icon:hover {
          color: #eef2f7;
          background: rgba(255,255,255,0.06);
          z-index: 9999;
        }
        .rw-sb-icon.active {
          background: rgba(0,223,162,0.1);
          color: #00dfa2;
        }
        .rw-sb-tip {
          position: absolute;
          left: 50px;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          padding: 6px 10px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #eef2f7;
          background: rgba(10,13,21,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 9999;
        }
        .rw-sb-icon:hover .rw-sb-tip { opacity: 1; }
        .rw-sb-divider {
          width: 24px;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 6px 0;
        }

        /* Main content */
        .rw-main {
          padding: 32px 28px 64px;
          min-width: 0;
        }

        /* Page header */
        .rw-pg-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .rw-pg-head h1 {
          font-size: clamp(1.6rem, 2.8vw, 2.1rem);
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          color: #eef2f7;
        }
        .rw-pg-head p { color: #8b97a8; font-size: 0.95rem; margin: 0; }
        .rw-pg-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .rw-pg-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: #8b97a8;
          text-decoration: none;
          margin-bottom: 6px;
          transition: color 0.2s ease;
        }
        .rw-pg-link:hover { color: #00dfa2; }
        .rw-pg-total {
          font-size: 1.6rem;
          font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
          color: #00dfa2;
          line-height: 1;
        }
        .rw-pg-label {
          font-size: 0.7rem;
          color: #4a5468;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        /* Glass card base */
        .rw-glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }

        /* Balance strip */
        .rw-bal-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        .rw-bal-card {
          padding: 18px 18px;
          position: relative;
          overflow: hidden;
        }
        .rw-bci {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .rw-bci.green { background: rgba(0,223,162,0.1); color: #00dfa2; }
        .rw-bci.amber { background: rgba(240,180,41,0.1); color: #F0B429; }
        .rw-bci.orange { background: rgba(255,152,0,0.1); color: #FF9800; }
        .rw-bci.blue { background: rgba(91,141,239,0.1); color: #5b8def; }
        .rw-bc-lbl { font-size: 0.72rem; color: #8b97a8; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; margin-bottom: 6px; }
        .rw-bc-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.4rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 4px;
        }
        .rw-bc-sub { font-size: 0.72rem; color: #4a5468; }

        /* Progress bar */
        .rw-prog-wrap {
          padding: 20px 22px;
          margin-bottom: 28px;
        }
        .rw-pw-label {
          font-weight: 700;
          color: #eef2f7;
          margin-bottom: 12px;
          font-family: 'Outfit', sans-serif;
        }
        .rw-pw-track {
          display: grid;
          grid-template-columns: repeat(11, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }
        .rw-pw-seg {
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
        }
        .rw-pw-seg.done { background: linear-gradient(90deg, #00dfa2, #00ffc3); }
        .rw-pw-info { display: flex; justify-content: space-between; font-size: 0.78rem; flex-wrap: wrap; gap: 8px; }
        .rw-pw-text { color: #8b97a8; }
        .rw-pw-badge {
          padding: 4px 10px;
          background: rgba(0,223,162,0.1);
          border: 1px solid rgba(0,223,162,0.2);
          border-radius: 12px;
          color: #00dfa2;
          font-weight: 700;
          font-size: 0.72rem;
        }

        /* Tabs */
        .rw-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 0;
          flex-wrap: wrap;
        }
        .rw-tab {
          padding: 10px 18px;
          color: #8b97a8;
          font-weight: 700;
          font-size: 0.88rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease;
          font-family: inherit;
        }
        .rw-tab:hover { color: #eef2f7; }
        .rw-tab.on { color: #00dfa2; border-bottom-color: #00dfa2; }

        /* Step section */
        .rw-step-sec { margin-bottom: 24px; }
        .rw-step-hdr {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .rw-step-hdr:hover { background: rgba(255,255,255,0.06); }
        .rw-step-hdr.locked { cursor: not-allowed; opacity: 0.7; }
        .rw-step-num {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rw-step-num.locked {
          background: rgba(255,255,255,0.06);
          color: #4a5468;
        }
        .rw-step-info { flex: 1; min-width: 0; }
        .rw-step-title {
          font-weight: 800;
          font-size: 0.95rem;
          color: #eef2f7;
          font-family: 'Outfit', sans-serif;
        }
        .rw-step-sub { font-size: 0.78rem; color: #8b97a8; }
        .rw-step-chevron { color: #8b97a8; transition: transform 0.25s ease; flex-shrink: 0; }
        .rw-step-chevron.open { transform: rotate(180deg); color: #00dfa2; }
        .rw-step-lock {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 0.74rem;
          color: #8b97a8;
          font-weight: 600;
          flex-shrink: 0;
        }

        /* Task grids */
        .rw-task-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 16px;
        }
        .rw-task-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 16px;
          opacity: 0.45;
          pointer-events: none;
          filter: blur(1px);
        }

        /* Task card (large, unlocked) */
        .rw-task-card {
          padding: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .rw-task-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,223,162,0.3);
          box-shadow: 0 10px 32px rgba(0,223,162,0.15);
        }
        .rw-tc-left-border {
          position: absolute;
          left: 0; top: 0; bottom: 0; width: 4px;
          border-radius: 14px 0 0 14px;
        }
        .rw-tc-left-border.green { background: linear-gradient(180deg, #00dfa2, #00ffc3); }
        .rw-tc-left-border.amber { background: linear-gradient(180deg, #F0B429, #FFD24D); }
        .rw-tc-decor {
          position: absolute;
          top: -40px; right: -40px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,223,162,0.1), transparent 70%);
          pointer-events: none;
        }
        .rw-tc-decor.amber {
          background: radial-gradient(circle, rgba(240,180,41,0.1), transparent 70%);
        }
        .rw-tc-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; position: relative; z-index: 1; }
        .rw-tc-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rw-tc-icon.green { background: rgba(0,223,162,0.15); color: #00dfa2; border: 1px solid rgba(0,223,162,0.25); }
        .rw-tc-icon.amber { background: rgba(240,180,41,0.15); color: #F0B429; border: 1px solid rgba(240,180,41,0.25); }
        .rw-tc-title {
          font-weight: 800;
          font-size: 1rem;
          color: #eef2f7;
          margin-bottom: 4px;
          font-family: 'Outfit', sans-serif;
        }
        .rw-tc-desc { font-size: 0.82rem; color: #8b97a8; line-height: 1.5; }
        .rw-tc-progress {
          font-size: 0.82rem;
          color: #8b97a8;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace;
        }
        .rw-tc-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .rw-tc-btn.green {
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
        }
        .rw-tc-btn.amber {
          background: linear-gradient(135deg, #F0B429, #FFD24D);
          color: #07080c;
        }
        .rw-tc-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,223,162,0.25); }

        /* Small task card (locked) */
        .rw-task-card-sm {
          padding: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .rw-locked-overlay {
          position: absolute;
          inset: 0;
          background: rgba(7,8,12,0.4);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          border-radius: inherit;
        }
        .rw-lo-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-size: 0.74rem;
          color: #8b97a8;
          font-weight: 700;
        }
        .rw-tcs-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(0,223,162,0.1);
          color: #00dfa2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }
        .rw-tcs-title { font-weight: 800; color: #eef2f7; margin-bottom: 4px; font-size: 0.92rem; font-family: 'Outfit', sans-serif; }
        .rw-tcs-bonus {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.3rem;
          font-weight: 800;
          color: #00dfa2;
          margin-bottom: 6px;
        }
        .rw-tcs-desc { font-size: 0.78rem; color: #8b97a8; margin-bottom: 12px; line-height: 1.5; }
        .rw-tcs-progress {
          font-size: 0.74rem;
          color: #4a5468;
          font-family: 'JetBrains Mono', monospace;
          padding: 6px 10px;
          background: rgba(255,255,255,0.03);
          border-radius: 6px;
          display: inline-block;
        }

        /* Trade & Earn — cashback table */
        .rw-cb-card { padding: 26px; margin-bottom: 22px; }
        .rw-cb-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .rw-cb-head .rw-icon-pill {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(0,223,162,0.15);
          color: #00dfa2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rw-cb-head h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 4px;
          font-family: 'Outfit', sans-serif;
        }
        .rw-cb-head p { font-size: 0.78rem; color: #8b97a8; margin: 0; }
        .rw-cb-table { width: 100%; border-collapse: collapse; }
        .rw-cb-table th {
          padding: 12px 0;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #4a5468;
          font-weight: 700;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-family: 'Outfit', sans-serif;
        }
        .rw-cb-table th:last-child { text-align: right; }
        .rw-cb-table td {
          padding: 14px 0;
          font-size: 0.88rem;
          color: #8b97a8;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .rw-cb-table tbody tr:last-child td { border-bottom: none; }
        .rw-cb-table td:last-child {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          color: #00dfa2;
        }
        .rw-cb-table td.highlight { color: #00ffc3; }

        /* Top Traders */
        .rw-tt-card { padding: 26px; }
        .rw-tt-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .rw-tt-head .rw-icon-pill {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(91,141,239,0.15);
          color: #5b8def;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rw-tt-head h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 4px;
          font-family: 'Outfit', sans-serif;
        }
        .rw-tt-head p { font-size: 0.78rem; color: #8b97a8; margin: 0; }
        .rw-tt-list { display: flex; flex-direction: column; gap: 10px; }
        .rw-tt-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.04);
        }
        .rw-tt-row.highlight {
          background: rgba(0,223,162,0.06);
          border-color: rgba(0,223,162,0.2);
        }
        .rw-tt-rank {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          color: #fff;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rw-tt-rank.amber { background: linear-gradient(135deg, #F0B429, #FFB84D); }
        .rw-tt-rank.blue { background: linear-gradient(135deg, #5b8def, #7B9EEF); }
        .rw-tt-rank.orange { background: linear-gradient(135deg, #FF9800, #FFB84D); }
        .rw-tt-rank.purple { background: linear-gradient(135deg, #8B5CF6, #A78BFA); }
        .rw-tt-rank.green { background: linear-gradient(135deg, #00dfa2, #00ffc3); color: #000; }
        .rw-tt-info { flex: 1; min-width: 0; }
        .rw-tt-name { font-size: 0.88rem; font-weight: 700; color: #eef2f7; }
        .rw-tt-vol { font-size: 0.7rem; color: #8b97a8; }
        .rw-tt-earn {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 800;
          color: #00ffc3;
          font-size: 0.92rem;
          text-align: right;
        }
        .rw-tt-earn.muted { color: #8b97a8; }
        .rw-tt-lbl { font-size: 0.68rem; color: #4a5468; text-align: right; }

        /* My Promo */
        .rw-promo-empty {
          padding: 48px 28px;
          text-align: center;
        }
        .rw-promo-empty svg { color: #4a5468; margin: 0 auto 16px; }
        .rw-promo-empty h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 6px;
          font-family: 'Outfit', sans-serif;
        }
        .rw-promo-empty p { font-size: 0.85rem; color: #8b97a8; margin-bottom: 22px; }
        .rw-promo-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(0,223,162,0.06);
          border: 1px solid rgba(0,223,162,0.18);
          border-radius: 10px;
          max-width: 420px;
          margin: 0 auto;
        }
        .rw-promo-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.86rem;
          color: #eef2f7;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          min-width: 0;
        }
        .rw-promo-input::placeholder { color: #4a5468; }
        .rw-promo-apply {
          padding: 8px 14px;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
          border: none;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }

        /* Wide cards (Explore) */
        .rw-wide-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .rw-wide-card {
          padding: 28px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .rw-wc-decor {
          position: absolute;
          top: -50px;
          right: -50px;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,223,162,0.1), transparent 70%);
          pointer-events: none;
        }
        .rw-wc-decor.purple { background: radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%); }
        .rw-wc-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }
        .rw-wc-icon.green { background: rgba(0,223,162,0.15); color: #00dfa2; border: 1px solid rgba(0,223,162,0.25); }
        .rw-wc-icon.purple { background: rgba(139,92,246,0.15); color: #8B5CF6; border: 1px solid rgba(139,92,246,0.25); }
        .rw-wc-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #eef2f7;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
          font-family: 'Outfit', sans-serif;
        }
        .rw-wc-desc {
          font-size: 0.88rem;
          color: #8b97a8;
          line-height: 1.65;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }
        .rw-wc-btn {
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          text-decoration: none;
          border: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .rw-wc-btn.green {
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #000;
        }
        .rw-wc-btn.purple {
          background: linear-gradient(135deg, #8B5CF6, #A78BFA);
          color: #fff;
        }
        .rw-wc-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,223,162,0.2); }

        /* FAQ */
        .rw-faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .rw-faq-card {
          padding: 18px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .rw-faq-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.14);
        }
        .rw-faq-card.open { border-color: rgba(0,223,162,0.3); }
        .rw-faq-q {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.92rem;
          font-weight: 700;
          color: #eef2f7;
        }
        .rw-faq-q-icon {
          color: #00dfa2;
          margin-top: 4px;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }
        .rw-faq-card.open .rw-faq-q-icon { transform: rotate(90deg); }
        .rw-faq-a {
          padding-top: 12px;
          margin-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 0.82rem;
          color: #8b97a8;
          line-height: 1.7;
        }

        /* Section heads */
        .rw-section-head {
          margin-top: 56px;
          margin-bottom: 22px;
        }
        .rw-section-head h2 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #eef2f7;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 4px;
        }
        .rw-section-head p { color: #8b97a8; font-size: 0.9rem; margin: 0; }
        .rw-section-head.center { text-align: center; }

        /* Footer */
        .rw-footer {
          background: #07080c;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 24px 0;
          margin-top: 48px;
        }
        .rw-footer-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .rw-footer p { color: #8b97a8; font-size: 0.82rem; margin: 0; }
        .rw-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .rw-footer-link {
          color: #8b97a8;
          text-decoration: none;
          font-size: 0.82rem;
          transition: color 0.2s ease;
        }
        .rw-footer-link:hover { color: #00dfa2; }

        /* Responsive */
        @media (max-width: 1024px) {
          .rw-bal-row { grid-template-columns: repeat(2, 1fr); }
          .rw-task-grid { grid-template-columns: 1fr; }
          .rw-task-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .rw-wide-grid { grid-template-columns: 1fr; }
          .rw-faq-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .rw-nav-links { display: none; }
          .rw-hamburger { display: flex; }
          .rw-layout {
            grid-template-columns: 1fr;
          }
          .rw-sidebar {
            position: sticky;
            top: 60px;
            height: auto;
            flex-direction: row;
            justify-content: center;
            padding: 8px 12px;
            gap: 6px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            z-index: 150;
          }
          .rw-sb-divider {
            width: 1px;
            height: 20px;
            margin: 0 6px;
          }
          .rw-sb-icon:hover .rw-sb-tip { opacity: 0; }
          .rw-main { padding: 24px 18px 48px; }
          .rw-bal-row { grid-template-columns: 1fr 1fr; gap: 10px; }
          .rw-bc-num { font-size: 1.15rem; }
          .rw-task-grid-3 { grid-template-columns: 1fr; }
          .rw-pg-right { align-items: flex-start; }
          .rw-tabs { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
          .rw-tabs::-webkit-scrollbar { display: none; }
        }
        @media (max-width: 600px) {
          .rw-bal-row { grid-template-columns: 1fr; }
          .rw-pw-track { grid-template-columns: repeat(11, 1fr); gap: 2px; }
          .rw-pw-seg { height: 6px; }
          .rw-step-hdr { flex-wrap: wrap; gap: 10px; }
          .rw-step-lock { font-size: 0.68rem; padding: 5px 10px; }
        }
      `}</style>

      {/* ─── TICKER ─── */}
      <div className="rw-ticker-wrap">
        <TickerBar />
      </div>

      {/* ─── NAV ─── */}
      <nav className="rw-nav">
        <div className="rw-nav-inner">
          <Link to="/main/dashboard" className="rw-logo" aria-label={brandName}>
            <div className="rw-logo-icon">1TM</div>
            <div className="rw-logo-text">
              {brandHead ? (
                <>
                  {brandHead} <em>{brandTail}</em>
                </>
              ) : (
                <em>{brandTail}</em>
              )}
            </div>
          </Link>
          <div className="rw-nav-links">
            {NAV_LINKS.map((l) =>
              l.to.startsWith("#") ? (
                <button
                  key={l.label}
                  type="button"
                  className={`rw-nav-link${l.active ? " active" : ""}`}
                  onClick={() => smoothScroll(l.to)}
                >
                  {l.label}
                </button>
              ) : l.external ? (
                <a
                  key={l.label}
                  href={l.to}
                  className={`rw-nav-link${l.active ? " active" : ""}`}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`rw-nav-link${l.active ? " active" : ""}`}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
          <div className="rw-nav-right">
            <Bell className="rw-nav-icon h-5 w-5" aria-label="Notifications" />
            <div className="rw-avatar" aria-label="User initials">
              {initials}
            </div>
            <button
              type="button"
              className="rw-hamburger"
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
              key="rw-mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="rw-mobile-menu">
                {NAV_LINKS.map((l) =>
                  l.to.startsWith("#") ? (
                    <button
                      key={l.label}
                      type="button"
                      className={`rw-nav-link${l.active ? " active" : ""}`}
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
                      className={`rw-nav-link${l.active ? " active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      to={l.to}
                      className={`rw-nav-link${l.active ? " active" : ""}`}
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

      {/* ─── LAYOUT ─── */}
      <div className="rw-layout">
        {/* ─── ICON-ONLY SIDEBAR (Market style) ─── */}
        <aside className="rw-sidebar" aria-label="Rewards navigation">
          <button
            type="button"
            className={`rw-sb-icon${activeTab === "tasks" ? " active" : ""}`}
            onClick={() => setActiveTab("tasks")}
            aria-label="Trader Tasks"
          >
            <ListTodo className="h-[1.05rem] w-[1.05rem]" />
            <span className="rw-sb-tip">Trader Tasks</span>
          </button>
          <button
            type="button"
            className={`rw-sb-icon${activeTab === "earn" ? " active" : ""}`}
            onClick={() => setActiveTab("earn")}
            aria-label="Trade & Earn"
          >
            <TrendingUp className="h-[1.05rem] w-[1.05rem]" />
            <span className="rw-sb-tip">Trade &amp; Earn</span>
          </button>
          <button
            type="button"
            className={`rw-sb-icon${activeTab === "promo" ? " active" : ""}`}
            onClick={() => setActiveTab("promo")}
            aria-label="My Promo"
          >
            <Gift className="h-[1.05rem] w-[1.05rem]" />
            <span className="rw-sb-tip">My Promo</span>
          </button>
          <div className="rw-sb-divider" />
          <Link to="/main/wallet" className="rw-sb-icon" aria-label="Wallet">
            <WalletIcon className="h-[1.05rem] w-[1.05rem]" />
            <span className="rw-sb-tip">Wallet</span>
          </Link>
          <Link to="/main/settings" className="rw-sb-icon" aria-label="Settings">
            <SettingsIcon className="h-[1.05rem] w-[1.05rem]" />
            <span className="rw-sb-tip">Settings</span>
          </Link>
          <Link to="/main/chat" className="rw-sb-icon" aria-label="Support">
            <Headphones className="h-[1.05rem] w-[1.05rem]" />
            <span className="rw-sb-tip">Support</span>
          </Link>
        </aside>

        {/* ─── MAIN ─── */}
        <main className="rw-main">
          {/* Page header */}
          <motion.div {...revealProps} className="rw-pg-head">
            <div>
              <h1>Rewards Center</h1>
              <p>Complete tasks, earn rewards, level up your trading</p>
            </div>
            <div className="rw-pg-right">
              <Link to="#rw-faq" className="rw-pg-link" onClick={(e) => { e.preventDefault(); smoothScroll("#rw-faq"); }}>
                <HelpCircle className="h-3.5 w-3.5" /> How to use rewards?
              </Link>
              <div className="rw-pg-total">$0.00</div>
              <div className="rw-pg-label">Total Earned</div>
            </div>
          </motion.div>

          {/* Balance strip */}
          <motion.div {...revealProps} className="rw-bal-row">
            {BAL_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="rw-glass rw-bal-card">
                  <span className={`rw-bci ${c.tone}`}>
                    <Icon className="h-[1.05rem] w-[1.05rem]" />
                  </span>
                  <div className="rw-bc-lbl">{c.label}</div>
                  <div className="rw-bc-num">{c.value}</div>
                  <div className="rw-bc-sub">{c.sub}</div>
                </div>
              );
            })}
          </motion.div>

          {/* Progress bar */}
          <motion.div {...revealProps} className="rw-glass rw-prog-wrap">
            <div className="rw-pw-label">
              Complete tasks — earn more than $2,000
            </div>
            <div className="rw-pw-track">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className={`rw-pw-seg${i === 0 ? " done" : ""}`} />
              ))}
            </div>
            <div className="rw-pw-info">
              <span className="rw-pw-text">11 tasks unlock higher rewards</span>
              <span className="rw-pw-badge">Tasks completed 0/11</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div {...revealProps} className="rw-tabs" id="rw-tabs">
            <button
              type="button"
              className={`rw-tab${activeTab === "tasks" ? " on" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
              Trader Tasks
            </button>
            <button
              type="button"
              className={`rw-tab${activeTab === "earn" ? " on" : ""}`}
              onClick={() => setActiveTab("earn")}
            >
              Trade &amp; Earn
            </button>
            <button
              type="button"
              className={`rw-tab${activeTab === "promo" ? " on" : ""}`}
              onClick={() => setActiveTab("promo")}
            >
              My Promo
            </button>
          </motion.div>

          {/* TAB 1: TRADER TASKS */}
          {activeTab === "tasks" && (
            <motion.div
              key="tab-tasks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {TASK_STEPS.map((step) => {
                const isOpen = expandedSteps[step.num] === true && !step.locked;
                return (
                  <div key={step.num} className="rw-step-sec">
                    <div
                      className={`rw-step-hdr${step.locked ? " locked" : ""}`}
                      onClick={() => toggleStep(step.num)}
                    >
                      <div className={`rw-step-num${step.locked ? " locked" : ""}`}>
                        {step.num}
                      </div>
                      <div className="rw-step-info">
                        <div className="rw-step-title">{step.title}</div>
                        <div className="rw-step-sub">{step.sub}</div>
                      </div>
                      {step.locked ? (
                        <div className="rw-step-lock">
                          <Lock className="h-3 w-3" /> {step.lockMsg}
                        </div>
                      ) : (
                        <ChevronDown
                          className={`rw-step-chevron h-4 w-4${isOpen ? " open" : ""}`}
                        />
                      )}
                    </div>

                    {/* Step body — locked steps render no cards (matches reference) */}
                    <AnimatePresence initial={false}>
                      {!step.locked && isOpen ? (
                        <motion.div
                          key={`open-${step.num}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="rw-task-grid">
                            {step.cards.map((c, i) => {
                              const Icon = c.icon;
                              const ctaTo =
                                c.cta?.label === "Deposit Now"
                                  ? "/main/wallet?tab=deposit"
                                  : "/trading";
                              return (
                                <div key={i} className="rw-task-card">
                                  <div className={`rw-tc-left-border ${c.tone}`} />
                                  <div className={`rw-tc-decor${c.tone === "amber" ? " amber" : ""}`} />
                                  <div className="rw-tc-header">
                                    <div className={`rw-tc-icon ${c.tone}`}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <div className="rw-tc-title">{c.title}</div>
                                      <div className="rw-tc-desc">{c.desc}</div>
                                    </div>
                                  </div>
                                  <div className="rw-tc-progress">{c.progress}</div>
                                  {c.cta &&
                                    (c.cta.label === "Trade Now" ? (
                                      <a
                                        href={ctaTo}
                                        className={`rw-tc-btn ${c.cta.tone}`}
                                      >
                                        <Icon className="h-4 w-4" />
                                        {c.cta.label}
                                      </a>
                                    ) : (
                                      <Link
                                        to={ctaTo}
                                        className={`rw-tc-btn ${c.cta.tone}`}
                                      >
                                        <Icon className="h-4 w-4" />
                                        {c.cta.label}
                                      </Link>
                                    ))}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* TAB 2: TRADE & EARN */}
          {activeTab === "earn" && (
            <motion.div
              key="tab-earn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="rw-glass rw-cb-card">
                <div className="rw-cb-head">
                  <div className="rw-icon-pill">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3>Earn Cashback on Trades</h3>
                    <p>Get up to 0.5% cashback on every trade based on your volume tier</p>
                  </div>
                </div>
                <table className="rw-cb-table">
                  <thead>
                    <tr>
                      <th>Trading Volume Tier</th>
                      <th>Cashback Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CASHBACK_TIERS.map((t) => (
                      <tr key={t.tier}>
                        <td>{t.tier}</td>
                        <td className={t.highlight ? "highlight" : ""}>{t.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rw-glass rw-tt-card">
                <div className="rw-tt-head">
                  <div className="rw-icon-pill">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3>Top Traders This Week</h3>
                    <p>Leaderboard of highest earners</p>
                  </div>
                </div>
                <div className="rw-tt-list">
                  {TOP_TRADERS.map((t) => (
                    <div
                      key={t.rank}
                      className={`rw-tt-row${t.highlight ? " highlight" : ""}`}
                    >
                      <div className={`rw-tt-rank ${t.tone}`}>{t.rank}</div>
                      <div className="rw-tt-info">
                        <div className="rw-tt-name">{t.name}</div>
                        <div className="rw-tt-vol">Trading volume: {t.volume}</div>
                      </div>
                      <div>
                        <div className={`rw-tt-earn${t.highlight ? "" : " muted"}`}>
                          {t.earned}
                        </div>
                        <div className="rw-tt-lbl">earned</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MY PROMO */}
          {activeTab === "promo" && (
            <motion.div
              key="tab-promo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="rw-glass rw-promo-empty">
                <Inbox className="h-10 w-10" />
                <h3>No Active Promotions</h3>
                <p>Check back soon for exciting promotional offers</p>
                <form
                  className="rw-promo-input-row"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="text"
                    className="rw-promo-input"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    aria-label="Promo code"
                  />
                  <button type="button" className="rw-promo-apply">
                    Apply Code
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Explore More Opportunities */}
          <motion.div {...revealProps} className="rw-section-head">
            <h2>Explore More Opportunities</h2>
          </motion.div>
          <motion.div {...revealProps} className="rw-wide-grid">
            <div className="rw-wide-card">
              <div className="rw-wc-decor" />
              <div className="rw-wc-icon green">
                <Users className="h-6 w-6" />
              </div>
              <div className="rw-wc-title">Invite Friends &amp; Earn</div>
              <div className="rw-wc-desc">
                Share your referral link and earn $50 USD for each friend who
                signs up and completes their first deposit. Build your network
                and watch rewards grow!
              </div>
              <Link to="/main/referral" className="rw-wc-btn green">
                <Share2 className="h-4 w-4" />
                Start Inviting
              </Link>
            </div>
            <div className="rw-wide-card">
              <div className="rw-wc-decor purple" />
              <div className="rw-wc-icon purple">
                <Flame className="h-6 w-6" />
              </div>
              <div className="rw-wc-title">Trading Competitions</div>
              <div className="rw-wc-desc">
                Compete with traders worldwide in monthly trading contests. Win
                up to $10,000 in prizes based on highest volume, fastest growth,
                and most consistent profits!
              </div>
              <Link to="/main/trading-plans" className="rw-wc-btn purple">
                <Trophy className="h-4 w-4" />
                Join Contest
              </Link>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div {...revealProps} className="rw-section-head center" id="rw-faq">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our rewards program</p>
          </motion.div>
          <motion.div {...revealProps} className="rw-faq-grid">
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`rw-faq-card${isOpen ? " open" : ""}`}
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                >
                  <div className="rw-faq-q">
                    <Circle
                      className="rw-faq-q-icon h-2 w-2"
                      fill="currentColor"
                    />
                    <span>{f.q}</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="a"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="rw-faq-a">{f.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </main>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="rw-footer">
        <div className="rw-footer-inner">
          <p>© 2024–2026 {brandName}. All rights reserved.</p>
          <div className="rw-footer-links">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="rw-footer-link">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
