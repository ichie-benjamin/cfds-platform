import useCurrencyStore from "@/store/currencyStore";

interface ScRowProps {
  label: string;
  value: string;
}

function ScRow({ label, value }: ScRowProps) {
  return (
    <div
      className="flex items-center justify-between border-b py-2 text-[0.76rem] last:border-b-0"
      style={{ borderColor: "rgba(255,255,255,0.025)" }}
    >
      <span className="font-medium text-[#4a5468]">{label}</span>
      <span className="font-[JetBrains_Mono,monospace] text-[0.72rem] font-semibold text-[#eef2f7]">
        {value}
      </span>
    </div>
  );
}

export function CurrentPreferencesCard() {
  const selectedCurrencyCode = useCurrencyStore(
    (state) => state.selectedCurrencyCode
  );

  return (
    <div
      className="relative mb-3.5 overflow-hidden rounded-2xl border border-white/[0.06] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
      style={{
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

      <div className="relative z-10 mb-3.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
        Current Preferences
      </div>

      <div className="relative z-10">
        <ScRow label="Currency" value={selectedCurrencyCode} />
        <ScRow label="Language" value="English" />
        <ScRow label="Chart" value="Candlestick" />
        <ScRow label="Timeframe" value="1D" />
        <ScRow label="Order Type" value="Limit" />
      </div>
    </div>
  );
}
