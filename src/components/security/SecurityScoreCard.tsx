import { ShieldCheck } from "lucide-react";
import useUserStore from "@/store/userStore";

export function SecurityScoreCard() {
  const user = useUserStore((state) => state.user);
  const isVerified = user?.verification_status === "approved";

  // Recommendation items derived from real user state. Each renders as a
  // bullet only when not satisfied (matches settings.html reference).
  const items = [
    { label: "Enable 2FA authentication", satisfied: false },
    { label: "Complete KYC verification", satisfied: isVerified },
    { label: "Set up anti-phishing code", satisfied: false },
  ];
  const recommendations = items.filter((i) => !i.satisfied);

  return (
    <section
      className="relative mb-[18px] overflow-hidden rounded-2xl border p-6 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
      style={{
        borderColor: "rgba(0, 223, 162, 0.08)",
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-[18px]">
        <div
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[14px]"
          style={{
            background: "rgba(0, 223, 162, 0.08)",
            color: "#00dfa2",
          }}
        >
          <ShieldCheck className="h-[1.15rem] w-[1.15rem]" />
        </div>

        <div className="min-w-0">
          <div className="font-[Outfit,sans-serif] text-[1.05rem] font-extrabold text-[#eef2f7]">
            Your Security Score
          </div>
          <p className="mt-[2px] text-[0.75rem] text-[#4a5468]">
            Enable all security features for maximum protection
          </p>

          {recommendations.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {recommendations.map((r) => (
                <span
                  key={r.label}
                  className="flex items-center gap-[7px] text-[0.7rem] text-[#8b97a8]"
                >
                  <span
                    className="block h-[0.4rem] w-[0.4rem] rounded-full"
                    style={{ background: "#FF9800" }}
                  />
                  {r.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
