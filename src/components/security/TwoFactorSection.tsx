import { Key, Smartphone, Mail } from "lucide-react";

interface TfaCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function TfaCard({ title, description, icon: Icon }: TfaCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-[18px] py-[22px] text-center"
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

      {/* Icon chip */}
      <div
        className="relative z-10 mx-auto mb-3 grid h-11 w-11 place-items-center rounded-[12px] border border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.035)", color: "#00dfa2" }}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="relative z-10 mb-1 font-[Outfit,sans-serif] text-[0.88rem] font-bold text-[#eef2f7]">
        {title}
      </div>
      <p className="relative z-10 mx-auto mb-3 max-w-[24ch] text-[0.68rem] leading-[1.5] text-[#4a5468]">
        {description}
      </p>

      {/* Status badge */}
      <div
        className="relative z-10 mx-auto mb-3.5 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-[3px] text-[0.62rem] font-bold"
        style={{
          background: "rgba(244,63,94,0.08)",
          color: "#f43f5e",
        }}
      >
        <span className="block h-[5px] w-[5px] rounded-full bg-[#f43f5e]" />
        <span>Disabled</span>
      </div>

      <button
        type="button"
        disabled
        className="relative z-10 w-full cursor-not-allowed rounded-lg border px-2 py-[9px] text-[0.76rem] font-semibold transition-colors"
        style={{
          borderColor: "rgba(0,223,162,0.2)",
          color: "#00dfa2",
          background: "transparent",
          opacity: 0.6,
        }}
      >
        Coming Soon
      </button>
    </div>
  );
}

export function TwoFactorSection() {
  return (
    <section className="mb-[18px]">
      <div className="mb-4 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
        <Key className="h-[0.55rem] w-[0.55rem]" />
        Two-Factor Authentication
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <TfaCard
          title="Google Authenticator"
          description="Use Google Authenticator for 2FA. Provides the highest level of security."
          icon={Key}
        />
        <TfaCard
          title="SMS Authentication"
          description="Receive verification codes via SMS to your registered phone number."
          icon={Smartphone}
        />
        <TfaCard
          title="Email Authentication"
          description="Receive verification codes via email for account actions and logins."
          icon={Mail}
        />
      </div>
    </section>
  );
}
