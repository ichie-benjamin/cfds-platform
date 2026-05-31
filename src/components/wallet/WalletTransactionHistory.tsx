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
} from "lucide-react";

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

  const showEmpty = !isLoading && !error && visibleRows.length === 0;

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

        {!isLoading && error && (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              fontSize: ".8rem",
              color: "var(--red)",
            }}
          >
            {error}
          </div>
        )}

        {!isLoading && !error && activeTab === "gold" && (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div
              style={{
                margin: "0 auto 12px",
                width: 48,
                height: 48,
                borderRadius: "9999px",
                background: "rgba(61,219,169,0.1)",
                color: "var(--accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Coins className="h-5 w-5" />
            </div>
            <div
              style={{
                marginBottom: 4,
                fontSize: ".92rem",
                fontWeight: 800,
                color: "var(--t1)",
              }}
            >
              No gold transactions yet
            </div>
            <div
              style={{
                maxWidth: 420,
                margin: "0 auto",
                fontSize: ".78rem",
                color: "var(--t3)",
              }}
            >
              When you place a physical gold order, it will appear here with
              full delivery and serial-number tracking.
            </div>
          </div>
        )}

        {showEmpty && activeTab !== "gold" && (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              fontSize: ".8rem",
              color: "var(--t3)",
            }}
          >
            No transactions found.
          </div>
        )}

        {!isLoading && !error && visibleRows.length > 0 && (
          <table className="htbl">
            <thead>
              <tr>
                <th>Type</th>
                <th>Asset</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((tx) => {
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
