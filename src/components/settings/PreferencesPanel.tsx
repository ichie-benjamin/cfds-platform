import { useState } from "react";
import {
  Bell,
  Palette,
  BarChart3,
  Mail,
  Smartphone,
  MessageSquare,
  LineChart,
  Receipt,
  Shield,
  Moon,
  Sun,
  CheckCheck,
  Bot,
} from "lucide-react";

/**
 * PreferencesPanel — visual-only preferences UI.
 *
 * NOTE: All toggles and pill selectors in this panel are LOCAL UI state only.
 * They do not call any backend API or persist to any store, because the
 * platform does not currently expose endpoints for these preferences.
 *
 * Theme switching, currency, and language already live on the Overview tab
 * and use their own real, persisted controls.
 */
export function PreferencesPanel() {
  return (
    <div className="flex flex-col gap-[18px]">
      <NotificationsCard />
      <DisplayCard />
      <TradingCard />
    </div>
  );
}

/* ───────────── Notifications ───────────── */

interface ToggleConfig {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  initial: boolean;
  locked?: boolean;
}

function NotificationsCard() {
  const toggles: ToggleConfig[] = [
    {
      id: "email",
      label: "Email Notifications",
      desc: "Receive account updates via email",
      icon: <Mail className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: true,
    },
    {
      id: "push",
      label: "Push Notifications",
      desc: "Browser push notifications for alerts",
      icon: <Smartphone className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: false,
    },
    {
      id: "sms",
      label: "SMS Alerts",
      desc: "Text messages for critical events",
      icon: <MessageSquare className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: false,
    },
    {
      id: "price",
      label: "Price Alerts",
      desc: "Get notified when prices hit your targets",
      icon: <LineChart className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: true,
    },
    {
      id: "trade",
      label: "Trade Confirmations",
      desc: "Confirmation after each trade execution",
      icon: <Receipt className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: true,
    },
    {
      id: "security",
      label: "Security Alerts",
      desc: "Login attempts and security events (always on)",
      icon: <Shield className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: true,
      locked: true,
    },
  ];

  return (
    <SectionCard title="Notifications" icon={<Bell className="h-3.5 w-3.5 text-[#00dfa2]" />}>
      <div className="flex flex-col">
        {toggles.map((t, i) => (
          <ToggleRow key={t.id} {...t} isLast={i === toggles.length - 1} />
        ))}
      </div>
    </SectionCard>
  );
}

function ToggleRow({
  label,
  desc,
  icon,
  initial,
  locked,
  isLast,
}: ToggleConfig & { isLast: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3.5 ${
        isLast ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="grid w-4 place-items-center">{icon}</span>
        <div>
          <div className="text-[0.84rem] font-semibold text-[#eef2f7]">
            {label}
          </div>
          <div className="text-[0.66rem] text-[#4a5468]">{desc}</div>
        </div>
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={() => !locked && setOn((v) => !v)}
        aria-pressed={on}
        className={`relative h-[23px] w-[42px] shrink-0 rounded-xl transition-colors ${
          on
            ? "bg-gradient-to-br from-[#00dfa2] to-[#00b881]"
            : "bg-white/[0.08]"
        } ${locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-[3px] h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

/* ───────────── Display ───────────── */

function DisplayCard() {
  const [theme, setTheme] = useState("Dark");
  const [chart, setChart] = useState("Candlestick");
  const [timeframe, setTimeframe] = useState("1D");

  return (
    <SectionCard title="Display" icon={<Palette className="h-3.5 w-3.5 text-[#00dfa2]" />}>
      <PillGroup
        label="Theme"
        value={theme}
        onChange={setTheme}
        options={[
          { value: "Dark", icon: <Moon className="h-[0.6rem] w-[0.6rem]" /> },
          { value: "Light", icon: <Sun className="h-[0.6rem] w-[0.6rem]" /> },
        ]}
      />
      <PillGroup
        label="Chart Type"
        value={chart}
        onChange={setChart}
        options={[{ value: "Candlestick" }, { value: "Line" }, { value: "Area" }]}
      />
      <PillGroup
        label="Default Timeframe"
        value={timeframe}
        onChange={setTimeframe}
        options={[{ value: "1H" }, { value: "4H" }, { value: "1D" }, { value: "1W" }]}
      />
    </SectionCard>
  );
}

/* ───────────── Trading ───────────── */

function TradingCard() {
  const [order, setOrder] = useState("Limit");
  const toggles: ToggleConfig[] = [
    {
      id: "confirm",
      label: "Confirm Before Trade",
      desc: "Show confirmation dialog before executing",
      icon: <CheckCheck className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: true,
    },
    {
      id: "auto",
      label: "Auto-close Positions",
      desc: "Automatically close at stop-loss / take-profit",
      icon: <Bot className="h-3.5 w-3.5 text-[#4a5468]" />,
      initial: false,
    },
  ];

  return (
    <SectionCard
      title="Trading Preferences"
      icon={<BarChart3 className="h-3.5 w-3.5 text-[#00dfa2]" />}
    >
      <PillGroup
        label="Default Order Type"
        value={order}
        onChange={setOrder}
        options={[{ value: "Market" }, { value: "Limit" }]}
      />
      <div className="flex flex-col">
        {toggles.map((t, i) => (
          <ToggleRow key={t.id} {...t} isLast={i === toggles.length - 1} />
        ))}
      </div>
    </SectionCard>
  );
}

/* ───────────── Shared ───────────── */

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />
      <div className="relative z-10 mb-[18px] flex items-center gap-2.5 border-b border-white/[0.06] pb-[14px]">
        <span className="grid w-5 place-items-center">{icon}</span>
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          {title}
        </h3>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function PillGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="mb-[18px] last:mb-0">
      <div className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[0.76rem] transition-colors ${
                active
                  ? "border-[#00dfa2]/30 bg-[#00dfa2]/[0.08] font-bold text-[#00dfa2]"
                  : "border-white/[0.06] bg-transparent font-semibold text-[#4a5468] hover:border-white/[0.12] hover:text-[#8b97a8]"
              }`}
            >
              {opt.icon}
              {opt.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
