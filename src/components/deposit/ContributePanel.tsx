import { useState } from "react";
import {
  ArrowDownToLine,
  Wallet,
  Building2,
  CreditCard,
  ChevronRight,
  Bolt,
  Clock,
  ShieldCheck,
  X,
  Copy as CopyIcon,
  CircleCheck,
} from "lucide-react";
import useSiteSettingsStore from "@/store/siteSettingStore";
import useDataStore from "@/store/dataStore";
import CardFunding from "@/components/deposit-funds/CardFunding";
import { ExchangePartners } from "@/components/deposit/ExchangePartners";

type DepositMethod = "crypto" | "bank-wire" | "card" | null;

const BTC_DEPOSIT_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
const CRYPTO_NETWORKS = ["Bitcoin (BTC)", "Lightning", "ERC-20"] as const;
type CryptoNetwork = (typeof CRYPTO_NETWORKS)[number];

interface ContributePanelProps {
  onDepositSuccess?: () => void;
}

export function ContributePanel({ onDepositSuccess }: ContributePanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>(null);
  const [showFundingForm, setShowFundingForm] = useState(false);
  const { settings } = useSiteSettingsStore();
  const { deposit_config } = useDataStore();

  // Crypto deposit local UI state (presentational — no backend calls)
  const [selectedNetwork, setSelectedNetwork] =
    useState<CryptoNetwork>("Bitcoin (BTC)");
  const [depositAmount, setDepositAmount] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(BTC_DEPOSIT_ADDRESS)
        .then(() => {
          setAddressCopied(true);
          window.setTimeout(() => setAddressCopied(false), 2000);
        })
        .catch(() => {
          /* silent */
        });
    }
  };

  const cryptoEnabled = deposit_config?.crypto?.enabled !== false;
  const cardEnabled =
    deposit_config?.credit_card?.enabled !== false &&
    settings?.credit_card_deposit;

  const url = window.location.href.toLowerCase();
  const stepsCount: 3 | 4 =
    url.includes("fincapitalmarkets.org") ||
    url.includes("equitymarketspro.com")
      ? 4
      : 3;

  const handleMethodSelect = (method: DepositMethod) => {
    setSelectedMethod(method);
  };

  const handleProceed = () => {
    if (selectedMethod) {
      setShowFundingForm(true);
    }
  };

  const handleBack = () => {
    setShowFundingForm(false);
    setSelectedMethod(null);
  };

  // When a non-crypto funding sub-form is active, render it directly.
  // Crypto now uses an inline reference-style panel below — no Proceed step.
  if (showFundingForm && selectedMethod && selectedMethod !== "crypto") {
    // Bank-wire shows the exchange-partner selection screen
    if (selectedMethod === "bank-wire") {
      return <ExchangePartners onBack={handleBack} />;
    }

    return (
      <div className="scard">
        <div className='[&_[class*="bg-card"]]:!bg-transparent [&_[class*="bg-muted"]]:!bg-white/[0.04]'>
          <CardFunding
            onChangeMethod={handleBack}
            onClose={onDepositSuccess}
            onDepositSuccess={onDepositSuccess}
            stepsCount={stepsCount}
          />
        </div>
      </div>
    );
  }

  // Method-selection view (matches reference — Deposit Funds + dynamic panel as separate sections)
  const activeDotIndex =
    selectedMethod === "crypto"
      ? 0
      : selectedMethod === "bank-wire"
        ? 1
        : selectedMethod === "card"
          ? 2
          : -1;

  return (
    <>
      {/* ─── Section 1: Deposit Funds (method cards + step dots) ─── */}
      <div className="scard">
        <div className="scard-title">
          <ArrowDownToLine
            className="h-[0.85rem] w-[0.85rem]"
            style={{ color: "var(--accent)" }}
          />
          Deposit Funds
        </div>
        <div
          style={{
            fontSize: ".72rem",
            color: "var(--t3)",
            marginTop: "-6px",
            marginBottom: 10,
            position: "relative",
          }}
        >
          Choose how you want to add funds to your account
        </div>

        {/* Method Cards — horizontal 3-column grid */}
        <div className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {cryptoEnabled && (
            <MethodCard
              icon={<Wallet className="h-4 w-4" />}
              iconBg="rgba(61,219,169,0.1)"
              iconColor="var(--accent)"
              title="Crypto Deposit"
              desc="Send from external wallet"
              tag="Recommended"
              tagBg="rgba(61,219,169,0.1)"
              tagColor="var(--accent)"
              selected={selectedMethod === "crypto"}
              onClick={() => handleMethodSelect("crypto")}
            />
          )}
          <MethodCard
            icon={<Building2 className="h-4 w-4" />}
            iconBg="rgba(74,144,226,0.1)"
            iconColor="#4A90E2"
            title="Bank Wire Transfer"
            desc="Via trusted exchange partners"
            tag="Trusted Partners"
            tagBg="rgba(74,144,226,0.1)"
            tagColor="#4A90E2"
            selected={selectedMethod === "bank-wire"}
            onClick={() => handleMethodSelect("bank-wire")}
          />
          {cardEnabled && (
            <MethodCard
              icon={<CreditCard className="h-4 w-4" />}
              iconBg="rgba(74,144,226,0.1)"
              iconColor="#4A90E2"
              title="Credit / Debit Card"
              desc="Buy instantly via card"
              tag="Visa · MC · Amex"
              tagBg="rgba(74,144,226,0.1)"
              tagColor="#4A90E2"
              selected={selectedMethod === "card"}
              onClick={() => handleMethodSelect("card")}
            />
          )}
        </div>

        {/* Step dots (reference parity — active dot position reflects selected method) */}
        {selectedMethod && (
          <div className="mt-3.5 mb-0.5 flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) =>
              i === activeDotIndex ? (
                <span
                  key={i}
                  className="h-2 w-6 rounded-[4px] bg-[#3DDBA9] shadow-[0_0_8px_rgba(61,219,169,0.45)]"
                />
              ) : (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full border border-white/[0.10] bg-white/[0.10]"
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* ─── Section 2a: Choose Asset & Network (Crypto only) ─── */}
      {selectedMethod === "crypto" && (
        <div className="scard">
          <div className="mb-0.5 text-[0.82rem] font-extrabold text-[#eef2f7]">
            Choose Asset &amp; Network
          </div>
          <div className="mb-3 text-[0.7rem] leading-[1.5] text-[#6b7a90]">
            Select your cryptocurrency and network, then generate your deposit address
          </div>

          {/* Asset selector */}
          <div className="mb-3">
            <div className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.07em] text-[#6b7a90]">
              Cryptocurrency to Deposit
            </div>
            <div className="flex items-center gap-2.5 rounded-[8px] border border-white/[0.07] bg-[#0a0d15] px-3 py-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-extrabold"
                style={{ background: "rgba(247,147,26,0.13)", color: "#F7931A" }}
              >
                ₿
              </div>
              <div className="flex-1">
                <div className="text-[0.82rem] font-bold text-[#eef2f7]">BTC</div>
                <div className="text-[0.65rem] text-[#6b7a90]">Bitcoin</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[0.78rem] font-bold text-[#3DDBA9]">
                  1.4800 BTC
                </div>
                <div className="font-mono text-[0.62rem] text-[#6b7a90]">
                  ≈ $84,210
                </div>
              </div>
            </div>
          </div>

          {/* Network buttons */}
          <div className="mb-3">
            <div className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.07em] text-[#6b7a90]">
              Select Network
            </div>
            <div className="flex flex-wrap gap-2">
              {CRYPTO_NETWORKS.map((net) => {
                const active = selectedNetwork === net;
                return (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSelectedNetwork(net)}
                    className={`rounded-[8px] border px-3 py-2 text-[0.75rem] font-bold transition-all ${
                      active
                        ? "border-[#3DDBA9] bg-[rgba(61,219,169,0.10)] text-[#3DDBA9] shadow-[0_0_12px_rgba(61,219,169,0.15)]"
                        : "border-white/[0.08] bg-white/[0.025] text-[#a3adbf] hover:border-white/[0.18] hover:text-[#eef2f7]"
                    }`}
                  >
                    {net}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fee / time / confirmations info bar */}
          <div className="mb-3 grid grid-cols-3 gap-2 rounded-[8px] border border-[rgba(61,219,169,0.18)] bg-[rgba(61,219,169,0.04)] px-3 py-2.5">
            <div className="text-center">
              <div className="mb-0.5 flex items-center justify-center gap-1 text-[0.58rem] font-bold uppercase tracking-[0.06em] text-[#6b7a90]">
                <Bolt className="h-2.5 w-2.5 text-[#3DDBA9]" /> Network Fee
              </div>
              <div className="font-mono text-[0.74rem] font-extrabold text-[#eef2f7]">
                Free
              </div>
            </div>
            <div className="border-x border-white/[0.05] text-center">
              <div className="mb-0.5 flex items-center justify-center gap-1 text-[0.58rem] font-bold uppercase tracking-[0.06em] text-[#6b7a90]">
                <Clock className="h-2.5 w-2.5 text-[#3DDBA9]" /> Estimated Time
              </div>
              <div className="font-mono text-[0.74rem] font-extrabold text-[#eef2f7]">
                5 – 30 min
              </div>
            </div>
            <div className="text-center">
              <div className="mb-0.5 flex items-center justify-center gap-1 text-[0.58rem] font-bold uppercase tracking-[0.06em] text-[#6b7a90]">
                <ShieldCheck className="h-2.5 w-2.5 text-[#3DDBA9]" /> Confirmations
              </div>
              <div className="font-mono text-[0.74rem] font-extrabold text-[#eef2f7]">
                2 blocks
              </div>
            </div>
          </div>

          {/* Optional deposit amount */}
          <div className="mb-3">
            <div className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.07em] text-[#6b7a90]">
              Deposit Amount <span className="ml-1 normal-case text-[#4d5b6e]">(Optional)</span>
            </div>
            <div className="flex items-center rounded-[8px] border border-white/[0.08] bg-[#0a0d15] px-3 py-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 bg-transparent font-mono text-[0.82rem] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
              />
              <span className="ml-2 font-mono text-[0.72rem] font-bold text-[#6b7a90]">
                BTC
              </span>
            </div>
          </div>

          {/* Generate Deposit Address button */}
          <button
            type="button"
            onClick={() => setShowAddressModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 font-[Inter,sans-serif] text-[0.82rem] font-extrabold text-[#07080c] transition-all hover:-translate-y-px"
            style={{
              background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
              boxShadow:
                "0 4px 12px rgba(61,219,169,.25), inset 0 1px 1px rgba(255,255,255,.25)",
            }}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            Generate Deposit Address
          </button>
        </div>
      )}

      {/* ─── Section 2b: Configure Your Purchase (Bank Wire) ─── */}
      {selectedMethod === "bank-wire" && (
        <div className="scard">
          <div className="mb-0.5 text-[0.82rem] font-extrabold text-[#eef2f7]">
            Configure Your Purchase
          </div>
          <div className="mb-3 text-[0.7rem] leading-[1.5] text-[#6b7a90]">
            Enter amount and select which asset to receive
          </div>

          <ConfigurePurchaseForm
            kind="bank-wire"
            amount={depositAmount}
            onAmountChange={setDepositAmount}
            onContinue={handleProceed}
          />
        </div>
      )}

      {/* ─── Section 2c: Configure Your Purchase (Credit / Debit Card) ─── */}
      {selectedMethod === "card" && (
        <div className="scard">
          <div className="mb-0.5 text-[0.82rem] font-extrabold text-[#eef2f7]">
            Configure Your Purchase
          </div>
          <div className="mb-3 text-[0.7rem] leading-[1.5] text-[#6b7a90]">
            Enter amount and select which asset to receive
          </div>

          <ConfigurePurchaseForm
            kind="card"
            amount={depositAmount}
            onAmountChange={setDepositAmount}
            onContinue={handleProceed}
          />
        </div>
      )}

      {/* Generate Deposit Address modal (UI-only, no backend) */}
      {showAddressModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-address-modal-title"
          onClick={() => setShowAddressModal(false)}
          className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto px-5 py-10"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[16px]"
            style={{
              background:
                "linear-gradient(145deg,rgba(14,17,26,.98),rgba(10,13,21,.99))",
              border: "1.5px solid rgba(255,255,255,.08)",
              boxShadow: "0 24px 80px rgba(0,0,0,.6)",
            }}
          >
            {/* Top accent strip */}
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg,#1A9E78,#3DDBA9,#6EECC4,#3DDBA9)",
              }}
            />

            {/* Close */}
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7a90] transition-all hover:bg-white/[0.08] hover:text-[#eef2f7]"
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="p-6">
              <div className="mb-1.5 flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-extrabold"
                  style={{ background: "rgba(247,147,26,0.13)", color: "#F7931A" }}
                >
                  ₿
                </div>
                <div>
                  <h2
                    id="deposit-address-modal-title"
                    className="font-[Outfit,sans-serif] text-[1rem] font-extrabold leading-tight text-[#eef2f7]"
                  >
                    Generate Deposit Address
                  </h2>
                  <div className="text-[0.66rem] text-[#6b7a90]">
                    BTC · {selectedNetwork}
                  </div>
                </div>
              </div>

              {/* QR placeholder */}
              <div className="my-4 flex justify-center">
                <div
                  className="flex h-[160px] w-[160px] items-center justify-center rounded-[10px]"
                  style={{
                    background:
                      "repeating-conic-gradient(#eef2f7 0% 25%, #07080c 0% 50%) 50% / 16px 16px",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                  }}
                  aria-label="QR code placeholder"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#07080c] text-[1rem] font-extrabold text-[#F7931A]">
                    ₿
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.07em] text-[#6b7a90]">
                BTC Deposit Address
              </div>
              <div
                className="mb-3 flex items-center gap-2 rounded-[8px] px-3 py-2"
                style={{
                  background: "#0a0d15",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="flex-1 truncate font-mono text-[0.72rem] text-[#3DDBA9]">
                  {BTC_DEPOSIT_ADDRESS}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="flex shrink-0 items-center gap-1 rounded-[6px] px-2.5 py-1.5 text-[0.65rem] font-bold transition-all"
                  style={
                    addressCopied
                      ? {
                          background: "rgba(61,219,169,0.15)",
                          color: "#3DDBA9",
                          border: "1px solid rgba(61,219,169,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          color: "#a3adbf",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  {addressCopied ? (
                    <CircleCheck className="h-3 w-3" />
                  ) : (
                    <CopyIcon className="h-3 w-3" />
                  )}
                  {addressCopied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Notice */}
              <div
                className="mb-4 rounded-[8px] px-3 py-2.5 text-[0.7rem] leading-[1.5] text-[#a3adbf]"
                style={{
                  background: "rgba(232,169,77,0.06)",
                  border: "1px solid rgba(232,169,77,0.18)",
                }}
              >
                <strong className="text-[#E8A94D]">Important:</strong> Send only{" "}
                <strong className="text-[#eef2f7]">BTC via {selectedNetwork}</strong>{" "}
                to this address. Sending any other coin or network will result in
                permanent loss.
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-[10px] px-3 py-2.5 text-[0.78rem] font-bold text-[#eef2f7] transition-all"
                  style={{
                    background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                    color: "#07080c",
                    boxShadow:
                      "0 3px 12px rgba(61,219,169,.20), inset 0 1px 1px rgba(255,255,255,.25)",
                  }}
                >
                  I have sent the funds
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-[10px] px-3 py-2.5 text-[0.78rem] font-bold text-[#eef2f7] transition-all hover:bg-white/[0.06]"
                  style={{
                    background: "rgba(255,255,255,.035)",
                    border: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* Configure Your Purchase form — presentational, matches reference (bank-wire / card paths) */
function ConfigurePurchaseForm({
  kind,
  amount,
  onAmountChange,
  onContinue,
}: {
  kind: "bank-wire" | "card";
  amount: string;
  onAmountChange: (v: string) => void;
  onContinue: () => void;
}) {
  const [fiat, setFiat] = useState("USD");
  const [receive, setReceive] = useState("BTC");
  const RATES: Record<string, number> = {
    BTC: 84210,
    ETH: 3182,
    SOL: 182,
    XRP: 2.18,
    ADA: 0.74,
  };
  const amt = parseFloat(amount) || 5000;
  const rate = RATES[receive] ?? 1;
  const est = (amt / rate).toFixed(receive === "BTC" ? 4 : 2);
  const buttonLabel =
    kind === "bank-wire"
      ? "Continue to Exchange Partners"
      : "Continue to Card Platforms";

  return (
    <>
      <div className="mb-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.07em] text-[#6b7a90]">
            I want to deposit
          </label>
          <div className="flex items-stretch overflow-hidden rounded-[8px] border border-white/[0.07]">
            <input
              type="number"
              inputMode="decimal"
              placeholder="5,000"
              value={amount || ""}
              onChange={(e) => onAmountChange(e.target.value)}
              className="flex-1 bg-[#0a0d15] px-3 py-2 font-mono text-[0.82rem] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
            />
            <select
              value={fiat}
              onChange={(e) => setFiat(e.target.value)}
              className="min-w-[72px] cursor-pointer border-l border-white/[0.07] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-[0.78rem] font-bold text-[#eef2f7] outline-none"
              style={{ appearance: "none", WebkitAppearance: "none" }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[0.62rem] font-bold uppercase tracking-[0.07em] text-[#6b7a90]">
            I want to receive
          </label>
          <select
            value={receive}
            onChange={(e) => setReceive(e.target.value)}
            className="h-[calc(100%-22px)] w-full cursor-pointer rounded-[8px] border border-white/[0.07] bg-[#0a0d15] px-3 py-2 text-[0.82rem] font-semibold text-[#eef2f7] outline-none"
            style={{ appearance: "none", WebkitAppearance: "none" }}
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
            <option value="XRP">Ripple (XRP)</option>
            <option value="ADA">Cardano (ADA)</option>
          </select>
        </div>
      </div>

      {/* Estimated Receive */}
      <div
        className="mb-3 rounded-[8px] border border-[rgba(61,219,169,0.18)] bg-[rgba(61,219,169,0.04)] p-3"
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[#3DDBA9]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3DDBA9] shadow-[0_0_6px_#3DDBA9]" />
            Estimated Receive
          </span>
          <span className="text-[0.62rem] text-[#6b7a90]">
            Based on current market rate
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[1.15rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
              {est}
            </span>
            <span className="font-mono text-[0.78rem] font-bold text-[#6EECC4]">
              {receive}
            </span>
          </div>
          <div className="text-right">
            <div className="text-[0.62rem] font-bold text-[#eef2f7]">
              ≈ {est} {receive}
            </div>
            <div className="text-[0.58rem] text-[#6b7a90]">Rate updates live</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 font-[Inter,sans-serif] text-[0.82rem] font-extrabold text-[#07080c] transition-all hover:-translate-y-px"
        style={{
          background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
          boxShadow:
            "0 4px 12px rgba(61,219,169,.25), inset 0 1px 1px rgba(255,255,255,.25)",
        }}
      >
        {buttonLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </>
  );
}

function MethodCard({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  tag,
  tagBg,
  tagColor,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        border: selected
          ? "1.5px solid rgba(61,219,169,0.35)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        background: selected
          ? "linear-gradient(145deg,rgba(61,219,169,.06),rgba(61,219,169,.02))"
          : "linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015))",
        boxShadow: selected ? "0 0 16px rgba(61,219,169,0.08)" : "none",
        color: "var(--t1)",
        cursor: "pointer",
        textAlign: "left",
        transition: "all .2s",
      }}
    >
      <div
        style={{
          display: "flex",
          height: 38,
          width: 38,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          background: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: ".82rem",
            fontWeight: 800,
            color: "var(--t1)",
            marginBottom: 1,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: ".68rem", color: "var(--t3)" }}>{desc}</div>
        <span
          style={{
            display: "inline-block",
            marginTop: 4,
            padding: "1px 8px",
            borderRadius: 16,
            background: tagBg,
            color: tagColor,
            fontSize: ".6rem",
            fontWeight: 700,
          }}
        >
          {tag}
        </span>
      </div>
      <ChevronRight
        className="h-[0.85rem] w-[0.85rem] shrink-0"
        style={{ color: "var(--t4)" }}
      />
    </button>
  );
}
