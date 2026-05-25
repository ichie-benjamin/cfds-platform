import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Menu,
  X as XIcon,
  ChevronDown,
  Wallet as WalletIcon,
} from "lucide-react";
import useUserStore from "@/store/userStore";
import useSiteSettingsStore from "@/store/siteSettingStore";

// ───────────────────────────────────────────────────────────────
// NAV STRUCTURE — every destination verified in App.tsx
// ───────────────────────────────────────────────────────────────

interface NavLeaf {
  label: string;
  to: string;
  external?: boolean;
}

interface NavGroup {
  label: string;
  key: string;
  items: NavLeaf[];
}

const TOP_LINKS: NavLeaf[] = [
  { label: "Dashboard", to: "/main/dashboard" },
  { label: "Markets", to: "/main/market" },
];

const GROUPS: NavGroup[] = [
  {
    label: "Trade",
    key: "trade",
    items: [
      { label: "Trade Room", to: "/trading", external: true },
      { label: "Trading Plans", to: "/main/trading-plans" },
      { label: "Trade Access", to: "/main/trade-access" },
    ],
  },
  {
    label: "Wallet",
    key: "wallet",
    items: [
      { label: "Wallet", to: "/main/wallet" },
      { label: "Accounts", to: "/main/accounts" },
      { label: "Funds", to: "/main/withdrawal" },
      { label: "Deposit History", to: "/main/deposit-history" },
      { label: "Savings", to: "/main/savings" },
    ],
  },
  {
    label: "Earn",
    key: "earn",
    items: [
      { label: "Rewards", to: "/main/rewards" },
      { label: "Referral", to: "/main/referral" },
      { label: "Welcome Bonus", to: "/main/welcome-bonus" },
      { label: "Managed Portfolio", to: "/main/managed-portfolio" },
      { label: "Fund Managers", to: "/main/fund-managers" },
    ],
  },
  {
    label: "More",
    key: "more",
    items: [
      { label: "Personal Info", to: "/main/personal" },
      { label: "Fund Protection", to: "/main/fund-protection" },
      { label: "Social Responsibility", to: "/main/social-responsibility" },
      { label: "Security", to: "/main/security" },
      { label: "KYC Partners", to: "/main/kyc-partners" },
      { label: "Settings", to: "/main/settings" },
      { label: "Support", to: "/main/chat" },
    ],
  },
];

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

function isLeafActive(currentPath: string, to: string): boolean {
  if (currentPath === to) return true;
  if (
    to !== "/" &&
    to !== "/main/dashboard" &&
    !to.startsWith("/trading") &&
    currentPath.startsWith(to + "/")
  )
    return true;
  return false;
}

function isGroupActive(currentPath: string, group: NavGroup): boolean {
  return group.items.some((i) => isLeafActive(currentPath, i.to));
}

// ───────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────

