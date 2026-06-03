import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Tag,
  Zap,
  Droplets,
  ShieldCheck,
  Lock,
  X,
  CreditCard,
} from "lucide-react";

/* Mirrors the working Bank Wire (ExchangePartners) selection pattern, with
 * card-platform wording and providers taken verbatim from
 * html_files/wallet (2).html (card-platform-cards section). No backend
 * calls — the modal opens the provider site in a new tab, identical to
 * the Bank Wire pattern's submitPurchase() redirect. */

type SortMode = "popular" | "fee" | "speed";

interface CardProvider {
  name: string;
  abbr: string;
  color: string;
  textColor: string;
  type: string;
  cardFee: string;
  cardFeeNum: number;
  minAmount: string;
  processing: string;
  processingRank: number;
  totalCost: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  badgeIcon: React.ReactNode;
  popularRank: number;
  url: string;
  siteHost: string;
  payMethods: ("VISA" | "MC" | "AMEX" | "PAY")[];
}

const PROVIDERS: CardProvider[] = [
  {
    name: "Coinbase",
    abbr: "CB",
    color: "#1652F0",
    textColor: "#fff",
    type: "Card Purchase Platform",
    cardFee: "2.49%",
    cardFeeNum: 2.49,
    minAmount: "$2",
    processing: "Instant",
    processingRank: 1,
    totalCost: "$5,124.50",
    badge: "Most Popular",
    badgeBg: "rgba(0,223,162,0.12)",
    badgeColor: "#00dfa2",
    badgeIcon: <Flame className="h-2.5 w-2.5" />,
    popularRank: 1,
    url: "https://www.coinbase.com",
    siteHost: "coinbase.com",
    payMethods: ["VISA", "MC", "AMEX"],
  },
  {
    name: "Kraken",
    abbr: "KR",
    color: "#5741D9",
    textColor: "#fff",
    type: "Card Purchase Platform",
    cardFee: "1.50%",
    cardFeeNum: 1.5,
    minAmount: "$10",
    processing: "Instant",
    processingRank: 1,
    totalCost: "$5,075.00",
    badge: "Lowest Fee",
    badgeBg: "rgba(200,230,78,0.12)",
    badgeColor: "#c8e64e",
    badgeIcon: <Tag className="h-2.5 w-2.5" />,
    popularRank: 2,
    url: "https://www.kraken.com",
    siteHost: "kraken.com",
    payMethods: ["VISA", "MC"],
  },
  {
    name: "Binance",
    abbr: "BN",
    color: "#F3BA2F",
    textColor: "#1A1A2E",
    type: "Card Purchase Platform",
    cardFee: "1.80%",
    cardFeeNum: 1.8,
    minAmount: "$15",
    processing: "Instant",
    processingRank: 1,
    totalCost: "$5,090.00",
    badge: "Best Liquidity",
    badgeBg: "rgba(74,144,226,0.12)",
    badgeColor: "#4A90E2",
    badgeIcon: <Droplets className="h-2.5 w-2.5" />,
    popularRank: 3,
    url: "https://www.binance.com",
    siteHost: "binance.com",
    payMethods: ["VISA", "MC"],
  },
  {
    name: "MoonPay",
    abbr: "MP",
    color: "#7B2BF9",
    textColor: "#fff",
    type: "Card Purchase Platform",
    cardFee: "3.80%",
    cardFeeNum: 3.8,
    minAmount: "$30",
    processing: "~5 min",
    processingRank: 3,
    totalCost: "$5,190.00",
    badge: "Apple Pay",
    badgeBg: "rgba(255,255,255,0.06)",
    badgeColor: "#C8D4E8",
    badgeIcon: <ShieldCheck className="h-2.5 w-2.5" />,
    popularRank: 4,
    url: "https://www.moonpay.com",
    siteHost: "moonpay.com",
    payMethods: ["VISA", "MC", "AMEX", "PAY"],
  },
  {
    name: "Transak",
    abbr: "TR",
    color: "#12B3A8",
    textColor: "#fff",
    type: "Card Purchase Platform",
    cardFee: "0.99%",
    cardFeeNum: 0.99,
    minAmount: "$30",
    processing: "~2 min",
    processingRank: 2,
    totalCost: "$5,049.50",
    badge: "Lowest Fee",
    badgeBg: "rgba(200,230,78,0.12)",
    badgeColor: "#c8e64e",
    badgeIcon: <Tag className="h-2.5 w-2.5" />,
    popularRank: 5,
    url: "https://www.transak.com",
    siteHost: "transak.com",
    payMethods: ["VISA", "MC"],
  },
  {
    name: "Simplex",
    abbr: "SP",
    color: "#2A2A72",
    textColor: "#fff",
    type: "Card Purchase Platform",
    cardFee: "3.50%",
    cardFeeNum: 3.5,
    minAmount: "$50",
    processing: "~10 min",
    processingRank: 4,
    totalCost: "$5,175.00",
    badge: "High Limits",
    badgeBg: "rgba(255,107,26,0.12)",
    badgeColor: "#FF6B1A",
    badgeIcon: <Zap className="h-2.5 w-2.5" />,
    popularRank: 6,
    url: "https://www.simplex.com",
    siteHost: "simplex.com",
    payMethods: ["VISA", "MC", "AMEX"],
  },
];

