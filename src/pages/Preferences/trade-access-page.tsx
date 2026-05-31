
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Sliders,
  Star,
  ShieldHalf,
  Users,
  CalendarCheck,
  FileText,
  Workflow,
  ChartBar,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  Gem,
  ChartLine,
  UserCheck,
  FileSignature,
  History,
  Headset,
  Bolt,
  Check,
  Copy,
  Circle,
  Globe,
  Vault,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";
import useUserStore from "@/store/userStore";
import useSiteSettingsStore from "@/store/siteSettingStore";
import { TickerBar } from "@/components/dashboard/TickerBar";

// ──────────────────────────────────────────────────────────────
// STATIC REFERENCE DATA (presentational only — no backing store exists)
// ──────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { n: 1, title: "Authenticate", desc: "Verify your identity" },
  { n: 2, title: "Generate Keys", desc: "Create encrypted access keys" },
  { n: 3, title: "Send Request", desc: "Submit to your fund manager" },
  { n: 4, title: "Manager Connects", desc: "Manager links to your account" },
  { n: 5, title: "Monitor Trades", desc: "Track activity in real time" },
];

const STATS = [
  {
    k: "sc1",
    label: "Security Score",
    val: "98.7%",
    sub: "+2.1% from last month",
    subAccent: true,
    fill: 98.7,
    color: "#00dfa2",
    gradient: "linear-gradient(90deg,#00dfa2,#34eaa0)",
    icon: "shield",
  },
  {
    k: "sc2",
    label: "Active Managers",
    val: "1",
    sub: "Connected and verified",
    subAccent: false,
    fill: 25,
    color: "#5b8def",
    gradient: "linear-gradient(90deg,#5b8def,#7da6f5)",
    icon: "users",
  },
  {
    k: "sc3",
    label: "Days Protected",
    val: "47",
    sub: "Zero incidents recorded",
    subAccent: false,
    fill: 65,
    color: "#8b5cf6",
    gradient: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
    icon: "calendar",
  },
  {
    k: "sc4",
    label: "Audit Events",
    val: "1,284",
    sub: "+156 this week",
    subAccent: true,
    fill: 82,
    color: "#f5a623",
    gradient: "linear-gradient(90deg,#f5a623,#fbbf24)",
    icon: "file",
  },
] as const;

const CAN_LIST = [
  "View account balance and portfolio composition",
  "Execute buy and sell orders on your behalf",
  "Place stop losses and take profits",
  "Access account history and trade logs",
  "Manage position sizes within preset limits",
  "Rebalance portfolio as needed",
];

const CANNOT_LIST = [
  "Withdraw or transfer any funds",
  "Change account security settings",
  "Disable 2FA or authentication methods",
  "Access your personal identity data",
  "Create new API keys or credentials",
  "Grant access to third parties",
];

const BENEFITS = [
  {
    k: "bc1",
    icon: "lock",
    title: "Bank Level Security",
    desc: "Military grade encryption protects all credentials and data",
    color: "#00dfa2",
  },
  {
    k: "bc2",
    icon: "chart",
    title: "Real Time Analytics",
    desc: "Track every trade and decision as it happens",
    color: "#5b8def",
  },
  {
    k: "bc3",
    icon: "check",
    title: "Trusted Managers",
    desc: "Verified and rated professional fund traders",
    color: "#8b5cf6",
  },
  {
    k: "bc4",
    icon: "contract",
    title: "Transparent Terms",
    desc: "Clear performance fees and service agreements",
    color: "#f5a623",
  },
  {
    k: "bc5",
    icon: "history",
    title: "Immutable Audit Trail",
    desc: "Every action recorded with tamper proof logging",
    color: "#00dfa2",
  },
  {
    k: "bc6",
    icon: "headset",
    title: "24 Hour Support",
    desc: "Live assistance from our team whenever you need it",
    color: "#5b8def",
  },
] as const;

const ACTIVITY = [
  {
    kind: "live",
    title: "Manager Connected",
    desc: "Sarah Chen (Elite Pro Manager)",
    badge: "Active",
    badgeKind: "active",
    time: "15 days ago",
  },
  {
    kind: "done",
    title: "Access Granted",
    desc: "Credentials shared and verified",
    badge: "Verified",
    badgeKind: "complete",
    time: "15 days ago",
  },
  {
    kind: "done",
    title: "Credentials Rotated",
    desc: "New key pair generated successfully",
    badge: "Complete",
    badgeKind: "complete",
    time: "22 days ago",
  },
  {
    kind: "done",
    title: "Account Verified",
    desc: "KYC verification passed",
    badge: "Passed",
    badgeKind: "complete",
    time: "47 days ago",
  },
] as const;

// Reference (html_files/trade-access.html lines 382–384) has exactly 4 items.
// Wired to existing workspace routes only — no new routes invented:
//   • Trading   → /trading       (TradingRouter → TradingPlatform/Light; App.tsx:222)
//   • Portfolio → /main/wallet   (Wallet page renders "Portfolio Holdings" /
//                                 "Net Portfolio" — the only portfolio-equivalent view)
const NAV_LINKS = [
  { label: "Dashboard", href: "/main/dashboard" },
  { label: "Trading", href: "/trading" as string | null },
  { label: "Portfolio", href: "/main/wallet" as string | null },
  { label: "Trade Access", href: "/main/trade-access" },
];

// ──────────────────────────────────────────────────────────────
// ICON HELPERS (Lucide aliases so the JSX stays flat)
// ──────────────────────────────────────────────────────────────

function StatIconEl({ kind }: { kind: string }) {
  const cls = "h-[0.78rem] w-[0.78rem]";
  if (kind === "shield") return <ShieldHalf className={cls} />;
  if (kind === "users") return <Users className={cls} />;
  if (kind === "calendar") return <CalendarCheck className={cls} />;
  return <FileText className={cls} />;
}

function BenefitIconEl({ kind }: { kind: string }) {
  const cls = "h-[1.05rem] w-[1.05rem]";
  if (kind === "lock") return <Lock className={cls} />;
  if (kind === "chart") return <ChartLine className={cls} />;
  if (kind === "check") return <UserCheck className={cls} />;
  if (kind === "contract") return <FileSignature className={cls} />;
  if (kind === "history") return <History className={cls} />;
  return <Headset className={cls} />;
}

// ──────────────────────────────────────────────────────────────
// PAGE
// ──────────────────────────────────────────────────────────────

