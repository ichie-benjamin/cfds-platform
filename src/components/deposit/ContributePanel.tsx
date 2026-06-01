import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Wallet,
  Building2,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Bolt,
  Clock,
  Copy as CopyIcon,
  CircleCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  TriangleAlert,
  Network,
  CircleDollarSign,
  Info,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import useSiteSettingsStore from "@/store/siteSettingStore";
import useDataStore, { type DepositCryptoWallet, type Wallet as WalletData } from "@/store/dataStore";
import useAssetStore from "@/store/assetStore";
import CardFunding from "@/components/deposit-funds/CardFunding";
import { ExchangePartners } from "@/components/deposit/ExchangePartners";

type DepositMethod = "crypto" | "bank-wire" | "card" | null;
type CryptoStep = 1 | 2 | 3;

interface ContributePanelProps {
  onDepositSuccess?: () => void;
}

/* ──────────────────────────────────────────────────────────────
 * Presentational-only metadata for network info chips & coin colors.
 * Matches reference (DEP_COINS / DEP_NETWORKS in wallet (2).html).
 * Used only for display — does NOT generate or store addresses.
 * ────────────────────────────────────────────────────────────── */
type CoinMeta = {
  symbol: string;
  name: string;
  color: string;
  bg: string;
  glyph: string;
  min: string;
  confs: string;
};

const COIN_META: Record<string, CoinMeta> = {
  BTC:   { symbol: "BTC",   name: "Bitcoin",       color: "#F7931A", bg: "rgba(247,147,26,0.13)",  glyph: "₿", min: "0.001 BTC", confs: "3–6 confirmations" },
  ETH:   { symbol: "ETH",   name: "Ethereum",      color: "#627EEA", bg: "rgba(98,126,234,0.13)",  glyph: "Ξ", min: "0.01 ETH",  confs: "12 confirmations" },
  USDT:  { symbol: "USDT",  name: "Tether USD",    color: "#26A17B", bg: "rgba(38,161,123,0.13)",  glyph: "₮", min: "10 USDT",   confs: "12 confirmations" },
  USDC:  { symbol: "USDC",  name: "USD Coin",      color: "#2775CA", bg: "rgba(39,117,202,0.13)",  glyph: "$", min: "10 USDC",   confs: "12 confirmations" },
  BNB:   { symbol: "BNB",   name: "BNB Chain",     color: "#F3BA2F", bg: "rgba(243,186,47,0.13)",  glyph: "B", min: "0.01 BNB",  confs: "15 confirmations" },
  SOL:   { symbol: "SOL",   name: "Solana",        color: "#9945FF", bg: "rgba(153,69,255,0.13)",  glyph: "◎", min: "0.1 SOL",   confs: "32 confirmations" },
  XRP:   { symbol: "XRP",   name: "Ripple XRP",    color: "#00AAE4", bg: "rgba(0,170,228,0.13)",   glyph: "✕", min: "10 XRP",    confs: "—" },
  ADA:   { symbol: "ADA",   name: "Cardano",       color: "#0033AD", bg: "rgba(0,51,173,0.13)",    glyph: "A", min: "5 ADA",     confs: "10 confirmations" },
  DOGE:  { symbol: "DOGE",  name: "Dogecoin",      color: "#BA9F33", bg: "rgba(186,159,51,0.13)",  glyph: "Ð", min: "20 DOGE",   confs: "6 confirmations" },
  MATIC: { symbol: "MATIC", name: "Polygon",       color: "#8247E5", bg: "rgba(130,71,229,0.13)",  glyph: "M", min: "1 MATIC",   confs: "30 confirmations" },
  LTC:   { symbol: "LTC",   name: "Litecoin",      color: "#BFBBBB", bg: "rgba(191,187,187,0.13)", glyph: "Ł", min: "0.01 LTC",  confs: "6 confirmations" },
  TRX:   { symbol: "TRX",   name: "TRON",          color: "#EF0027", bg: "rgba(239,0,39,0.13)",    glyph: "T", min: "10 TRX",    confs: "20 confirmations" },
};

type NetworkMeta = {
  fee: string;
  time: string;
  confs: string;
};

const NETWORK_FALLBACK: NetworkMeta = {
  fee: "Network rate",
  time: "10–60 min",
  confs: "Network default",
};

