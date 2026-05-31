import { useState } from "react";
import {
  ArrowDownToLine,
  Wallet,
  Building2,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import useSiteSettingsStore from "@/store/siteSettingStore";
import useDataStore from "@/store/dataStore";
import CryptoFunding from "@/components/deposit-funds/CryptoFunding";
import CardFunding from "@/components/deposit-funds/CardFunding";
import { ExchangePartners } from "@/components/deposit/ExchangePartners";

type DepositMethod = "crypto" | "bank-wire" | "card" | null;

interface ContributePanelProps {
  onDepositSuccess?: () => void;
}

export function ContributePanel({ onDepositSuccess }: ContributePanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>(null);
  const [showFundingForm, setShowFundingForm] = useState(false);
  const { settings } = useSiteSettingsStore();
  const { deposit_config } = useDataStore();

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

  // When a funding sub-form is active, render it directly
  if (showFundingForm && selectedMethod) {
    // Bank-wire shows the exchange-partner selection screen
    if (selectedMethod === "bank-wire") {
      return <ExchangePartners onBack={handleBack} />;
    }

    return (
      <div className="scard">
        <div className='[&_[class*="bg-card"]]:!bg-transparent [&_[class*="bg-muted"]]:!bg-white/[0.04]'>
          {selectedMethod === "crypto" ? (
            <CryptoFunding
              onChangeMethod={handleBack}
              stepsCount={stepsCount}
              onDepositSuccess={onDepositSuccess}
            />
          ) : (
            <CardFunding
              onChangeMethod={handleBack}
              onClose={onDepositSuccess}
              onDepositSuccess={onDepositSuccess}
              stepsCount={stepsCount}
            />
          )}
        </div>
      </div>
    );
  }

  // Method-selection view (matches reference)
  return (
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

      {/* Method Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          position: "relative",
        }}
      >
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

      {selectedMethod && (
        <div style={{ marginTop: 14, position: "relative" }}>
          <button
            type="button"
            onClick={handleProceed}
            className="btn-sub btn-dep"
            style={{ width: "auto", padding: "10px 22px" }}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Proceed to Deposit
          </button>
        </div>
      )}
    </div>
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
