import { useMemo, useState } from "react";
import {
  Search,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Gift,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  FileDown,
  Copy,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

export interface DepositTransaction {
  id: string;
  amount: string;
  date: string;
  type: string;
  account: string;
  status: string;
  details: string | null;
}

interface DepositHistoryTransactionsCardProps {
  transactions: DepositTransaction[];
  isLoading: boolean;
  error: string | null;
}

type FilterKey = "all" | "deposit" | "withdraw" | "transfer" | "bonus";

const TX_FILTERS: {
  key: FilterKey;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "all", label: "All" },
  { key: "deposit", label: "Deposits", icon: ArrowDown },
  { key: "withdraw", label: "Withdrawals", icon: ArrowUp },
  { key: "transfer", label: "Transfers", icon: ArrowLeftRight },
  { key: "bonus", label: "Rewards", icon: Gift },
];

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<string, { label: string; cls: string; dot: string }> = {
  approved: {
    label: "Completed",
    cls: "bg-[rgba(52,199,123,0.08)] text-[#34C77B] border-[rgba(52,199,123,0.15)]",
    dot: "bg-[#34C77B] shadow-[0_0_6px_#34C77B]",
  },
  completed: {
    label: "Completed",
    cls: "bg-[rgba(52,199,123,0.08)] text-[#34C77B] border-[rgba(52,199,123,0.15)]",
    dot: "bg-[#34C77B] shadow-[0_0_6px_#34C77B]",
  },
  pending: {
    label: "Pending",
    cls: "bg-[rgba(232,169,77,0.07)] text-[#E8A94D] border-[rgba(232,169,77,0.15)]",
    dot: "bg-[#E8A94D] shadow-[0_0_6px_#E8A94D] animate-pulse",
  },
  processing: {
    label: "Processing",
    cls: "bg-[rgba(91,141,239,0.08)] text-[#5B8DEF] border-[rgba(91,141,239,0.15)]",
    dot: "bg-[#5B8DEF] shadow-[0_0_6px_#5B8DEF] animate-pulse",
  },
  rejected: {
    label: "Failed",
    cls: "bg-[rgba(232,93,93,0.08)] text-[#E85D5D] border-[rgba(232,93,93,0.15)]",
    dot: "bg-[#E85D5D] shadow-[0_0_6px_#E85D5D]",
  },
  failed: {
    label: "Failed",
    cls: "bg-[rgba(232,93,93,0.08)] text-[#E85D5D] border-[rgba(232,93,93,0.15)]",
    dot: "bg-[#E85D5D] shadow-[0_0_6px_#E85D5D]",
  },
};

function statusInfo(status: string) {
  return STATUS_LABEL[status.toLowerCase()] ?? STATUS_LABEL.pending;
}

function deriveAsset(amount: string): { asset: string; assetName: string } {
  const match = amount.match(/[A-Z]{2,5}/);
  if (match) {
    const sym = match[0];
    const names: Record<string, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      USDT: "Tether",
      USDC: "USD Coin",
      SOL: "Solana",
      XRP: "Ripple",
      ADA: "Cardano",
      DOGE: "Dogecoin",
      AVAX: "Avalanche",
      USD: "US Dollar",
      EUR: "Euro",
      GBP: "British Pound",
    };
    return { asset: sym, assetName: names[sym] ?? sym };
  }
  return { asset: "USD", assetName: "US Dollar" };
}

