import { Network } from "lucide-react";

interface Coin {
  symbol: string;
  name: string;
  network: string;
  color: string;
  glyph: string;
}

const coins: Coin[] = [
  { symbol: "BTC", name: "Bitcoin", network: "Native SegWit", color: "#F7931A", glyph: "₿" },
  { symbol: "ETH", name: "Ethereum", network: "ERC-20", color: "#627EEA", glyph: "Ξ" },
  { symbol: "USDT", name: "Tether", network: "TRC-20", color: "#26A17B", glyph: "₮" },
  { symbol: "BNB", name: "BNB Chain", network: "BEP-20", color: "#F0B90B", glyph: "B" },
  { symbol: "SOL", name: "Solana", network: "SOL Net", color: "#9945FF", glyph: "◎" },
];

interface CoinGridProps {
  selectedCoin: string;
  /** The network value from react-hook-form — single source of truth for display */
  formNetwork: string;
  onCoinSelect: (symbol: string, name: string, network: string) => void;
}

export function CoinGrid({ selectedCoin, formNetwork, onCoinSelect }: CoinGridProps) {
  const selected = coins.find((c) => c.symbol === selectedCoin) || coins[0];
  const displayNetwork = formNetwork || selected.network;

  return (
    <div>
      <div className="flabel" style={{ marginBottom: 8 }}>
        Cryptocurrency <small>Your holdings shown below</small>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,minmax(0,1fr))",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {coins.map((coin) => {
          const isSelected = selectedCoin === coin.symbol;
          return (
            <button
              key={coin.symbol}
              type="button"
              onClick={() =>
                onCoinSelect(coin.symbol, coin.name, coin.network)
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 10,
                borderRadius: 10,
                border: isSelected
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid rgba(255,255,255,0.07)",
                background: isSelected
                  ? "rgba(61,219,169,0.08)"
                  : "linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015))",
                boxShadow: isSelected
                  ? "0 0 0 1px var(--accent)"
                  : "none",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              <div
                style={{
                  marginBottom: 6,
                  display: "flex",
                  height: 30,
                  width: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  background: `${coin.color}22`,
                  color: coin.color,
                  fontSize: ".82rem",
                  fontWeight: 800,
                }}
              >
                {coin.glyph}
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  fontWeight: 800,
                  color: "var(--t1)",
                }}
              >
                {coin.symbol}
              </div>
              <div style={{ fontSize: ".58rem", color: "var(--t4)" }}>
                {coin.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Network badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "var(--bg2)",
          padding: "8px 12px",
          fontSize: ".72rem",
          fontWeight: 600,
          color: "var(--t2)",
        }}
      >
        <Network
          className="h-3.5 w-3.5"
          style={{ color: "var(--accent)" }}
        />
        <span>
          {displayNetwork} ({selected.name} Network)
        </span>
      </div>
    </div>
  );
}
