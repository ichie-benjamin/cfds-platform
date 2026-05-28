import { Globe, Coins, Languages } from "lucide-react";
import { CurrencySelector } from "@/components/settings/currency-selector";
import { LanguageSelector } from "@/components/settings/language-selector";

/**
 * LocalizationSection — visual wrapper that matches the reference design
 * for the "Localization" section. Internally reuses the EXISTING
 * CurrencySelector and LanguageSelector components verbatim — no logic
 * is modified.
 */
export function LocalizationSection({
  currencyAnchorId,
  languageAnchorId,
}: {
  currencyAnchorId?: string;
  languageAnchorId?: string;
}) {
  return (
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
        <Globe className="h-3.5 w-3.5 text-[#00dfa2]" />
        <h3 className="flex-1 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
          Localization
        </h3>
      </div>

      {/* Currency */}
      <div id={currencyAnchorId} className="relative z-10 scroll-mt-20">
        <div className="mb-3.5 flex items-center gap-1.5">
          <Coins className="h-[0.55rem] w-[0.55rem] text-[#00dfa2]" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
            Dashboard Currency
          </span>
        </div>
        <CurrencySelector />
      </div>

      {/* Language */}
      <div id={languageAnchorId} className="relative z-10 mt-[22px] scroll-mt-20">
        <div className="mb-3.5 flex items-center gap-1.5">
          <Languages className="h-[0.55rem] w-[0.55rem] text-[#00dfa2]" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">
            Dashboard Language
          </span>
        </div>
        <LanguageSelector />
      </div>
    </section>
  );
}
