import { Coins, Inbox } from "lucide-react";

export function WalletAssetsPanel() {
  return (
    <div className="scard">
      <div className="scard-title">
        <Coins
          className="h-[0.85rem] w-[0.85rem]"
          style={{ color: "var(--accent)" }}
        />
        Portfolio Holdings
      </div>

      <div className="overflow-x-auto" style={{ position: "relative" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: ".82rem",
            minWidth: 640,
          }}
        >
          <thead>
            <tr>
              {[
                "Asset",
                "Balance",
                "Value (USD)",
                "Price",
                "24h Change",
                "Allocation",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    fontSize: ".66rem",
                    fontWeight: 700,
                    color: "var(--t4)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: "60px 16px" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      height: 52,
                      width: 52,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      border: "1px solid rgba(61,219,169,0.25)",
                      background: "rgba(61,219,169,0.08)",
                      color: "var(--accent)",
                    }}
                  >
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div
                    style={{
                      fontSize: ".95rem",
                      fontWeight: 800,
                      color: "var(--t1)",
                    }}
                  >
                    No assets yet
                  </div>
                  <div
                    style={{
                      maxWidth: 360,
                      fontSize: ".78rem",
                      lineHeight: 1.6,
                      color: "var(--t3)",
                    }}
                  >
                    Your portfolio holdings will appear here once you start
                    trading or making deposits.
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