const NETWORK_META: Record<string, NetworkMeta> = {
  "Bitcoin (BTC)":          { fee: "~$0.50",  time: "10–60 min", confs: "3–6 conf" },
  "Bitcoin":                { fee: "~$0.50",  time: "10–60 min", confs: "3–6 conf" },
  "BTC":                    { fee: "~$0.50",  time: "10–60 min", confs: "3–6 conf" },
  "Lightning":              { fee: "< $0.01", time: "Instant",   confs: "Instant" },
  "LN":                     { fee: "< $0.01", time: "Instant",   confs: "Instant" },
  "ERC-20":                 { fee: "~$2",     time: "5–15 min",  confs: "12 conf" },
  "ERC20":                  { fee: "~$2",     time: "5–15 min",  confs: "12 conf" },
  "Ethereum (ERC-20)":      { fee: "~$2",     time: "5–15 min",  confs: "12 conf" },
  "Ethereum":               { fee: "~$2",     time: "5–15 min",  confs: "12 conf" },
  "TRC-20":                 { fee: "< $0.10", time: "1–3 min",   confs: "20 conf" },
  "TRC20":                  { fee: "< $0.10", time: "1–3 min",   confs: "20 conf" },
  "TRON (TRC-20)":          { fee: "< $0.10", time: "1–3 min",   confs: "20 conf" },
  "BEP-20":                 { fee: "< $0.10", time: "1–3 min",   confs: "15 conf" },
  "BEP20":                  { fee: "< $0.10", time: "1–3 min",   confs: "15 conf" },
  "BNB Chain (BEP-20)":     { fee: "< $0.10", time: "1–3 min",   confs: "15 conf" },
  "Solana":                 { fee: "< $0.01", time: "< 30 sec",  confs: "~1 conf" },
  "SOL":                    { fee: "< $0.01", time: "< 30 sec",  confs: "~1 conf" },
  "Solana (SPL)":           { fee: "< $0.01", time: "< 30 sec",  confs: "~1 conf" },
  "Polygon":                { fee: "< $0.01", time: "1–2 min",   confs: "~30 conf" },
  "Polygon (PoS)":          { fee: "< $0.01", time: "1–2 min",   confs: "~30 conf" },
  "MATIC":                  { fee: "< $0.01", time: "1–2 min",   confs: "~30 conf" },
  "Arbitrum":               { fee: "< $0.10", time: "< 2 min",   confs: "~1 conf" },
  "Arbitrum One":           { fee: "< $0.10", time: "< 2 min",   confs: "~1 conf" },
  "Optimism":               { fee: "< $0.10", time: "< 2 min",   confs: "~1 conf" },
  "Avalanche":              { fee: "< $0.05", time: "1–2 min",   confs: "~1 conf" },
  "Avalanche C-Chain":      { fee: "< $0.05", time: "1–2 min",   confs: "~1 conf" },
  "Base":                   { fee: "< $0.10", time: "< 2 min",   confs: "~1 conf" },
  "XRP Ledger":             { fee: "< $0.01", time: "< 10 sec",  confs: "—" },
  "XRP":                    { fee: "< $0.01", time: "< 10 sec",  confs: "—" },
  "Cardano":                { fee: "< $0.20", time: "1–2 min",   confs: "10 conf" },
  "Dogecoin":               { fee: "~$0.05",  time: "1–3 min",   confs: "6 conf" },
  "Litecoin":               { fee: "~$0.02",  time: "2–5 min",   confs: "6 conf" },
};

function getCoinMeta(code: string): CoinMeta {
  const up = (code || "").toUpperCase();
  return (
    COIN_META[up] ?? {
      symbol: up || "—",
      name: up || "Asset",
      color: "#6EECC4",
      bg: "rgba(61,219,169,0.13)",
      glyph: (up[0] || "•") as string,
      min: "—",
      confs: "Network default",
    }
  );
}

function getNetworkMeta(network: string): NetworkMeta {
  if (!network) return NETWORK_FALLBACK;
  return NETWORK_META[network] ?? NETWORK_FALLBACK;
}

/* Presentation-only fallback so the asset/network selector is never empty
 * when backend deposit_config is null or has no configured wallets.
 * Mirrors DEP_COINS / DEP_NETWORKS from html_files/wallet (2).html.
 * NEVER carries a deposit address — real addresses come only from
 * data.wallets (see findRealWallet). Step 2 shows the "not yet enabled"
 * notice for any fallback asset that has no real configured wallet. */
