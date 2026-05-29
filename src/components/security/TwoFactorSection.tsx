import { ShieldCheck, XCircle } from "lucide-react";

interface TfaCardProps {
  title: string;
  description: string;
  meta?: string;
}

function TfaCard({ title, description, meta }: TfaCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.08)] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(0,223,162,0.02))",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,223,162,0.3), transparent)",
        }}
      />

      {/* card-header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="font-[Outfit,sans-serif] text-[16px] font-semibold text-[#eef2f7]">
          {title}
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.3px]"
          style={{
            background: "rgba(255, 71, 87, 0.15)",
            color: "#ff4757",
          }}
        >
          <XCircle className="h-3 w-3" /> Off
        </div>
      </div>

      <p className="mb-4 text-[13px] leading-[1.5] text-[#8b97a8]">
        {description}
      </p>

      {meta && (
        <div className="mb-4 flex items-center gap-2 text-[12px] text-[#4a5468]">
          {meta}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border-[1.5px] px-4 py-[8px] text-[13px] font-semibold opacity-60"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#eef2f7",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
}

export function TwoFactorSection() {
  return (
    <section className="mb-8">
      {/* section-header */}
      <div className="mb-5 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-[#00dfa2]" />
        <h2 className="flex-1 font-[Outfit,sans-serif] text-[18px] font-semibold text-[#eef2f7]">
          Two-Factor Authentication
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TfaCard
          title="Google Authenticator"
          description="Use Google Authenticator app for time-based one-time passwords (TOTP). Most secure 2FA method."
        />
        <TfaCard
          title="SMS Authentication"
          description="Receive one-time codes via SMS to your registered phone number."
        />
        <TfaCard
          title="Email Authentication"
          description="Receive verification links and codes at your registered email address."
        />
      </div>
    </section>
  );
}
