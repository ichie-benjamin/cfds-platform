import { Shield } from "lucide-react";

const items = [
  "Enterprise-Grade Encryption",
  "All data encrypted at rest and in transit",
  "3D Glassmorphism Dark Theme",
];

export function TrustBadgesFooter() {
  return (
    <div
      className="mt-12 rounded-2xl border-[1.5px] p-8 text-center"
      style={{
        background: "rgba(0, 223, 162, 0.05)",
        borderColor: "rgba(0, 223, 162, 0.2)",
      }}
    >
      <div className="mb-4 flex items-center justify-center gap-3 text-[16px] font-bold text-[#eef2f7]">
        <Shield className="h-5 w-5 text-[#00dfa2]" />
        Security &amp; Trust
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center gap-2 text-[12px] text-[#8b97a8]"
          >
            <span
              className="grid h-5 w-5 place-items-center rounded-full text-[12px] font-bold"
              style={{
                background: "rgba(0, 223, 162, 0.15)",
                color: "#00dfa2",
              }}
            >
              ✓
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