// Match the Bank Wire (ExchangePartners) modal baseline so totalCost lines up.
const MODAL_BASE_AMOUNT = 5000;
const MODAL_CRYPTO_SYMBOL = "BTC";
const MODAL_CRYPTO_RATE = 84210;
const MODAL_CRYPTO_EST = (MODAL_BASE_AMOUNT / MODAL_CRYPTO_RATE).toFixed(4);

interface CardPlatformsProps {
  onBack?: () => void;
}

export function CardPlatforms({ onBack }: CardPlatformsProps) {
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [selectedProvider, setSelectedProvider] =
    useState<CardProvider | null>(null);
  const openConfirm = (p: CardProvider) => setSelectedProvider(p);
  const closeConfirm = () => setSelectedProvider(null);

  const sorted = useMemo(() => {
    const copy = [...PROVIDERS];
    switch (sortMode) {
      case "popular":
        return copy.sort((a, b) => a.popularRank - b.popularRank);
      case "fee":
        return copy.sort((a, b) => a.cardFeeNum - b.cardFeeNum);
      case "speed":
        return copy.sort((a, b) => a.processingRank - b.processingRank);
      default:
        return copy;
    }
  }, [sortMode]);

  const sortButtons: { mode: SortMode; label: string }[] = [
    { mode: "popular", label: "Most Popular" },
    { mode: "fee", label: "Lowest Fee" },
    { mode: "speed", label: "Fastest" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f1220]/70 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#00dfa2]/[0.05] blur-3xl" />

      <div className="relative">
        {/* Step header */}
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00ffc3] to-[#00dfa2] text-xs font-extrabold text-[#07080c] shadow-[0_4px_12px_rgba(0,223,162,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]">
            2
          </div>
          <div>
            <div className="text-sm font-extrabold text-white">
              Choose Purchase Platform
            </div>
            <div className="text-xs text-[#4a5468]">
              Select a trusted platform — you&apos;ll be redirected to complete
              your card purchase securely
            </div>
          </div>
        </div>

        {/* Sort tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {sortButtons.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              className={`rounded-lg border px-3.5 py-1.5 text-xs font-bold backdrop-blur-md transition-all duration-200 ${
                sortMode === mode
                  ? "border-[#00dfa2]/40 bg-[#00dfa2]/10 text-[#00dfa2] shadow-[0_0_0_1px_rgba(0,223,162,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]"
                  : "border-white/[0.06] bg-white/[0.02] text-[#4a5468] hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-[#8b97a8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Back button */}
        {onBack && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-bold text-[#8b97a8] backdrop-blur-md transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Change Method
            </button>
          </div>
        )}

        {/* Provider cards grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sorted.map((p) => (
            <div
              key={p.name}
              role="button"
              tabIndex={0}
              onClick={() => openConfirm(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openConfirm(p);
                }
              }}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0d15]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-[#0a0d15]/80 hover:shadow-[0_8px_24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,223,162,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              {/* Hover accent bar */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-transparent transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-[#00dfa2] group-hover:to-transparent" />

              {/* Card top */}
              <div
                className="flex items-center gap-2.5 border-b border-white/[0.05] px-4 py-3"
                style={{
                  background: `linear-gradient(135deg, ${p.color}14, ${p.color}06 55%, transparent)`,
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[13px] font-black tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)]"
                  style={{ background: p.color, color: p.textColor }}
                >
                  {p.abbr}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-extrabold text-white">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-[#4a5468]">{p.type}</div>
                </div>
                <span
                  className="flex items-center gap-1 rounded-full border border-white/[0.04] px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm"
                  style={{
                    background: p.badgeBg,
                    color: p.badgeColor,
                  }}
                >
                  {p.badgeIcon}
                  {p.badge}
                </span>
              </div>

              {/* Stats grid */}
              <div className="flex-1 px-4 py-3">
                <div className="mb-2.5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Card Fee", value: p.cardFee, highlight: true },
                    { label: "Min Amount", value: p.minAmount, highlight: false },
                    { label: "Processing", value: p.processing, highlight: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-md border px-1 py-2 text-center backdrop-blur-sm ${
                        item.highlight
                          ? "border-[#c8e64e]/15 bg-[#c8e64e]/[0.04]"
                          : "border-white/[0.04] bg-white/[0.02]"
                      }`}
                    >
                      <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
                        {item.label}
                      </div>
                      <div
                        className={`font-mono text-[13px] font-extrabold ${
                          item.highlight ? "text-[#c8e64e]" : "text-white"
                        }`}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment method badges */}
                <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                  {p.payMethods.map((m) => (
                    <PayBadge key={m} kind={m} />
                  ))}
                </div>

                {/* Total cost row */}
                <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                  <span className="text-[11px] text-[#4a5468]">
                    Total Est. Cost
                  </span>
                  <span className="font-mono text-sm font-extrabold text-white">
                    {p.totalCost}
                  </span>
                </div>
              </div>

              {/* Buy button */}
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirm(p);
                  }}
                  className="relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg px-4 py-2.5 text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_14px_rgba(0,0,0,0.25)] transition-all duration-200 hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_rgba(0,0,0,0.35)]"
                  style={{
                    background: `linear-gradient(180deg, ${p.color}, ${p.color}e6)`,
                    color: p.textColor,
                  }}
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
                  <CreditCard className="relative h-3.5 w-3.5" />
                  <span className="relative">Buy with {p.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProvider && (
        <PurchaseConfirmModal
          provider={selectedProvider}
          onClose={closeConfirm}
        />
      )}
    </div>
  );
}

function PayBadge({ kind }: { kind: "VISA" | "MC" | "AMEX" | "PAY" }) {
  if (kind === "VISA") {
    return (
      <span
        className="rounded-[3px] px-1.5 py-[1px] text-[0.55rem] font-black tracking-[0.05em] text-white"
        style={{ background: "#1A1F71" }}
      >
        VISA
      </span>
    );
  }
  if (kind === "MC") {
    return (
      <span
        className="rounded-[3px] border px-1.5 py-[1px] text-[0.55rem] font-black"
        style={{
          borderColor: "rgba(247,158,27,0.3)",
          background: "linear-gradient(90deg,#EB001B,#F79E1B)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        MC
      </span>
    );
  }
  if (kind === "AMEX") {
    return (
      <span
        className="rounded-[3px] px-1.5 py-[1px] text-[0.5rem] font-extrabold text-white"
        style={{ background: "#007BC1" }}
      >
        AMEX
      </span>
    );
  }
  return (
    <span
      className="rounded-[3px] border px-1.5 py-[1px] text-[0.5rem] font-bold text-[#C8D4E8]"
      style={{
        background: "rgba(255,255,255,0.1)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      Pay
    </span>
  );
}

function PurchaseConfirmModal({
  provider,
  onClose,
}: {
  provider: CardProvider;
  onClose: () => void;
}) {
  const handleContinue = () => {
    // Same safe redirect as the Bank Wire (ExchangePartners) pattern:
    // open the provider site in a new tab. No backend call.
    window.open(provider.url, "_blank", "noopener,noreferrer");
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-confirm-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
      style={{
        background: "rgba(0,0,0,.7)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        className="w-full overflow-hidden rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
        style={{
          background: "#141E38",
          border: "1.5px solid rgba(160,190,255,.12)",
          maxWidth: 480,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(160,190,255,.06)" }}
        >
          <div
            id="card-confirm-title"
            className="flex items-center gap-2 text-base font-extrabold text-white"
          >
            <ShieldCheck className="h-4 w-4" style={{ color: "#3DDBA9" }} />
            Confirm Purchase
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5"
            style={{ background: "none", border: "none", color: "#8898B8" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-5">
          {/* Selected provider card */}
          <div
            className="mb-5 flex items-center gap-3 rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(160,190,255,.06)",
            }}
          >
            <div
              className="grid h-12 w-12 place-items-center rounded-[10px] text-[0.9rem] font-black"
              style={{
                background: provider.color,
                color: provider.textColor,
              }}
            >
              {provider.abbr}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[1.05rem] font-extrabold text-white">
                {provider.name}
              </div>
              <div
                className="truncate text-[0.72rem]"
                style={{ color: "#8898B8" }}
              >
                {provider.siteHost}
              </div>
            </div>
          </div>

          {/* You Pay / You Receive */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <div
              className="rounded-[10px] p-3.5"
              style={{ background: "#1A2745" }}
            >
              <div
                className="mb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.06em]"
                style={{ color: "#8898B8" }}
              >
                You Pay
              </div>
              <div className="font-mono text-[1.2rem] font-extrabold text-white">
                ${MODAL_BASE_AMOUNT.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div
              className="rounded-[10px] p-3.5"
              style={{ background: "#1A2745" }}
            >
              <div
                className="mb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.06em]"
                style={{ color: "#8898B8" }}
              >
                You Receive (est.)
              </div>
              <div
                className="font-mono text-[1.2rem] font-extrabold"
                style={{ color: "#3DDBA9" }}
              >
                {MODAL_CRYPTO_EST} {MODAL_CRYPTO_SYMBOL}
              </div>
            </div>
          </div>

          {/* Fee summary */}
          <div
            className="mb-4 rounded-[10px] p-3.5"
            style={{ background: "#1A2745" }}
          >
            <div className="mb-2 flex justify-between">
              <span className="text-[0.75rem]" style={{ color: "#8898B8" }}>
                Card Fee
              </span>
              <span
                className="font-mono text-[0.75rem] font-bold"
                style={{ color: "#F0B429" }}
              >
                {provider.cardFee}
              </span>
            </div>
            <div className="mb-2 flex justify-between">
              <span className="text-[0.75rem]" style={{ color: "#8898B8" }}>
                Processing
              </span>
              <span className="font-mono text-[0.75rem] font-bold text-white">
                {provider.processing}
              </span>
            </div>
            <div
              className="flex justify-between pt-2"
              style={{ borderTop: "1px solid rgba(160,190,255,.08)" }}
            >
              <span className="text-[0.8rem] font-bold text-white">
                Total Cost
              </span>
              <span className="font-mono text-[0.8rem] font-extrabold text-white">
                {provider.totalCost}
              </span>
            </div>
          </div>

          {/* Secure redirect note */}
          <div
            className="mb-4 flex items-center justify-center gap-1.5 text-center text-[0.68rem]"
            style={{ color: "#8898B8" }}
          >
            <Lock className="h-3 w-3" style={{ color: "#3DDBA9" }} />
            <span>
              You&apos;ll be securely redirected to{" "}
              <span className="font-bold text-white">{provider.name}</span> to
              complete your card purchase
            </span>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-2.5 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[10px] px-3 py-3 text-[0.85rem] font-bold"
            style={{
              background: "#1A2745",
              border: "1px solid rgba(160,190,255,.12)",
              color: "#C8D4E8",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 rounded-[10px] px-3 py-3 text-[0.85rem] font-bold"
            style={{
              flex: 2,
              background: "#3DDBA9",
              color: "#000",
              border: "none",
            }}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Continue to {provider.name}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