const FALLBACK_PRESENTATION_ASSETS: DepositCryptoWallet[] = [
  {
    id: "fallback-btc",
    logo: "",
    name: "Bitcoin",
    code: "BTC",
    networks: ["Bitcoin (BTC)", "Lightning", "ERC-20"],
    default: true,
  },
  {
    id: "fallback-eth",
    logo: "",
    name: "Ethereum",
    code: "ETH",
    networks: ["Ethereum (ERC-20)", "Arbitrum One", "Optimism"],
    default: false,
  },
  {
    id: "fallback-usdt",
    logo: "",
    name: "Tether USD",
    code: "USDT",
    networks: [
      "Ethereum (ERC-20)",
      "TRON (TRC-20)",
      "BNB Chain (BEP-20)",
      "Solana (SPL)",
      "Polygon (PoS)",
      "Avalanche C-Chain",
      "Arbitrum One",
      "Optimism",
    ],
    default: false,
  },
  {
    id: "fallback-usdc",
    logo: "",
    name: "USD Coin",
    code: "USDC",
    networks: ["Ethereum (ERC-20)", "Solana", "BNB Chain (BEP-20)", "Polygon"],
    default: false,
  },
  {
    id: "fallback-sol",
    logo: "",
    name: "Solana",
    code: "SOL",
    networks: ["Solana"],
    default: false,
  },
  {
    id: "fallback-bnb",
    logo: "",
    name: "BNB Chain",
    code: "BNB",
    networks: ["BNB Chain (BEP-20)"],
    default: false,
  },
  {
    id: "fallback-xrp",
    logo: "",
    name: "Ripple XRP",
    code: "XRP",
    networks: ["XRP Ledger"],
    default: false,
  },
];

/* Find the real configured deposit wallet (address) for a given asset+network,
 * if one exists. Returns null when no real address is configured — UI then
 * shows the "not yet enabled" notice instead of inventing an address. */
function findRealWallet(
  wallets: WalletData[],
  code: string,
  network: string,
): WalletData | null {
  if (!code || !wallets.length) return null;
  const codeUp = code.toUpperCase();
  const netLow = (network || "").toLowerCase();
  const exact = wallets.find(
    (w) => w.crypto?.toUpperCase() === codeUp && w.crypto_network === network,
  );
  if (exact && exact.address) return exact;
  const partial = wallets.find(
    (w) =>
      w.crypto?.toUpperCase() === codeUp &&
      (w.crypto_network?.toLowerCase().includes(netLow) ||
        (netLow && netLow.includes(w.crypto_network?.toLowerCase() ?? ""))),
  );
  if (partial && partial.address) return partial;
  const byCoin = wallets.find((w) => w.crypto?.toUpperCase() === codeUp);
  return byCoin && byCoin.address ? byCoin : null;
}