function shortenId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function DepositHistoryTransactionsCard({
  transactions,
  isLoading,
  error,
}: DepositHistoryTransactionsCardProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: transactions.length,
      deposit: 0,
      withdraw: 0,
      transfer: 0,
      bonus: 0,
    };
    for (const tx of transactions) {
      const t = (tx.type ?? "deposit").toLowerCase();
      if (t in c && t !== "all") c[t as FilterKey] += 1;
      else c.deposit += 1;
    }
    return c;
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = transactions.slice();
    if (filter !== "all") {
      list = list.filter((tx) => {
        const t = (tx.type ?? "deposit").toLowerCase();
        return filter === "deposit" ? t === "deposit" || !t : t === filter;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.amount.toLowerCase().includes(q) ||
          tx.date.toLowerCase().includes(q) ||
          (tx.account ?? "").toLowerCase().includes(q) ||
          (tx.status ?? "").toLowerCase().includes(q),
      );
    }
    if (!sortNewest) list.reverse();
    return list;
  }, [transactions, filter, query, sortNewest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const showFrom = filtered.length === 0 ? 0 : pageStart + 1;
  const showTo = Math.min(pageStart + PAGE_SIZE, filtered.length);

  const copyId = (id: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(id).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-4">
      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div
          className="inline-flex gap-0 rounded-[10px] border border-white/[0.07] p-[3px] backdrop-blur-[40px]"
          style={{
            background:
              "linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
          }}
        >
          {TX_FILTERS.map(({ key, label, icon: Icon }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setPage(1);
                }}
                className={
                  "relative flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-4 py-[7px] text-[0.75rem] font-semibold transition-all " +
                  (active
                    ? "text-[#07080c] font-bold shadow-[0_2px_10px_rgba(61,219,169,0.2),inset_0_1px_2px_rgba(255,255,255,0.35)]"
                    : "text-[#6b7a90] hover:text-[#eef2f7]")
                }
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(145deg,#6EECC4,#3DDBA9,#1A9E78)",
                      }
                    : undefined
                }
              >
                {Icon && <Icon className="h-[0.6rem] w-[0.6rem]" />}
                <span>{label}</span>
                <span
                  className={
                    "ml-1 rounded-[10px] px-[7px] py-[2px] font-mono text-[0.62rem] " +
                    (active
                      ? "bg-black/15 text-[#07080c]"
                      : "bg-white/[0.06] text-[#6b7a90]")
                  }
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="flex min-w-[180px] flex-1 items-center gap-2 rounded-[10px] border border-white/[0.08] px-3.5 transition-colors focus-within:border-[rgba(61,219,169,0.4)] focus-within:shadow-[0_0_0_3px_rgba(61,219,169,0.08)]"
          style={{
            background:
              "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
          }}
        >
          <Search className="h-[0.78rem] w-[0.78rem] text-[#6b7a90]" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by asset, ID, or amount..."
            className="flex-1 bg-transparent py-[9px] text-[0.8rem] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSortNewest((v) => !v)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[0.72rem] font-semibold text-[#6b7a90] transition-all hover:border-white/[0.12] hover:text-[#eef2f7]"
          >
            {sortNewest ? (
              <ArrowDownWideNarrow className="h-[0.78rem] w-[0.78rem]" />
            ) : (
              <ArrowUpWideNarrow className="h-[0.78rem] w-[0.78rem]" />
            )}
            {sortNewest ? "Newest" : "Oldest"}
          </button>
          <button
            onClick={() => {
              /* preview-only export: no backend behavior */
            }}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[0.72rem] font-semibold text-[#6b7a90] transition-all hover:border-white/[0.12] hover:text-[#eef2f7]"
          >
            <FileDown className="h-[0.78rem] w-[0.78rem]" />
            Export
          </button>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div
        className="overflow-hidden rounded-[14px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px]"
        style={{
          background:
            "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(61,219,169,0.01))",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                {["Type", "Asset", "Amount", "Date", "TX ID", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-left text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[#4d5b6e]"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#3DDBA9]" />
                    <p className="mt-3 text-[0.78rem] text-[#6b7a90]">
                      Loading deposit history...
                    </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <p className="text-[0.82rem] text-[#E85D5D]">{error}</p>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[16px] border border-[rgba(61,219,169,0.2)] text-[1.4rem] text-[#3DDBA9]"
                      style={{
                        background:
                          "linear-gradient(145deg,rgba(61,219,169,0.15),rgba(61,219,169,0.06))",
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,.25),inset 0 1px 1px rgba(255,255,255,.15)",
                      }}
                    >
                      <Inbox className="h-6 w-6" />
                    </div>
                    <div className="font-[Outfit,sans-serif] text-[1rem] font-bold text-[#eef2f7]">
                      No transactions found
                    </div>
                    <div className="mx-auto mt-1.5 max-w-[280px] text-[0.78rem] text-[#6b7a90]">
                      Try adjusting your filters or search query
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((tx) => {
                  const t = (tx.type ?? "deposit").toLowerCase();
                  const asset = deriveAsset(tx.amount);
                  const st = statusInfo(tx.status);
                  const amtStr = tx.amount ?? "";
                  const isMinus = amtStr.trim().startsWith("-");
                  const isPlus =
                    !isMinus &&
                    (t === "deposit" || t === "bonus" || amtStr.trim().startsWith("+"));
                  const displayAmount = isPlus
                    ? amtStr.startsWith("+")
                      ? amtStr
                      : `+${amtStr}`
                    : amtStr;
                  const typeColors: Record<
                    string,
                    { bg: string; border: string; text: string }
                  > = {
                    deposit: {
                      bg: "linear-gradient(145deg,rgba(52,199,123,0.15),rgba(52,199,123,0.06))",
                      border: "rgba(52,199,123,0.2)",
                      text: "#34C77B",
                    },
                    withdraw: {
                      bg: "linear-gradient(145deg,rgba(232,93,93,0.15),rgba(232,93,93,0.06))",
                      border: "rgba(232,93,93,0.2)",
                      text: "#E85D5D",
                    },
                    transfer: {
                      bg: "linear-gradient(145deg,rgba(91,141,239,0.15),rgba(91,141,239,0.06))",
                      border: "rgba(91,141,239,0.2)",
                      text: "#5B8DEF",
                    },
                    bonus: {
                      bg: "linear-gradient(145deg,rgba(139,92,246,0.15),rgba(139,92,246,0.06))",
                      border: "rgba(139,92,246,0.2)",
                      text: "#8B5CF6",
                    },
                  };
                  const tc = typeColors[t] ?? typeColors.deposit;
                  const TypeIcon =
                    t === "withdraw"
                      ? ArrowUp
                      : t === "transfer"
                        ? ArrowLeftRight
                        : t === "bonus"
                          ? Gift
                          : ArrowDown;
                  return (
                    <tr
                      key={tx.id}
                      className="cursor-pointer border-b border-white/[0.03] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-[10px] border text-[0.82rem]"
                            style={{
                              background: tc.bg,
                              borderColor: tc.border,
                              color: tc.text,
                              boxShadow:
                                "0 4px 12px rgba(0,0,0,.25),inset 0 1px 1px rgba(255,255,255,.15)",
                            }}
                          >
                            <TypeIcon className="h-[0.82rem] w-[0.82rem]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.82rem] font-semibold text-[#eef2f7]">
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </span>
                            <span className="text-[0.68rem] capitalize text-[#6b7a90]">
                              {tx.account || "Trading Account"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(61,219,169,0.2)] bg-[linear-gradient(135deg,rgba(61,219,169,0.15),rgba(61,219,169,0.06))] text-[0.55rem] font-extrabold text-[#3DDBA9]">
                            {asset.asset.charAt(0)}
                          </div>
                          <div>
                            <div className="text-[0.82rem] font-semibold text-[#eef2f7]">
                              {asset.assetName}
                            </div>
                            <div className="font-mono text-[0.68rem] text-[#6b7a90]">
                              {asset.asset}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div
                          className={
                            "font-mono text-[0.88rem] font-bold " +
                            (isMinus
                              ? "text-[#E85D5D]"
                              : isPlus
                                ? "text-[#34C77B]"
                                : "text-[#eef2f7]")
                          }
                        >
                          {displayAmount || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-[0.78rem] text-[#a3adbf]">
                          {tx.date}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5 font-mono text-[0.68rem] text-[#6b7a90]">
                          <span title={tx.id}>{shortenId(tx.id)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyId(tx.id);
                            }}
                            aria-label="Copy transaction ID"
                            className="text-[#4d5b6e] transition-colors hover:text-[#3DDBA9]"
                          >
                            <Copy className="h-[0.65rem] w-[0.65rem]" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={
                            "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[20px] border px-3 py-1 text-[0.68rem] font-bold " +
                            st.cls
                          }
                        >
                          <span
                            className={"h-[5px] w-[5px] rounded-full " + st.dot}
                          />
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-2.5 py-3.5 sm:flex-row">
          <div className="text-[0.72rem] text-[#6b7a90]">
            Showing{" "}
            <strong className="text-[#eef2f7]">
              {showFrom}-{showTo}
            </strong>{" "}
            of{" "}
            <strong className="text-[#eef2f7]">{filtered.length}</strong>{" "}
            transactions
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-[0.72rem] text-[#6b7a90] transition-colors hover:bg-white/[0.08] hover:text-[#eef2f7] disabled:pointer-events-none disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(
                1,
                Math.min(currentPage - 2, totalPages - 4),
              );
              const num = start + i;
              if (num > totalPages) return null;
              const active = num === currentPage;
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={
                    "flex h-[34px] w-[34px] items-center justify-center rounded-lg border text-[0.72rem] font-semibold transition-colors " +
                    (active
                      ? "border-[rgba(61,219,169,0.18)] bg-[rgba(61,219,169,0.1)] text-[#3DDBA9] font-bold"
                      : "border-white/[0.06] bg-white/[0.04] text-[#6b7a90] hover:bg-white/[0.08] hover:text-[#eef2f7]")
                  }
                >
                  {num}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-[0.72rem] text-[#6b7a90] transition-colors hover:bg-white/[0.08] hover:text-[#eef2f7] disabled:pointer-events-none disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
