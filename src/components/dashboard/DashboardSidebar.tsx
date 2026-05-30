import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Globe,
  Wallet,
  ArrowDownToLine,
  Clock,
  Coins,
  ShieldCheck,
  Users,
  Gift,
  Flame,
  Settings,
  LogOut,
} from "lucide-react";
import { clearAuthenticatedSession } from "@/lib/session";
import { useNavigate } from "react-router-dom";

const navTop = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/main/dashboard" },
  { title: "Trade Room", icon: BarChart3, href: "/trading", external: true },
  { title: "Markets", icon: Globe, href: "/main/market" },
  { title: "Wallet", icon: Wallet, href: "/main/wallet" },
  { title: "Deposit / Withdraw", icon: ArrowDownToLine, href: "/main/withdrawal" },
];

const navMid = [
  { title: "Trading Plans", icon: Clock, href: "/main/trading-plans" },
  { title: "Fund Protection", icon: ShieldCheck, href: "/main/fund-protection" },
  { title: "Fund Managers", icon: Users, href: "/main/fund-managers" },
  { title: "Earning", icon: Coins, href: "/main/savings" },
  { title: "Meme Explorer", icon: Flame, href: "/main/meme-explorer" },
  { title: "Welcome Bonus", icon: Gift, href: "/main/welcome-bonus" },
];

const navBottom = [
  { title: "Settings", icon: Settings, href: "/main/settings" },
];

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  external?: boolean;
}

function SbIcon({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const cls = `sb-icon group relative flex h-10 w-10 items-center justify-center rounded-[10px] cursor-pointer transition-all duration-150 ${
    active
      ? "bg-[rgba(0,223,162,0.1)] text-[#00dfa2]"
      : "text-[#4a5468] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
  }`;

  const tooltip = (
    <span className="tip pointer-events-none absolute left-[50px] z-[400] whitespace-nowrap rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(10,13,21,0.95)] px-[10px] py-1 text-[0.68rem] font-semibold text-[#eef2f7] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      {item.title}
    </span>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={cls}
        onClick={onClick}
      >
        <item.icon className="h-[0.88rem] w-[0.88rem]" />
        {tooltip}
      </a>
    );
  }

  return (
    <Link to={item.href} className={cls} onClick={onClick}>
      <item.icon className="h-[0.88rem] w-[0.88rem]" />
      {tooltip}
    </Link>
  );
}

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    clearAuthenticatedSession();
    if (onClose) onClose();
    navigate("/");
  };

  const handleItemClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[35] bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-8 bottom-0 z-[40] flex w-[60px] flex-col items-center gap-1 border-r border-[rgba(255,255,255,0.05)] py-[18px] transition-transform duration-200 md:static md:top-0 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(10,13,21,0.98), rgba(7,8,12,0.98))",
        }}
      >
        {/* Top nav */}
        {navTop.map((item) => (
          <SbIcon
            key={item.title}
            item={item}
            active={isActive(item.href)}
            onClick={handleItemClick}
          />
        ))}

        {/* Divider */}
        <div className="my-1.5 h-px w-6 bg-[rgba(255,255,255,0.05)]" />

        {/* Mid nav */}
        {navMid.map((item) => (
          <SbIcon
            key={item.title}
            item={item}
            active={isActive(item.href)}
            onClick={handleItemClick}
          />
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="my-1.5 h-px w-6 bg-[rgba(255,255,255,0.05)]" />

        {/* Bottom nav */}
        {navBottom.map((item) => (
          <SbIcon
            key={item.title}
            item={item}
            active={isActive(item.href)}
            onClick={handleItemClick}
          />
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sb-icon group relative flex h-10 w-10 items-center justify-center rounded-[10px] cursor-pointer text-[#4a5468] transition-all duration-150 hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
        >
          <LogOut className="h-[0.88rem] w-[0.88rem]" />
          <span className="tip pointer-events-none absolute left-[50px] z-[400] whitespace-nowrap rounded-md border border-[rgba(255,255,255,0.1)] bg-[rgba(10,13,21,0.95)] px-[10px] py-1 text-[0.68rem] font-semibold text-[#eef2f7] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            Logout
          </span>
        </button>
      </aside>
    </>
  );
}