export default function TradeAccessPage() {
  const user = useUserStore((state) => state.user);
  const settings = useSiteSettingsStore((state) => state.settings);

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const brandName = settings?.name || "1 Trade Market";
  const tierLabel = user?.account_type?.title || "Elite";

  // Security score — same derivation used by src/components/security/SecurityScoreCard.tsx
  // (account verification = 50 pts, password slot has no backend signal = 0 pts).
  const isVerified = user?.verification_status === "approved";
  const securityScore = isVerified ? 50 : 0;

  // Local UI state — presentational only, no business logic
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [accessKey, setAccessKey] = useState("XXXXXXXXXXXXXXXX");
  const [clock, setClock] = useState("00:00:00");

  // Generate Trade Only Access confirmation modal — local UI only
  const [showGenModal, setShowGenModal] = useState(false);
  const [genChecks, setGenChecks] = useState<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);
  const genAllChecked = genChecks.every(Boolean);
  const toggleGenCheck = (i: number) =>
    setGenChecks((prev) => {
      const next = [...prev] as typeof prev;
      next[i] = !next[i];
      return next;
    });
  const closeGenModal = () => {
    setShowGenModal(false);
    setGenChecks([false, false, false, false]);
  };
  const confirmAndGenerate = () => {
    if (!genAllChecked) return;
    closeGenModal();
    revealKey();
  };

  // Hide MainLayout chrome while this page is mounted (mirrors Trading Plans)
  useEffect(() => {
    document.body.classList.add("ta-active");
    return () => {
      document.body.classList.remove("ta-active");
    };
  }, []);

  // Load reference fonts (Outfit + Inter + JetBrains Mono) — scoped to this page
  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>(
      'link[data-ta-fonts="1"]',
    );
    if (existing) return;
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    preconnect1.dataset.taFonts = "1";
    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    preconnect2.dataset.taFonts = "1";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
    fontLink.dataset.taFonts = "1";
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

  // Simple clock (reference has a live clock in the nav)
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(
        `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Cosmetic reveal (matches reference — purely client-side presentational)
  const revealKey = () => {
    if (keyRevealed) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "CPTINV";
    for (let i = 0; i < 6; i++)
      id += chars[Math.floor(Math.random() * chars.length)];
    id += "2026";
    for (let i = 0; i < 2; i++)
      id += chars[Math.floor(Math.random() * chars.length)];
    setAccessKey(id);
    setKeyRevealed(true);
  };

  return (
    <>
      {/* Page-scoped overrides (hide MainLayout + ticker adjustments + responsive) */}
      <style>{`
        body.ta-active .fixed.top-0.left-0.right-0.z-20,
        body.ta-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.ta-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.ta-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }

        .ta-ticker-wrap > div {
          height: 34px !important;
          background: rgba(7,8,12,0.65) !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
        }
        .ta-ticker-wrap [data-ticker-price],
        .ta-ticker-wrap span:has(+ [data-ticker-price]) {
          font-size: 0.68rem !important;
        }
        .ta-ticker-wrap [data-ticker-price] ~ span {
          font-size: 0.65rem !important;
        }

        @keyframes ta-orbFloat {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(40px,-30px) scale(1.1); }
          66%  { transform: translate(-20px,40px) scale(.95); }
          100% { transform: translate(30px,20px) scale(1.05); }
        }
        @keyframes ta-linePulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes ta-gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ta-gradSlide {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes ta-livePulse {
          0%,100% { opacity: 1; box-shadow: 0 0 8px #00dfa2; }
          50%     { opacity: .35; box-shadow: 0 0 3px #00dfa2; }
        }
        @keyframes ta-shineMove {
          0%   { left: -100%; }
          50%  { left: 100%; }
          100% { left: 100%; }
        }
        @keyframes ta-riseIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ta-navLightSweep {
          0%,100% { left: -80%; opacity: 0; }
          10%     { opacity: 1; }
          50%     { left: 130%; opacity: 1; }
          60%     { left: 130%; opacity: 0; }
        }
        @keyframes ta-rimShift {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes ta-navLogoPulse {
          0%,100% {
            box-shadow:
              0 0 20px rgba(0,223,162,.2),
              0 4px 14px rgba(0,223,162,.25),
              0 2px 4px rgba(0,0,0,.3),
              0 8px 20px rgba(0,0,0,.25),
              inset 0 2px 0 rgba(255,255,255,.4),
              inset 0 -3px 6px rgba(0,0,0,.22),
              inset 2px 0 4px rgba(0,0,0,.06),
              inset -2px 0 4px rgba(0,0,0,.06);
          }
          50% {
            box-shadow:
              0 0 30px rgba(0,223,162,.3),
              0 6px 18px rgba(0,223,162,.3),
              0 2px 4px rgba(0,0,0,.3),
              0 10px 24px rgba(0,0,0,.28),
              inset 0 2px 0 rgba(255,255,255,.45),
              inset 0 -3px 6px rgba(0,0,0,.22),
              inset 2px 0 4px rgba(0,0,0,.06),
              inset -2px 0 4px rgba(0,0,0,.06);
          }
        }
        .ta-logo-box { animation: ta-navLogoPulse 3s ease-in-out infinite; }
        .ta-logo-sweep {
          content: ''; position: absolute; top: -50%; left: -80%;
          width: 60%; height: 200%;
          background: linear-gradient(105deg,transparent 30%,rgba(255,255,255,.15) 45%,rgba(255,255,255,.22) 50%,rgba(255,255,255,.15) 55%,transparent 70%);
          transform: rotate(25deg);
          pointer-events: none; z-index: 4;
          animation: ta-navLightSweep 4s ease-in-out 1s infinite;
        }
        .ta-logo-gloss {
          position: absolute; top: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(175deg,rgba(255,255,255,.32) 0%,rgba(255,255,255,.08) 40%,transparent 100%);
          pointer-events: none;
          border-radius: 8px 8px 50% 50%;
          z-index: 3;
        }
        .ta-logo-rim {
          position: absolute; top: -1px; left: -1px; right: -1px; bottom: -1px;
          border-radius: 9px;
          border: 1px solid transparent;
          background: linear-gradient(145deg,rgba(255,255,255,.25),rgba(0,223,162,.3),rgba(91,141,239,.2),rgba(139,92,246,.2),rgba(0,223,162,.15)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 5;
          animation: ta-rimShift 5s linear infinite;
        }
        .ta-logo-depth-b { position: absolute; bottom: -3px; left: 2px; right: 2px; height: 4px; background: linear-gradient(180deg,#008a62,#006b4d); border-radius: 0 0 6px 6px; filter: blur(.3px); z-index: -1; }
        .ta-logo-depth-l { position: absolute; top: 2px; bottom: 2px; left: -2px; width: 3px; background: linear-gradient(90deg,#007a58,#009e72); border-radius: 6px 0 0 6px; filter: blur(.3px); z-index: -1; }
        .ta-logo-depth-r { position: absolute; top: 2px; bottom: 2px; right: -2px; width: 2px; background: linear-gradient(270deg,#006b4d,#008a62); border-radius: 0 6px 6px 0; filter: blur(.3px); z-index: -1; }

        .ta-orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(80px); animation: ta-orbFloat 20s ease-in-out infinite alternate; }
        .ta-rise { animation: ta-riseIn .7s cubic-bezier(.22,1,.36,1) both; }
        .ta-d1{animation-delay:.05s}.ta-d2{animation-delay:.12s}.ta-d3{animation-delay:.18s}
        .ta-d4{animation-delay:.25s}.ta-d5{animation-delay:.32s}.ta-d6{animation-delay:.4s}
        .ta-d7{animation-delay:.48s}.ta-d8{animation-delay:.56s}

        .ta-top-line { height: 2px; background: linear-gradient(90deg,transparent,#00dfa2 25%,#5b8def 50%,#8b5cf6 75%,transparent); opacity: .4; animation: ta-linePulse 4s ease-in-out infinite; }

        .ta-title-grad {
          background: linear-gradient(135deg,#00dfa2,#34eaa0,#22d3ee);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          background-size: 200% auto; animation: ta-gradShift 3s ease-in-out infinite;
        }

        .ta-pill-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: linear-gradient(145deg,#00ffc3,#00dfa2);
          box-shadow: 0 0 10px #00dfa2, inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 2px rgba(0,0,0,.3);
          animation: ta-livePulse 2s ease-in-out infinite;
        }

        .ta-cred-top {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg,#00dfa2,#5b8def,#8b5cf6,#00dfa2);
          background-size: 300% 100%; animation: ta-gradSlide 4s linear infinite; z-index: 3;
        }

        .ta-shine {
          position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg,transparent,rgba(0,223,162,.06),transparent);
          animation: ta-shineMove 3s ease-in-out infinite; pointer-events: none;
        }

        .ta-step-num {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(145deg,#00ffc3,#00dfa2,#00b881);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-weight: 800; font-size: .85rem; color: #000;
          box-shadow: 0 6px 20px rgba(0,223,162,.25), 0 2px 6px rgba(0,0,0,.3),
                      inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 6px rgba(0,0,0,.2);
          position: relative; z-index: 1;
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
          text-shadow: 0 1px 0 rgba(255,255,255,.25);
        }
        .ta-hiw-step:hover .ta-step-num {
          transform: scale(1.18) rotate(-6deg) translateY(-3px);
          box-shadow: 0 10px 32px rgba(0,223,162,.5), 0 4px 8px rgba(0,0,0,.3),
                      inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 6px rgba(0,0,0,.2);
        }
        .ta-hiw-step:not(:last-child)::after {
          content: ''; position: absolute; top: 18px;
          left: calc(50% + 22px); right: calc(-50% + 22px); height: 2px;
          background: linear-gradient(90deg, rgba(0,223,162,.45), rgba(91,141,239,.25)); z-index: 0;
        }

        .ta-stat-card { transition: all .3s cubic-bezier(.22,1,.36,1); }
        .ta-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,.3); border-color: rgba(255,255,255,.12); }
        .ta-stat-top-sc1::before{background:linear-gradient(90deg,transparent,#00dfa2,transparent)!important}
        .ta-stat-top-sc2::before{background:linear-gradient(90deg,transparent,#5b8def,transparent)!important}
        .ta-stat-top-sc3::before{background:linear-gradient(90deg,transparent,#8b5cf6,transparent)!important}
        .ta-stat-top-sc4::before{background:linear-gradient(90deg,transparent,#f5a623,transparent)!important}
        .ta-stat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity .3s;
        }
        .ta-stat-card:hover::before { opacity: 1; }

        .ta-ben-card { transition: all .35s cubic-bezier(.22,1,.36,1); }
        .ta-ben-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,.3); border-color: rgba(255,255,255,.14); }
        .ta-ben-card:hover .ta-ben-icon { transform: scale(1.18) rotate(-5deg) translateY(-3px); }
        .ta-ben-icon { transition: all .3s cubic-bezier(.22,1,.36,1); }

        .ta-perms-card { transition: all .3s cubic-bezier(.22,1,.36,1); }
        .ta-perms-card:hover { transform: translateY(-4px); box-shadow: 0 16px 44px rgba(0,0,0,.3); }

        .ta-p-item { transition: all .2s; }
        .ta-p-item:hover { color: #eef2f7; transform: translateX(4px); }

        @media (max-width: 1024px) {
          .ta-perms-grid { grid-template-columns: 1fr !important; }
          .ta-benefits-grid { grid-template-columns: repeat(2,1fr) !important; }
          .ta-stats-bar { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 768px) {
          .ta-nav { padding-left: 1rem !important; padding-right: 1rem !important; }
          .ta-container { padding-left: 1rem !important; padding-right: 1rem !important; }
          .ta-clock { display: none !important; }
          .ta-hiw-steps { flex-direction: column !important; gap: 1.25rem !important; }
          .ta-hiw-step:not(:last-child)::after { display: none !important; }
          .ta-pg-head-row { flex-direction: column !important; gap: 1rem !important; }
          .ta-status-pills { justify-content: flex-start !important; }
          .ta-benefits-grid, .ta-stats-bar { grid-template-columns: 1fr !important; }
          .ta-cred-footer { flex-direction: column !important; gap: 1rem !important; align-items: flex-start !important; }
          .ta-ft-top { grid-template-columns: 1fr !important; gap: 32px !important; }
          .ta-ft-links { grid-template-columns: repeat(2,1fr) !important; }
          .ta-site-footer { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (max-width: 500px) {
          .ta-nav-links, .ta-user-info { display: none !important; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col overflow-y-auto font-[Inter,system-ui,sans-serif]"
        style={{ background: "#07080c", color: "#eef2f7" }}
      >
        {/* Atmospheric orbs */}
        <div
          className="ta-orb"
          style={{
            width: 400,
            height: 400,
            background: "rgba(0,223,162,.06)",
            top: -100,
            left: -100,
            animationDuration: "25s",
          }}
        />
        <div
          className="ta-orb"
          style={{
            width: 300,
            height: 300,
            background: "rgba(91,141,239,.05)",
            bottom: "10%",
            right: -80,
            animationDuration: "20s",
            animationDelay: "-5s",
          }}
        />
        <div
          className="ta-orb"
          style={{
            width: 250,
            height: 250,
            background: "rgba(139,92,246,.04)",
            top: "50%",
            left: "30%",
            animationDuration: "22s",
            animationDelay: "-10s",
          }}
        />

        {/* TICKER */}
        <div className="ta-ticker-wrap relative z-[299]">
          <TickerBar />
        </div>

        {/* NAV */}
        <nav
          className="ta-nav sticky top-0 z-[300] flex h-14 items-center justify-between px-8 py-6"
          style={{
            background: "rgba(7,8,12,0.55)",
            backdropFilter: "blur(32px) saturate(1.3)",
            WebkitBackdropFilter: "blur(32px) saturate(1.3)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.35)",
          }}
        >
          {/* Brand */}
          <Link to="/main/dashboard" className="flex flex-shrink-0 items-center gap-2.5">
            <div
              className="ta-logo-box relative flex h-[34px] w-[34px] flex-shrink-0 items-baseline justify-center overflow-hidden rounded-lg pt-1"
              style={{
                background:
                  "linear-gradient(145deg,#00ffc3 0%,#00e8aa 25%,#00dfa2 50%,#00c78a 75%,#00b881 100%)",
              }}
            >
              {/* 3D decorations to match reference (lines 90–101) */}
              <span className="ta-logo-rim" />
              <span className="ta-logo-depth-b" />
              <span className="ta-logo-depth-l" />
              <span className="ta-logo-depth-r" />
              <span className="ta-logo-gloss" />
              <span className="ta-logo-sweep" />
              <span
                className="relative z-[2] font-[Outfit,sans-serif] text-[0.95rem] font-black leading-none text-black"
                style={{
                  textShadow:
                    "0 1px 0 rgba(255,255,255,.35), 0 2px 0 rgba(255,255,255,.12)",
                }}
              >
                1
              </span>
              <span
                className="relative z-[2] ml-[0.5px] mt-[1px] self-start font-[Outfit,sans-serif] text-[0.48rem] font-extrabold leading-none"
                style={{
                  color: "rgba(0,0,0,0.65)",
                  letterSpacing: "-0.02em",
                  textShadow: "0 1px 0 rgba(255,255,255,.18)",
                }}
              >
                TM
              </span>
            </div>
            <div className="whitespace-nowrap font-[Outfit,sans-serif] text-[0.95rem] font-bold tracking-[-0.02em]">
              {(() => {
                const parts = brandName.split(" ").filter(Boolean);
                if (parts.length <= 1) {
                  return (
                    <em className="not-italic text-[#00dfa2]">{brandName}</em>
                  );
                }
                const lead = parts.slice(0, -1).join(" ");
                const tail = parts.slice(-1)[0];
                return (
                  <>
                    {lead}{" "}
                    <em className="not-italic text-[#00dfa2]">{tail}</em>
                  </>
                );
              })()}
            </div>
          </Link>

          {/* Links */}
          <div className="ta-nav-links flex flex-shrink-0 gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/main/trade-access";
              const className = `relative cursor-pointer whitespace-nowrap rounded-lg px-[14px] py-[7px] text-[0.82rem] font-medium transition-all duration-200 ${
                isActive
                  ? "text-[#00dfa2]"
                  : "text-[#4a5468] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#eef2f7]"
              }`;
              const content = (
                <>
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-[2px]"
                      style={{
                        background: "#00dfa2",
                        boxShadow: "0 0 8px rgba(0,223,162,0.25)",
                      }}
                    />
                  )}
                </>
              );
              if (link.href) {
                return (
                  <Link key={link.label} to={link.href} className={className}>
                    {content}
                  </Link>
                );
              }
              return (
                <span
                  key={link.label}
                  className={className}
                  role="link"
                  aria-disabled="true"
                >
                  {content}
                </span>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <div
              className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] text-[0.82rem] text-[#4a5468] transition-all duration-200 hover:text-[#eef2f7]"
              style={{
                background:
                  "linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 2px 6px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.1),inset 0 -1px 3px rgba(0,0,0,.15)",
              }}
              title="Notifications"
            >
              <Bell className="h-[0.82rem] w-[0.82rem]" />
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[0.58rem] font-extrabold text-white"
                style={{ background: "#f43f5e" }}
              >
                3
              </span>
            </div>
            <div
              className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] text-[0.82rem] text-[#4a5468] transition-all duration-200 hover:text-[#eef2f7]"
              style={{
                background:
                  "linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 2px 6px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.1),inset 0 -1px 3px rgba(0,0,0,.15)",
              }}
              title="Settings"
            >
              <Sliders className="h-[0.82rem] w-[0.82rem]" />
            </div>
            <div
              className="ta-clock px-2 font-[JetBrains_Mono,monospace] text-[0.76rem] text-[#4a5468]"
            >
              {clock}
            </div>
            <div
              className="flex items-center gap-2 border-l pl-2.5"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[0.78rem] font-extrabold text-white"
                style={{
                  background:
                    "linear-gradient(145deg,#7da6f5,#5b8def,#8b5cf6)",
                  boxShadow:
                    "0 4px 14px rgba(91,141,239,.3),0 2px 4px rgba(0,0,0,.3),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -2px 4px rgba(0,0,0,.2)",
                  textShadow: "0 1px 2px rgba(0,0,0,.3)",
                }}
                title={fullName || "User"}
              >
                {initials}
              </div>
              <div className="ta-user-info flex flex-col">
                <div className="text-[0.78rem] font-semibold text-[#eef2f7]">
                  {fullName || "Account"}
                </div>
                <div className="flex items-center gap-1 text-[0.64rem] font-bold text-[#f5a623]">
                  <Star className="h-[0.6rem] w-[0.6rem] fill-current" />
                  {tierLabel}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="relative z-[2]">
          <div className="ta-top-line" />
          <div className="ta-container relative z-[2] mx-auto max-w-[1400px] px-8">
            {/* PAGE HEADER */}
            <div className="ta-rise ta-d1 relative pt-8">
              <div className="ta-pg-head-row flex items-start justify-between gap-8">
                <div>
                  <h1 className="mb-1.5 font-[Outfit,sans-serif] text-[1.75rem] font-extrabold leading-[1.2] tracking-[-0.04em] text-[#eef2f7]">
                    Trade Only <span className="ta-title-grad">Access Control</span>
                  </h1>
                  <p className="max-w-[640px] text-[0.84rem] leading-[1.65] text-[#8b97a8]">
                    Securely connect with professional fund managers who trade on your behalf. Full custody of your funds remains with you at all times.
                  </p>
                </div>
                <div className="ta-status-pills flex flex-shrink-0 flex-wrap justify-end gap-2">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-[20px] px-[14px] py-1.5 text-[0.66rem] font-semibold text-[#4a5468]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span className="ta-pill-dot" />
                    System Operational
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-[20px] px-[14px] py-1.5 text-[0.66rem] font-semibold text-[#5b8def]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(91,141,239,0.15)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <ShieldHalf className="h-[0.58rem] w-[0.58rem]" />
                    AES 256 Active
                  </div>
                </div>
              </div>
            </div>

            {/* HOW IT WORKS */}
            <SectionDivider
              label="How It Works"
              icon={<Workflow className="h-[0.72rem] w-[0.72rem]" />}
              count="5 Steps"
              className="ta-rise ta-d2"
            />
            <div
              className="ta-rise ta-d3 relative overflow-hidden rounded-[14px] px-7 py-6"
              style={{
                background: "rgba(13,15,21,0.48)",
                backdropFilter: "blur(28px) saturate(1.3)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)",
              }}
            >
              <div
                className="absolute left-0 right-0 top-0 h-[1px] opacity-35"
                style={{
                  background:
                    "linear-gradient(90deg,transparent 5%,#00dfa2,#5b8def,transparent 95%)",
                }}
              />
              <div className="ta-hiw-steps flex items-start justify-between gap-0">
                {HOW_IT_WORKS.map((s) => (
                  <div
                    key={s.n}
                    className="ta-hiw-step relative flex flex-1 flex-col items-center px-2 text-center"
                  >
                    <div className="ta-step-num mb-2">{s.n}</div>
                    <div className="mb-0.5 font-[Outfit,sans-serif] text-[0.74rem] font-bold text-[#eef2f7]">
                      {s.title}
                    </div>
                    <div className="text-[0.66rem] leading-[1.4] text-[#2a3040]">
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACCOUNT METRICS */}
            <SectionDivider
              label="Account Metrics"
              icon={<ChartBar className="h-[0.72rem] w-[0.72rem]" />}
              className="ta-rise ta-d4"
            />
            <div className="ta-rise ta-d5 ta-stats-bar grid grid-cols-4 gap-3">
              {STATS.map((s) => {
                // Security Score is wired to the real verification signal;
                // the other three have no workspace source and stay presentational.
                const val = s.k === "sc1" ? `${securityScore}%` : s.val;
                const sub =
                  s.k === "sc1"
                    ? isVerified
                      ? "Account verified"
                      : "Complete KYC verification"
                    : s.sub;
                const subAccent = s.k === "sc1" ? false : s.subAccent;
                const fill = s.k === "sc1" ? securityScore : s.fill;
                return (
                  <div
                    key={s.k}
                    className={`ta-stat-card ta-stat-top-${s.k} relative overflow-hidden rounded-xl px-[1.15rem] py-4`}
                    style={{
                      background: "rgba(13,15,21,0.45)",
                      backdropFilter: "blur(24px) saturate(1.2)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[#4a5468]">
                        {s.label}
                      </span>
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                        style={{
                          background: `linear-gradient(145deg,${s.color}33,${s.color}10)`,
                          color: s.color,
                          border: `1px solid ${s.color}30`,
                          boxShadow: `0 4px 12px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.2)`,
                        }}
                      >
                        <StatIconEl kind={s.icon} />
                      </div>
                    </div>
                    <div
                      className="mt-2 font-[Outfit,sans-serif] text-[1.4rem] font-extrabold leading-[1.2] tracking-[-0.03em]"
                      style={{ color: s.color }}
                    >
                      {val}
                    </div>
                    <div className="mt-[3px] flex items-center gap-1 text-[0.6rem] text-[#2a3040]">
                      {subAccent ? (
                        <span className="font-bold text-[#00dfa2]">{sub.split(" ")[0]}</span>
                      ) : null}
                      {subAccent ? sub.replace(sub.split(" ")[0], "").trim() : sub}
                    </div>
                    <div
                      className="mt-2 h-[3px] overflow-hidden rounded-[2px]"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <div
                        className="h-full rounded-[2px] transition-[width] duration-[1500ms] ease-out"
                        style={{ width: `${fill}%`, background: s.gradient }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECURITY AND ACCESS */}
            <SectionDivider
              label="Security and Access"
              icon={<Key className="h-[0.72rem] w-[0.72rem]" />}
              className="ta-rise ta-d6"
            />
            <div className="relative">
              <div
                className="ta-rise ta-d7 relative overflow-hidden rounded-[16px]"
                style={{
                  background: "rgba(13,15,21,0.48)",
                  backdropFilter: "blur(28px) saturate(1.3)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)",
                }}
              >
                <div className="ta-cred-top" />
                <div className="relative z-[1] p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-[Outfit,sans-serif] text-[0.92rem] font-bold text-[#eef2f7]">
                      <Key className="h-[0.8rem] w-[0.8rem] text-[#00dfa2]" />
                      Your Security Credentials
                    </div>
                    <div
                      className="inline-flex items-center gap-1.5 rounded px-2.5 py-[3px] text-[0.56rem] font-extrabold tracking-[0.1em] text-[#00dfa2]"
                      style={{
                        background: "rgba(0,223,162,0.06)",
                        border: "1px solid rgba(0,223,162,0.12)",
                      }}
                    >
                      <span
                        className="h-[5px] w-[5px] rounded-full"
                        style={{
                          background: "#00dfa2",
                          boxShadow: "0 0 6px #00dfa2",
                          animation: "ta-livePulse 2s ease-in-out infinite",
                        }}
                      />
                      ENCRYPTED
                    </div>
                  </div>
                  <div className="mb-5 flex flex-col gap-5">
                    <div className="relative">
                      <label className="mb-1.5 flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-[#4a5468]">
                        Trade Only Access API Key
                        <span
                          className="ml-1.5 rounded-[3px] px-1.5 py-[2px] text-[0.58rem] font-bold text-[#f43f5e]"
                          style={{ background: "rgba(244,63,94,0.1)" }}
                        >
                          CONFIDENTIAL
                        </span>
                      </label>
                      <div className="relative">
                        <div
                          className="relative flex items-center justify-between gap-2 overflow-hidden rounded-lg px-3 py-2.5 font-[JetBrains_Mono,monospace] text-[0.78rem] font-semibold text-[#00dfa2] transition-[border-color,box-shadow] duration-200"
                          style={{
                            background: "rgba(16,19,26,0.55)",
                            border: "1.5px solid rgba(0,223,162,0.12)",
                            letterSpacing: "0.03em",
                            filter: keyRevealed ? "none" : "blur(6px)",
                            pointerEvents: keyRevealed ? "auto" : "none",
                            userSelect: keyRevealed ? "auto" : "none",
                          }}
                        >
                          <span className="ta-shine" />
                          <span>{accessKey}</span>
                          <button
                            type="button"
                            className="flex-shrink-0 cursor-pointer rounded-[5px] px-[11px] py-[5px] text-[0.64rem] font-bold text-[#00dfa2] transition-all duration-200"
                            style={{
                              background: "rgba(0,223,162,0.1)",
                              border: "1px solid rgba(0,223,162,0.2)",
                            }}
                          >
                            <Copy className="mr-1 inline h-[0.7rem] w-[0.7rem]" />
                            Copy
                          </button>
                        </div>
                        {!keyRevealed && (
                          <div className="absolute inset-0 z-[2] flex items-center justify-center gap-2 text-[0.76rem] font-semibold text-[#4a5468]">
                            <Lock className="h-[0.8rem] w-[0.8rem] text-[#2a3040]" />
                            Generate to reveal API key
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="ta-cred-footer flex items-center justify-between border-t pt-4"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="inline-flex items-center gap-1.5 rounded-lg px-[14px] py-1.5 text-[0.63rem] font-bold text-[#00dfa2]"
                      style={{
                        background:
                          "linear-gradient(145deg,rgba(0,223,162,0.12),rgba(0,223,162,0.03))",
                        border: "1px solid rgba(0,223,162,0.15)",
                        boxShadow:
                          "0 2px 8px rgba(0,223,162,0.1), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 3px rgba(0,0,0,0.12)",
                      }}
                    >
                      <ShieldHalf className="h-[0.7rem] w-[0.7rem]" />
                      AES 256 Encrypted
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGenModal(true)}
                      className="inline-flex cursor-pointer items-center gap-[7px] overflow-hidden rounded-lg px-[18px] py-2 font-[Outfit,sans-serif] text-[0.74rem] font-extrabold text-black transition-transform duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg,#00dfa2,#00c990,#00b881)",
                        boxShadow: "0 3px 14px rgba(0,223,162,0.25)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      <Bolt className="h-[0.8rem] w-[0.8rem]" />
                      Generate Trade Access
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PERMISSIONS */}
            <SectionDivider
              label="Access Permissions"
              icon={<Lock className="h-[0.72rem] w-[0.72rem]" />}
              count="2 Tiers"
            />
            <div className="ta-perms-grid grid grid-cols-2 gap-6">
              <div
                className="ta-perms-card relative overflow-hidden rounded-[18px] p-7"
                style={{
                  background: "rgba(0,223,162,0.025)",
                  backdropFilter: "blur(24px) saturate(1.2)",
                  border: "1px solid rgba(0,223,162,0.12)",
                }}
              >
                <div
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-50"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,#00dfa2,transparent)",
                  }}
                />
                <div className="relative z-[1] mb-4 flex items-center gap-2 font-[Outfit,sans-serif] text-[0.9rem] font-bold text-[#eef2f7]">
                  <CheckCircle className="h-[0.9rem] w-[0.9rem] text-[#00dfa2]" />
                  Managers Can
                </div>
                {CAN_LIST.map((item, i) => (
                  <div
                    key={i}
                    className="ta-p-item relative z-[1] mb-[9px] flex items-start gap-2 py-0.5 text-[0.74rem] leading-[1.5] text-[#8b97a8]"
                  >
                    <Circle className="mt-1 h-[0.45rem] w-[0.45rem] flex-shrink-0 fill-current text-[rgba(0,223,162,0.45)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div
                className="ta-perms-card relative overflow-hidden rounded-[18px] p-7"
                style={{
                  background: "rgba(244,63,94,0.025)",
                  backdropFilter: "blur(24px) saturate(1.2)",
                  border: "1px solid rgba(244,63,94,0.12)",
                }}
              >
                <div
                  className="absolute left-0 right-0 top-0 h-[2px] opacity-50"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,#f43f5e,transparent)",
                  }}
                />
                <div className="relative z-[1] mb-4 flex items-center gap-2 font-[Outfit,sans-serif] text-[0.9rem] font-bold text-[#eef2f7]">
                  <XCircle className="h-[0.9rem] w-[0.9rem] text-[#f43f5e]" />
                  Managers Cannot
                </div>
                {CANNOT_LIST.map((item, i) => (
                  <div
                    key={i}
                    className="ta-p-item relative z-[1] mb-[9px] flex items-start gap-2 py-0.5 text-[0.74rem] leading-[1.5] text-[#8b97a8]"
                  >
                    <Circle className="mt-1 h-[0.45rem] w-[0.45rem] flex-shrink-0 fill-current text-[rgba(244,63,94,0.45)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BENEFITS */}
            <SectionDivider
              label="Why Choose Managed Trading"
              icon={<Gem className="h-[0.72rem] w-[0.72rem]" />}
              count="6 Benefits"
            />
            <div className="ta-benefits-grid grid grid-cols-3 gap-[14px]">
              {BENEFITS.map((b) => (
                <div
                  key={b.k}
                  className="ta-ben-card relative flex flex-col items-start overflow-hidden rounded-xl px-[1.4rem] py-[1.2rem]"
                  style={{
                    background: "rgba(13,15,21,0.48)",
                    backdropFilter: "blur(28px) saturate(1.3)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow:
                      "0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    className="ta-ben-icon relative z-[1] mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(145deg,${b.color}40,${b.color}10)`,
                      color: b.color,
                      border: `1px solid ${b.color}30`,
                      boxShadow: `0 6px 16px ${b.color}2f, inset 0 1.5px 0 rgba(255,255,255,.18), inset 0 -3px 6px rgba(0,0,0,.2)`,
                    }}
                  >
                    <BenefitIconEl kind={b.icon} />
                  </div>
                  <div className="relative z-[1] mb-1 font-[Outfit,sans-serif] text-[0.8rem] font-bold text-[#eef2f7]">
                    {b.title}
                  </div>
                  <div className="relative z-[1] text-[0.68rem] leading-[1.45] text-[#2a3040]">
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE ACTIVITY */}
            <SectionDivider
              label="Live Activity"
              icon={<Bolt className="h-[0.72rem] w-[0.72rem]" />}
              count={`${ACTIVITY.length} Events`}
            />
            <div className="flex flex-col gap-2">
              {ACTIVITY.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 overflow-hidden rounded-[10px] px-4 py-3 transition-all duration-200 hover:border-[rgba(0,223,162,0.12)]"
                  style={{
                    background: "rgba(7,8,12,0.58)",
                    backdropFilter: "blur(32px) saturate(1.25)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    boxShadow:
                      "0 12px 40px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.03)",
                  }}
                >
                  <span
                    className="relative z-[1] h-[10px] w-[10px] flex-shrink-0 rounded-full"
                    style={
                      f.kind === "live"
                        ? {
                            background:
                              "linear-gradient(145deg,#00ffc3,#00dfa2)",
                            boxShadow:
                              "0 0 10px #00dfa2, inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 2px rgba(0,0,0,.3)",
                            animation: "ta-livePulse 2s ease-in-out infinite",
                          }
                        : {
                            background:
                              "linear-gradient(145deg,#7da6f5,#5b8def)",
                            boxShadow:
                              "0 0 8px #5b8def, inset 0 1px 0 rgba(255,255,255,.35), inset 0 -1px 2px rgba(0,0,0,.3)",
                          }
                    }
                  />
                  <div className="relative z-[1] flex-1">
                    <div className="mb-0.5 text-[0.76rem] font-bold text-[#eef2f7]">
                      {f.title}
                    </div>
                    <div className="text-[0.68rem] text-[#4a5468]">
                      {f.desc}
                    </div>
                  </div>
                  <div
                    className="relative z-[1] inline-flex items-center gap-1 whitespace-nowrap rounded-[5px] px-2.5 py-1 text-[0.58rem] font-bold"
                    style={
                      f.badgeKind === "active"
                        ? {
                            color: "#00dfa2",
                            background: "rgba(0,223,162,0.06)",
                            border: "1px solid rgba(0,223,162,0.1)",
                          }
                        : {
                            color: "#5b8def",
                            background: "rgba(91,141,239,0.06)",
                            border: "1px solid rgba(91,141,239,0.1)",
                          }
                    }
                  >
                    {f.badgeKind === "active" ? (
                      <CheckCircle className="h-[0.6rem] w-[0.6rem]" />
                    ) : (
                      <Check className="h-[0.6rem] w-[0.6rem]" />
                    )}
                    {f.badge}
                  </div>
                  <div className="relative z-[1] whitespace-nowrap font-[JetBrains_Mono,monospace] text-[0.64rem] text-[#2a3040]">
                    {f.time}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-12" />
          </div>

          {/* FOOTER */}
          <footer
            className="ta-site-footer relative z-[1] px-10 pt-12"
            style={{
              background: "rgba(7,8,12,0.55)",
              backdropFilter: "blur(24px) saturate(1.2)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-[1px] opacity-25"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#00dfa2,#5b8def,transparent)",
              }}
            />
            <div
              className="ta-ft-top grid gap-[60px] border-b pb-9"
              style={{
                gridTemplateColumns: "280px 1fr",
                borderColor: "rgba(255,255,255,0.04)",
              }}
            >
              <div>
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div
                    className="relative flex h-7 w-7 items-baseline justify-center overflow-hidden rounded-md pt-[3px]"
                    style={{
                      background:
                        "linear-gradient(145deg,#00ffc3 0%,#00e8aa 25%,#00dfa2 50%,#00c78a 75%,#00b881 100%)",
                      boxShadow:
                        "inset 0 2px 0 rgba(255,255,255,.4),inset 0 -3px 6px rgba(0,0,0,.22)",
                    }}
                  >
                    <span className="font-[Outfit,sans-serif] text-[0.78rem] font-black leading-none text-black">
                      1
                    </span>
                    <span
                      className="ml-[0.5px] self-start font-[Outfit,sans-serif] text-[0.38rem] font-extrabold leading-none"
                      style={{ color: "rgba(0,0,0,0.65)" }}
                    >
                      TM
                    </span>
                  </div>
                  <div className="font-[Outfit,sans-serif] text-[0.9rem] font-bold">
                    {brandName.split(" ")[0] || "1"}{" "}
                    {brandName.split(" ").slice(1, -1).join(" ") || "Trade"}{" "}
                    <em className="not-italic text-[#00dfa2]">
                      {brandName.split(" ").slice(-1)[0] || "Market"}
                    </em>
                  </div>
                </div>
                <p className="mb-4 text-[0.73rem] leading-[1.75] text-[#2a3040]">
                  The next generation cryptocurrency and precious metals trading platform. Secure, fast, and built for serious traders worldwide.
                </p>
              </div>
              <div className="ta-ft-links grid grid-cols-4 gap-6">
                <FooterCol
                  title="Products"
                  items={[
                    "Spot Trading",
                    "Futures",
                    "Margin Trading",
                    "Staking and Earn",
                    "OTC Desk",
                    "Launchpad",
                  ]}
                />
                <FooterCol
                  title="Services"
                  items={[
                    "Buy Crypto",
                    "P2P Trading",
                    "Convert",
                    "Gold Market",
                    "Institutional",
                    "VIP Program",
                  ]}
                />
                <FooterCol
                  title="Support"
                  items={[
                    "Help Center",
                    "API Documentation",
                    "Fee Schedule",
                    "System Status",
                    "Submit a Request",
                    "Bug Bounty",
                  ]}
                />
                <FooterCol
                  title="Company"
                  items={[
                    "About Us",
                    "Careers",
                    "Blog",
                    "Press and Media",
                    "Community",
                    "Affiliate Program",
                  ]}
                />
              </div>
            </div>
            <div
              className="flex flex-wrap items-center justify-center gap-2.5 border-b py-6"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <FooterBadge icon={<ShieldHalf className="h-[0.6rem] w-[0.6rem] text-[#00dfa2]" />}>
                SOC 2 Type II
              </FooterBadge>
              <FooterBadge icon={<Lock className="h-[0.6rem] w-[0.6rem] text-[#00dfa2]" />}>
                256 bit SSL
              </FooterBadge>
              <FooterBadge icon={<Fingerprint className="h-[0.6rem] w-[0.6rem] text-[#00dfa2]" />}>
                KYC and AML Compliant
              </FooterBadge>
              <FooterBadge icon={<Globe className="h-[0.6rem] w-[0.6rem] text-[#5b8def]" />}>
                VASP Licensed
              </FooterBadge>
              <FooterBadge icon={<Vault className="h-[0.6rem] w-[0.6rem] text-[#f5a623]" />}>
                Cold Storage
              </FooterBadge>
              <FooterBadge icon={<ShieldCheck className="h-[0.6rem] w-[0.6rem] text-[#8b5cf6]" />}>
                2FA Protected
              </FooterBadge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-5">
              <div className="text-[0.67rem] text-[#2a3040]">
                © {new Date().getFullYear()} {brandName}. All rights reserved.
              </div>
              <div className="flex gap-[18px]">
                {[
                  "Terms of Service",
                  "Privacy Policy",
                  "Cookie Policy",
                  "AML Policy",
                  "Risk Disclosure",
                ].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[0.67rem] text-[#2a3040] transition-colors duration-150 hover:text-[#00dfa2]"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* ─── Generate Trade Only Access — confirmation modal ─── */}
      {showGenModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ta-gen-modal-title"
          onClick={closeGenModal}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[540px] max-h-[90vh] flex-col overflow-y-auto rounded-[20px]"
            style={{
              background: "rgba(16,19,26,0.94)",
              backdropFilter: "blur(40px) saturate(1.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center gap-3 rounded-t-[20px] px-8 py-7"
              style={{
                background: "linear-gradient(135deg,#00dfa2,#00b881)",
                color: "#000",
              }}
            >
              <ShieldHalf className="h-[1.4rem] w-[1.4rem]" />
              <h2
                id="ta-gen-modal-title"
                className="m-0 font-[Outfit,sans-serif] text-[1.05rem] font-bold"
              >
                Generate Trade Only Access
              </h2>
            </div>

            {/* Modal body */}
            <div className="px-8 py-7">
              <div
                className="mb-5 rounded-[10px] px-4 py-3.5 text-[0.74rem] leading-[1.6] text-[#8b97a8]"
                style={{
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <strong className="text-[#eef2f7]">Critical Restrictions:</strong>{" "}
                The appointed fund manager cannot withdraw, transfer, or close
                your account. All trading activity is recorded and your funds
                remain under your full custody at all times.
              </div>

              {[
                "I understand that the assigned fund manager is not authorized to withdraw or transfer funds from my account",
                "I acknowledge that all trades and activity will be recorded for audit purposes",
                "I confirm my funds are kept in my full custody and control",
                "I have read and agree to these Terms and Conditions",
              ].map((label, i) => (
                <label
                  key={i}
                  className="mb-4 flex cursor-pointer items-start gap-2.5 text-[0.76rem] leading-[1.5] text-[#8b97a8] last:mb-0"
                >
                  <input
                    type="checkbox"
                    checked={genChecks[i]}
                    onChange={() => toggleGenCheck(i)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer"
                    style={{ accentColor: "#00dfa2" }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2.5 px-8 pb-8">
              <button
                type="button"
                onClick={closeGenModal}
                className="cursor-pointer rounded-[10px] px-5 py-2.5 font-[Outfit,sans-serif] text-[0.78rem] font-bold text-[#8b97a8] transition-colors duration-150 hover:text-[#eef2f7]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndGenerate}
                disabled={!genAllChecked}
                className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-5 py-2.5 font-[Outfit,sans-serif] text-[0.78rem] font-extrabold text-black transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: genAllChecked
                    ? "linear-gradient(135deg,#00dfa2,#00b881)"
                    : "rgba(0,223,162,0.25)",
                  boxShadow: genAllChecked
                    ? "0 3px 14px rgba(0,223,162,0.25)"
                    : "none",
                  letterSpacing: "-0.01em",
                }}
              >
                <Bolt className="h-[0.78rem] w-[0.78rem]" />
                Agree and Generate API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// LOCAL HELPER COMPONENTS
// ──────────────────────────────────────────────────────────────

function SectionDivider({
  label,
  icon,
  count,
  className = "",
}: {
  label: string;
  icon: React.ReactNode;
  count?: string;
  className?: string;
}) {
  return (
    <div className={`relative my-9 flex items-center gap-4 ${className}`}>
      <span
        className="h-[1px] w-10 flex-shrink-0"
        style={{ background: "linear-gradient(90deg,transparent,#00dfa2)" }}
      />
      <div className="flex items-center gap-2 whitespace-nowrap font-[Outfit,sans-serif] text-[0.78rem] font-bold uppercase tracking-[0.04em] text-[#eef2f7]">
        <span className="text-[#00dfa2]">{icon}</span>
        {label}
      </div>
      {count && (
        <span
          className="rounded px-2 py-[3px] font-[JetBrains_Mono,monospace] text-[0.6rem] font-semibold text-[#4a5468]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {count}
        </span>
      )}
      <span
        className="h-[1px] flex-1"
        style={{
          background:
            "linear-gradient(90deg,rgba(255,255,255,0.08),transparent 80%)",
        }}
      />
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  const getFooterHref = (item: string) =>
    item === "Staking and Earn" ? "/main/savings" : "#";

  return (
    <div className="flex flex-col">
      <div
        className="mb-3.5 border-b pb-2.5 font-[Outfit,sans-serif] text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#eef2f7]"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        {title}
      </div>
      {items.map((item) => (
        <a
          key={item}
          href={getFooterHref(item)}
          className="block py-[5px] text-[0.76rem] text-[#4a5468] transition-all duration-200 hover:pl-2 hover:text-[#00dfa2]"
        >
          {item}
        </a>
      ))}
    </div>
  );
}

function FooterBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-lg px-[14px] py-1.5 text-[0.63rem] font-bold text-[#4a5468] transition-all duration-200"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {icon}
      {children}
    </div>
  );
}
