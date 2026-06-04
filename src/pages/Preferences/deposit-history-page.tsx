import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Wallet,
  ArrowUp,
  ArrowLeftRight,
  Receipt,
  Info,
  PieChart,
  Headset,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { MarketSidebar } from "@/components/market/MarketSidebar";
import useUserStore from "@/store/userStore";
import { useCurrency } from "@/hooks/useCurrency";
import {
  DepositHistoryTransactionsCard,
  type DepositTransaction,
} from "@/components/deposit-history-ui/DepositHistoryTransactionsCard";

interface ApiResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: DepositTransaction[];
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

// Parse a numeric amount out of strings like "$1,250.00", "+0.45 BTC", "500 USDT"
function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[+,$]/g, "").trim();
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return 0;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : 0;
}

export default function DepositHistoryPage() {
  const user = useUserStore((state) => state.user);
  const { formatCurrency } = useCurrency();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<DepositTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>("/user/deposits");
        if (!cancelled) {
          setTransactions(response.data.data.data ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load deposit history");
          console.error("Error fetching deposits:", err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("deposit-history-active");
    return () => {
      document.body.classList.remove("deposit-history-active");
    };
  }, []);

  // Derive stats from real data; missing dimensions show safe fallbacks.
  const stats = useMemo(() => {
    const deposits = transactions.filter(
      (t) => (t.type ?? "deposit").toLowerCase() === "deposit",
    );
    const withdrawals = transactions.filter(
      (t) => (t.type ?? "").toLowerCase() === "withdraw",
    );
    const depositSum = deposits.reduce((acc, t) => acc + parseAmount(t.amount), 0);
    const withdrawSum = withdrawals.reduce(
      (acc, t) => acc + Math.abs(parseAmount(t.amount)),
      0,
    );
    return {
      depositSum,
      withdrawSum,
      withdrawCount: withdrawals.length,
      netFlow: depositSum - withdrawSum,
      txCount: transactions.length,
    };
  }, [transactions]);

  const balance = user?.balance ?? 0;
  const planTitle = user?.account_type?.title?.toUpperCase() ?? "STARTER";
  const leverage = user?.account_type?.leverage
    ? `1:${user.account_type.leverage}`
    : "1:10";
  const kycStatus = (user?.verification_status ?? "pending").toLowerCase();

  const kycChip =
    kycStatus === "approved"
      ? {
          label: "Verified",
          cls: "bg-[rgba(52,199,123,0.08)] text-[#34C77B] border-[rgba(52,199,123,0.15)]",
          dot: "bg-[#34C77B] shadow-[0_0_6px_#34C77B]",
        }
      : kycStatus === "rejected"
        ? {
            label: "Rejected",
            cls: "bg-[rgba(232,93,93,0.08)] text-[#E85D5D] border-[rgba(232,93,93,0.15)]",
            dot: "bg-[#E85D5D] shadow-[0_0_6px_#E85D5D]",
          }
        : {
            label: "Pending",
            cls: "bg-[rgba(232,169,77,0.07)] text-[#E8A94D] border-[rgba(232,169,77,0.15)]",
            dot: "bg-[#E8A94D] shadow-[0_0_6px_#E8A94D] animate-pulse",
          };

  return (
    <>
      <style>{`
        body.deposit-history-active .fixed.top-0.left-0.right-0.z-20,
        body.deposit-history-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.deposit-history-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.deposit-history-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
        }}
      >
        <TickerBar />
        <DashboardNavbar />

        {/* Mobile-only sidebar trigger */}
        <div className="flex items-center border-b border-white/[0.06] bg-[rgba(7,8,12,0.75)] px-3 py-1.5 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03] text-[#6b7a90] transition-colors hover:bg-white/[0.06] hover:text-[#eef2f7]"
          >
            <Menu className="h-[1.05rem] w-[1.05rem]" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[60px_1fr]">
          <MarketSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main
            className="overflow-y-auto px-3 py-5 md:px-6"
            style={{ maxHeight: "100%" }}
          >
            {/* PAGE HEAD */}
            <div className="mb-5">
              <h1 className="font-[Outfit,sans-serif] text-[1.2rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                Deposit <span className="text-[#3DDBA9]">History</span>
              </h1>
              <p className="mt-0.5 text-[0.78rem] text-[#6b7a90]">
                View and track every deposit across your trading accounts
              </p>
            </div>

            {/* BALANCE STRIP */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Wallet className="h-[0.75rem] w-[0.75rem]" />}
                label="Current Balance"
                value={formatCurrency(balance)}
                sub="Available to trade"
              />
              <StatCard
                icon={<ArrowUp className="h-[0.75rem] w-[0.75rem]" />}
                label="Total Withdrawn"
                value={
                  stats.withdrawSum > 0
                    ? formatCurrency(stats.withdrawSum)
                    : "$0.00"
                }
                sub={
                  stats.withdrawCount > 0
                    ? `${stats.withdrawCount} withdrawals`
                    : "No withdrawals yet"
                }
              />
              <StatCard
                icon={
                  <ArrowLeftRight className="h-[0.75rem] w-[0.75rem]" />
                }
                label="Net Flow"
                value={
                  (stats.netFlow >= 0 ? "+" : "-") +
                  formatCurrency(Math.abs(stats.netFlow)).replace(/^[+-]/, "")
                }
                sub="All-time net"
              />
              <StatCard
                icon={<Receipt className="h-[0.75rem] w-[0.75rem]" />}
                label="Total Txns"
                value={String(stats.txCount)}
                sub={
                  stats.txCount === 0 ? "No activity yet" : "Across all deposits"
                }
              />
            </div>

            {/* CONTENT GRID */}
            <div className="grid items-start gap-5 xl:grid-cols-[1fr_300px]">
              {/* LEFT */}
              <DepositHistoryTransactionsCard
                transactions={transactions}
                isLoading={isLoading}
                error={error}
              />

              {/* RIGHT */}
              <div className="flex flex-col gap-4">
                <StatusGuideCard />
                <AccountSummaryCard
                  accountId={user?.account_id ?? "—"}
                  totalBalance={formatCurrency(balance)}
                  available={formatCurrency(balance)}
                  bonus={formatCurrency(0)}
                  plan={planTitle}
                  leverage={leverage}
                  kycChip={kycChip}
                />
                <NeedHelpCard />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Page-local presentational pieces
// ──────────────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-white/[0.08] p-[16px_18px] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px]"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(61,219,169,0.01))",
      }}
    >
      <div
        className="absolute right-[14px] top-[14px] flex h-8 w-8 items-center justify-center rounded-[10px] border border-[rgba(61,219,169,0.2)] text-[#3DDBA9] shadow-[0_4px_12px_rgba(0,0,0,.25),inset_0_1px_1px_rgba(255,255,255,.15)]"
        style={{
          background:
            "linear-gradient(145deg,rgba(61,219,169,0.15),rgba(61,219,169,0.06))",
        }}
      >
        {icon}
      </div>
      <div className="mb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#4d5b6e]">
        {label}
      </div>
      <div className="mb-1 font-mono text-[1.15rem] font-bold leading-none text-[#3DDBA9]">
        {value}
      </div>
      <div className="text-[0.65rem] text-[#6b7a90]">{sub}</div>
    </div>
  );
}

function RightCardShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] border border-white/[0.1] p-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[60px]"
      style={{
        background:
          "linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02),rgba(61,219,169,0.015))",
      }}
    >
      <div className="mb-3.5 flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[#3DDBA9]">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function StatusGuideCard() {
  const rows = [
    {
      label: "Completed",
      cls: "bg-[rgba(52,199,123,0.08)] text-[#34C77B] border-[rgba(52,199,123,0.15)]",
      dot: "bg-[#34C77B] shadow-[0_0_6px_#34C77B]",
      desc: "Transaction has been fully processed and confirmed on the blockchain.",
    },
    {
      label: "Pending",
      cls: "bg-[rgba(232,169,77,0.07)] text-[#E8A94D] border-[rgba(232,169,77,0.15)]",
      dot: "bg-[#E8A94D] shadow-[0_0_6px_#E8A94D] animate-pulse",
      desc: "Transaction submitted and awaiting confirmation. May take 10-30 min.",
    },
    {
      label: "Processing",
      cls: "bg-[rgba(91,141,239,0.08)] text-[#5B8DEF] border-[rgba(91,141,239,0.15)]",
      dot: "bg-[#5B8DEF] shadow-[0_0_6px_#5B8DEF] animate-pulse",
      desc: "Transaction is being verified by the network. Almost done.",
    },
    {
      label: "Failed",
      cls: "bg-[rgba(232,93,93,0.08)] text-[#E85D5D] border-[rgba(232,93,93,0.15)]",
      dot: "bg-[#E85D5D] shadow-[0_0_6px_#E85D5D]",
      desc: "Transaction could not be completed. Funds returned to source wallet.",
    },
  ];
  return (
    <RightCardShell
      label="Status Guide"
      icon={<Info className="h-[0.6rem] w-[0.6rem]" />}
    >
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start gap-2.5 border-b border-white/[0.04] pb-2.5 last:border-b-0 last:pb-0"
          >
            <span
              className={
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[20px] border px-2 py-[3px] text-[0.6rem] font-bold " +
                r.cls
              }
            >
              <span className={"h-[5px] w-[5px] rounded-full " + r.dot} />
              {r.label}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.75rem] font-semibold text-[#eef2f7]">
                {r.label}
              </span>
              <span className="text-[0.65rem] leading-[1.5] text-[#6b7a90]">
                {r.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </RightCardShell>
  );
}

interface AccountSummaryProps {
  accountId: string;
  totalBalance: string;
  available: string;
  bonus: string;
  plan: string;
  leverage: string;
  kycChip: { label: string; cls: string; dot: string };
}

function AccountSummaryCard({
  accountId,
  totalBalance,
  available,
  bonus,
  plan,
  leverage,
  kycChip,
}: AccountSummaryProps) {
  return (
    <RightCardShell
      label="Account Summary"
      icon={<PieChart className="h-[0.6rem] w-[0.6rem]" />}
    >
      <div className="flex flex-col">
        <SummaryRow label="Account ID" value={accountId} mono />
        <SummaryRow label="Total Balance" value={totalBalance} valueCls="text-[#3DDBA9]" />
        <SummaryRow label="Available" value={available} valueCls="text-[#34C77B]" />
        <SummaryRow label="Bonus Wallet" value={bonus} />
        <SummaryRow label="Plan" value={plan} valueCls="text-[#3DDBA9]" />
        <SummaryRow label="Leverage" value={leverage} />
        <div className="flex items-center justify-between border-b border-white/[0.04] py-2.5 last:border-b-0">
          <span className="text-[0.72rem] font-medium text-[#6b7a90]">
            KYC Status
          </span>
          <span
            className={
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[20px] border px-2 py-[3px] text-[0.6rem] font-bold " +
              kycChip.cls
            }
          >
            <span className={"h-[5px] w-[5px] rounded-full " + kycChip.dot} />
            {kycChip.label}
          </span>
        </div>
      </div>
    </RightCardShell>
  );
}

function SummaryRow({
  label,
  value,
  valueCls,
  mono,
}: {
  label: string;
  value: string;
  valueCls?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] py-2.5 last:border-b-0">
      <span className="text-[0.72rem] font-medium text-[#6b7a90]">{label}</span>
      <span
        className={
          (mono ? "font-mono " : "font-mono ") +
          "text-[0.78rem] font-semibold " +
          (valueCls ?? "text-[#eef2f7]")
        }
      >
        {value}
      </span>
    </div>
  );
}

function NeedHelpCard() {
  return (
    <RightCardShell
      label="Need Help?"
      icon={<Headset className="h-[0.6rem] w-[0.6rem]" />}
    >
      <p className="mb-3.5 text-[0.75rem] leading-[1.6] text-[#6b7a90]">
        Can&apos;t find a transaction or need help with a pending deposit? Our
        24/7 support team is ready to assist.
      </p>
      <a
        href="/main/chat"
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[10px] px-3 py-2.5 text-[0.78rem] font-bold text-[#07080c] shadow-[0_4px_16px_rgba(61,219,169,.15)] transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_24px_rgba(61,219,169,.25)]"
        style={{
          background: "linear-gradient(135deg,#3DDBA9,#1A9E78)",
        }}
      >
        <Headset className="h-[0.78rem] w-[0.78rem]" />
        Contact Support
      </a>
    </RightCardShell>
  );
}
