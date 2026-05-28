import { ShieldAlert, Globe, Coins } from "lucide-react";

interface SettingsUserCardProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string | null;
  planTitle?: string;
  verificationStatus?: string;
  onSecurity: () => void;
  onLanguage: () => void;
  onCurrency: () => void;
}

export function SettingsUserCard({
  firstName,
  lastName,
  email,
  avatar,
  planTitle,
  verificationStatus,
  onSecurity,
  onLanguage,
  onCurrency,
}: SettingsUserCardProps) {
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || "User Account";
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "UA";
  const isVerified = verificationStatus === "verified" || verificationStatus === "approved";

  return (
    <div
      className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.06] p-5 sm:flex-row sm:items-center sm:p-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      {/* Subtle inner highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg, rgba(255,255,255,0.025), transparent 40%)",
        }}
      />

      {/* Avatar */}
      <div className="relative z-10 flex shrink-0 items-center justify-center">
        <div
          className="relative grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,223,162,0.18), rgba(0,223,162,0.08))",
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-[Outfit,sans-serif] text-[1.05rem] font-black tracking-tight text-[#00dfa2]">
              {initials}
            </span>
          )}
          {/* Status dot */}
          <span
            className="absolute bottom-[2px] right-[2px] h-[11px] w-[11px] rounded-full border-2 border-[#0a0d15] bg-[#00dfa2]"
            style={{ boxShadow: "0 0 8px rgba(0,223,162,0.5)" }}
          />
        </div>
      </div>

      {/* Identity */}
      <div className="relative z-10 min-w-0 flex-1">
        <div className="truncate font-[Outfit,sans-serif] text-[1rem] font-bold text-[#eef2f7]">
          {fullName}
        </div>
        <div className="truncate text-[0.72rem] text-[#4a5468]">
          {email || "—"}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#00dfa2]/[0.08] px-2.5 py-[3px] text-[0.57rem] font-bold uppercase tracking-[0.04em] text-[#00dfa2]">
            {planTitle || "Basic Plan"}
          </span>
          <span
            className={`rounded-full px-2.5 py-[3px] text-[0.57rem] font-bold uppercase tracking-[0.04em] ${
              isVerified
                ? "bg-[#00dfa2]/[0.08] text-[#00dfa2]"
                : "bg-[#FF9800]/[0.08] text-[#FF9800]"
            }`}
          >
            {isVerified ? "Verified" : "Incomplete"}
          </span>
        </div>
      </div>

      {/* Quick action tiles */}
      <div className="relative z-10 flex gap-2.5 sm:ml-auto">
        <QuickTile icon={<ShieldAlert className="h-4 w-4" />} label="Security" onClick={onSecurity} />
        <QuickTile icon={<Globe className="h-4 w-4" />} label="Language" onClick={onLanguage} />
        <QuickTile icon={<Coins className="h-4 w-4" />} label="Currency" onClick={onCurrency} />
      </div>
    </div>
  );
}

function QuickTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[44px] w-[44px] flex-col items-center justify-center gap-[3px] rounded-xl border border-white/[0.06] bg-white/[0.035] text-[#4a5468] transition-all hover:border-[#00dfa2]/20 hover:bg-[#00dfa2]/[0.08] hover:text-[#00dfa2]"
      aria-label={label}
    >
      <span className="leading-none">{icon}</span>
      <span className="text-[0.42rem] font-bold uppercase tracking-[0.04em]">
        {label}
      </span>
    </button>
  );
}