export function ContributePanel({ onDepositSuccess }: ContributePanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>("crypto");
  const [showFundingForm, setShowFundingForm] = useState(false);
  const { settings } = useSiteSettingsStore();
  const { data, deposit_config } = useDataStore();
  const { fetchAssets, assets } = useAssetStore();

  /* ── Crypto flow local state ─────────────────────────────── */
  const [cryptoStep, setCryptoStep] = useState<CryptoStep>(1);
  const [selectedAssetCode, setSelectedAssetCode] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [depositAmountUsd, setDepositAmountUsd] = useState<string>("");
  const [coinDropdownOpen, setCoinDropdownOpen] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  /* ── Bank-wire / Card configure-purchase local state ─────── */
  const [purchaseAmount, setPurchaseAmount] = useState<string>("");

  useEffect(() => {
    if (assets.length === 0) fetchAssets();
  }, [assets.length, fetchAssets]);

  /* Real assets from backend deposit config; fall back to a presentation-only
   * list so the selector is never empty. Real addresses still only come from
   * data.wallets — fallback entries cannot produce a deposit address. */
  const availableAssets: DepositCryptoWallet[] = useMemo(() => {
    const real = deposit_config?.crypto?.wallets ?? [];
    return real.length > 0 ? real : FALLBACK_PRESENTATION_ASSETS;
  }, [deposit_config]);

  /* Initialise selection once data arrives */
  useEffect(() => {
    if (availableAssets.length && !selectedAssetCode) {
      const def = availableAssets.find((a) => a.default) ?? availableAssets[0];
      setSelectedAssetCode(def.code);
      if (def.networks?.length) setSelectedNetwork(def.networks[0]);
    }
  }, [availableAssets, selectedAssetCode]);

  /* Close coin dropdown when clicking outside */
  useEffect(() => {
    if (!coinDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.("[data-dep-coin-drop]")) setCoinDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [coinDropdownOpen]);

  const selectedAsset = useMemo(
    () => availableAssets.find((a) => a.code === selectedAssetCode) ?? null,
    [availableAssets, selectedAssetCode],
  );

  const availableNetworks = useMemo(
    () => selectedAsset?.networks ?? [],
    [selectedAsset],
  );

  /* Keep selectedNetwork valid when asset changes */
  useEffect(() => {
    if (availableNetworks.length && !availableNetworks.includes(selectedNetwork)) {
      setSelectedNetwork(availableNetworks[0]);
    }
  }, [availableNetworks, selectedNetwork]);

  const coinMeta = getCoinMeta(selectedAssetCode);
  const netMeta = getNetworkMeta(selectedNetwork);

  /* Look up real configured wallet — never fabricate */
  const wallets: WalletData[] = useMemo(() => data?.wallets ?? [], [data?.wallets]);
  const realWallet = useMemo(
    () => findRealWallet(wallets, selectedAssetCode, selectedNetwork),
    [wallets, selectedAssetCode, selectedNetwork],
  );
  const hasRealAddress = Boolean(realWallet?.address);

  /* Live price for amount preview (presentational only) */
  const livePrice = useMemo(() => {
    if (!selectedAssetCode || assets.length === 0) return 0;
    const code = selectedAssetCode.toLowerCase();
    const match = assets.find(
      (a) =>
        a.type === "crypto" &&
        (a.symbol?.toLowerCase().includes(code) ||
          a.sy?.toLowerCase().includes(code) ||
          a.name?.toLowerCase().includes(code)),
    );
    if (match) return parseFloat(match.rate) || 0;
    if (["USDT", "USDC", "BUSD", "DAI"].includes(selectedAssetCode.toUpperCase()))
      return 1;
    return 0;
  }, [assets, selectedAssetCode]);

  const cryptoAmountFromUsd = useMemo(() => {
    const usd = parseFloat(depositAmountUsd || "0");
    if (!usd || !livePrice) return "";
    const dp = ["USDT", "USDC", "BUSD", "DAI"].includes(
      selectedAssetCode.toUpperCase(),
    )
      ? 2
      : 6;
    return (usd / livePrice).toFixed(dp);
  }, [depositAmountUsd, livePrice, selectedAssetCode]);

  const cryptoEnabled = deposit_config?.crypto?.enabled !== false;
  const cardEnabled =
    deposit_config?.credit_card?.enabled !== false && settings?.credit_card_deposit;

  const url = typeof window !== "undefined" ? window.location.href.toLowerCase() : "";
  const stepsCount: 3 | 4 =
    url.includes("fincapitalmarkets.org") || url.includes("equitymarketspro.com")
      ? 4
      : 3;

  /* ── Method switching resets local flow state ────────────── */
  const handleMethodSelect = (method: DepositMethod) => {
    setSelectedMethod(method);
    setShowFundingForm(false);
    if (method === "crypto") setCryptoStep(1);
    if (method !== selectedMethod) setPurchaseAmount("");
  };

  const handleProceed = () => {
    if (selectedMethod) setShowFundingForm(true);
  };

  const handleBack = () => {
    setShowFundingForm(false);
    setSelectedMethod(null);
  };

  /* ── Crypto step transitions ─────────────────────────────── */
  const goToAddress = () => {
    if (!selectedAssetCode || !selectedNetwork) return;
    setCryptoStep(2);
  };
  const backToAsset = () => setCryptoStep(1);
  const confirmSent = () => setCryptoStep(3);
  const resetCrypto = () => {
    setCryptoStep(1);
    setAddressCopied(false);
    onDepositSuccess?.();
  };

  const handleCopyAddress = () => {
    if (!realWallet?.address) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(realWallet.address)
        .then(() => {
          setAddressCopied(true);
          window.setTimeout(() => setAddressCopied(false), 2000);
        })
        .catch(() => {
          /* silent */
        });
    }
  };

  /* Bank-wire / card sub-forms */
  if (showFundingForm && selectedMethod && selectedMethod !== "crypto") {
    if (selectedMethod === "bank-wire") return <ExchangePartners onBack={handleBack} />;
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

  /* ── Step dot indicators per method ──────────────────────── */
  const totalDots =
    selectedMethod === "crypto" ? 3 : selectedMethod ? 2 : 0;
  const activeDot =
    selectedMethod === "crypto"
      ? cryptoStep - 1
      : selectedMethod
        ? 0
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

        {/* Method step dots (under cards, reflect current step in active flow) */}
        {totalDots > 0 && (
          <div className="mt-3.5 mb-0.5 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalDots }).map((_, i) =>
              i === activeDot ? (
                <span
                  key={i}
                  className="h-2 w-6 rounded-[4px] bg-[#3DDBA9] shadow-[0_0_8px_rgba(61,219,169,0.45)]"
                />
              ) : (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < activeDot
                      ? "bg-[rgba(61,219,169,0.45)]"
                      : "border border-white/[0.10] bg-white/[0.10]"
                  }`}
                />
              ),
            )}
          </div>
        )}
      </div>

      {/* ─── Section 2: Crypto flow — three inline step panels ─── */}
      {selectedMethod === "crypto" && (
        <div className="scard">
          {/* STEP 1: Choose Asset & Network */}
          {cryptoStep === 1 && (
            <>
              <div className="mb-3 flex items-start gap-2.5">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.1)] text-[0.68rem] font-extrabold text-[#3DDBA9]">
                  1
                </div>
                <div>
                  <div className="text-[0.82rem] font-bold text-[#eef2f7]">
                    Choose Asset &amp; Network
                  </div>
                  <div className="mt-[1px] text-[0.7rem] text-[#6b7a90]">
                    Select your cryptocurrency and network, then generate your deposit address
                  </div>
                </div>
              </div>

              {/* Asset dropdown */}
              <div className="mb-4">
                <div className="mb-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.09em] text-[#6b7a90]">
                  Cryptocurrency to Deposit
                </div>
                <div className="relative" data-dep-coin-drop>
                  <button
                    type="button"
                    onClick={() => setCoinDropdownOpen((v) => !v)}
                    className={`flex w-full items-center gap-2.5 rounded-[10px] border bg-[#0a0d15] px-3.5 py-2.5 transition-colors ${
                      coinDropdownOpen
                        ? "border-[#3DDBA9]"
                        : "border-white/[0.07] hover:border-white/[0.12]"
                    }`}
                  >
                    <div
                      className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[1rem] font-extrabold"
                      style={{ background: coinMeta.bg, color: coinMeta.color }}
                    >
                      {coinMeta.glyph}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-[0.95rem] font-extrabold leading-none text-[#eef2f7]">
                        {coinMeta.symbol}
                      </div>
                      <div className="mt-[2px] text-[0.72rem] text-[#6b7a90]">
                        {coinMeta.name}
                      </div>
                    </div>
                    {livePrice > 0 && (
                      <div className="mr-2 font-mono text-[0.88rem] font-bold text-[#a3adbf]">
                        ${livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#4d5b6e] transition-transform ${
                        coinDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {coinDropdownOpen && availableAssets.length > 0 && (
                    <div
                      className="absolute left-0 right-0 z-[300] mt-1.5 overflow-hidden rounded-[12px] border-[1.5px] border-white/[0.08] bg-[#0a0d15] shadow-[0_8px_32px_rgba(0,0,0,.55)]"
                      style={{ backdropFilter: "blur(40px)" }}
                    >
                      <div className="max-h-[280px] overflow-y-auto">
                        {availableAssets.map((asset) => {
                          const m = getCoinMeta(asset.code);
                          const active = asset.code === selectedAssetCode;
                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => {
                                setSelectedAssetCode(asset.code);
                                if (asset.networks?.length)
                                  setSelectedNetwork(asset.networks[0]);
                                setCoinDropdownOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-white/[0.03] ${
                                active ? "bg-white/[0.03]" : ""
                              }`}
                            >
                              <div
                                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[0.9rem] font-extrabold"
                                style={{ background: m.bg, color: m.color }}
                              >
                                {m.glyph}
                              </div>
                              <div className="flex-1">
                                <div className="text-[0.85rem] font-extrabold text-[#eef2f7]">
                                  {m.symbol}
                                </div>
                                <div className="mt-[1px] text-[0.7rem] text-[#6b7a90]">
                                  {asset.name || m.name}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Network pills */}
              <div className="mb-2 text-[0.65rem] font-extrabold uppercase tracking-[0.09em] text-[#6b7a90]">
                Select Network
              </div>
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {availableNetworks.length ? (
                  availableNetworks.map((net) => {
                    const active = net === selectedNetwork;
                    return (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setSelectedNetwork(net)}
                        className={`flex items-center gap-1.5 rounded-[7px] border px-3 py-1.5 text-[0.7rem] font-bold transition-all ${
                          active
                            ? "border-[rgba(61,219,169,0.45)] bg-[rgba(61,219,169,0.10)] text-[#3DDBA9]"
                            : "border-white/[0.07] bg-[#0a0d15] text-[#a3adbf] hover:border-white/[0.12] hover:text-[#eef2f7]"
                        }`}
                      >
                        {net}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-[0.7rem] text-[#6b7a90]">
                    No networks available
                  </span>
                )}
              </div>

              {/* Fee / Time / Confirmations info bar */}
              <div className="mb-3.5 flex flex-wrap items-center gap-[14px] rounded-[7px] border border-white/[0.05] bg-[#0a0d15] px-3 py-2 text-[0.7rem] text-[#6b7a90]">
                <div className="flex items-center gap-1.5">
                  <Bolt className="h-3 w-3 text-[#FFD166]" />
                  Fee: <strong className="font-bold text-[#eef2f7]">{netMeta.fee}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-[#4d5b6e]" />
                  Est. time:{" "}
                  <strong className="font-bold text-[#eef2f7]">{netMeta.time}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleCheck className="h-3 w-3 text-[#3DDBA9]" />
                  Confs:{" "}
                  <strong className="font-bold text-[#eef2f7]">{netMeta.confs}</strong>
                </div>
              </div>

              {/* Optional amount */}
              <div className="mb-4">
                <div className="mb-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.09em] text-[#6b7a90]">
                  Deposit Amount{" "}
                  <span className="ml-1 normal-case text-[#4d5b6e]">(Optional)</span>
                </div>
                <div className="flex items-stretch overflow-hidden rounded-[8px] border-[1.5px] border-white/[0.08]">
                  <div className="flex items-center bg-[#0a0d15] px-3 py-2.5 text-[0.82rem] font-bold text-[#6b7a90]">
                    $
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={depositAmountUsd}
                    onChange={(e) => setDepositAmountUsd(e.target.value)}
                    className="flex-1 bg-[#0a0d15] px-3 py-2.5 font-mono text-[0.88rem] font-bold text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
                  />
                </div>
                <div className="mt-1.5 font-mono text-[0.7rem] text-[#4d5b6e]">
                  {cryptoAmountFromUsd
                    ? `${cryptoAmountFromUsd} ${coinMeta.symbol}`
                    : `0.000000 ${coinMeta.symbol}`}
                </div>
              </div>

              {/* Generate Deposit Address */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToAddress}
                  disabled={!selectedAssetCode || !selectedNetwork}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[8px] px-5 py-2.5 text-[0.82rem] font-extrabold text-[#07080c] transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                    boxShadow:
                      "0 4px 12px rgba(61,219,169,.25), inset 0 1px 1px rgba(255,255,255,.25)",
                  }}
                >
                  Generate Deposit Address
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Deposit Address Panel */}
          {cryptoStep === 2 && (
            <>
              <div className="mb-3 flex items-start gap-2.5">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.1)] text-[0.68rem] font-extrabold text-[#3DDBA9]">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-[0.82rem] font-bold text-[#eef2f7]">
                    Your Deposit Address
                  </div>
                  <div className="mt-[1px] text-[0.7rem] text-[#6b7a90]">
                    {hasRealAddress
                      ? `Send ${coinMeta.symbol} on ${selectedNetwork} to this address`
                      : "Address not available for this asset on this platform"}
                  </div>
                </div>
                <div
                  className="ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] font-bold"
                  style={{
                    background: "rgba(0,0,0,.25)",
                    borderColor: `${coinMeta.color}55`,
                    color: coinMeta.color,
                  }}
                >
                  {coinMeta.glyph}
                  <span>{coinMeta.symbol}</span>
                </div>
              </div>

              {hasRealAddress && realWallet ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr] items-start mb-3">
                    {/* QR */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="relative flex h-[150px] w-[150px] items-center justify-center rounded-[12px] bg-white p-2 transition-shadow"
                        style={{
                          boxShadow: `0 0 0 2px ${coinMeta.color}80, 0 0 28px ${coinMeta.color}30`,
                        }}
                      >
                        <QRCodeSVG
                          value={realWallet.address}
                          size={134}
                          level="M"
                          bgColor="#FFFFFF"
                          fgColor="#0E1529"
                        />
                        <div
                          className="absolute -bottom-3.5 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white text-[0.75rem] font-extrabold text-white"
                          style={{ background: coinMeta.color }}
                        >
                          {coinMeta.glyph}
                        </div>
                      </div>
                      <div className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.07em] text-[#a3adbf]">
                        Scan to Deposit
                      </div>
                    </div>

                    {/* Address + chips */}
                    <div className="flex flex-col gap-2.5">
                      {depositAmountUsd && cryptoAmountFromUsd && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.08)] px-3 py-1.5 font-mono text-[0.73rem] font-bold text-[#3DDBA9]">
                            <CircleDollarSign className="h-3 w-3" />$
                            {parseFloat(depositAmountUsd).toFixed(2)} ≈{" "}
                            {cryptoAmountFromUsd} {coinMeta.symbol}
                          </span>
                        </div>
                      )}

                      <div>
                        <div className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.07em] text-[#a3adbf]">
                          Deposit Address
                        </div>
                        <div
                          className="select-all rounded-[10px] border border-white/[0.10] px-3.5 py-3 font-mono text-[0.75rem] leading-[1.55] text-[#eef2f7] [word-break:break-all]"
                          style={{
                            background:
                              "linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.02))",
                          }}
                        >
                          {realWallet.address}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className={`flex items-center justify-center gap-2 rounded-[10px] py-2.5 text-[0.8rem] font-extrabold tracking-[0.02em] transition-all hover:-translate-y-px ${
                          addressCopied ? "" : ""
                        }`}
                        style={{
                          background: addressCopied
                            ? "linear-gradient(135deg,#34C77B,#28a868)"
                            : "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                          color: "#07080c",
                          boxShadow:
                            "inset 0 1px 2px rgba(255,255,255,.25), 0 4px 16px rgba(61,219,169,.2)",
                        }}
                      >
                        {addressCopied ? (
                          <>
                            <CircleCheck className="h-3.5 w-3.5" />
                            Address Copied
                          </>
                        ) : (
                          <>
                            <CopyIcon className="h-3.5 w-3.5" />
                            Copy Address
                          </>
                        )}
                      </button>

                      <div className="flex flex-col gap-[7px]">
                        <InfoChip
                          icon={<Network className="h-3 w-3" />}
                          label="Network"
                          value={selectedNetwork}
                        />
                        <InfoChip
                          icon={<ArrowDownToLine className="h-3 w-3" />}
                          label="Min. Deposit"
                          value={coinMeta.min}
                        />
                        <InfoChip
                          icon={<CircleCheck className="h-3 w-3" />}
                          label="Confirmations"
                          value={coinMeta.confs}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warning notice */}
                  <div
                    className="mt-2.5 flex items-start gap-2.5 rounded-[10px] px-4 py-3 text-[0.75rem] leading-[1.5] text-[#a3adbf]"
                    style={{
                      background: "rgba(232,169,77,0.07)",
                      border: "1px solid rgba(232,169,77,0.2)",
                    }}
                  >
                    <TriangleAlert className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#FF9800]" />
                    <span>
                      Only send{" "}
                      <strong className="text-[#eef2f7]">
                        {coinMeta.symbol}
                      </strong>{" "}
                      on the correct network. Sending wrong assets results in{" "}
                      <strong className="text-[#eef2f7]">permanent loss</strong>.
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className="my-2 flex items-start gap-3 rounded-[10px] px-4 py-3.5 text-[0.78rem] leading-[1.55] text-[#a3adbf]"
                  style={{
                    background: "rgba(74,144,226,0.07)",
                    border: "1px solid rgba(74,144,226,0.2)",
                  }}
                >
                  <Info className="mt-[1px] h-4 w-4 shrink-0 text-[#4A90E2]" />
                  <span>
                    This asset is not yet enabled for deposits on this platform.
                    Please choose a different asset or network.
                  </span>
                </div>
              )}

              {/* Action row */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={backToAsset}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] border border-white/[0.07] bg-[#0a0d15] py-2.5 text-[0.76rem] font-bold text-[#a3adbf] transition-all hover:border-white/[0.18] hover:text-[#eef2f7]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={confirmSent}
                  disabled={!hasRealAddress}
                  className="flex flex-[2] items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-[0.78rem] font-extrabold text-[#07080c] transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                    boxShadow:
                      "inset 0 1px 2px rgba(255,255,255,.25), 0 3px 12px rgba(61,219,169,.2)",
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                  I&rsquo;ve Sent the Funds
                </button>
              </div>
            </>
          )}

          {/* STEP 3: Deposit Submitted */}
          {cryptoStep === 3 && (
            <div className="px-3.5 py-4 text-center">
              <div className="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.1)]">
                <CircleCheck className="h-[1.4rem] w-[1.4rem] text-[#3DDBA9]" />
              </div>
              <div className="mb-1 font-[Outfit,sans-serif] text-[0.92rem] font-extrabold text-[#eef2f7]">
                Deposit Submitted
              </div>
              <div className="mx-auto mb-3.5 max-w-[360px] text-[0.75rem] leading-[1.5] text-[#6b7a90]">
                Your deposit request has been received. Funds will appear once
                network confirmations are complete.
              </div>

              <div className="mb-3.5 rounded-[10px] border border-white/[0.05] bg-[#0a0d15] px-3.5 py-2.5 text-left">
                <DetailRow label="Asset" value={coinMeta.symbol} valueMono />
                <DetailRow label="Network" value={selectedNetwork || "—"} />
                {depositAmountUsd && cryptoAmountFromUsd && (
                  <DetailRow
                    label="Amount"
                    value={`$${parseFloat(depositAmountUsd).toFixed(2)} ≈ ${cryptoAmountFromUsd} ${coinMeta.symbol}`}
                    valueMono
                    accent
                  />
                )}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[0.72rem] font-semibold text-[#6b7a90]">
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-extrabold text-[#3DDBA9]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3DDBA9]" />
                    Awaiting Confirmation
                  </span>
                </div>
              </div>

              <div className="mb-5 flex items-center justify-center gap-2 rounded-[10px] border border-[rgba(61,219,169,0.15)] bg-[rgba(61,219,169,0.06)] px-4 py-2.5">
                <Clock className="h-3.5 w-3.5 text-[#3DDBA9]" />
                <span className="text-[0.75rem] font-semibold text-[#a3adbf]">
                  Estimated arrival:{" "}
                  <strong className="font-extrabold text-[#3DDBA9]">
                    {netMeta.time}
                  </strong>
                </span>
              </div>

              <div className="flex">
                <button
                  type="button"
                  onClick={resetCrypto}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] py-2.5 text-[0.78rem] font-extrabold text-[#07080c] transition-all hover:-translate-y-px"
                  style={{
                    background: "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                    boxShadow:
                      "inset 0 1px 2px rgba(255,255,255,.25), 0 3px 12px rgba(61,219,169,.2)",
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Make Another Deposit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Section 2b: Configure Your Purchase (Bank Wire) ─── */}
      {selectedMethod === "bank-wire" && (
        <div className="scard">
          <div className="mb-3 flex items-start gap-2.5">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.1)] text-[0.68rem] font-extrabold text-[#3DDBA9]">
              1
            </div>
            <div>
              <div className="text-[0.82rem] font-bold text-[#eef2f7]">
                Configure Your Purchase
              </div>
              <div className="mt-[1px] text-[0.7rem] text-[#6b7a90]">
                Enter amount and select which asset to receive
              </div>
            </div>
          </div>

          <ConfigurePurchaseForm
            kind="bank-wire"
            amount={purchaseAmount}
            onAmountChange={setPurchaseAmount}
            onContinue={handleProceed}
          />
        </div>
      )}

      {/* ─── Section 2c: Configure Your Purchase (Card) ─── */}
      {selectedMethod === "card" && (
        <div className="scard">
          <div className="mb-3 flex items-start gap-2.5">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-[rgba(61,219,169,0.25)] bg-[rgba(61,219,169,0.1)] text-[0.68rem] font-extrabold text-[#3DDBA9]">
              1
            </div>
            <div>
              <div className="text-[0.82rem] font-bold text-[#eef2f7]">
                Configure Your Purchase
              </div>
              <div className="mt-[1px] text-[0.7rem] text-[#6b7a90]">
                Enter amount and select which asset to receive
              </div>
            </div>
          </div>

          <ConfigurePurchaseForm
            kind="card"
            amount={purchaseAmount}
            onAmountChange={setPurchaseAmount}
            onContinue={handleProceed}
          />
        </div>
      )}
    </>
  );
}

/* ─── Small presentational helpers ───────────────────────── */

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-white/[0.06] bg-[#07080c] px-3 py-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#0a0d15] text-[#6b7a90]">
        {icon}
      </div>
      <div>
        <div className="mb-[2px] text-[0.62rem] font-bold uppercase leading-none tracking-[0.06em] text-[#a3adbf]">
          {label}
        </div>
        <div className="font-mono text-[0.76rem] font-bold leading-none text-[#eef2f7]">
          {value}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueMono,
  accent,
}: {
  label: string;
  value: string;
  valueMono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between last:mb-0">
      <span className="text-[0.72rem] font-semibold text-[#6b7a90]">{label}</span>
      <span
        className={`text-[0.82rem] font-bold ${valueMono ? "font-mono" : ""} ${
          accent ? "text-[#3DDBA9]" : "text-[#eef2f7]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

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

      <div className="mb-3 rounded-[8px] border border-[rgba(61,219,169,0.18)] bg-[rgba(61,219,169,0.04)] p-3">
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
        className="flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-[0.82rem] font-extrabold text-[#07080c] transition-all hover:-translate-y-px"
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