export default function DashboardNavbar() {
  const location = useLocation();
  const user = useUserStore((s) => s.user);
  const settings = useSiteSettingsStore((s) => s.settings);
  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "JD";
  const brandName = settings?.name || "1 Trade Market";

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>("trade");
  const closeTimer = useRef<number | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  // Close everything on route change
  useEffect(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
  }, [location.pathname]);

  // Click outside closes desktop dropdowns
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenGroup(null);
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 140);
  };

  const renderLeafLink = (
    item: NavLeaf,
    className: string,
    onClick?: () => void,
  ) => {
    if (item.external) {
      return (
        <a
          key={item.label}
          href={item.to}
          className={className}
          onClick={onClick}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link
        key={item.label}
        to={item.to}
        className={className}
        onClick={onClick}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <div className="dn-root" ref={navRef}>
      <style>{`
        .dn-root {
          position: relative;
          z-index: 195;
          background: #0b0c12;
          border-bottom: 1px solid #1a1b22;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #e4e4e7;
        }
        .dn-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 56px;
          gap: 18px;
        }
        .dn-left {
          display: flex;
          align-items: center;
          gap: 28px;
          min-width: 0;
          flex-shrink: 0;
        }
        .dn-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          text-decoration: none;
          color: #fff;
        }
        .dn-brand-icon { width: 22px; height: 22px; flex-shrink: 0; }
        .dn-brand-name {
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }
        .dn-brand-name em { font-style: normal; color: #00dfa2; }

        .dn-nav {
          display: flex;
          align-items: center;
          gap: 22px;
        }
        .dn-link {
          color: #9ca3af;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          line-height: 1;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .dn-link:hover { color: #fff; }
        .dn-link-active { color: #00dfa2; }
        .dn-link-active:hover { color: #00dfa2; }
        .dn-chev {
          width: 12px;
          height: 12px;
          transition: transform 0.2s ease;
          opacity: 0.85;
        }
        .dn-group { position: relative; }
        .dn-group.is-open .dn-chev { transform: rotate(180deg); }

        .dn-pop {
          position: absolute;
          top: calc(100% + 6px);
          left: -8px;
          min-width: 220px;
          padding: 6px;
          background: #16171d;
          border: 1px solid #1f2028;
          border-radius: 10px;
          box-shadow: 0 14px 40px rgba(0,0,0,0.55);
          z-index: 250;
        }
        .dn-pop-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          font-size: 13px;
          color: #cbd5e1;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
          white-space: nowrap;
        }
        .dn-pop-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .dn-pop-item-active { color: #00dfa2; background: rgba(0,223,162,0.06); }
        .dn-pop-item-active:hover { color: #00dfa2; }

        .dn-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .dn-icon-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #16171d;
          border: 1px solid #1f2028;
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          position: relative;
          transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .dn-icon-btn:hover {
          color: #fff;
          background: #1c1d24;
          border-color: #2a2b34;
        }
        .dn-bell-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
        }

        .dn-deposit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #07080c;
          font-weight: 700;
          font-size: 13px;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0,223,162,0.18);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .dn-deposit:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 32px rgba(0,223,162,0.32);
        }
        .dn-quick {
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 0 4px;
          white-space: nowrap;
          transition: color 0.15s ease;
        }
        .dn-quick:hover { color: #fff; }

        .dn-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00dfa2, #00ffc3);
          color: #07080c;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2px;
          text-decoration: none;
          flex-shrink: 0;
          border: 1.5px solid rgba(0,223,162,0.4);
        }

        .dn-hamburger {
          display: none;
        }

        /* ─── Drawer ─── */
        .dn-drawer {
          background: #0d0e14;
          border-bottom: 1px solid #1a1b22;
          padding: 8px 24px 18px;
        }
        .dn-drawer-link {
          display: block;
          padding: 12px 6px;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .dn-drawer-link:hover { color: #fff; }
        .dn-drawer-link-active { color: #00dfa2; }

        .dn-drawer-section {
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .dn-drawer-section:last-child { border-bottom: none; }
        .dn-drawer-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 6px;
          background: none;
          border: none;
          width: 100%;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }
        .dn-drawer-section-head .dn-chev { color: #9ca3af; }
        .dn-drawer-section-head.is-open .dn-chev { transform: rotate(180deg); }
        .dn-drawer-sub {
          padding: 4px 6px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dn-drawer-sub a {
          display: block;
          padding: 9px 12px;
          color: #cbd5e1;
          text-decoration: none;
          font-size: 13px;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .dn-drawer-sub a:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .dn-drawer-sub a.active {
          color: #00dfa2;
          background: rgba(0,223,162,0.06);
        }

        /* ─── Responsive ─── */
        @media (max-width: 1279px) {
          .dn-nav, .dn-quick { display: none; }
          .dn-hamburger { display: inline-flex; }
        }
        @media (max-width: 640px) {
          .dn-brand-name { display: none; }
          .dn-inner { padding: 0 14px; gap: 10px; }
          .dn-right { gap: 8px; }
          .dn-deposit { padding: 7px 12px; font-size: 12px; }
        }
      `}</style>

      <div className="dn-inner">
        {/* LEFT: brand + top-level nav */}
        <div className="dn-left">
          <Link to="/main/dashboard" className="dn-brand" aria-label={brandName}>
            <svg className="dn-brand-icon" viewBox="0 0 22 22">
              <polygon
                points="11,1 20,6 20,16 11,21 2,16 2,6"
                fill="#00dfa2"
                opacity="0.95"
              />
              <text
                x="11"
                y="14.5"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#0b0c12"
              >
                1
              </text>
            </svg>
            <span className="dn-brand-name">{brandName}</span>
          </Link>

          <nav className="dn-nav" aria-label="Primary">
            {TOP_LINKS.map((l) =>
              renderLeafLink(
                l,
                `dn-link${
                  isLeafActive(location.pathname, l.to) ? " dn-link-active" : ""
                }`,
              ),
            )}
            {GROUPS.map((g) => {
              const groupActive = isGroupActive(location.pathname, g);
              const isOpen = openGroup === g.key;
              return (
                <div
                  key={g.key}
                  className={`dn-group${isOpen ? " is-open" : ""}`}
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenGroup(g.key);
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    className={`dn-link${groupActive ? " dn-link-active" : ""}`}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenGroup(isOpen ? null : g.key)
                    }
                  >
                    {g.label}
                    <ChevronDown className="dn-chev" />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key={`pop-${g.key}`}
                        role="menu"
                        className="dn-pop"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                      >
                        {g.items.map((it) => {
                          const active = isLeafActive(location.pathname, it.to);
                          const cls = `dn-pop-item${
                            active ? " dn-pop-item-active" : ""
                          }`;
                          return renderLeafLink(it, cls, () =>
                            setOpenGroup(null),
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: search + Deposit + wallet quick-link + avatar + bell + hamburger */}
        <div className="dn-right">
          <Link to="/main/market" className="dn-icon-btn" aria-label="Markets / Search">
            <Search className="h-3.5 w-3.5" />
          </Link>
          <Link to="/main/withdrawal?tab=deposit" className="dn-deposit">
            Deposit
          </Link>
          <Link to="/main/wallet" className="dn-quick">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <WalletIcon className="h-3.5 w-3.5" />
              Wallet
            </span>
          </Link>
          <Link to="/main/personal" className="dn-avatar" aria-label="Profile">
            {user ? initials : <User className="h-3.5 w-3.5" />}
          </Link>
          <Link to="/main/chat" className="dn-icon-btn" aria-label="Notifications">
            <Bell className="h-3.5 w-3.5" />
            <span className="dn-bell-dot" />
          </Link>
          <button
            type="button"
            className="dn-icon-btn dn-hamburger"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* DRAWER (hamburger menu) */}
      <AnimatePresence initial={false}>
        {drawerOpen && (
          <motion.div
            key="dn-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="dn-drawer">
              {TOP_LINKS.map((l) => {
                const active = isLeafActive(location.pathname, l.to);
                const cls = `dn-drawer-link${active ? " dn-drawer-link-active" : ""}`;
                return renderLeafLink(l, cls, () => setDrawerOpen(false));
              })}
              {GROUPS.map((g) => {
                const isSecOpen = mobileSection === g.key;
                const groupActive = isGroupActive(location.pathname, g);
                return (
                  <div key={g.key} className="dn-drawer-section">
                    <button
                      type="button"
                      className={`dn-drawer-section-head${
                        isSecOpen ? " is-open" : ""
                      }`}
                      onClick={() =>
                        setMobileSection(isSecOpen ? null : g.key)
                      }
                      style={groupActive ? { color: "#00dfa2" } : undefined}
                    >
                      <span>{g.label}</span>
                      <ChevronDown className="dn-chev" />
                    </button>
                    <AnimatePresence initial={false}>
                      {isSecOpen && (
                        <motion.div
                          key={`sec-${g.key}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="dn-drawer-sub">
                            {g.items.map((it) => {
                              const active = isLeafActive(location.pathname, it.to);
                              const onClick = () => setDrawerOpen(false);
                              if (it.external) {
                                return (
                                  <a
                                    key={it.label}
                                    href={it.to}
                                    className={active ? "active" : undefined}
                                    onClick={onClick}
                                  >
                                    {it.label}
                                  </a>
                                );
                              }
                              return (
                                <Link
                                  key={it.label}
                                  to={it.to}
                                  className={active ? "active" : undefined}
                                  onClick={onClick}
                                >
                                  {it.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
