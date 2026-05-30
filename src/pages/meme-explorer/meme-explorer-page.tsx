import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Menu } from "lucide-react";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

/* ----------------------------- Types ----------------------------- */
type Coin = {
  id: string;
  name: string;
  ticker: string;
  price: number;
  mcap: number;
  fdv: number;
  volume24h: number;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  buys5m: number;
  sells5m: number;
  buys1h: number;
  sells1h: number;
  buys6h: number;
  sells6h: number;
  buys24h: number;
  sells24h: number;
  txns: number;
  volume5m: number;
  volume1h: number;
  volume6h: number;
  priceNative: string;
  quoteToken: string;
  age: string;
  pairCreatedAt: number;
  chain: string;
  chainId: string;
  dex: string;
  liquidity: number;
  progress: number;
  pairAddress: string;
  tokenAddress: string;
  contractAddr: string;
  imageUrl: string;
  url: string;
  websites: Array<{ url?: string }>;
  socials: Array<{ type?: string; url?: string }>;
  color: string;
  abbr: string;
  isHot: boolean;
};

type TabKey = "trending" | "newpairs" | "gainers" | "losers" | "recent";
type SortKey = "newest" | "oldest" | "mcap" | "volume" | "txns";

/* ----------------------------- Helpers ----------------------------- */
const API = "https://api.dexscreener.com";

const fmt$ = (n?: number) => {
  if (n == null || isNaN(n)) return "$0";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  if (n >= 1) return "$" + n.toFixed(2);
  if (n >= 0.01) return "$" + n.toFixed(4);
  return "$" + n.toFixed(8);
};
const fmtN = (n?: number) => {
  if (n == null || isNaN(n)) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
};
const fmtP = (n?: number) => {
  if (n == null || isNaN(n)) return "+0.00%";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
};
const fmtPrice = (n?: number) => {
  if (n == null || isNaN(n) || n === 0) return "$0";
  if (n >= 1)
    return (
      "$" +
      n.toLocaleString("en", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  if (n >= 0.01) return "$" + n.toFixed(4);
  if (n >= 0.0001) return "$" + n.toFixed(6);
  return "$" + n.toFixed(8);
};
const getAge = (ts: number) => {
  if (!ts) return "?";
  const ms = Date.now() - ts;
  if (ms < 0) return "Just now";
  const s = ms / 1000;
  if (s < 60) return Math.floor(s) + "s";
  const m = s / 60;
  if (m < 60) return Math.floor(m) + "m";
  const h = m / 60;
  if (h < 24) return Math.floor(h) + "h";
  const d = h / 24;
  if (d < 30) return Math.floor(d) + "d";
  const mo = d / 30;
  if (mo < 12) return Math.floor(mo) + "mo";
  return Math.floor(d / 365) + "y";
};
const getColorForChain = (chain: string) => {
  const map: Record<string, string> = {
    solana: "#9945FF",
    ethereum: "#627EEA",
    bsc: "#F3BA2F",
    base: "#0052FF",
    arbitrum: "#28A0F0",
    polygon: "#8247E5",
    avalanche: "#E84142",
    optimism: "#FF0420",
    fantom: "#1969FF",
  };
  return map[chain] || "#5b8def";
};
const getChainClass = (chain: string) => {
  const map: Record<string, string> = {
    solana: "chain-sol",
    ethereum: "chain-eth",
    bsc: "chain-bsc",
    base: "chain-base",
    arbitrum: "chain-arb",
    polygon: "chain-pol",
  };
  return map[chain] || "chain-default";
};
const getChainDisplay = (chain: string) => {
  const map: Record<string, string> = {
    solana: "SOL",
    ethereum: "ETH",
    bsc: "BSC",
    base: "BASE",
    arbitrum: "ARB",
    polygon: "POL",
    avalanche: "AVAX",
    optimism: "OP",
    fantom: "FTM",
    cronos: "CRO",
  };
  return map[chain] || (chain || "").toUpperCase().slice(0, 3);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const pairToCoin = (pair: any): Coin => {
  const chain = pair.chainId || "unknown";
  const price = parseFloat(pair.priceUsd) || 0;
  const mcap = pair.marketCap || pair.fdv || 0;
  const liq = pair.liquidity?.usd || 0;
  return {
    name: pair.baseToken?.name || "Unknown",
    ticker: pair.baseToken?.symbol || "???",
    price,
    mcap,
    fdv: pair.fdv || 0,
    volume24h: pair.volume?.h24 || 0,
    change5m: pair.priceChange?.m5 || 0,
    change1h: pair.priceChange?.h1 || 0,
    change6h: pair.priceChange?.h6 || 0,
    change24h: pair.priceChange?.h24 || 0,
    buys5m: pair.txns?.m5?.buys || 0,
    sells5m: pair.txns?.m5?.sells || 0,
    buys1h: pair.txns?.h1?.buys || 0,
    sells1h: pair.txns?.h1?.sells || 0,
    buys6h: pair.txns?.h6?.buys || 0,
    sells6h: pair.txns?.h6?.sells || 0,
    buys24h: pair.txns?.h24?.buys || 0,
    sells24h: pair.txns?.h24?.sells || 0,
    txns: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
    volume5m: pair.volume?.m5 || 0,
    volume1h: pair.volume?.h1 || 0,
    volume6h: pair.volume?.h6 || 0,
    priceNative: pair.priceNative || "0",
    quoteToken: pair.quoteToken?.symbol || "",
    age: getAge(pair.pairCreatedAt),
    pairCreatedAt: pair.pairCreatedAt || 0,
    chain: getChainDisplay(chain),
    chainId: chain,
    dex: pair.dexId || "",
    liquidity: liq,
    progress: mcap > 0 ? Math.min(100, (liq / mcap) * 500) : 0,
    pairAddress: pair.pairAddress || "",
    tokenAddress: pair.baseToken?.address || "",
    contractAddr: pair.baseToken?.address || "",
    imageUrl: pair.info?.imageUrl || "",
    url: pair.url || "",
    websites: pair.info?.websites || [],
    socials: pair.info?.socials || [],
    color: getColorForChain(chain),
    abbr: (pair.baseToken?.symbol || "??").slice(0, 2).toUpperCase(),
    isHot: Math.abs(pair.priceChange?.h24 || 0) > 50,
    id:
      pair.pairAddress ||
      Math.random().toString(36).slice(2) + "_" + Date.now(),
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

async function safeFetch(url: string): Promise<unknown | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url);
      if (r.status === 429) {
        await new Promise((res) => setTimeout(res, 2000 * (attempt + 1)));
        continue;
      }
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) {
      if (attempt < 3)
        await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
      else {
        console.warn("Failed:", url, (e as Error).message);
        return null;
      }
    }
  }
  return null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function extractPairs(r: any): any[] {
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (r.pairs && Array.isArray(r.pairs)) return r.pairs;
  return [];
}
function dedup(pairs: any[]): any[] {
  const m = new Map<string, any>();
  pairs.forEach((p) => {
    if (!p || !p.pairAddress) return;
    const ex = m.get(p.pairAddress);
    if (!ex || (p.volume?.h24 || 0) > (ex.volume?.h24 || 0))
      m.set(p.pairAddress, p);
  });
  return [...m.values()];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function parallelFetchPairs(
  urls: string[],
  onProgress?: (msg: string) => void,
  label?: string,
) {
  const BATCH = 12;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pairs: any[] = [];
  let done = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map((u) => safeFetch(u)));
    results.forEach((r) => {
      if (r.status === "fulfilled") pairs = pairs.concat(extractPairs(r.value));
    });
    done += batch.length;
    if (onProgress && label)
      onProgress(
        `${label} (${done}/${urls.length} calls, ${pairs.length} pairs found)`,
      );
    if (i + BATCH < urls.length)
      await new Promise((res) => setTimeout(res, 350));
  }
  return pairs;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function findNewAddrs(pairs: any[], alreadyFetched: Set<string>): string[] {
  const s = new Set<string>();
  pairs.forEach((p) => {
    const a = p.baseToken?.address;
    if (a && !alreadyFetched.has(a.toLowerCase())) s.add(a);
    const q = p.quoteToken?.address;
    if (q && !alreadyFetched.has(q.toLowerCase())) s.add(q);
  });
  return [...s];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function buildTokenUrls(addrs: string[]): string[] {
  const urls: string[] = [];
  for (let i = 0; i < addrs.length; i += 30) {
    urls.push(API + "/latest/dex/tokens/" + addrs.slice(i, i + 30).join(","));
  }
  return urls;
}

/* Search waves — trimmed from reference (still broad enough for real data) */
const SEARCH_WAVE_1 = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m",
  "n","o","p","q","r","s","t","u","v","w","x","y","z",
  "0","1","2","3","4","5","6","7","8","9",
  "PEPE","DOGE","SHIB","BONK","WIF","FLOKI","BRETT","POPCAT","MOG","TURBO",
  "GOAT","FARTCOIN","PNUT","BOME","NEIRO","MEW","MYRO","SPX6900","MOODENG",
  "GIGA","ANDY","TOSHI","PONKE","SLERF","TREMP","TRUMP","HAWK","PENGU",
  "CHILLGUY","PENG","APU","WOJAK","MILADY","CHAD","SIGMA","NORMIE",
  "RENDER","ONDO","JUP","JITO","PYTH","RAY","ORCA","DRIFT","TENSOR",
  "FET","TAO","NEAR","INJ","SEI","TIA","SUI","AERO","VIRTUAL",
  "HNT","MOBILE","KMNO","MOTHER","DADDY",
];
const SEARCH_WAVE_2 = [
  "meme","meme coin","pump fun","degen","moon","gem","100x",
  "cat token","dog token","frog token","AI token","RWA token",
  "viral","hot","trending","new token","launch","presale",
  "solana","ethereum","bsc","base","arbitrum","polygon","avalanche","optimism",
  "solana meme","base meme","eth meme","bsc meme","arb meme","avax meme",
  "uniswap","pancakeswap","raydium","jupiter","sushiswap","orca",
  "aerodrome","camelot","trader joe","meteora","quickswap","velodrome",
];

/* ----------------------------- Sparkline ----------------------------- */
function drawSparkline(
  canvas: HTMLCanvasElement,
  coin: Coin,
  w: number,
  h: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const c24 = coin.change24h || 0;
  const c6 = coin.change6h || 0;
  const c1 = coin.change1h || 0;
  const price = coin.price || 1;
  const pts: number[] = [];
  const n = 20;
  const p24 = price / (1 + c24 / 100);
  const p6 = price / (1 + c6 / 100);
  const p1 = price / (1 + c1 / 100);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let p;
    if (t < 0.25) p = p24 + (p6 - p24) * (t / 0.25);
    else if (t < 0.8) p = p6 + (p1 - p6) * ((t - 0.25) / 0.55);
    else p = p1 + (price - p1) * ((t - 0.8) / 0.2);
    p *= 1 + Math.sin(i * 7.3) * 0.005;
    pts.push(p);
  }
  const mn = Math.min(...pts),
    mx = Math.max(...pts);
  const range = mx - mn || 1;
  const isUp = pts[pts.length - 1] >= pts[0];
  const lineColor = isUp ? "#1ED760" : "#f43f5e";
  const points = pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * w,
    y: h - ((v - mn) / range) * (h - 2) - 1,
  }));
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const cp = (points[i - 1].x + points[i].x) / 2;
    ctx.bezierCurveTo(cp, points[i - 1].y, cp, points[i].y, points[i].x, points[i].y);
  }
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineTo(points[points.length - 1].x, h);
  ctx.lineTo(points[0].x, h);
  ctx.closePath();
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, isUp ? "rgba(30,215,96,.25)" : "rgba(244,63,94,.25)");
  grd.addColorStop(1, "transparent");
  ctx.fillStyle = grd;
  ctx.fill();
}

