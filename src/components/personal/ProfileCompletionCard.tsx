import { Check, X, ListChecks } from "lucide-react";

interface ProfileFields {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country?: string | null;
  address?: string | null;
  birth_date?: string;
  avatar?: string | null;
}

interface ProfileCompletionCardProps {
  fields: ProfileFields;
}

const FIELD_LABELS: { key: keyof ProfileFields; label: string }[] = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "country", label: "Country" },
  { key: "address", label: "Address" },
  { key: "birth_date", label: "Date of Birth" },
  { key: "avatar", label: "Profile Photo" },
];

function isFilled(value: string | null | undefined) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function ProfileCompletionCard({ fields }: ProfileCompletionCardProps) {
  const filledCount = FIELD_LABELS.filter(({ key }) => isFilled(fields[key])).length;
  const total = FIELD_LABELS.length;
  const percent = Math.round((filledCount / total) * 100);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] px-5 py-5 sm:px-6"
      style={{
        background:
          "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      {/* Soft inner highlight (matches .gc::before) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(175deg,rgba(255,255,255,0.025),transparent 40%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <ListChecks className="h-3 w-3 text-[#00dfa2]" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
            Profile Checklist
          </span>
        </div>
        <span className="font-[Outfit,sans-serif] text-[0.78rem] font-extrabold tabular-nums text-[#eef2f7]">
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mb-[18px] h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg,#00dfa2,#00ffc3)",
          }}
        />
      </div>

      {/* Items grid: 1 → 2 → 4 cols, gap 10px */}
      <div className="relative z-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {FIELD_LABELS.map(({ key, label }) => {
          const filled = isFilled(fields[key]);
          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-colors ${
                filled
                  ? "border-[#00dfa2]/10 bg-[#00dfa2]/[0.03]"
                  : "border-[#f43f5e]/10 bg-[#f43f5e]/[0.03]"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  filled
                    ? "bg-[#00dfa2]/[0.08] text-[#00dfa2]"
                    : "bg-[#f43f5e]/[0.08] text-[#f43f5e]"
                }`}
              >
                {filled ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <X className="h-3 w-3" strokeWidth={3} />
                )}
              </span>
              <span
                className={`text-[0.74rem] font-semibold leading-tight ${
                  filled ? "text-[#00dfa2]" : "text-[#f43f5e]"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
