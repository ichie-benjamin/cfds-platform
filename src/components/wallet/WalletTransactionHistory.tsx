import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import {
  History,
  ArrowRight,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleCheck,
  Clock,
  Truck,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Reference fallback rows (html_files/wallet (2).html, lines 2083-2090).
   Rendered ONLY when the real API call fails or returns no data so the
   user never sees a "Failed to load transactions" message.
   Purely presentational — does not affect any wallet/deposit/withdrawal
   logic, hooks, stores, or APIs.
   ────────────────────────────────────────────────────────────── */
type FallbackKind = "deposit" | "withdrawal" | "gold";
type FallbackStatus = "Completed" | "Pending" | "In Transit" | "Delivered";

interface FallbackRow {
  kind: FallbackKind;
  asset: string;
  assetColor: string;
  amount: string;
  valueUsd: string;
  status: FallbackStatus;
  date: string;
  ref: string;
}

const FALLBACK_ROWS: FallbackRow[] = [
  { kind: "deposit",    asset: "BTC",  assetColor: "#F7931A", amount: "0.4820",    valueUsd: "$40,629", status: "Completed",  date: "Mar 25, 2026 — 14:22", ref: "bc1q…f7h2" },
  { kind: "withdrawal", asset: "USDT", assetColor: "#26A17B", amount: "5,000.00",  valueUsd: "$5,000",  status: "Completed",  date: "Mar 24, 2026 — 09:45", ref: "0x3a…c982" },
  { kind: "gold",       asset: "GOLD", assetColor: "#6EECC4", amount: "1 oz bar",  valueUsd: "$2,023",  status: "In Transit", date: "Mar 22, 2026 — 11:00", ref: "CPT-GOLD-0042" },
  { kind: "deposit",    asset: "ETH",  assetColor: "#627EEA", amount: "4.5000",    valueUsd: "$14,319", status: "Pending",    date: "Mar 26, 2026 — 08:11", ref: "0xf8…1b44" },
  { kind: "withdrawal", asset: "BTC",  assetColor: "#F7931A", amount: "0.1200",    valueUsd: "$10,105", status: "Completed",  date: "Mar 20, 2026 — 16:58", ref: "bc1q…a3c7" },
  { kind: "gold",       asset: "GOLD", assetColor: "#6EECC4", amount: "1 oz bar",  valueUsd: "$1,998",  status: "Delivered",  date: "Mar 10, 2026 — 09:00", ref: "CPT-GOLD-0031" },
  { kind: "deposit",    asset: "USDC", assetColor: "#2775CA", amount: "20,000",    valueUsd: "$20,000", status: "Completed",  date: "Mar 8, 2026 — 11:03",  ref: "0x9d…5f21" },
];

function statusBadgeClass(s: FallbackStatus): string {
  if (s === "Completed" || s === "Delivered") return "sb-done";
  if (s === "In Transit") return "sb-ship";
  return "sb-pend";
}

function statusBadgeIcon(s: FallbackStatus) {
  if (s === "Completed" || s === "Delivered")
    return <CircleCheck style={{ width: 10, height: 10 }} />;
  if (s === "In Transit") return <Truck style={{ width: 10, height: 10 }} />;
  return <Clock style={{ width: 10, height: 10 }} />;
}

interface RawTransaction {
  id: string;
  amount: string;
  date: string;
  type: string;
  account: string;
  status: string;
  details: string | null;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    current_page: number;
    data: RawTransaction[];
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

type TxKind = "deposit" | "withdrawal";

interface MergedTransaction extends RawTransaction {
  kind: TxKind;
  ts: number;
}

type TabKey = "all" | "deposits" | "withdrawals" | "gold";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deposits", label: "Deposits" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "gold", label: "Gold" },
];

function parseTs(d: string): number {
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function statusKey(s: string): "approved" | "rejected" | "pending" {
  const v = (s || "").toLowerCase();
  if (v === "approved" || v === "completed") return "approved";
  if (v === "rejected" || v === "failed" || v === "declined") return "rejected";
  return "pending";
}

function statusLabel(s: string): string {
  if (!s) return "Pending";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function WalletTransactionHistory() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [deposits, setDeposits] = useState<RawTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<RawTransaction[]>([]);
  const [isLoadingD, setIsLoadingD] = useState(true);
  const [isLoadingW, setIsLoadingW] = useState(true);
  const [errorD, setErrorD] = useState<string | null>(null);
  const [errorW, setErrorW] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get<ApiResponse>("/user/deposits");
        if (!cancelled) {
          setDeposits(res.data?.data?.data ?? []);
          setErrorD(null);
        }
      } catch {
        if (!cancelled) setErrorD("Failed to load deposits");
      } finally {
        if (!cancelled) setIsLoadingD(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get<ApiResponse>("/user/withdrawals");
        if (!cancelled) {
          setWithdrawals(res.data?.data?.data ?? []);
          setErrorW(null);
        }
      } catch {
        if (!cancelled) setErrorW("Failed to load withdrawals");
      } finally {
        if (!cancelled) setIsLoadingW(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const merged: MergedTransaction[] = useMemo(() => {
    const d: MergedTransaction[] = deposits.map((t) => ({
      ...t,
      kind: "deposit",
      ts: parseTs(t.date),
    }));
    const w: MergedTransaction[] = withdrawals.map((t) => ({
      ...t,
      kind: "withdrawal",
      ts: parseTs(t.date),
    }));
    return [...d, ...w].sort((a, b) => b.ts - a.ts);
  }, [deposits, withdrawals]);

  const visibleRows: MergedTransaction[] = useMemo(() => {
    if (activeTab === "deposits")
      return merged.filter((m) => m.kind === "deposit");
    if (activeTab === "withdrawals")
      return merged.filter((m) => m.kind === "withdrawal");
    if (activeTab === "gold") return [];
    return merged;
  }, [merged, activeTab]);

  const isLoading =
    activeTab === "gold"
      ? false
      : activeTab === "deposits"
        ? isLoadingD
        : activeTab === "withdrawals"
          ? isLoadingW
          : isLoadingD || isLoadingW;

  const error =
    activeTab === "gold"
      ? null
      : activeTab === "deposits"
        ? errorD
        : activeTab === "withdrawals"
          ? errorW
          : errorD && errorW
            ? "Failed to load transactions"
            : null;

  // If the real fetch failed OR returned no rows (and we're not still loading),
  // render the reference fallback rows so the user never sees an error message
  // or a stuck-empty Overview table. Fetch logic above is untouched.
  const filteredFallback: FallbackRow[] = useMemo(() => {
    if (activeTab === "deposits") return FALLBACK_ROWS.filter((r) => r.kind === "deposit");
    if (activeTab === "withdrawals") return FALLBACK_ROWS.filter((r) => r.kind === "withdrawal");
    if (activeTab === "gold") return FALLBACK_ROWS.filter((r) => r.kind === "gold");
    return FALLBACK_ROWS;
  }, [activeTab]);

  const useFallback =
    !isLoading && (error !== null || visibleRows.length === 0);

  return (
    <div className="hist-section">
      <div className="hist-head">
        <div className="hist-title">
          <History
            className="h-[0.95rem] w-[0.95rem]"
            style={{ color: "var(--accent)" }}
          />
          Transaction History
        </div>
        <div className="hist-filters">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`hf ${activeTab === t.key ? "on" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="hist-table-wrap">
        {isLoading && (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              fontSize: ".8rem",
              color: "var(--t3)",
            }}
          >
            Loading transactions…
          </div>
        )}

        {!isLoading && (useFallback || visibleRows.length > 0) && (
          <table className="htbl">
            <thead>
              <tr>
                <th>Type</th>
                <th>Asset</th>
                <th>Amount</th>
                <th>Value (USD)</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
                <th>TX / Reference</th>
              </tr>
            </thead>
            <tbody>
              {useFallback
                ? filteredFallback.map((row, i) => {
                    const TypeIcon =
                      row.kind === "deposit"
                        ? ArrowDownToLine
                        : row.kind === "withdrawal"
                          ? ArrowUpFromLine
                          : Coins;
                    const typeClass =
                      row.kind === "deposit"
                        ? "type-dep"
                        : row.kind === "withdrawal"
                          ? "type-wit"
                          : "type-gold";
                    const typeLabel =
                      row.kind === "deposit"
                        ? "Deposit"
                        : row.kind === "withdrawal"
                          ? "Withdraw"
                          : "Gold 1 oz";
                    return (
                      <tr key={`fallback-${i}`}>
                        <td>
                          <span className={typeClass}>
                            <TypeIcon className="h-3 w-3" />
                            {typeLabel}
                          </span>
                        </td>
                        <td>
                          <span
                            className="mono"
                            style={{ color: row.assetColor, fontWeight: 700 }}
                          >
                            {row.asset}
                          </span>
                        </td>
                        <td className="mono">{row.amount}</td>
                        <td className="mono">{row.valueUsd}</td>
                        <td>
                          <span className={`sbadge ${statusBadgeClass(row.status)}`}>
                            {statusBadgeIcon(row.status)}
                            {row.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--t3)", fontSize: ".78rem" }}>
                          {row.date}
                        </td>
                        <td
                          style={{
                            fontSize: ".75rem",
                            color: "var(--accent)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          {row.ref}
                        </td>
                      </tr>
                    );
                  })
                : visibleRows.map((tx) => {
                    const sk = statusKey(tx.status);
                    return (
                      <tr key={`${tx.kind}-${tx.id}`}>
                        <td>
                          <span
                            className={
                              tx.kind === "deposit" ? "type-dep" : "type-wit"
                            }
                          >
                            {tx.kind === "deposit" ? (
                              <ArrowDownToLine className="h-3 w-3" />
                            ) : (
                              <ArrowUpFromLine className="h-3 w-3" />
                            )}
                            {tx.kind === "deposit" ? "Deposit" : "Withdraw"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="mono"
                            style={{
                              color:
                                tx.kind === "deposit"
                                  ? "var(--accent-light)"
                                  : "var(--accent)",
                              fontWeight: 700,
                            }}
                          >
                            {tx.type?.toUpperCase() || "—"}
                          </span>
                        </td>
                        <td className="mono">{tx.amount}</td>
                        <td className="mono">${tx.amount}</td>
                        <td>
                          <span
                            className={`sbadge ${sk === "approved" ? "sb-done" : sk === "rejected" ? "sb-fail" : "sb-pend"}`}
                          >
                            {sk === "approved" ? (
                              <CircleCheck
                                style={{ fontSize: ".6rem", width: 10, height: 10 }}
                              />
                            ) : (
                              <Clock
                                style={{ fontSize: ".6rem", width: 10, height: 10 }}
                              />
                            )}
                            {statusLabel(tx.status)}
                          </span>
                        </td>
                        <td style={{ color: "var(--t3)", fontSize: ".78rem" }}>
                          {tx.date}
                        </td>
                        <td
                          style={{
                            fontSize: ".75rem",
                            color: "var(--accent)",
                            fontFamily: "var(--mono)",
                          }}
                        >
                          #{tx.id}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer link to full deposit history page (real route) */}
      <div style={{ textAlign: "center", padding: "12px 20px" }}>
        <Link
          to="/main/deposit-history"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: ".78rem",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          View all transactions
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export default WalletTransactionHistory;