/* ----------------------------- Chart data ----------------------------- */
function generateChartData(coin: Coin, period: "1H" | "4H" | "1D") {
  const price = coin.price || 0.001;
  const counts =
    period === "1H"
      ? { n: 60, change: coin.change1h || 0 }
      : period === "4H"
      ? { n: 120, change: coin.change6h || 0 }
      : { n: 200, change: coin.change24h || 0 };
  const startPrice = price / (1 + counts.change / 100);
  const diff = price - startPrice;
  const pts: number[] = [];
  for (let i = 0; i < counts.n; i++) {
    const t = i / (counts.n - 1);
    const base = startPrice + diff * t;
    const noise = base * 0.005 * Math.sin(i * 0.8) * Math.cos(i * 0.3 + 7);
    const drift = base * 0.002 * Math.sin(i * 0.15);
    pts.push(Math.max(0.000000001, base + noise + drift));
  }
  return pts;
}

/* ----------------------------- Subcomponents ----------------------------- */
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-avatar shimmer" />
    <div className="skeleton-lines">
      <div className="skeleton-line shimmer" style={{ width: "70%" }} />
      <div className="skeleton-line shimmer" style={{ width: "40%" }} />
      <div className="skeleton-line shimmer" style={{ width: "55%" }} />
    </div>
  </div>
);

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr>
    <td colSpan={cols}>
      <div className="skeleton-table-row">
        <div
          className="skeleton-avatar shimmer"
          style={{ width: 26, height: 26, borderRadius: 8 }}
        />
        <div className="skeleton-lines" style={{ flex: 1 }}>
          <div className="skeleton-line shimmer" style={{ width: "60%" }} />
          <div className="skeleton-line shimmer" style={{ width: "30%" }} />
        </div>
      </div>
    </td>
  </tr>
);

function CoinAvatar({
  coin,
  size = 36,
  rounded = 10,
  font = "0.7rem",
}: {
  coin: Coin;
  size?: number;
  rounded?: number;
  font?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (coin.imageUrl && !errored) {
    return (
      <img
        src={coin.imageUrl}
        alt=""
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          borderRadius: rounded,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: coin.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: font,
        flexShrink: 0,
        fontFamily: "Outfit, sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {coin.abbr}
    </div>
  );
}

function CoinCard({ coin, onClick }: { coin: Coin; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (canvasRef.current) drawSparkline(canvasRef.current, coin, 60, 20);
  }, [coin]);
  const isUp = coin.change24h >= 0;
  const bcColor =
    coin.progress < 30
      ? "var(--orange)"
      : coin.progress < 70
      ? "var(--blue)"
      : "var(--green)";
  const cClass = getChainClass(coin.chainId);
  return (
    <div className="coin-card" onClick={onClick}>
      <div style={{ position: "relative" }}>
        <CoinAvatar coin={coin} />
      </div>
      <div className="cc-body">
        <div className="cc-top">
          <span className="cc-name">{coin.name}</span>
          <span className="cc-ticker">{coin.ticker}</span>
          {coin.isHot && (
            <span className="hot-badge">
              <Flame size={9} />
              HOT
            </span>
          )}
        </div>
        <div className="cc-meta">
          <span>{coin.age}</span>
          <span className={`chain-badge ${cClass}`}>{coin.chain}</span>
          <span>{coin.dex}</span>
        </div>
        <div className="cc-stats">
          <span>Vol {fmt$(coin.volume24h)}</span>
          <span>Liq {fmt$(coin.liquidity)}</span>
          <span>{fmtN(coin.txns)} txns</span>
        </div>
        <div className="cc-bottom">
          <span className="cc-mcap">MCap {fmt$(coin.mcap)}</span>
          <div className="cc-right">
            <span className={`cc-change ${isUp ? "up" : "dn"}`}>
              {fmtP(coin.change24h)}
            </span>
            <canvas
              ref={canvasRef}
              className="sparkline"
              width={60}
              height={20}
            />
          </div>
        </div>
        <div className="bc-bar">
          <div
            className="bc-fill"
            style={{
              width: `${Math.min(100, coin.progress).toFixed(0)}%`,
              background: bcColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Inline SVG icons (matching FA reference) ----------------------------- */
const Flame = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 11 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12z" />
  </svg>
);
const Grad = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm0 13L5 12.18V15c0 2 3.13 5 7 5s7-3 7-5v-2.82L12 16z" />
  </svg>
);
const Trophy = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M5 4h14v2h2v3a4 4 0 0 1-4 4 5 5 0 0 1-3 2v3h3v2H7v-2h3v-3a5 5 0 0 1-3-2 4 4 0 0 1-4-4V6h2V4zm0 4v1a2 2 0 0 0 2 2V8H5zm12 0v3a2 2 0 0 0 2-2V8h-2z" />
  </svg>
);
const ChartBar = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M4 20h16v2H4zM6 10h3v8H6zm5-6h3v14h-3zm5 8h3v6h-3z" />
  </svg>
);
const Users = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3 0-8 1.5-8 4.5V20h10v-2.5c0-1 .4-2 1-2.8C10.4 13.3 9 13 8 13zm8 0c-1 0-2.4.3-3.5.8.6.8 1 1.8 1 2.8V20h10v-2.5c0-3-5-4.5-7.5-4.5z" />
  </svg>
);
const Coin = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>$</text>
  </svg>
);
const Bolt = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
const Sliders = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M3 6h11v2H3zm0 5h7v2H3zm0 5h13v2H3zM18 4h2v6h-2zm-6 5h2v6h-2zm9 5h2v6h-2z" />
  </svg>
);
const Search = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const PlusCircle = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z" />
  </svg>
);
const ClockIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 11h-5v-2h3V7h2z" />
  </svg>
);
const TrendUp = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M3 17 9 11l4 4 8-8v6h2V3h-9v2h5.5L13 12l-4-4-8 8z" />
  </svg>
);
const TrendDown = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M3 7 9 13l4-4 8 8v-6h2v9h-9v-2h5.5L13 11l-4 4-8-8z" />
  </svg>
);
const XIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" aria-hidden>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);
const CopyIcon = ({ size = 10, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
    <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11z" />
  </svg>
);
const Globe = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);

