import { Link } from "react-router-dom";
import {
  IdCard,
  AlertTriangle,
  Check,
  Upload,
  Gift,
  TrendingUp,
  Landmark,
  RefreshCw,
  Headphones,
} from "lucide-react";

interface VerificationOverviewProps {
  verificationStatus?: string;
}

export function VerificationOverviewCard({
  verificationStatus,
}: VerificationOverviewProps) {
  const isVerified =
    verificationStatus === "verified" || verificationStatus === "approved";

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Identity Verification card */}
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
          <IdCard className="h-3.5 w-3.5 text-[#00dfa2]" />
          <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
            Identity Verification
          </h3>
        </div>

        {/* Status banner */}
        <div
          className={`relative z-10 mb-[18px] flex items-center gap-2.5 rounded-lg border px-4 py-3 ${
            isVerified
              ? "border-[#00dfa2]/[0.12] bg-[#00dfa2]/[0.06]"
              : "border-[#FF9800]/[0.1] bg-[#FF9800]/[0.06]"
          }`}
        >
          <AlertTriangle
            className={`h-[0.8rem] w-[0.8rem] ${
              isVerified ? "text-[#00dfa2]" : "text-[#FF9800]"
            }`}
          />
          <div>
            <div
              className={`text-[0.78rem] font-bold ${
                isVerified ? "text-[#00dfa2]" : "text-[#FF9800]"
              }`}
            >
              {isVerified ? "VERIFIED" : "INCOMPLETE"}
            </div>
            <div className="text-[0.66rem] text-[#4a5468]">
              {isVerified
                ? "Your identity has been verified."
                : "Complete your KYC verification to unlock full platform features"}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="relative z-10 flex flex-col gap-2">
          <Step
            num={1}
            title="Personal Information"
            desc="Basic details confirmed"
            tone="done"
            badge="Complete"
          />
          <Step
            num={2}
            title="Government ID"
            desc="Upload a valid government-issued photo ID"
            tone={isVerified ? "done" : "pend"}
            badge={isVerified ? "Complete" : "Pending"}
            cta={
              !isVerified ? (
                <Link
                  to="/main/kyc"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#00dfa2]/20 px-3.5 py-1.5 text-[0.74rem] font-semibold text-[#00dfa2] transition-colors hover:bg-[#00dfa2]/[0.08]"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Link>
              ) : null
            }
          />
        </div>
      </section>

      {/* Benefits */}
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
          <Gift className="h-3.5 w-3.5 text-[#00dfa2]" />
          <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
            Verification Benefits
          </h3>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-2.5">
          <Benefit icon={<TrendingUp className="h-4 w-4 text-[#00dfa2]" />} label="Higher Limits" />
          <Benefit icon={<Landmark className="h-4 w-4 text-[#00dfa2]" />} label="Fiat Withdrawals" />
          <Benefit icon={<RefreshCw className="h-4 w-4 text-[#00dfa2]" />} label="P2P Trading" />
          <Benefit icon={<Headphones className="h-4 w-4 text-[#00dfa2]" />} label="Priority Support" />
        </div>
      </section>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
  tone,
  badge,
  cta,
}: {
  num: number;
  title: string;
  desc: string;
  tone: "done" | "pend";
  badge: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.035] px-[18px] py-4 transition-colors hover:border-white/[0.12]">
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold ${
          tone === "done"
            ? "bg-[#00dfa2]/[0.08] text-[#00dfa2]"
            : "bg-[#FF9800]/[0.08] text-[#FF9800]"
        }`}
      >
        {tone === "done" ? <Check className="h-3.5 w-3.5" /> : num}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.84rem] font-semibold text-[#eef2f7]">
          {title}
        </div>
        <div className="text-[0.68rem] text-[#4a5468]">{desc}</div>
      </div>
      <span
        className={`shrink-0 rounded-xl px-2.5 py-1 text-[0.58rem] font-bold ${
          tone === "done"
            ? "bg-[#1ED760]/[0.08] text-[#1ED760]"
            : "bg-[#FF9800]/[0.08] text-[#FF9800]"
        }`}
      >
        {badge}
      </span>
      {cta}
    </div>
  );
}

function Benefit({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.035] p-4 text-center transition-colors hover:border-white/[0.12]">
      {icon}
      <span className="text-[0.78rem] font-semibold text-[#eef2f7]">
        {label}
      </span>
    </div>
  );
}
