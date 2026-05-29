import { UserAccount } from "@/store/userStore";

interface AccountsTableProps {
  accounts: UserAccount[];
}

export function AccountsTable({ accounts }: AccountsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Account", "Type", "Balance", "Currency", "Status"].map((h) => (
              <th
                key={h}
                className="border-b border-white/[0.06] px-4 py-3.5 text-left text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#3a4556]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, i) => (
            <tr
              key={account.type}
              className="transition-colors hover:bg-white/[0.025]"
              style={{
                background: i % 2 === 1 ? "rgba(255,255,255,0.01)" : undefined,
              }}
            >
              <td
                className="border-b px-4 py-4 align-middle"
                style={{ borderColor: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-[0.84rem] font-semibold text-[#eef2f7]">
                  {account.title}
                </span>
              </td>
              <td
                className="border-b px-4 py-4 align-middle"
                style={{ borderColor: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-[0.78rem] font-medium capitalize text-[#8b97a8]">
                  {account.type}
                </span>
              </td>
              <td
                className="border-b px-4 py-4 align-middle"
                style={{ borderColor: "rgba(255,255,255,0.03)" }}
              >
                <span className="font-[JetBrains_Mono,monospace] text-[0.88rem] font-bold text-[#eef2f7]">
                  ${account.balance}
                </span>
              </td>
              <td
                className="border-b px-4 py-4 align-middle"
                style={{ borderColor: "rgba(255,255,255,0.03)" }}
              >
                <span className="font-[JetBrains_Mono,monospace] text-[0.82rem] text-[#8b97a8]">
                  {account.currency}
                </span>
              </td>
              <td
                className="border-b px-4 py-4 align-middle"
                style={{ borderColor: "rgba(255,255,255,0.03)" }}
              >
                <StatusBadge status={account.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: UserAccount["status"] }) {
  const config = (() => {
    switch (status) {
      case "active":
        return {
          bg: "rgba(30,215,96,0.1)",
          color: "#1ED760",
          border: "rgba(30,215,96,0.2)",
          dot: "#1ED760",
          label: "Active",
        };
      case "inactive":
        return {
          bg: "rgba(139,151,168,0.1)",
          color: "#8b97a8",
          border: "rgba(139,151,168,0.2)",
          dot: "#8b97a8",
          label: "Inactive",
        };
      case "suspended":
        return {
          bg: "rgba(244,63,94,0.1)",
          color: "#f43f5e",
          border: "rgba(244,63,94,0.2)",
          dot: "#f43f5e",
          label: "Suspended",
        };
      default:
        return null;
    }
  })();

  if (!config) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[20px] border px-3 py-1 text-[0.7rem] font-bold"
      style={{
        background: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
    >
      <span
        className="h-[5px] w-[5px] rounded-full"
        style={{
          background: config.dot,
          boxShadow: `0 0 6px ${config.dot}`,
        }}
      />
      {config.label}
    </span>
  );
}