/* ----------------------------- Page ----------------------------- */
export default function MemeExplorerPage() {
  const [allPairs, setAllPairs] = useState<Coin[]>([]);
  const [newCreationPairs, setNewCreationPairs] = useState<Coin[]>([]);
  const [trendingPairs, setTrendingPairs] = useState<Coin[]>([]);
  const [graduatedPairs, setGraduatedPairs] = useState<Coin[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("trending");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeChain, setActiveChain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [progressMsg, setProgressMsg] = useState("");
  const [stats, setStats] = useState({
    tokens: "--",
    volume: "--",
    traders: "--",
    newToday: "--",
  });
  const [modalCoin, setModalCoin] = useState<Coin | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"1H" | "4H" | "1D">("1H");
  const [openFilterDD, setOpenFilterDD] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const chartDataRef = useRef<number[]>([]);
  const trendBannerRef = useRef<HTMLDivElement | null>(null);

  /* ───────── Hide MainLayout chrome ───────── */
  useEffect(() => {
    document.body.classList.add("meme-active");
    return () => document.body.classList.remove("meme-active");
  }, []);

  /* ───────── Show toast helper ───────── */
  const showToast = useCallback((msg: string) => {
    setToast({ msg });
    window.setTimeout(() => setToast(null), 3600);
  }, []);

  /* ───────── Data fetch ───────── */
  const fetchAllData = useCallback(async () => {
    const t0 = performance.now();
    const fetchedAddrs = new Set<string>();
    try {
      setProgressMsg("Phase 1: Loading token registry...");
      const [boostsR, topBoostsR, profilesR] = await Promise.allSettled([
        safeFetch(API + "/token-boosts/latest/v1"),
        safeFetch(API + "/token-boosts/top/v1"),
        safeFetch(API + "/token-profiles/latest/v1"),
      ]);
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const boostData: any[] =
        boostsR.status === "fulfilled" && Array.isArray(boostsR.value)
          ? (boostsR.value as any[])
          : [];
      const topBoostData: any[] =
        topBoostsR.status === "fulfilled" && Array.isArray(topBoostsR.value)
          ? (topBoostsR.value as any[])
          : [];
      const profileData: any[] =
        profilesR.status === "fulfilled" && Array.isArray(profilesR.value)
          ? (profilesR.value as any[])
          : [];
      const allBoosts = [...boostData, ...topBoostData];

      const addrSet = new Set<string>();
      allBoosts.forEach((b) => {
        if (b.tokenAddress) addrSet.add(b.tokenAddress);
      });
      profileData.forEach((p) => {
        if (p.tokenAddress) addrSet.add(p.tokenAddress);
      });
      const seedAddrs = [...addrSet];
      seedAddrs.forEach((a) => fetchedAddrs.add(a.toLowerCase()));

      const searchUrls1 = SEARCH_WAVE_1.map(
        (q) => API + "/latest/dex/search?q=" + encodeURIComponent(q),
      );
      const tokenUrls1 = buildTokenUrls(seedAddrs);
      let allRawPairs = await parallelFetchPairs(
        [...tokenUrls1, ...searchUrls1],
        setProgressMsg,
        "Phase 2: Search sweep",
      );
      allRawPairs = dedup(allRawPairs);

      const newAddrs = findNewAddrs(allRawPairs, fetchedAddrs);
      newAddrs.forEach((a) => fetchedAddrs.add(a.toLowerCase()));

      const searchUrls2 = SEARCH_WAVE_2.map(
        (q) => API + "/latest/dex/search?q=" + encodeURIComponent(q),
      );
      const tokenUrls2 = buildTokenUrls(newAddrs);
      const phase3Pairs = await parallelFetchPairs(
        [...tokenUrls2, ...searchUrls2],
        setProgressMsg,
        "Phase 3: Deep search",
      );
      allRawPairs = dedup([...allRawPairs, ...phase3Pairs]);

      const profileMap: Record<
        string,
        { icon?: string; description?: string; links?: unknown }
      > = {};
      profileData.forEach((p) => {
        if (p.tokenAddress)
          profileMap[p.tokenAddress.toLowerCase()] = {
            icon: p.icon,
            description: p.description,
            links: p.links,
          };
      });
      allBoosts.forEach((b) => {
        if (b.tokenAddress && b.icon) {
          const k = b.tokenAddress.toLowerCase();
          if (!profileMap[k]) profileMap[k] = {};
          profileMap[k].icon = profileMap[k].icon || b.icon;
        }
      });
      allRawPairs.forEach((p) => {
        if (p.baseToken?.address) {
          const prof = profileMap[p.baseToken.address.toLowerCase()];
          if (prof && prof.icon && !p.info?.imageUrl) {
            if (!p.info) p.info = {};
            p.info.imageUrl = prof.icon;
          }
        }
      });
      /* eslint-enable @typescript-eslint/no-explicit-any */

      const coins = allRawPairs.map(pairToCoin);

      const bestPerToken: Record<string, Coin> = {};
      coins.forEach((c) => {
        const key = (c.tokenAddress || "").toLowerCase() + "_" + (c.chainId || "");
        if (!bestPerToken[key] || c.volume24h > bestPerToken[key].volume24h)
          bestPerToken[key] = c;
      });
      const uniqueTokenPairs = Object.values(bestPerToken);

      const now = Date.now();
      const w1 = 7 * 24 * 60 * 60 * 1000;
      const h24 = 24 * 60 * 60 * 1000;

      const newCreations = coins
        .filter((c) => c.pairCreatedAt && now - c.pairCreatedAt < w1)
        .sort((a, b) => b.pairCreatedAt - a.pairCreatedAt);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const boostedAddrs = new Set(
        allBoosts.map((b: any) => (b.tokenAddress || "").toLowerCase()),
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */
      const trending = uniqueTokenPairs
        .filter((c) => {
          const addr = (c.tokenAddress || "").toLowerCase();
          return boostedAddrs.has(addr) || (c.mcap > 1000 && c.txns > 5);
        })
        .sort((a, b) => b.txns - a.txns);

      const graduated = [...uniqueTokenPairs]
        .sort((a, b) => b.mcap - a.mcap)
        .filter((c) => c.mcap > 100000);

      const totalVol = uniqueTokenPairs.reduce((s, c) => s + c.volume24h, 0);

      setAllPairs(coins);
      setNewCreationPairs(newCreations);
      setTrendingPairs(trending);
      setGraduatedPairs(graduated);
      setStats({
        tokens: coins.length.toLocaleString(),
        volume: fmt$(totalVol),
        traders: coins.filter((c) => c.txns > 0).length.toLocaleString(),
        newToday: coins
          .filter((c) => c.pairCreatedAt && now - c.pairCreatedAt < h24)
          .length.toLocaleString(),
      });

      const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
      setProgressMsg(
        "Updated " + new Date().toLocaleTimeString() + " (" + elapsed + "s)",
      );
      setIsLoading(false);
      showToast(`Loaded ${coins.length} pairs in ${elapsed}s`);
    } catch (err) {
      console.error("fetchAllData error:", err);
      setProgressMsg("Failed to load. Retrying...");
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
    const id = window.setInterval(fetchAllData, 120000);
    return () => window.clearInterval(id);
  }, [fetchAllData]);

  /* ───────── Search debounce ───────── */
  useEffect(() => {
    const t = window.setTimeout(async () => {
      const val = searchInput.trim();
      setSearchQuery(val);
      if (val.length >= 2) {
        const r = (await safeFetch(
          API + "/latest/dex/search?q=" + encodeURIComponent(val),
        )) as { pairs?: unknown[] } | null;
        if (r && Array.isArray(r.pairs)) {
          const newCoins = r.pairs.map(pairToCoin);
          setAllPairs((prev) => {
            const ids = new Set(prev.map((c) => c.id));
            const fresh = newCoins.filter((c) => !ids.has(c.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  /* ───────── Filter helper ───────── */
  const filterCoins = useCallback(
    (list: Coin[]) =>
      list.filter((c) => {
        if (activeFilter !== "all") {
          const dexLower = (c.dex || "").toLowerCase();
          if (!dexLower.includes(activeFilter)) return false;
        }
        if (activeChain !== "all") {
          if ((c.chainId || "").toLowerCase() !== activeChain) return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !c.name.toLowerCase().includes(q) &&
            !c.ticker.toLowerCase().includes(q) &&
            !c.contractAddr.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [activeFilter, activeChain, searchQuery],
  );

  /* ───────── Sort columns ───────── */
  const sortList = useCallback((list: Coin[], sort: SortKey) => {
    const fns: Record<SortKey, (a: Coin, b: Coin) => number> = {
      newest: (a, b) => b.pairCreatedAt - a.pairCreatedAt,
      oldest: (a, b) => a.pairCreatedAt - b.pairCreatedAt,
      mcap: (a, b) => b.mcap - a.mcap,
      volume: (a, b) => b.volume24h - a.volume24h,
      txns: (a, b) => b.txns - a.txns,
    };
    return [...list].sort(fns[sort]);
  }, []);

  const handleSort = (col: "new" | "grad" | "done", sort: SortKey) => {
    if (col === "new") setNewCreationPairs((p) => sortList(p, sort));
    else if (col === "grad") setTrendingPairs((p) => sortList(p, sort));
    else setGraduatedPairs((p) => sortList(p, sort));
    setOpenFilterDD(null);
  };

  /* ───────── Trending banner items ───────── */
  const trendingBannerItems = useMemo(() => {
    return [...allPairs].sort((a, b) => b.change24h - a.change24h).slice(0, 10);
  }, [allPairs]);

  /* ───────── Tables ───────── */
  const gainers = useMemo(
    () =>
      filterCoins(allPairs)
        .filter((c) => c.change24h > 0)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 200),
    [allPairs, filterCoins],
  );
  const losers = useMemo(
    () =>
      filterCoins(allPairs)
        .filter((c) => c.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h)
        .slice(0, 200),
    [allPairs, filterCoins],
  );
  const recentPairs = useMemo(
    () =>
      filterCoins(allPairs)
        .filter((c) => c.pairCreatedAt > 0)
        .sort((a, b) => b.pairCreatedAt - a.pairCreatedAt)
        .slice(0, 200),
    [allPairs, filterCoins],
  );

  /* ───────── Modal: draw chart ───────── */
  const drawChart = useCallback(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas || !chartDataRef.current.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement!.getBoundingClientRect();
    const w = rect.width;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const pad = { top: 20, right: 60, bottom: 30, left: 10 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const data = chartDataRef.current;
    const mn = Math.min(...data);
    const mx = Math.max(...data);
    const range = mx - mn || 1;
    const isUp = data[data.length - 1] >= data[0];
    const lineColor = isUp ? "#1ED760" : "#f43f5e";
    ctx.strokeStyle = "rgba(255,255,255,.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + ch * (i / 4);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      const val = mx - range * (i / 4);
      ctx.fillStyle = "rgba(139,151,168,.5)";
      ctx.font = "10px JetBrains Mono";
      ctx.textAlign = "left";
      ctx.fillText(fmtPrice(val).replace("$", ""), w - pad.right + 6, y + 3);
    }
    const periods: Record<typeof chartPeriod, string[]> = {
      "1H": ["0m", "15m", "30m", "45m", "60m"],
      "4H": ["0h", "1h", "2h", "3h", "4h"],
      "1D": ["0h", "6h", "12h", "18h", "24h"],
    };
    const xlabels = periods[chartPeriod];
    ctx.fillStyle = "rgba(139,151,168,.4)";
    ctx.font = "10px JetBrains Mono";
    ctx.textAlign = "center";
    xlabels.forEach((l, i) => {
      const x = pad.left + cw * (i / (xlabels.length - 1));
      ctx.fillText(l, x, h - 6);
    });
    const pts = data.map((v, i) => ({
      x: pad.left + (i / (data.length - 1)) * cw,
      y: pad.top + ch - ((v - mn) / range) * ch,
    }));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    const path = new Path2D();
    path.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i - 1].x + pts[i].x) / 2;
      path.bezierCurveTo(cpx, pts[i - 1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
    }
    path.lineTo(pts[pts.length - 1].x, pad.top + ch);
    path.lineTo(pts[0].x, pad.top + ch);
    path.closePath();
    const grd = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grd.addColorStop(0, isUp ? "rgba(30,215,96,.2)" : "rgba(244,63,94,.2)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fill(path);
  }, [chartPeriod]);

  /* ───────── Modal open/close ───────── */
  const openModal = useCallback(
    (coin: Coin) => {
      setModalCoin(coin);
      setChartPeriod("1H");
      chartDataRef.current = generateChartData(coin, "1H");
      document.body.style.overflow = "hidden";
      window.setTimeout(drawChart, 50);
    },
    [drawChart],
  );

  const closeModal = useCallback(() => {
    setModalCoin(null);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    if (modalCoin) {
      chartDataRef.current = generateChartData(modalCoin, chartPeriod);
      drawChart();
    }
  }, [chartPeriod, modalCoin, drawChart]);

  useEffect(() => {
    const onResize = () => modalCoin && drawChart();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [modalCoin, drawChart]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  /* ───────── Chart hover tooltip + crosshair ───────── */
  const onChartMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = chartCanvasRef.current;
      if (!canvas || !chartDataRef.current.length) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const w = rect.width;
      const h = rect.height;
      const pad = { top: 20, right: 60, bottom: 30, left: 10 };
      const cw = w - pad.left - pad.right;
      const ch = h - pad.top - pad.bottom;
      const data = chartDataRef.current;
      const idx = Math.round(((x - pad.left) / cw) * (data.length - 1));
      const tt = tooltipRef.current;
      if (!tt) return;
      if (idx < 0 || idx >= data.length) {
        tt.style.display = "none";
        return;
      }
      const val = data[idx];
      const mn = Math.min(...data);
      const mx = Math.max(...data);
      const range = mx - mn || 1;
      const px = pad.left + (idx / (data.length - 1)) * cw;
      const py = pad.top + ch - ((val - mn) / range) * ch;
      tt.style.display = "block";
      tt.style.left = px + 10 + "px";
      tt.style.top = py - 40 + "px";
      tt.querySelector<HTMLDivElement>(".ct-price")!.textContent =
        fmtPrice(val);
      const plabels: Record<typeof chartPeriod, string> = {
        "1H": "min",
        "4H": "min",
        "1D": "h",
      };
      tt.querySelector<HTMLDivElement>(".ct-time")!.textContent =
        idx + " " + plabels[chartPeriod] + " ago";
      drawChart();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = "rgba(255,255,255,.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, pad.top + ch);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(w - pad.right, py);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = data[data.length - 1] >= data[0] ? "#1ED760" : "#f43f5e";
      ctx.fill();
      ctx.restore();
    },
    [chartPeriod, drawChart],
  );

  const onChartLeave = useCallback(() => {
    if (tooltipRef.current) tooltipRef.current.style.display = "none";
    drawChart();
  }, [drawChart]);

  /* ───────── Copy address ───────── */
  const copyAddr = (addr: string) => {
    navigator.clipboard
      .writeText(addr)
      .then(() => showToast("Address copied to clipboard"))
      .catch(() => showToast("Address copied to clipboard"));
  };

  /* ───────── Trending banner: paused on hover, looped via duplicated content ───────── */
  const trendBannerHtml = useMemo(() => {
    if (!trendingBannerItems.length) return null;
    const items: React.ReactNode[] = [];
    for (let r = 0; r < 3; r++) {
      trendingBannerItems.forEach((c, i) => {
        const isUp = c.change24h >= 0;
        items.push(
          <span className="trend-item" key={`${r}-${i}`}>
            <Flame size={11} color="var(--orange)" />
            <span className="tn">{c.ticker}</span>
            <span
              className="tc"
              style={{ color: isUp ? "var(--green)" : "var(--red)" }}
            >
              {fmtP(c.change24h)}
            </span>
            {i < trendingBannerItems.length - 1 && (
              <span className="trend-sep">|</span>
            )}
          </span>,
        );
      });
      if (r < 2)
        items.push(
          <span
            className="trend-sep"
            key={`sep-${r}`}
            style={{ padding: "0 20px" }}
          >
            |
          </span>,
        );
    }
    return items;
  }, [trendingBannerItems]);

  /* ───────── Filter dropdown options ───────── */
  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "mcap", label: "Highest MCap" },
    { key: "volume", label: "Most Volume" },
    { key: "txns", label: "Most TX" },
  ];

  /* ───────── Render filtered column lists ───────── */
  const filteredNew = useMemo(
    () => filterCoins(newCreationPairs),
    [newCreationPairs, filterCoins],
  );
  const filteredGrad = useMemo(
    () => filterCoins(trendingPairs),
    [trendingPairs, filterCoins],
  );
  const filteredDone = useMemo(
    () => filterCoins(graduatedPairs),
    [graduatedPairs, filterCoins],
  );

  /* ───────── UI ───────── */
  return (
    <>
      <StyleBlock />

      <div
        className="meme-explorer fixed inset-0 z-30 flex flex-col"
        style={{
          background:
            "linear-gradient(135deg,var(--bg) 0%,var(--bg2) 100%)",
          color: "var(--t1)",
          fontFamily: "Inter,-apple-system,sans-serif",
        }}
      >
        <TickerBar />
        <DashboardNavbar />

        {/* Mobile-only sidebar trigger (matches accounts-page) */}
        <div className="flex items-center border-b border-[rgba(255,255,255,0.06)] bg-[rgba(7,8,12,0.75)] px-3 py-1.5 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Toggle navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
          >
            <Menu className="h-[1.05rem] w-[1.05rem]" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="main">
            {/* HEADER */}
            <div className="page-hdr">
              <div>
                <div className="page-hdr-left">
                  <h1>
                    <Flame size={22} color="var(--orange)" />
                    Meme Explorer
                  </h1>
                  <span className="live-badge">
                    <span className="dot" />
                    LIVE
                  </span>
                  <span className="last-updated">{progressMsg}</span>
                </div>
                <div className="page-hdr-sub">
                  Discover trending meme coins, new launches, and top
                  performers via DexScreener
                </div>
              </div>
              <div className="search-wrap">
                <span className="search-ico">
                  <Search />
                </span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search tokens by name or ticker..."
                />
              </div>
            </div>

            {/* STATS */}
            <div className="stats-row">
              <div className="stat-pill glass">
                <div className="si accent">
                  <Coin />
                </div>
                <div>
                  <div className="sv">{stats.tokens}</div>
                  <div className="sl">Total Pairs Found</div>
                </div>
              </div>
              <div className="stat-pill glass">
                <div className="si blue">
                  <ChartBar />
                </div>
                <div>
                  <div className="sv">{stats.volume}</div>
                  <div className="sl">24h Volume</div>
                </div>
              </div>
              <div className="stat-pill glass">
                <div className="si green">
                  <Users />
                </div>
                <div>
                  <div className="sv">{stats.traders}</div>
                  <div className="sl">Active Pairs</div>
                </div>
              </div>
              <div className="stat-pill glass">
                <div className="si orange">
                  <Bolt />
                </div>
                <div>
                  <div className="sv">{stats.newToday}</div>
                  <div className="sl">New Today</div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="tab-bar">
              {(
                [
                  ["trending", "Trending"],
                  ["newpairs", "New Pairs"],
                  ["gainers", "Gainers"],
                  ["losers", "Losers"],
                  ["recent", "Recently Added"],
                ] as const
              ).map(([k, l]) => (
                <button
                  key={k}
                  className={`tab-btn ${activeTab === k ? "on" : ""}`}
                  onClick={() => setActiveTab(k)}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* PLATFORM PILLS */}
            <div className="pill-bar">
              {[
                ["all", "All Platforms"],
                ["pumpfun", "Pump.fun"],
                ["raydium", "Raydium"],
                ["jupiter", "Jupiter"],
                ["uniswap", "Uniswap"],
                ["pancakeswap", "PancakeSwap"],
                ["sushiswap", "SushiSwap"],
                ["orca", "Orca"],
                ["meteora", "Meteora"],
                ["aerodrome", "Aerodrome"],
                ["camelot", "Camelot"],
                ["trader-joe", "Trader Joe"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  className={`pill-btn ${activeFilter === k ? "on" : ""}`}
                  onClick={() => setActiveFilter(k)}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* CHAIN PILLS */}
            <div className="pill-bar" style={{ marginTop: "-12px" }}>
              {[
                ["all", "All Chains", ""],
                ["solana", "Solana", "#9945FF"],
                ["ethereum", "Ethereum", "#627EEA"],
                ["bsc", "BSC", "#F3BA2F"],
                ["base", "Base", "#0052FF"],
                ["arbitrum", "Arbitrum", "#28A0F0"],
                ["polygon", "Polygon", "#8247E5"],
                ["avalanche", "Avalanche", "#E84142"],
                ["optimism", "Optimism", "#FF0420"],
              ].map(([k, l, color]) => (
                <button
                  key={k}
                  className={`pill-btn ${activeChain === k ? "on" : ""}`}
                  onClick={() => setActiveChain(k)}
                >
                  {color && (
                    <span style={{ color, marginRight: 4 }}>●</span>
                  )}
                  {l}
                </button>
              ))}
            </div>

            {/* TREND BANNER */}
            <div className="trend-banner">
              <div className="trend-track" ref={trendBannerRef}>
                {trendBannerHtml ?? (
                  <span className="trend-item">
                    <span className="tn">Loading trending...</span>
                  </span>
                )}
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "trending" && (
              <div className="col-grid">
                <ColumnCard
                  id="new"
                  title="New Creations"
                  icon={<Flame size={13} color="var(--orange)" />}
                  isOpenDD={openFilterDD === "new"}
                  onToggleDD={() =>
                    setOpenFilterDD(openFilterDD === "new" ? null : "new")
                  }
                  sortOptions={SORT_OPTIONS}
                  onSort={(s) => handleSort("new", s)}
                >
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  ) : filteredNew.length === 0 ? (
                    <div className="no-results">
                      <Search size={18} /> No tokens found
                    </div>
                  ) : (
                    filteredNew.map((c) => (
                      <CoinCard
                        key={c.id}
                        coin={c}
                        onClick={() => openModal(c)}
                      />
                    ))
                  )}
                </ColumnCard>

                <ColumnCard
                  id="grad"
                  title="About to Graduate"
                  icon={<Grad size={13} color="var(--blue)" />}
                  isOpenDD={openFilterDD === "grad"}
                  onToggleDD={() =>
                    setOpenFilterDD(openFilterDD === "grad" ? null : "grad")
                  }
                  sortOptions={SORT_OPTIONS}
                  onSort={(s) => handleSort("grad", s)}
                >
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  ) : filteredGrad.length === 0 ? (
                    <div className="no-results">
                      <Search size={18} /> No tokens found
                    </div>
                  ) : (
                    filteredGrad.map((c) => (
                      <CoinCard
                        key={c.id}
                        coin={c}
                        onClick={() => openModal(c)}
                      />
                    ))
                  )}
                </ColumnCard>

                <ColumnCard
                  id="done"
                  title="Graduated"
                  icon={<Trophy size={13} color="var(--green)" />}
                  isOpenDD={openFilterDD === "done"}
                  onToggleDD={() =>
                    setOpenFilterDD(openFilterDD === "done" ? null : "done")
                  }
                  sortOptions={SORT_OPTIONS}
                  onSort={(s) => handleSort("done", s)}
                >
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  ) : filteredDone.length === 0 ? (
                    <div className="no-results">
                      <Search size={18} /> No tokens found
                    </div>
                  ) : (
                    filteredDone.map((c) => (
                      <CoinCard
                        key={c.id}
                        coin={c}
                        onClick={() => openModal(c)}
                      />
                    ))
                  )}
                </ColumnCard>
              </div>
            )}

            {activeTab === "gainers" && (
              <TableSection
                title="Top Gainers (24h)"
                icon={<TrendUp size={14} color="var(--green)" />}
              >
                <GainerLoserTable
                  rows={gainers}
                  isLoading={isLoading}
                  changeColor="var(--green)"
                  emptyMsg="No gainers found"
                  onRowClick={openModal}
                />
              </TableSection>
            )}

            {activeTab === "losers" && (
              <TableSection
                title="Top Losers (24h)"
                icon={<TrendDown size={14} color="var(--red)" />}
              >
                <GainerLoserTable
                  rows={losers}
                  isLoading={isLoading}
                  changeColor="var(--red)"
                  emptyMsg="No losers found"
                  onRowClick={openModal}
                />
              </TableSection>
            )}

            {activeTab === "newpairs" && (
              <TableSection
                title="New Pairs"
                icon={<PlusCircle size={14} color="var(--accent)" />}
              >
                <PairsTable
                  rows={recentPairs}
                  isLoading={isLoading}
                  onRowClick={openModal}
                />
              </TableSection>
            )}

            {activeTab === "recent" && (
              <TableSection
                title="Recently Added"
                icon={<ClockIcon size={14} color="var(--amber)" />}
              >
                <RecentTable
                  rows={recentPairs}
                  isLoading={isLoading}
                  onRowClick={openModal}
                />
              </TableSection>
            )}
          </main>
        </div>
      </div>

      {/* MODAL */}
      {modalCoin && (
        <div
          className="modal-overlay show"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-card">
            <div className="modal-close" onClick={closeModal}>
              <XIcon />
            </div>
            <div className="modal-header">
              <div style={{ position: "relative" }}>
                <CoinAvatar
                  coin={modalCoin}
                  size={48}
                  rounded={14}
                  font="1rem"
                />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="modal-title">{modalCoin.name}</span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      color: "var(--t3)",
                      fontSize: ".82rem",
                    }}
                  >
                    {modalCoin.ticker}
                  </span>
                  <span
                    className={`chain-badge ${getChainClass(modalCoin.chainId)}`}
                  >
                    {modalCoin.chain}
                  </span>
                  <span style={{ fontSize: ".68rem", color: "var(--t3)" }}>
                    {modalCoin.dex}
                  </span>
                  {modalCoin.isHot && (
                    <span className="hot-badge">
                      <Flame size={9} />
                      HOT
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-price-row">
              <span className="modal-price">{fmtPrice(modalCoin.price)}</span>
              <span
                className="modal-pchange"
                style={{
                  color:
                    modalCoin.change24h >= 0 ? "var(--green)" : "var(--red)",
                }}
              >
                {modalCoin.change24h >= 0 ? "▲" : "▼"} {fmtP(modalCoin.change24h)}
              </span>
            </div>

            <ModalStats coin={modalCoin} />

            <div className="chart-wrap">
              <div className="chart-periods">
                {(["1H", "4H", "1D"] as const).map((p) => (
                  <button
                    key={p}
                    className={chartPeriod === p ? "on" : ""}
                    onClick={() => setChartPeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <canvas
                ref={chartCanvasRef}
                className="chart-canvas"
                onMouseMove={onChartMove}
                onMouseLeave={onChartLeave}
              />
              <div className="chart-tooltip" ref={tooltipRef}>
                <div className="ct-price" />
                <div className="ct-time" />
              </div>
            </div>

            <div className="token-info">
              <div className="ti-grid">
                <TiItem
                  label="Token Address"
                  value={
                    modalCoin.contractAddr
                      ? modalCoin.contractAddr.slice(0, 8) +
                        "..." +
                        modalCoin.contractAddr.slice(-6)
                      : "N/A"
                  }
                  onCopy={
                    modalCoin.contractAddr
                      ? () => copyAddr(modalCoin.contractAddr)
                      : undefined
                  }
                />
                <TiItem
                  label="Pair Address"
                  value={
                    modalCoin.pairAddress
                      ? modalCoin.pairAddress.slice(0, 8) +
                        "..." +
                        modalCoin.pairAddress.slice(-6)
                      : "N/A"
                  }
                  onCopy={
                    modalCoin.pairAddress
                      ? () => copyAddr(modalCoin.pairAddress)
                      : undefined
                  }
                />
                <TiItem
                  label="Chain"
                  customValue={
                    <span
                      className={`chain-badge ${getChainClass(modalCoin.chainId)}`}
                    >
                      {modalCoin.chain}
                    </span>
                  }
                />
                <TiItem label="DEX" value={modalCoin.dex || "Unknown"} />
                <TiItem label="Age" value={modalCoin.age} />
                <TiItem
                  label="Total TX (24h)"
                  value={fmtN(modalCoin.txns)}
                />
              </div>
            </div>

            <div className="social-row">
              {modalCoin.socials?.map((s, i) => {
                const t = (s.type || "").toLowerCase();
                const label =
                  t === "twitter" || t === "x"
                    ? "Twitter"
                    : t === "telegram"
                    ? "Telegram"
                    : t === "discord"
                    ? "Discord"
                    : s.type || "Link";
                return (
                  <a
                    key={i}
                    className="social-link"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                );
              })}
              {modalCoin.websites?.map((w, i) => (
                <a
                  key={`w-${i}`}
                  className="social-link"
                  href={(w.url || w) as string}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={12} />
                  Website
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast.msg}</div>
        </div>
      )}
    </>
  );
}

/* ----------------------------- ColumnCard ----------------------------- */
function ColumnCard({
  title,
  icon,
  isOpenDD,
  onToggleDD,
  sortOptions,
  onSort,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpenDD: boolean;
  onToggleDD: () => void;
  sortOptions: { key: SortKey; label: string }[];
  onSort: (s: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass col-card">
      <div className="col-hdr">
        <h3>
          {icon}
          {title}
        </h3>
        <div className="filter-btn-wrap" style={{ position: "relative" }}>
          <button className="filter-btn" onClick={onToggleDD}>
            <Sliders />
          </button>
          {isOpenDD && (
            <div className="filter-dd show">
              {sortOptions.map((o) => (
                <div
                  key={o.key}
                  className="filter-dd-item"
                  onClick={() => onSort(o.key)}
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-list">{children}</div>
    </div>
  );
}

/* ----------------------------- TableSection ----------------------------- */
function TableSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass" style={{ marginBottom: 24 }}>
      <div className="section-hdr">
        <h3>
          {icon}
          {title}
        </h3>
      </div>
      <div className="section-body">
        <div className="tbl-wrap">{children}</div>
      </div>
    </div>
  );
}

function GainerLoserTable({
  rows,
  isLoading,
  changeColor,
  emptyMsg,
  onRowClick,
}: {
  rows: Coin[];
  isLoading: boolean;
  changeColor: string;
  emptyMsg: string;
  onRowClick: (c: Coin) => void;
}) {
  return (
    <table className="dt">
      <thead>
        <tr>
          <th>#</th>
          <th>Token</th>
          <th>Chain</th>
          <th>Price</th>
          <th>5m</th>
          <th>1h</th>
          <th>6h</th>
          <th>24h</th>
          <th>MCap</th>
          <th>Volume</th>
          <th>Liquidity</th>
          <th>TXs</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} cols={12} />
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={12} className="no-results">
              {emptyMsg}
            </td>
          </tr>
        ) : (
          rows.map((c, i) => (
            <tr key={c.id} onClick={() => onRowClick(c)}>
              <td style={{ color: "var(--t3)", fontFamily: "var(--mono)" }}>
                {i + 1}
              </td>
              <td>
                <div className="tbl-token">
                  <CoinAvatar
                    coin={c}
                    size={26}
                    rounded={8}
                    font="0.56rem"
                  />
                  <div>
                    <div className="tbl-name">{c.name}</div>
                    <div className="tbl-ticker">{c.ticker}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`chain-badge ${getChainClass(c.chainId)}`}>
                  {c.chain}
                </span>
              </td>
              <Td>{fmtPrice(c.price)}</Td>
              <ChangeTd v={c.change5m} />
              <ChangeTd v={c.change1h} />
              <ChangeTd v={c.change6h} />
              <td
                style={{
                  color: changeColor,
                  fontFamily: "var(--mono)",
                  fontSize: ".7rem",
                  fontWeight: 700,
                }}
              >
                {fmtP(c.change24h)}
              </td>
              <Td>{fmt$(c.mcap)}</Td>
              <Td>{fmt$(c.volume24h)}</Td>
              <Td>{fmt$(c.liquidity)}</Td>
              <Td>{fmtN(c.txns)}</Td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function PairsTable({
  rows,
  isLoading,
  onRowClick,
}: {
  rows: Coin[];
  isLoading: boolean;
  onRowClick: (c: Coin) => void;
}) {
  return (
    <table className="dt">
      <thead>
        <tr>
          <th>Pair</th>
          <th>DEX</th>
          <th>Chain</th>
          <th>Age</th>
          <th>Liquidity</th>
          <th>Price</th>
          <th>MCap</th>
          <th>5m</th>
          <th>1h</th>
          <th>24h Vol</th>
          <th>B/S (24h)</th>
          <th>24h</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} cols={12} />
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={12} className="no-results">
              No pairs found
            </td>
          </tr>
        ) : (
          rows.map((c) => {
            const isUp = c.change24h >= 0;
            return (
              <tr key={c.id} onClick={() => onRowClick(c)}>
                <td>
                  <div className="tbl-token">
                    <CoinAvatar
                      coin={c}
                      size={26}
                      rounded={8}
                      font="0.56rem"
                    />
                    <div>
                      <div className="tbl-name">{c.ticker}</div>
                      <div className="tbl-ticker">{c.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: ".7rem" }}>{c.dex}</td>
                <td>
                  <span className={`chain-badge ${getChainClass(c.chainId)}`}>
                    {c.chain}
                  </span>
                </td>
                <Td>{c.age}</Td>
                <Td>{fmt$(c.liquidity)}</Td>
                <Td>{fmtPrice(c.price)}</Td>
                <Td>{fmt$(c.mcap)}</Td>
                <ChangeTd v={c.change5m} />
                <ChangeTd v={c.change1h} />
                <Td>{fmt$(c.volume24h)}</Td>
                <td
                  style={{ fontFamily: "var(--mono)", fontSize: ".7rem" }}
                >
                  <span style={{ color: "var(--green)" }}>
                    {fmtN(c.buys24h)}
                  </span>
                  <span style={{ color: "var(--t4)" }}> / </span>
                  <span style={{ color: "var(--red)" }}>
                    {fmtN(c.sells24h)}
                  </span>
                </td>
                <td
                  style={{
                    color: isUp ? "var(--green)" : "var(--red)",
                    fontFamily: "var(--mono)",
                    fontSize: ".7rem",
                    fontWeight: 700,
                  }}
                >
                  {fmtP(c.change24h)}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

function RecentTable({
  rows,
  isLoading,
  onRowClick,
}: {
  rows: Coin[];
  isLoading: boolean;
  onRowClick: (c: Coin) => void;
}) {
  return (
    <table className="dt">
      <thead>
        <tr>
          <th>#</th>
          <th>Token</th>
          <th>Chain</th>
          <th>DEX</th>
          <th>Age</th>
          <th>Price</th>
          <th>MCap</th>
          <th>Liquidity</th>
          <th>Volume</th>
          <th>5m</th>
          <th>1h</th>
          <th>24h</th>
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} cols={12} />
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={12} className="no-results">
              No tokens found
            </td>
          </tr>
        ) : (
          rows.map((c, i) => {
            const isUp = c.change24h >= 0;
            return (
              <tr key={c.id} onClick={() => onRowClick(c)}>
                <td
                  style={{ color: "var(--t3)", fontFamily: "var(--mono)" }}
                >
                  {i + 1}
                </td>
                <td>
                  <div className="tbl-token">
                    <CoinAvatar
                      coin={c}
                      size={26}
                      rounded={8}
                      font="0.56rem"
                    />
                    <div>
                      <div className="tbl-name">{c.name}</div>
                      <div className="tbl-ticker">{c.ticker}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`chain-badge ${getChainClass(c.chainId)}`}>
                    {c.chain}
                  </span>
                </td>
                <td style={{ fontSize: ".7rem" }}>{c.dex}</td>
                <Td>{c.age}</Td>
                <Td>{fmtPrice(c.price)}</Td>
                <Td>{fmt$(c.mcap)}</Td>
                <Td>{fmt$(c.liquidity)}</Td>
                <Td>{fmt$(c.volume24h)}</Td>
                <ChangeTd v={c.change5m} />
                <ChangeTd v={c.change1h} />
                <td
                  style={{
                    color: isUp ? "var(--green)" : "var(--red)",
                    fontFamily: "var(--mono)",
                    fontSize: ".7rem",
                    fontWeight: 700,
                  }}
                >
                  {fmtP(c.change24h)}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ fontFamily: "var(--mono)", fontSize: ".7rem" }}>{children}</td>
  );
}

function ChangeTd({ v }: { v: number }) {
  return (
    <td
      style={{
        color: v >= 0 ? "var(--green)" : "var(--red)",
        fontFamily: "var(--mono)",
        fontSize: ".7rem",
      }}
    >
      {fmtP(v)}
    </td>
  );
}

function ModalStats({ coin }: { coin: Coin }) {
  const items: { label: string; val: React.ReactNode; color?: string }[] = [
    { label: "Market Cap", val: fmt$(coin.mcap) },
    { label: "FDV", val: fmt$(coin.fdv) },
    { label: "Liquidity", val: fmt$(coin.liquidity) },
    { label: "Total TX (24h)", val: fmtN(coin.txns) },
    {
      label: "Price Native",
      val: parseFloat(coin.priceNative || "0").toFixed(6) + " " + coin.quoteToken,
    },
  ];
  const changes = [
    { label: "5m", val: fmtP(coin.change5m), color: coin.change5m >= 0 ? "var(--green)" : "var(--red)" },
    { label: "1h", val: fmtP(coin.change1h), color: coin.change1h >= 0 ? "var(--green)" : "var(--red)" },
    { label: "6h", val: fmtP(coin.change6h), color: coin.change6h >= 0 ? "var(--green)" : "var(--red)" },
    { label: "24h", val: fmtP(coin.change24h), color: coin.change24h >= 0 ? "var(--green)" : "var(--red)" },
    { label: "Vol 24h", val: fmt$(coin.volume24h) },
  ];
  const vols = [
    { label: "Vol 5m", val: fmt$(coin.volume5m) },
    { label: "Vol 1h", val: fmt$(coin.volume1h) },
    { label: "Vol 6h", val: fmt$(coin.volume6h) },
    { label: "Buys 24h", val: fmtN(coin.buys24h), color: "var(--green)" },
    { label: "Sells 24h", val: fmtN(coin.sells24h), color: "var(--red)" },
  ];
  return (
    <div className="modal-stats">
      {[...items, ...changes, ...vols].map((it, i) => (
        <div className="ms-item" key={i}>
          <div className="ms-label">{it.label}</div>
          <div className="ms-val" style={it.color ? { color: it.color } : undefined}>
            {it.val}
          </div>
        </div>
      ))}
    </div>
  );
}

function TiItem({
  label,
  value,
  customValue,
  onCopy,
}: {
  label: string;
  value?: string;
  customValue?: React.ReactNode;
  onCopy?: () => void;
}) {
  return (
    <div className="ti-item">
      <span className="til">{label}</span>
      <span className="tiv">
        {customValue ?? value}
        {onCopy && (
          <button
            className="copy-btn"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            aria-label="Copy"
          >
            <CopyIcon />
          </button>
        )}
      </span>
    </div>
  );
}

/* ----------------------------- Style block ----------------------------- */
function StyleBlock() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

body.meme-active .fixed.top-0.left-0.right-0.z-20,
body.meme-active .fixed.top-\\[60px\\].left-0.bottom-0 {
  display: none !important;
}
body.meme-active .flex.flex-1.pt-\\[90px\\] { padding-top: 0 !important; }
body.meme-active .flex-1.md\\:ml-\\[80px\\] { margin-left: 0 !important; }

.meme-explorer {
  --accent:#00dfa2; --accent-light:#00ffc3; --accent-dark:#00b881;
  --accent-dim:rgba(0,223,162,0.1); --accent-glow:rgba(0,223,162,0.25);
  --bg:#07080c; --bg2:#0a0d15;
  --t1:#eef2f7; --t2:#8b97a8; --t3:#4a5468; --t4:#3a4556;
  --glass-bg:rgba(255,255,255,0.04); --glass-border:rgba(255,255,255,0.08);
  --green:#1ED760; --green-dim:rgba(30,215,96,.1);
  --red:#f43f5e; --red-dim:rgba(244,63,94,.1);
  --orange:#FF9800; --orange-dim:rgba(255,152,0,.08);
  --blue:#5b8def; --blue-dim:rgba(91,141,239,.1);
  --amber:#F0B429;
  --sans:'Inter',-apple-system,sans-serif;
  --heading:'Outfit',sans-serif;
  --mono:'JetBrains Mono',monospace;
  --radius:8px; --radius-lg:12px; --radius-xl:16px;
}
.meme-explorer ::-webkit-scrollbar { width:4px; height:4px; }
.meme-explorer ::-webkit-scrollbar-track { background: transparent; }
.meme-explorer ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
.meme-explorer ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.2); }

/* MAIN */
.meme-explorer .main { padding:24px 28px; overflow-y:auto; }
@media(max-width:768px) { .meme-explorer .main { padding:14px; } }

/* GLASS */
.meme-explorer .glass {
  background: linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  position: relative; overflow: hidden;
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
}
.meme-explorer .glass::before{
  content:''; position:absolute; top:0; left:0; right:0; height:100%;
  background:linear-gradient(175deg,rgba(255,255,255,.04),transparent 40%);
  pointer-events:none; border-radius:var(--radius-xl);
}

/* HEADER */
.meme-explorer .page-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
.meme-explorer .page-hdr-left { display:flex; align-items:center; gap:14px; }
.meme-explorer .page-hdr-left h1 { font-family:var(--heading); font-size:1.55rem; font-weight:800; letter-spacing:-.03em; display:flex; align-items:center; gap:8px; }
.meme-explorer .page-hdr-sub { font-size:.78rem; color:var(--t3); font-weight:500; margin-top:2px; }
.meme-explorer .live-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:20px; font-size:.7rem; font-weight:700; background:var(--green-dim); color:var(--green); border:1px solid rgba(30,215,96,.2); }
.meme-explorer .live-badge .dot { width:6px; height:6px; border-radius:50%; background:var(--green); box-shadow:0 0 8px var(--green); animation: meme-pulse 2s ease-in-out infinite; }
@keyframes meme-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.meme-explorer .last-updated { font-size:.65rem; color:var(--t3); font-family:var(--mono); margin-left:8px; }

/* SEARCH */
.meme-explorer .search-wrap { position:relative; max-width:360px; width:100%; }
.meme-explorer .search-wrap input { width:100%; padding:9px 14px 9px 38px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; color:var(--t1); font-size:.8rem; font-family:var(--sans); outline:none; transition: border-color .2s, background .2s; }
.meme-explorer .search-wrap input:focus { border-color: var(--accent); background: rgba(0,223,162,.04); }
.meme-explorer .search-wrap input::placeholder { color: var(--t3); }
.meme-explorer .search-wrap .search-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--t3); display:flex; align-items:center; }

/* STATS */
.meme-explorer .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
@media(max-width:900px) { .meme-explorer .stats-row { grid-template-columns: repeat(2,1fr); } }
@media(max-width:500px) { .meme-explorer .stats-row { grid-template-columns: 1fr; } }
.meme-explorer .stat-pill { display:flex; align-items:center; gap:10px; padding:14px 18px; border-radius:var(--radius-lg); position:relative; }
.meme-explorer .stat-pill .si { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:.85rem; flex-shrink:0; position:relative; z-index:1; }
.meme-explorer .stat-pill > div:last-child { position:relative; z-index:1; }
.meme-explorer .stat-pill .si.green { background:var(--green-dim); color:var(--green); }
.meme-explorer .stat-pill .si.blue { background:var(--blue-dim); color:var(--blue); }
.meme-explorer .stat-pill .si.orange { background:var(--orange-dim); color:var(--orange); }
.meme-explorer .stat-pill .si.accent { background:var(--accent-dim); color:var(--accent); }
.meme-explorer .stat-pill .sv { font-family:var(--mono); font-size:1.1rem; font-weight:700; color:var(--t1); }
.meme-explorer .stat-pill .sl { font-size:.68rem; color:var(--t3); font-weight:500; }

/* TABS */
.meme-explorer .tab-bar { display:flex; gap:4px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px; }
.meme-explorer .tab-btn { padding:8px 20px; border-radius:20px; font-size:.76rem; font-weight:600; border:1px solid transparent; background:rgba(255,255,255,.03); color:var(--t3); cursor:pointer; white-space:nowrap; transition:all .2s; }
.meme-explorer .tab-btn:hover { background:rgba(255,255,255,.06); color:var(--t2); }
.meme-explorer .tab-btn.on { background:var(--accent-dim); color:var(--accent); border-color: rgba(0,223,162,.2); }

/* PILLS */
.meme-explorer .pill-bar { display:flex; gap:6px; margin-bottom:20px; overflow-x:auto; padding-bottom:4px; }
.meme-explorer .pill-btn { padding:6px 16px; border-radius:16px; font-size:.7rem; font-weight:600; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.03); color:var(--t3); cursor:pointer; white-space:nowrap; transition: all .2s; }
.meme-explorer .pill-btn:hover { background:rgba(255,255,255,.06); color:var(--t2); }
.meme-explorer .pill-btn.on { background:var(--accent-dim); color:var(--accent); border-color: rgba(0,223,162,.2); }

/* TREND BANNER */
.meme-explorer .trend-banner { background: linear-gradient(90deg,rgba(244,63,94,.08),rgba(255,152,0,.08),rgba(0,223,162,.08)); border:1px solid rgba(255,255,255,.06); border-radius:var(--radius-lg); padding:10px 0; margin-bottom:18px; overflow:hidden; white-space:nowrap; position:relative; }
.meme-explorer .trend-banner::before, .meme-explorer .trend-banner::after { content:''; position:absolute; top:0; bottom:0; width:40px; z-index:2; pointer-events:none; }
.meme-explorer .trend-banner::before { left:0; background: linear-gradient(90deg, var(--bg), transparent); }
.meme-explorer .trend-banner::after  { right:0; background: linear-gradient(270deg, var(--bg), transparent); }
.meme-explorer .trend-track { display:inline-flex; animation: meme-trend-scroll 20s linear infinite; }
@keyframes meme-trend-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
.meme-explorer .trend-item { display:inline-flex; align-items:center; gap:6px; padding:0 24px; font-size:.76rem; font-weight:700; }
.meme-explorer .trend-item .tn { color:var(--t1); }
.meme-explorer .trend-item .tc { font-family:var(--mono); font-size:.72rem; }
.meme-explorer .trend-sep { color:var(--t4); padding:0 8px; font-size:.6rem; }

/* COL GRID */
.meme-explorer .col-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-bottom:24px; }
@media(max-width:1100px) { .meme-explorer .col-grid { grid-template-columns: 1fr; } }
.meme-explorer .col-card { padding:0; max-height:780px; display:flex; flex-direction:column; }
.meme-explorer .col-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 10px; border-bottom:1px solid rgba(255,255,255,.04); flex-shrink:0; position:relative; z-index:2; }
.meme-explorer .col-hdr h3 { font-family:var(--heading); font-size:.88rem; font-weight:700; display:flex; align-items:center; gap:8px; }
.meme-explorer .col-hdr .filter-btn { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); color:var(--t3); cursor:pointer; transition:all .15s; }
.meme-explorer .col-hdr .filter-btn:hover { background: rgba(255,255,255,.08); color: var(--t1); }
.meme-explorer .filter-dd { position:absolute; top:34px; right:0; background: rgba(10,13,21,.96); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:6px; min-width:140px; z-index:50; backdrop-filter:blur(30px); }
.meme-explorer .filter-dd-item { padding:6px 12px; font-size:.7rem; color:var(--t2); border-radius:6px; cursor:pointer; transition:all .15s; white-space:nowrap; }
.meme-explorer .filter-dd-item:hover { background:rgba(255,255,255,.06); color:var(--t1); }
.meme-explorer .col-list { padding:8px 10px; overflow-y:auto; flex:1; position:relative; z-index:1; }

/* COIN CARD */
.meme-explorer .coin-card { display:flex; align-items:flex-start; gap:10px; padding:10px; border-radius:10px; cursor:pointer; transition:all .15s; border:1px solid transparent; margin-bottom:4px; }
.meme-explorer .coin-card:hover { background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.06); }
.meme-explorer .cc-body { flex:1; min-width:0; }
.meme-explorer .cc-top { display:flex; align-items:center; gap:6px; margin-bottom:2px; }
.meme-explorer .cc-name { font-size:.78rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.meme-explorer .cc-ticker { font-size:.65rem; color:var(--t3); font-family:var(--mono); font-weight:600; }
.meme-explorer .hot-badge { display:inline-flex; align-items:center; gap:3px; padding:1px 6px; border-radius:6px; font-size:.55rem; font-weight:800; background:rgba(244,63,94,.12); color:var(--red); animation: meme-hot-pulse 1.5s ease-in-out infinite; text-transform:uppercase; letter-spacing:.04em; }
@keyframes meme-hot-pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
.meme-explorer .cc-meta { display:flex; align-items:center; gap:6px; font-size:.62rem; color:var(--t3); margin-bottom:4px; flex-wrap:wrap; }
.meme-explorer .chain-badge { padding:1px 6px; border-radius:4px; font-size:.56rem; font-weight:700; font-family:var(--mono); }
.meme-explorer .chain-sol { background:rgba(153,69,255,.15); color:#9945FF; }
.meme-explorer .chain-eth { background:rgba(98,126,234,.15); color:#627EEA; }
.meme-explorer .chain-bsc { background:rgba(243,186,47,.15); color:#F3BA2F; }
.meme-explorer .chain-base { background:rgba(0,82,255,.15); color:#0052FF; }
.meme-explorer .chain-arb { background:rgba(40,160,240,.15); color:#28A0F0; }
.meme-explorer .chain-pol { background:rgba(130,71,229,.15); color:#8247E5; }
.meme-explorer .chain-default { background:rgba(255,255,255,.08); color:var(--t2); }
.meme-explorer .cc-stats { display:flex; align-items:center; gap:8px; font-size:.62rem; color:var(--t3); margin-bottom:3px; }
.meme-explorer .cc-bottom { display:flex; align-items:center; justify-content:space-between; gap:6px; }
.meme-explorer .cc-mcap { font-family:var(--mono); font-size:.64rem; color:var(--t2); font-weight:600; }
.meme-explorer .cc-change { font-family:var(--mono); font-size:.66rem; font-weight:700; }
.meme-explorer .cc-change.up { color:var(--green); }
.meme-explorer .cc-change.dn { color:var(--red); }
.meme-explorer .cc-right { display:flex; align-items:center; gap:8px; }
.meme-explorer .bc-bar { width:100%; height:4px; background:rgba(255,255,255,.06); border-radius:4px; margin-top:4px; overflow:hidden; }
.meme-explorer .bc-fill { height:100%; border-radius:4px; transition: width .5s; }
.meme-explorer .sparkline { flex-shrink:0; }

/* SKELETON */
.meme-explorer .skeleton-card { display:flex; align-items:flex-start; gap:10px; padding:10px; margin-bottom:4px; }
.meme-explorer .skeleton-avatar { width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.06); flex-shrink:0; }
.meme-explorer .skeleton-lines { flex:1; display:flex; flex-direction:column; gap:6px; padding-top:4px; }
.meme-explorer .skeleton-line { height:10px; border-radius:4px; background:rgba(255,255,255,.06); }
.meme-explorer .shimmer { position:relative; overflow:hidden; }
.meme-explorer .shimmer::after { content:''; position:absolute; top:0; left:0; right:0; bottom:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent); animation: meme-shimmer 1.5s infinite; }
@keyframes meme-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
.meme-explorer .skeleton-table-row { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,.03); }
.meme-explorer .skeleton-table-row .skeleton-line { height:12px; }

/* TABLES */
.meme-explorer .tbl-wrap { overflow-x:auto; }
.meme-explorer table.dt { width:100%; border-collapse:collapse; font-size:.74rem; }
.meme-explorer table.dt th { text-align:left; padding:10px 12px; color:var(--t3); font-weight:600; font-size:.66rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid rgba(255,255,255,.04); white-space:nowrap; }
.meme-explorer table.dt td { padding:8px 12px; border-bottom:1px solid rgba(255,255,255,.03); white-space:nowrap; }
.meme-explorer table.dt tr { transition: background .15s; cursor:pointer; }
.meme-explorer table.dt tbody tr:hover { background: rgba(255,255,255,.03); }
.meme-explorer .tbl-token { display:flex; align-items:center; gap:8px; }
.meme-explorer .tbl-name { font-weight:600; }
.meme-explorer .tbl-ticker { color:var(--t3); font-family:var(--mono); font-size:.64rem; }

/* SECTION HDR */
.meme-explorer .section-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 10px; border-bottom:1px solid rgba(255,255,255,.04); }
.meme-explorer .section-hdr h3 { font-family:var(--heading); font-size:.88rem; font-weight:700; display:flex; align-items:center; gap:8px; }
.meme-explorer .section-body { padding:10px 14px; overflow-x:auto; }

/* NO RESULTS / ERROR */
.meme-explorer .no-results { text-align:center; padding:40px 20px; color:var(--t3); font-size:.82rem; }

/* MODAL */
.modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.65); backdrop-filter:blur(12px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto; }
.modal-overlay .modal-card {
  background:linear-gradient(145deg,rgba(14,17,26,.98),rgba(10,13,21,.99));
  border:1px solid rgba(255,255,255,.08);
  border-radius:20px; max-width:820px; width:100%; max-height:90vh; overflow-y:auto;
  position:relative; box-shadow: 0 32px 80px rgba(0,0,0,.6);
  color:#eef2f7;
  font-family:'Inter',-apple-system,sans-serif;
}
.modal-overlay .modal-close { position:absolute; top:14px; right:14px; width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); color:#8b97a8; cursor:pointer; transition: all .15s; z-index:10; }
.modal-overlay .modal-close:hover { background: rgba(255,255,255,.1); color:#eef2f7; }
.modal-overlay .modal-header { padding:24px 24px 16px; display:flex; align-items:center; gap:14px; }
.modal-overlay .modal-title { font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; }
.modal-overlay .modal-price-row { padding:0 24px 16px; display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
.modal-overlay .modal-price { font-family:'JetBrains Mono',monospace; font-size:1.6rem; font-weight:700; }
.modal-overlay .modal-pchange { font-family:'JetBrains Mono',monospace; font-size:.88rem; font-weight:700; }
.modal-overlay .modal-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; padding:0 24px 18px; }
@media(max-width:600px) { .modal-overlay .modal-stats { grid-template-columns: repeat(2,1fr); } }
.modal-overlay .ms-item { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); border-radius:10px; padding:10px 12px; text-align:center; }
.modal-overlay .ms-label { font-size:.6rem; color:#4a5468; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
.modal-overlay .ms-val { font-family:'JetBrains Mono',monospace; font-size:.82rem; font-weight:700; color:#eef2f7; }
.modal-overlay .chain-badge { padding:1px 6px; border-radius:4px; font-size:.56rem; font-weight:700; font-family:'JetBrains Mono',monospace; }
.modal-overlay .chain-sol { background:rgba(153,69,255,.15); color:#9945FF; }
.modal-overlay .chain-eth { background:rgba(98,126,234,.15); color:#627EEA; }
.modal-overlay .chain-bsc { background:rgba(243,186,47,.15); color:#F3BA2F; }
.modal-overlay .chain-base { background:rgba(0,82,255,.15); color:#0052FF; }
.modal-overlay .chain-arb { background:rgba(40,160,240,.15); color:#28A0F0; }
.modal-overlay .chain-pol { background:rgba(130,71,229,.15); color:#8247E5; }
.modal-overlay .chain-default { background:rgba(255,255,255,.08); color:#8b97a8; }
.modal-overlay .hot-badge { display:inline-flex; align-items:center; gap:3px; padding:1px 6px; border-radius:6px; font-size:.55rem; font-weight:800; background:rgba(244,63,94,.12); color:#f43f5e; text-transform:uppercase; letter-spacing:.04em; }

/* CHART */
.modal-overlay .chart-wrap { padding:0 24px 18px; position:relative; }
.modal-overlay .chart-canvas { width:100%; height:280px; border-radius:12px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.04); cursor:crosshair; }
.modal-overlay .chart-periods { display:flex; gap:4px; margin-bottom:10px; }
.modal-overlay .chart-periods button { padding:5px 14px; border-radius:8px; font-size:.68rem; font-weight:700; border:1px solid transparent; background:rgba(255,255,255,.04); color:#4a5468; cursor:pointer; transition: all .15s; font-family:'JetBrains Mono',monospace; }
.modal-overlay .chart-periods button:hover { background: rgba(255,255,255,.08); color:#8b97a8; }
.modal-overlay .chart-periods button.on { background:rgba(0,223,162,.1); color:#00dfa2; border-color: rgba(0,223,162,.2); }
.modal-overlay .chart-tooltip { position:absolute; background:rgba(10,13,21,.95); border:1px solid rgba(255,255,255,.12); border-radius:8px; padding:8px 12px; font-size:.7rem; pointer-events:none; z-index:10; display:none; }
.modal-overlay .chart-tooltip .ct-price { font-family:'JetBrains Mono',monospace; font-weight:700; color:#eef2f7; margin-bottom:2px; }
.modal-overlay .chart-tooltip .ct-time { font-size:.6rem; color:#4a5468; }

/* TOKEN INFO */
.modal-overlay .token-info { padding:0 24px 18px; }
.modal-overlay .ti-grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
@media(max-width:500px) { .modal-overlay .ti-grid { grid-template-columns: 1fr; } }
.modal-overlay .ti-item { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.04); border-radius:8px; }
.modal-overlay .ti-item .til { font-size:.68rem; color:#4a5468; font-weight:500; }
.modal-overlay .ti-item .tiv { font-family:'JetBrains Mono',monospace; font-size:.7rem; color:#eef2f7; font-weight:600; display:flex; align-items:center; gap:6px; }
.modal-overlay .copy-btn { width:22px; height:22px; border-radius:6px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.05); border:none; color:#4a5468; cursor:pointer; transition: all .15s; }
.modal-overlay .copy-btn:hover { background:rgba(0,223,162,.1); color:#00dfa2; }

/* SOCIAL */
.modal-overlay .social-row { display:flex; gap:8px; padding:0 24px 24px; flex-wrap:wrap; }
.modal-overlay .social-link { display:flex; align-items:center; gap:6px; padding:7px 16px; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); color:#8b97a8; font-size:.72rem; font-weight:600; cursor:pointer; transition: all .15s; text-decoration:none; }
.modal-overlay .social-link:hover { background:rgba(255,255,255,.08); color:#eef2f7; }

/* TOAST */
.toast-wrap { position:fixed; top:48px; right:20px; z-index:2000; display:flex; flex-direction:column; gap:8px; }
.toast { padding:12px 20px; border-radius:10px; font-size:.76rem; font-weight:600; background:rgba(10,13,21,.95); border:1px solid rgba(255,255,255,.1); color:#eef2f7; box-shadow:0 8px 24px rgba(0,0,0,.4); display:flex; align-items:center; gap:8px; backdrop-filter:blur(20px); animation: meme-toast-in .3s ease, meme-toast-out .3s ease 3.2s forwards; }
@keyframes meme-toast-in { from{opacity:0; transform:translateX(40px)} to{opacity:1; transform:translateX(0)} }
@keyframes meme-toast-out { from{opacity:1; transform:translateX(0)} to{opacity:0; transform:translateX(40px)} }
`}</style>
  );
}

