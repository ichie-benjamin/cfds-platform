import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Coins,
  Crown,
  Diamond,
  Gem,
  Headphones,
  Infinity as InfinityIcon,
  Layers,
  ShieldHalf,
  Star,
  Trophy,
  Vault,
  Award,
  FlaskRound,
  Globe,
  ChartBar,
  HelpCircle,
  TriangleAlert,
  X,
  Menu,
} from "lucide-react";
import useUserStore from "@/store/userStore";
import useSiteSettingsStore from "@/store/siteSettingStore";
import { TickerBar } from "@/components/dashboard/TickerBar";

// ──────────────────────────────────────────────────────────────
// STATIC TIER SPEC (presentational, from reference)
// ──────────────────────────────────────────────────────────────

type TierAccent = "gold" | "platinum" | "diamond" | "black" | "purple" | "super";

interface Tier {
  tier: number;
  slug: string;
  name: string;
  accent: TierAccent;
  minDeposit: string;
  minDepositNumeric: number;
  maker: string;
  taker: string;
  bonus: string;
  goldOz?: string;
  goldStars?: number;
  benefits: string[];
  goldBenefit?: string;
  badgeIcon: "circle" | "gem" | "diamond" | "trophy" | "infinity";
  recommended?: boolean;
}

const TIERS: Tier[] = [
  {
    tier: 1,
    slug: "Gold",
    name: "Gold",
    accent: "gold",
    minDeposit: "$10,000",
    minDepositNumeric: 10000,
    maker: "0.08%",
    taker: "0.10%",
    bonus: "+5%",
    badgeIcon: "circle",
    benefits: [
      "Reduced trading fees 0.08% / 0.10%",
      "Priority support, 4hr response",
      "Basic technical analysis tools",
      "Weekly market insights newsletter",
      "Copy trading feature access",
      "Standard API, 10 req/sec",
      "Email + live chat support",
      "5% bonus on first deposit",
    ],
  },
  {
    tier: 2,
    slug: "Gold Plus",
    name: "Gold Plus",
    accent: "gold",
    minDeposit: "$50,000",
    minDepositNumeric: 50000,
    maker: "0.06%",
    taker: "0.08%",
    bonus: "+8%",
    badgeIcon: "circle",
    benefits: [
      "All Gold benefits included",
      "Priority support, 2hr response",
      "Advanced charting 50+ indicators",
      "Dedicated account advisor (shared)",
      "OTC trading desk (min $10K)",
      "Fixed spreads on major pairs",
      "Enhanced API, 20 req/sec",
      "Monthly portfolio review report",
    ],
  },
  {
    tier: 3,
    slug: "Platinum",
    name: "Platinum",
    accent: "platinum",
    minDeposit: "$100,000",
    minDepositNumeric: 100000,
    maker: "0.04%",
    taker: "0.06%",
    bonus: "+10%",
    badgeIcon: "gem",
    recommended: true,
    benefits: [
      "All Gold Plus benefits included",
      "Priority support, 1hr response",
      "Full TradingView Premium integration",
      "Personal account manager (1-on-1)",
      "Free crypto-to-fiat withdrawals ×5/mo",
      "VIP trading signals, 3× daily",
      "Real-time technical analysis suite",
      "Tighter fixed spreads on all pairs",
      "Quarterly strategy consultation call",
      "Early access to new coin listings",
      "Dedicated phone support line",
      "API, 50 req/sec",
    ],
  },
  {
    tier: 4,
    slug: "Platinum Elite",
    name: "Platinum Elite",
    accent: "platinum",
    minDeposit: "$250,000",
    minDepositNumeric: 250000,
    maker: "0.03%",
    taker: "0.05%",
    bonus: "+12%",
    badgeIcon: "gem",
    benefits: [
      "All Platinum benefits included",
      "Dedicated 1-on-1 account manager",
      "Unlimited free withdrawals",
      "VIP trading signals, 5× daily + alerts",
      "Custom trading bots setup assistance",
      "Priority order execution engine",
      "Institutional-grade research reports",
      "Exclusive crypto conference invitations",
      "Annual tax optimization consultation",
      "API, 100 req/sec",
    ],
  },
  {
    tier: 5,
    slug: "Diamond",
    name: "Diamond",
    accent: "diamond",
    minDeposit: "$500,000",
    minDepositNumeric: 500000,
    maker: "0.02%",
    taker: "0.04%",
    bonus: "+15%",
    goldOz: "Up to 1 oz / quarter",
    goldStars: 1,
    goldBenefit: "Physical gold, 1 oz per quarter",
    badgeIcon: "diamond",
    benefits: [
      "All Platinum Elite benefits",
      "Private banking liaison assigned",
      "Custom liquidity provision",
      "White-glove client referral onboarding",
      "Priority fund manager matching",
      "Premium insurance, $500K coverage",
      "VIP lounge access at conferences",
      "Annual office visit (travel covered)",
      "Custom market data feeds",
      "API, 200 req/sec",
    ],
  },
  {
    tier: 6,
    slug: "Diamond Elite",
    name: "Diamond Elite",
    accent: "diamond",
    minDeposit: "$1,000,000",
    minDepositNumeric: 1000000,
    maker: "0.015%",
    taker: "0.03%",
    bonus: "+18%",
    goldOz: "Up to 5 oz / quarter",
    goldStars: 2,
    goldBenefit: "Physical gold, 5 oz per quarter",
    badgeIcon: "diamond",
    benefits: [
      "All Diamond benefits",
      "Dedicated senior account director",
      "Custom algo trading infrastructure",
      "Direct market access (DMA)",
      "Institutional lending rates",
      "Co-investment with top fund managers",
      "Annual tax & estate planning consultation",
      "Premium insurance, $1M coverage",
      "Priority block trade execution",
      "Custom reporting dashboards",
    ],
  },
  {
    tier: 7,
    slug: "Black",
    name: "Black",
    accent: "black",
    minDeposit: "$2,500,000",
    minDepositNumeric: 2500000,
    maker: "0.01%",
    taker: "0.02%",
    bonus: "+20%",
    goldOz: "Up to 15 oz / quarter",
    goldStars: 3,
    goldBenefit: "Physical gold, 15 oz per quarter",
    badgeIcon: "circle",
    benefits: [
      "All Diamond Elite benefits",
      "Private wealth management team",
      "Custom OTC desk with dedicated liquidity",
      "Bespoke trading infrastructure",
      "Early access to pre-ICO/IDO investments",
      "Annual luxury retreat invitation",
      "Private jet partnership (discounts)",
      "Premium insurance, $2.5M coverage",
      "Family office support services",
      "Dedicated compliance officer",
    ],
  },
  {
    tier: 8,
    slug: "Black Elite",
    name: "Black Elite",
    accent: "black",
    minDeposit: "$5,000,000",
    minDepositNumeric: 5000000,
    maker: "0.008%",
    taker: "0.015%",
    bonus: "+22%",
    goldOz: "Up to 30 oz / quarter",
    goldStars: 4,
    goldBenefit: "Physical gold, 30 oz per quarter",
    badgeIcon: "circle",
    benefits: [
      "All Black benefits",
      "CIO consultation (quarterly)",
      "Custom market-making arrangements",
      "Private vault storage",
      "24/7 concierge personal assistant",
      "Annual VIP event",
      "Exclusive travel partnerships",
      "Premium insurance, $5M coverage",
      "Custom legal counsel access",
      "Board advisory opportunity",
    ],
  },
  {
    tier: 9,
    slug: "MVP",
    name: "MVP",
    accent: "purple",
    minDeposit: "$10,000,000",
    minDepositNumeric: 10000000,
    maker: "0.005%",
    taker: "0.01%",
    bonus: "+25%",
    goldOz: "Up to 50 oz / quarter",
    goldStars: 5,
    goldBenefit: "Physical gold, 50 oz per quarter",
    badgeIcon: "trophy",
    benefits: [
      "All Black Elite benefits",
      "Seat on Client Advisory Board",
      "Personal CFO services",
      "Direct line to CEO",
      "Custom fund structuring",
      "Multi-family office integration",
      "Premium banking account setup",
      "Global event invitations",
      "Premium insurance, $10M coverage",
      "Naming rights on platform features",
    ],
  },
];

const SUPER_MVP: Tier = {
  tier: 10,
  slug: "Super MVP",
  name: "SUPER MVP",
  accent: "super",
  minDeposit: "$200,000,000",
  minDepositNumeric: 200000000,
  maker: "0.00%",
  taker: "0.00%",
  bonus: "+30%",
  goldOz: "Up to 200 oz / quarter",
  goldStars: 6,
  badgeIcon: "infinity",
  benefits: [],
};

// Compare table
const COMPARE_HEADERS = [
  { label: "Gold", color: "#c8e64e" },
  { label: "Gold+", color: "#c8e64e" },
  { label: "Platinum", color: "#D0DCE8" },
  { label: "Plat. Elite", color: "#D0DCE8" },
  { label: "Diamond", color: "#89C4F8" },
  { label: "Diam. Elite", color: "#89C4F8" },
  { label: "Black", color: "#00dfa2" },
  { label: "Black Elite", color: "#00dfa2" },
  { label: "MVP", color: "#a78bfa" },
  { label: "Super MVP", color: "#00ffc3" },
];

type CmpCell =
  | { kind: "mono"; value: string; variant?: "green" | "gold" }
  | { kind: "check" }
  | { kind: "times" }
  | { kind: "text"; value: string; variant?: "gold" };

interface CmpRow {
  label: string;
  cells: CmpCell[];
}

interface CmpSection {
  category: string;
  rows: CmpRow[];
}

const mono = (value: string, variant?: "green" | "gold"): CmpCell => ({
  kind: "mono",
  value,
  variant,
});
const text = (value: string, variant?: "gold"): CmpCell => ({
  kind: "text",
  value,
  variant,
});
const chk: CmpCell = { kind: "check" };
const xs: CmpCell = { kind: "times" };

const COMPARE_SECTIONS: CmpSection[] = [
  {
    category: "Minimum Deposit",
    rows: [
      {
        label: "Min. Deposit Required",
        cells: [
          mono("$10K"),
          mono("$50K"),
          mono("$100K"),
          mono("$250K"),
          mono("$500K"),
          mono("$1M"),
          mono("$2.5M"),
          mono("$5M"),
          mono("$10M"),
          mono("$200M", "gold"),
        ],
      },
      {
        label: "First Deposit Bonus",
        cells: [
          mono("+5%", "green"),
          mono("+8%", "green"),
          mono("+10%", "green"),
          mono("+12%", "green"),
          mono("+15%", "green"),
          mono("+18%", "green"),
          mono("+20%", "green"),
          mono("+22%", "green"),
          mono("+25%", "green"),
          mono("+30%", "gold"),
        ],
      },
    ],
  },
  {
    category: "Trading Fees",
    rows: [
      {
        label: "Maker Fee",
        cells: [
          mono("0.08%"),
          mono("0.06%"),
          mono("0.04%"),
          mono("0.03%"),
          mono("0.02%"),
          mono("0.015%"),
          mono("0.01%"),
          mono("0.008%"),
          mono("0.005%"),
          mono("0.00%", "gold"),
        ],
      },
      {
        label: "Taker Fee",
        cells: [
          mono("0.10%"),
          mono("0.08%"),
          mono("0.06%"),
          mono("0.05%"),
          mono("0.04%"),
          mono("0.03%"),
          mono("0.02%"),
          mono("0.015%"),
          mono("0.01%"),
          mono("0.00%", "gold"),
        ],
      },
      {
        label: "Fixed Spreads",
        cells: [
          xs,
          text("Major pairs"),
          text("All pairs"),
          text("Tighter"),
          text("Custom"),
          text("Custom"),
          text("Custom"),
          text("Custom"),
          text("Custom"),
          text("Tightest", "gold"),
        ],
      },
      {
        label: "Free Withdrawals",
        cells: [
          xs,
          xs,
          text("5/month"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited", "gold"),
        ],
      },
    ],
  },
  {
    category: "Support",
    rows: [
      {
        label: "Support Response Time",
        cells: [
          text("4 hours"),
          text("2 hours"),
          text("1 hour"),
          text("30 min"),
          text("15 min"),
          text("10 min"),
          text("5 min"),
          text("5 min"),
          text("Immediate"),
          text("Dedicated", "gold"),
        ],
      },
      {
        label: "Personal Account Manager",
        cells: [
          xs,
          text("Shared"),
          chk,
          text("1-on-1"),
          text("Senior"),
          text("Director"),
          text("Team"),
          text("Team"),
          text("C-Suite"),
          text("5+ Team", "gold"),
        ],
      },
      {
        label: "Phone Support",
        cells: [xs, xs, chk, chk, chk, chk, chk, chk, chk, chk],
      },
      {
        label: "24/7 Concierge",
        cells: [xs, xs, xs, xs, xs, xs, xs, chk, chk, chk],
      },
    ],
  },
  {
    category: "Tools & Analytics",
    rows: [
      {
        label: "Technical Analysis Tools",
        cells: [
          text("Basic"),
          text("Advanced"),
          text("Premium"),
          text("Full Suite"),
          text("Custom"),
          text("Custom"),
          text("Bespoke"),
          text("Bespoke"),
          text("Bespoke"),
          text("Full Custom", "gold"),
        ],
      },
      {
        label: "TradingView Integration",
        cells: [
          xs,
          text("Standard"),
          text("Premium"),
          text("Premium+"),
          text("Premium+"),
          text("Premium+"),
          text("Premium+"),
          text("Premium+"),
          text("Premium+"),
          text("Premium+", "gold"),
        ],
      },
      {
        label: "VIP Trading Signals",
        cells: [
          xs,
          xs,
          text("3×/day"),
          text("5×/day"),
          text("5×/day"),
          text("5×/day"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited"),
          text("Unlimited", "gold"),
        ],
      },
      {
        label: "API Rate Limits",
        cells: [
          mono("10 r/s"),
          mono("20 r/s"),
          mono("50 r/s"),
          mono("100 r/s"),
          mono("200 r/s"),
          mono("500 r/s"),
          mono("1K r/s"),
          mono("5K r/s"),
          mono("10K r/s"),
          mono("Unlimited", "gold"),
        ],
      },
    ],
  },
  {
    category: "Physical Gold Delivery",
    rows: [
      {
        label: "Physical Gold (LBMA certified)",
        cells: [
          xs,
          xs,
          xs,
          xs,
          mono("1 oz/qtr", "gold"),
          mono("5 oz/qtr", "gold"),
          mono("15 oz/qtr", "gold"),
          mono("30 oz/qtr", "gold"),
          mono("50 oz/qtr", "gold"),
          mono("200 oz/qtr", "gold"),
        ],
      },
      {
        label: "Gold Purity",
        cells: [
          xs,
          xs,
          xs,
          xs,
          text("999.9"),
          text("999.9"),
          text("999.9"),
          text("999.9"),
          text("999.9"),
          text("999.9", "gold"),
        ],
      },
      {
        label: "Worldwide Gold Delivery",
        cells: [xs, xs, xs, xs, chk, chk, chk, chk, chk, text("Unlimited", "gold")],
      },
    ],
  },
  {
    category: "Insurance & Protection",
    rows: [
      {
        label: "Asset Insurance Coverage",
        cells: [
          text("Standard"),
          text("Standard"),
          text("Standard"),
          text("Standard"),
          mono("$500K"),
          mono("$1M"),
          mono("$2.5M"),
          mono("$5M"),
          mono("$10M"),
          mono("$50M+", "gold"),
        ],
      },
      {
        label: "Private Banking",
        cells: [
          xs,
          xs,
          xs,
          xs,
          text("Liaison"),
          text("Liaison"),
          chk,
          chk,
          text("Full Account"),
          text("Full Account", "gold"),
        ],
      },
    ],
  },
  {
    category: "Exclusive Access",
    rows: [
      {
        label: "OTC Trading Desk",
        cells: [
          xs,
          text("Shared"),
          text("Shared"),
          text("Shared"),
          text("Dedicated"),
          text("Dedicated"),
          text("Custom"),
          text("Custom"),
          text("Custom"),
          text("Custom", "gold"),
        ],
      },
      {
        label: "Pre-ICO / IDO Access",
        cells: [xs, xs, xs, xs, xs, xs, chk, chk, chk, chk],
      },
      {
        label: "Conference / Event Invitations",
        cells: [
          xs,
          xs,
          xs,
          text("Crypto events"),
          text("VIP Lounge"),
          text("VIP Lounge"),
          text("Luxury Retreat"),
          text("VIP Events"),
          text("Global Events"),
          text("All + $100K", "gold"),
        ],
      },
      {
        label: "Office Visit",
        cells: [
          xs,
          xs,
          xs,
          xs,
          text("Annual"),
          text("Annual"),
          text("Annual"),
          text("Annual"),
          text("Annual"),
          text("Open Access", "gold"),
        ],
      },
      {
        label: "White-Label Platform",
        cells: [xs, xs, xs, xs, xs, xs, xs, xs, xs, chk],
      },
    ],
  },
];

interface GoldRow {
  tier: string;
  badge: string;
  minDeposit: string;
  allowance: string;
  frequency: string;
  purity: string;
  insurance: string;
  accent?: string;
}

const GOLD_ROWS: GoldRow[] = [
  {
    tier: "Diamond",
    badge: "Tier 5",
    minDeposit: "$500,000",
    allowance: "1 oz",
    frequency: "Quarterly",
    purity: "999.9",
    insurance: "Up to $3,000",
  },
  {
    tier: "Diamond Elite",
    badge: "Tier 6",
    minDeposit: "$1,000,000",
    allowance: "5 oz",
    frequency: "Quarterly",
    purity: "999.9",
    insurance: "Up to $15,000",
  },
  {
    tier: "Black",
    badge: "Tier 7",
    minDeposit: "$2,500,000",
    allowance: "15 oz",
    frequency: "Quarterly",
    purity: "999.9",
    insurance: "Up to $45,000",
  },
  {
    tier: "Black Elite",
    badge: "Tier 8",
    minDeposit: "$5,000,000",
    allowance: "30 oz",
    frequency: "Quarterly",
    purity: "999.9",
    insurance: "Up to $90,000",
  },
  {
    tier: "MVP",
    badge: "Tier 9",
    minDeposit: "$10,000,000",
    allowance: "50 oz",
    frequency: "Quarterly",
    purity: "999.9",
    insurance: "Up to $150,000",
  },
  {
    tier: "Super MVP",
    badge: "Tier 10",
    minDeposit: "$200,000,000",
    allowance: "200 oz",
    frequency: "Quarterly (Unlimited)",
    purity: "999.9",
    insurance: "Full Coverage",
    accent: "#00dfa2",
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How are VIP account thresholds calculated, is it based on deposit or portfolio value?",
    a: "Account tier eligibility is based on your minimum net deposit into the 1 Trade Market platform. This means the actual fiat or crypto value you deposit, not including unrealized gains. Once you meet the threshold, your tier is activated within 24-48 hours and remains active as long as your balance stays above the minimum requirement. Temporary dips below the threshold (due to market movement) will not immediately trigger a downgrade, our team evaluates this on a monthly basis with a 7-day grace period.",
  },
  {
    q: "When and how can I request physical gold delivery?",
    a: "Physical gold delivery is available quarterly for all accounts from Diamond tier ($500,000) and above. To initiate a delivery request, contact your assigned account manager or submit a request via the dashboard's Premium Benefits section. Deliveries are processed within 10-15 business days and are accompanied by LBMA assay certificates confirming 999.9 fine gold purity. All deliveries are fully insured during transit. As an alternative, clients may opt to store their allocated gold in our secure vault at no additional charge.",
  },
  {
    q: "Can I lose my VIP status if my balance drops?",
    a: "Your VIP tier status is protected for a minimum of 30 days after any drop below the tier threshold. This allows for market recovery or additional deposits. After the grace period, if your balance remains below the minimum, your account will be reviewed by our client success team who will work with you on a transition plan. Benefits such as dedicated account managers and fixed spreads will be maintained during this review period. We do not downgrade accounts without personal consultation first.",
  },
  {
    q: "Are there any restrictions on the 0.00% trading fees for Super MVP accounts?",
    a: "Super MVP account holders enjoy zero trading fees (0.00% maker and taker) on all standard spot, margin, and futures trading pairs available on the platform. This applies to an unlimited volume of trades. The only exceptions are network/blockchain withdrawal fees for external transfers (these are third-party costs passed through at cost), and fees for certain specialized OTC or structured products which may have custom pricing agreed upon in your client agreement.",
  },
  {
    q: "What premium residency assistance is available for Super MVP clients?",
    a: "For Super MVP clients, 1 Trade Market can introduce you to our network of immigration lawyers and wealth management consultants who specialize in investor residency programmes. This includes various residency pathways available to high-net-worth individuals. Our team facilitates introductions, provides referrals, and assists with documentation, though the legal process is handled by licensed attorneys. This is an introduction and support service, not a guarantee of residency approval.",
  },
  {
    q: "Can I upgrade multiple tiers at once if I make a large deposit?",
    a: "Yes, absolutely. If your deposit qualifies you for a higher tier, for example, depositing $1,000,000 which qualifies you for Diamond Elite, you will be placed directly at that tier, skipping intermediate tiers. All benefits of your final qualifying tier will be immediately activated. You do not need to \"earn\" through lower tiers. Contact your account manager when making a large deposit and they will expedite your tier review and onboarding.",
  },
];

// ──────────────────────────────────────────────────────────────
// Helpers for tier color accents
// ──────────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<TierAccent, { text: string; border: string; badgeBg: string; badgeBorder: string }> = {
  gold: {
    text: "#c8e64e",
    border: "rgba(200,230,78,0.25)",
    badgeBg: "rgba(200,230,78,0.1)",
    badgeBorder: "rgba(200,230,78,0.25)",
  },
  platinum: {
    text: "#D0DCE8",
    border: "rgba(184,196,208,0.2)",
    badgeBg: "rgba(184,196,208,0.08)",
    badgeBorder: "rgba(184,196,208,0.2)",
  },
  diamond: {
    text: "#89C4F8",
    border: "rgba(120,180,232,0.2)",
    badgeBg: "rgba(120,180,232,0.08)",
    badgeBorder: "rgba(120,180,232,0.2)",
  },
  black: {
    text: "#00dfa2",
    border: "rgba(0,223,162,0.15)",
    badgeBg: "rgba(0,223,162,0.08)",
    badgeBorder: "rgba(0,223,162,0.25)",
  },
  purple: {
    text: "#a78bfa",
    border: "rgba(139,92,246,0.3)",
    badgeBg: "rgba(139,92,246,0.1)",
    badgeBorder: "rgba(139,92,246,0.3)",
  },
  super: {
    text: "#00ffc3",
    border: "rgba(0,223,162,0.2)",
    badgeBg: "rgba(0,223,162,0.08)",
    badgeBorder: "rgba(0,223,162,0.18)",
  },
};

const UPGRADE_BTN_STYLES: Record<TierAccent, string> = {
  gold: "bg-gradient-to-br from-[#c8e64e] to-[#a8c01a] text-[#07080c]",
  platinum: "bg-gradient-to-br from-[#D0DCE8] to-[#8A9BB0] text-[#07080c]",
  diamond: "bg-gradient-to-br from-[#89C4F8] to-[#4A7FB8] text-white",
  black:
    "bg-gradient-to-br from-[rgba(0,223,162,0.15)] to-[rgba(0,223,162,0.08)] text-[#00dfa2] border border-[rgba(0,223,162,0.3)]",
  purple: "bg-gradient-to-br from-[#a78bfa] to-[#6D28D9] text-white",
  super: "bg-gradient-to-br from-[#00b881] to-[#00dfa2] text-[#07080c] text-[0.9rem] py-3.5 font-bold",
};

function BadgeIcon({ kind }: { kind: Tier["badgeIcon"] }) {
  switch (kind) {
    case "circle":
      return <Circle className="h-[0.6rem] w-[0.6rem] fill-current" />;
    case "gem":
      return <Gem className="h-[0.7rem] w-[0.7rem]" />;
    case "diamond":
      return <Diamond className="h-[0.7rem] w-[0.7rem]" />;
    case "trophy":
      return <Trophy className="h-[0.75rem] w-[0.75rem]" />;
    case "infinity":
      return <InfinityIcon className="h-[0.8rem] w-[0.8rem]" />;
  }
}

function StarRow({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-[0.55rem] w-[0.55rem] fill-current" />
      ))}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────

export default function TradingPlansPage() {
  const user = useUserStore((state) => state.user);
  const settings = useSiteSettingsStore((state) => state.settings);
  const navigate = useNavigate();

  const currentPlanTitle = user?.account_type?.title || "";
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const brandName = settings?.name || "1 Trade Market";
  const brandCode = brandName.slice(0, 3).toUpperCase();

  // Match MainLayout-hiding pattern used on wallet page
  useEffect(() => {
    document.body.classList.add("plans-active");
    return () => {
      document.body.classList.remove("plans-active");
    };
  }, []);

  // Load the Google Fonts the reference hero depends on (Outfit + Inter).
  // Scoped to this page: appended on mount, removed on unmount.
  useEffect(() => {
    const existing = document.querySelector<HTMLLinkElement>(
      'link[data-tp-fonts="1"]',
    );
    if (existing) return;
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    preconnect1.dataset.tpFonts = "1";
    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    preconnect2.dataset.tpFonts = "1";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    fontLink.dataset.tpFonts = "1";
    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(preconnect1);
      document.head.removeChild(preconnect2);
      document.head.removeChild(fontLink);
    };
  }, []);

  const currentTier = TIERS.find(
    (t) => t.slug.toLowerCase() === currentPlanTitle.toLowerCase(),
  );
  const isSuperCurrent = currentPlanTitle.toLowerCase() === "super mvp";

  const handleUpgrade = () => {
    navigate("/main/wallet");
  };

  return (
    <>
      {/* Hide MainLayout chrome while this page is mounted */}
      <style>{`
        body.plans-active .fixed.top-0.left-0.right-0.z-20,
        body.plans-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.plans-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.plans-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }
        @keyframes tp-shimmer { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
        .tp-shimmer { animation: tp-shimmer 3s ease-in-out infinite; }

        /* Page-scoped ticker overrides to match html_files/trading-plans.html exactly.
           Targets only descendants of .tp-ticker-wrap so the shared TickerBar
           component remains unchanged for all other pages. */
        .tp-ticker-wrap > div {
          height: 34px !important;
          background: rgba(7,8,12,0.65) !important;
          border-bottom: 1px solid rgba(255,255,255,0.04) !important;
        }
        .tp-ticker-wrap [data-ticker-price],
        .tp-ticker-wrap span:has(+ [data-ticker-price]) {
          font-size: 0.68rem !important;
        }
        .tp-ticker-wrap [data-ticker-price] ~ span {
          font-size: 0.65rem !important;
        }

        /* Responsive navbar: switch to hamburger/mobile-nav below lg (1024px). */
        @media (max-width: 1023px) {
          .tp-nav-links { display: none !important; }
          .tp-mobile-toggle { display: inline-flex !important; }
        }
        @media (min-width: 1024px) {
          .tp-mobile-menu { display: none !important; }
        }
        @media (max-width: 768px) {
          .tp-nav { padding-left: 12px !important; padding-right: 12px !important; gap: 12px !important; }
          .tp-nav-link { font-size: 0.72rem !important; padding: 5px 8px !important; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col overflow-y-auto font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
        }}
      >
        {/* Ticker strip */}
        <div className="tp-ticker-wrap">
          <TickerBar />
        </div>

        {/* NAV */}
        <nav
          className="tp-nav sticky top-0 z-[200] flex h-[60px] items-center gap-6 border-b-[1.5px] border-[rgba(255,255,255,0.08)] px-6 backdrop-blur-[40px]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Link
            to="/main/dashboard"
            className="flex shrink-0 items-center gap-2.5 text-[#eef2f7]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg font-[Outfit,sans-serif] text-[0.7rem] font-extrabold text-[#07080c]"
              style={{ background: "linear-gradient(135deg,#00dfa2,#00b881)" }}
            >
              {brandCode}
            </div>
            <div className="flex flex-col font-[Outfit,sans-serif] text-[1rem] font-bold leading-[1.1]">
              <span className="font-bold text-[#eef2f7]">1 Trade</span>
              <span className="font-semibold text-[#00dfa2]">Market</span>
            </div>
          </Link>

          <div className="tp-nav-links flex flex-1 gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { label: "Dashboard", href: "/main/dashboard" },
              { label: "Markets", href: "/main/market" },
              { label: "Trade", href: "/main/dashboard" },
              { label: "Wallet", href: "/main/wallet" },
              { label: "Fund Managers", href: "/main/fund-managers" },
              { label: "Staking", href: "/main/savings" },
              { label: "Trade Access", href: "/main/trade-access" },
              { label: "Trading Plans", href: "/main/trading-plans" },
              { label: "Fund Protection", href: "/main/fund-protection" },
            ].map((link) => {
              const isActive = link.href === "/main/trading-plans";
              const className = `tp-nav-link whitespace-nowrap rounded-md px-2.5 py-1.5 text-[0.78rem] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(0,223,162,0.1)] font-semibold text-[#00dfa2]"
                  : "text-[#8b97a8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#eef2f7]"
              }`;
              if (link.href) {
                return (
                  <Link key={link.label} to={link.href} className={className}>
                    {link.label}
                  </Link>
                );
              }
              return (
                <span
                  key={link.label}
                  className={`${className} cursor-pointer`}
                  role="link"
                  aria-disabled="true"
                >
                  {link.label}
                </span>
              );
            })}
          </div>

          {/* Right cluster. `ml-auto` keeps it pinned right when .tp-nav-links
              is hidden below lg (since the links' flex-1 no longer spans). */}
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              className="tp-mobile-toggle hidden h-[34px] w-[34px] items-center justify-center rounded-[8px] text-[#8b97a8] transition-colors hover:text-[#eef2f7]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {mobileMenuOpen ? (
                <X className="h-[1rem] w-[1rem]" />
              ) : (
                <Menu className="h-[1rem] w-[1rem]" />
              )}
            </button>
            <div
              className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[rgba(255,255,255,0.12)] text-[0.65rem] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#00dfa2,#00b881)" }}
              title={`${user?.first_name || ""} ${user?.last_name || ""}`.trim()}
            >
              {initials}
            </div>
          </div>
        </nav>

        {/* Mobile dropdown — only when open; hidden ≥ lg by CSS */}
        {mobileMenuOpen && (
          <div
            className="tp-mobile-menu sticky top-[60px] z-[150] flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] px-4 py-3 backdrop-blur-[40px]"
            style={{ background: "rgba(10,13,21,0.96)" }}
          >
            {[
              { label: "Dashboard", href: "/main/dashboard" },
              { label: "Markets", href: "/main/market" },
              { label: "Trade", href: "/main/dashboard" },
              { label: "Wallet", href: "/main/wallet" },
              { label: "Fund Managers", href: "/main/fund-managers" },
              { label: "Staking", href: "/main/savings" as string | null },
              { label: "Trade Access", href: "/main/trade-access" },
              { label: "Trading Plans", href: "/main/trading-plans" },
              { label: "Fund Protection", href: "/main/fund-protection" as string | null },
            ].map((link) => {
              const isActive = link.href === "/main/trading-plans";
              const cls = `rounded-[8px] px-3 py-2.5 text-[0.85rem] font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-[rgba(0,223,162,0.1)] font-semibold text-[#00dfa2]"
                  : "text-[#8b97a8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#eef2f7]"
              }`;
              if (link.href) {
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cls}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <span
                  key={link.label}
                  className={`${cls} cursor-pointer`}
                  role="link"
                  aria-disabled="true"
                >
                  {link.label}
                </span>
              );
            })}
          </div>
        )}

        {/* HERO */}
        <section
          className="relative flex flex-col items-center text-center"
          style={{
            padding: "80px 24px 64px",
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,223,162,0.08) 0%,transparent 70%),linear-gradient(180deg,rgba(0,223,162,0.04) 0%,transparent 60%)",
          }}
        >
          {/* VIP Badge */}
          <div
            className="tp-shimmer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0,223,162,0.1)",
              border: "1px solid rgba(0,223,162,0.25)",
              color: "#00dfa2",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: "20px",
              marginBottom: "24px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            <Crown style={{ width: "0.8rem", height: "0.8rem" }} />
            VIP Account Programme
          </div>

          {/* H1 2-line heading */}
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "20px",
              maxWidth: "800px",
              marginLeft: "auto",
              marginRight: "auto",
              fontFamily: "Outfit, sans-serif",
              color: "#eef2f7",
            }}
          >
            Premium Trading Plans
            <br />
            <span style={{ color: "#00dfa2" }}>Unlock Elite Benefits</span>
          </h1>

          {/* Supporting paragraph */}
          <p
            style={{
              fontSize: "1rem",
              color: "#8b97a8",
              maxWidth: "680px",
              margin: "0 auto 36px",
              lineHeight: 1.75,
            }}
          >
            Holders of VIP accounts benefit from the most advantageous trade
            deals in the market. Upgrade your account to access cutting-edge
            trading conditions, tighter fixed spreads, and real-time technical
            analysis tools specifically tailored for {brandName}.
          </p>

          {/* CTA row */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "48px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#plans"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "13px 28px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: 700,
                textDecoration: "none",
                background: "linear-gradient(145deg,#00dfa2,#00b881)",
                color: "#07080c",
                transition: "all .2s",
              }}
            >
              <Layers style={{ width: "0.9rem", height: "0.9rem" }} />
              View All Plans
            </a>
            <a
              href="#compare"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "13px 28px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: 600,
                textDecoration: "none",
                background: "transparent",
                color: "#eef2f7",
                border: "1.5px solid rgba(255,255,255,0.08)",
                transition: "all .2s",
              }}
            >
              <ChartBar style={{ width: "0.9rem", height: "0.9rem" }} />
              Compare Benefits
            </a>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              flexWrap: "wrap",
            }}
          >
            {[
              { val: "10", lab: "Account Tiers" },
              { val: "$10K", lab: "Starting From" },
              { val: "0.00%", lab: "Min. Trading Fees" },
              { val: "200oz", lab: "Max Physical Gold/Qtr" },
            ].map((s) => (
              <div key={s.lab} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#00dfa2",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#4a5468",
                    marginTop: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.lab}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CURRENT PLAN BANNER */}
        <div className="mx-auto mt-8 w-full max-w-[1280px] px-6">
          <div
            className="relative flex flex-wrap items-center gap-5 overflow-hidden rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.08)] p-5 px-7 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px]"
            style={{
              background:
                "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(0,223,162,0.02))",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle at 100% 0%,rgba(255,255,255,0.08),transparent)",
              }}
            />
            <div
              className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-[#07080c]"
              style={{
                background: "linear-gradient(145deg,#00dfa2,#00b881)",
              }}
            >
              <Star className="h-[0.65rem] w-[0.65rem] fill-current" />
              Your Plan: {currentPlanTitle || "Basic"}
            </div>
            <div className="relative flex-1 text-[0.9rem] text-[#8b97a8]">
              You are currently on the{" "}
              <strong className="text-[#eef2f7]">
                {currentPlanTitle || "Basic"} Account
              </strong>
              . Upgrade to unlock advanced charting, OTC desk access, reduced
              trading fees, and more exclusive benefits.
            </div>
            <a
              href="#plans"
              className="relative inline-flex items-center gap-1.5 rounded-lg px-5 py-2 text-[0.82rem] font-semibold text-[#07080c] transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,223,162,0.3)]"
              style={{
                background: "linear-gradient(145deg,#00dfa2,#00b881)",
              }}
            >
              <ArrowUp className="h-[0.8rem] w-[0.8rem]" /> Upgrade Now
            </a>
          </div>
        </div>

        {/* PLAN CARDS */}
        <section className="py-16" id="plans">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-3 inline-flex items-center gap-2 font-[Outfit,sans-serif] text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#00dfa2]">
              <Crown className="h-[0.75rem] w-[0.75rem]" /> Account Tiers
            </div>
            <div className="mb-2 font-[Outfit,sans-serif] text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-[-0.01em] text-[#eef2f7]">
              Choose Your Level of Excellence
            </div>
            <p className="mb-10 max-w-[600px] text-[0.92rem] leading-[1.7] text-[#8b97a8]">
              By becoming a Premium Account Holder, traders unlock exclusive
              access to specialized benefits, cutting-edge trading conditions,
              tighter fixed spreads, and an extensive suite of real-time
              technical analysis tools.
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 [@media(min-width:1280px)]:[grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
              {TIERS.slice(0, -1).map((t) => {
                const accent = ACCENT_COLORS[t.accent];
                const isCurrent =
                  currentTier && currentTier.slug === t.slug && !isSuperCurrent;
                const isRecommended = t.recommended && !isCurrent;
                return (
                  <div
                    key={t.slug}
                    className="relative overflow-hidden rounded-2xl border-[1.5px] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px] transition-all hover:-translate-y-[3px]"
                    style={{
                      background:
                        "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(0,223,162,0.02))",
                      borderColor: accent.border,
                    }}
                  >
                    {/* top stripe */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg,transparent,${accent.text},transparent)`,
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{
                        background:
                          "radial-gradient(circle at 100% 0%,rgba(255,255,255,0.08),transparent)",
                      }}
                    />

                    <div className="relative">
                      <div
                        className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.07em]"
                        style={{
                          color: accent.text,
                          background: accent.badgeBg,
                          borderColor: accent.badgeBorder,
                        }}
                      >
                        <BadgeIcon kind={t.badgeIcon} /> Tier {t.tier}
                      </div>
                      {isCurrent && (
                        <div
                          className="absolute right-0 top-0 rounded-xl px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.05em] text-[#07080c]"
                          style={{
                            background:
                              "linear-gradient(135deg,#00dfa2,#00b881)",
                          }}
                        >
                          Current Plan
                        </div>
                      )}
                      {isRecommended && (
                        <div
                          className="absolute right-0 top-0 rounded-xl px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.05em] text-[#07080c]"
                          style={{
                            background:
                              "linear-gradient(135deg,#00dfa2,#00b881)",
                          }}
                        >
                          Recommended
                        </div>
                      )}

                      <div
                        className="mb-1 font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.01em]"
                        style={{ color: accent.text }}
                      >
                        {t.name}
                      </div>
                      <div className="mb-5 font-mono text-[0.8rem] text-[#4a5468]">
                        Min. Deposit:{" "}
                        <span className="text-[1rem] font-semibold text-[#8b97a8]">
                          {t.minDeposit}
                        </span>
                      </div>

                      <div
                        className="mb-5 flex gap-3 rounded-lg border border-[rgba(255,255,255,0.08)] p-3"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        {[
                          { l: "Maker", v: t.maker },
                          { l: "Taker", v: t.taker },
                          { l: "Bonus", v: t.bonus },
                        ].map((f) => (
                          <div key={f.l} className="flex-1 text-center">
                            <div className="mb-0.5 text-[0.65rem] uppercase tracking-[0.05em] text-[#4a5468]">
                              {f.l}
                            </div>
                            <div className="font-mono text-[0.88rem] font-bold text-[#00dfa2]">
                              {f.v}
                            </div>
                          </div>
                        ))}
                      </div>

                      {t.goldOz && (
                        <div
                          className="mb-5 flex items-center gap-2.5 rounded-lg border border-[rgba(0,223,162,0.25)] px-3.5 py-2.5"
                          style={{ background: "rgba(0,223,162,0.08)" }}
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] text-[#07080c]"
                            style={{
                              background:
                                "linear-gradient(135deg,#00dfa2,#00b881)",
                            }}
                          >
                            <Coins className="h-3 w-3" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-[0.78rem] font-semibold text-[#00dfa2]">
                              {t.goldStars && (
                                <StarRow count={t.goldStars} />
                              )}
                              Physical Gold Delivery
                            </div>
                            <div className="font-mono text-[0.9rem] font-bold text-[#00ffc3]">
                              {t.goldOz}
                            </div>
                          </div>
                        </div>
                      )}

                      <ul className="mb-5 list-none">
                        {t.benefits.map((b, i) => {
                          const isGold = t.goldBenefit && i === 1;
                          return (
                            <li
                              key={i}
                              className={`flex items-start gap-2 border-b border-[rgba(255,255,255,0.04)] py-1.5 text-[0.82rem] last:border-b-0 ${
                                isGold
                                  ? "font-medium text-[#eef2f7]"
                                  : "text-[#8b97a8]"
                              }`}
                            >
                              {isGold ? (
                                <Coins
                                  className="mt-[3px] h-[0.7rem] w-[0.7rem] shrink-0"
                                  style={{ color: "#c8e64e" }}
                                />
                              ) : (
                                <Check className="mt-[3px] h-[0.7rem] w-[0.7rem] shrink-0 text-[#00dfa2]" />
                              )}
                              <span>{b}</span>
                            </li>
                          );
                        })}
                      </ul>

                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.85rem] font-semibold ${UPGRADE_BTN_STYLES[t.accent]}`}
                        >
                          <Check className="h-[0.85rem] w-[0.85rem]" /> Active
                          Plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleUpgrade}
                          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.85rem] font-semibold transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,223,162,0.25)] ${UPGRADE_BTN_STYLES[t.accent]}`}
                        >
                          <ArrowUp className="h-[0.8rem] w-[0.8rem]" />
                          Upgrade to {t.name}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TIER 9 (MVP) + TIER 10 (SUPER MVP) — side-by-side 1fr 1fr pair */}
            {(() => {
              const mvp = TIERS[TIERS.length - 1];
              const mvpAccent = ACCENT_COLORS[mvp.accent];
              const mvpIsCurrent =
                currentTier && currentTier.slug === mvp.slug && !isSuperCurrent;
              return (
                <div className="mt-5 grid grid-cols-1 items-start gap-[22px] lg:grid-cols-2">
                  {/* MVP card */}
                  <div
                    className="relative overflow-hidden rounded-2xl border-[1.5px] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px] transition-all hover:-translate-y-[3px]"
                    style={{
                      background:
                        "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(0,223,162,0.02))",
                      borderColor: mvpAccent.border,
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg,transparent,${mvpAccent.text},transparent)`,
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{
                        background:
                          "radial-gradient(circle at 100% 0%,rgba(255,255,255,0.08),transparent)",
                      }}
                    />
                    <div className="relative">
                      <div
                        className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.07em]"
                        style={{
                          color: mvpAccent.text,
                          background: mvpAccent.badgeBg,
                          borderColor: mvpAccent.badgeBorder,
                        }}
                      >
                        <BadgeIcon kind={mvp.badgeIcon} /> Tier {mvp.tier}
                      </div>
                      {mvpIsCurrent && (
                        <div
                          className="absolute right-0 top-0 rounded-xl px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.05em] text-[#07080c]"
                          style={{
                            background:
                              "linear-gradient(135deg,#00dfa2,#00b881)",
                          }}
                        >
                          Current Plan
                        </div>
                      )}

                      <div
                        className="mb-1 font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.01em]"
                        style={{ color: mvpAccent.text }}
                      >
                        {mvp.name}
                      </div>
                      <div className="mb-5 font-mono text-[0.8rem] text-[#4a5468]">
                        Min. Deposit:{" "}
                        <span className="text-[1rem] font-semibold text-[#8b97a8]">
                          {mvp.minDeposit}
                        </span>
                      </div>

                      <div
                        className="mb-5 flex gap-3 rounded-lg border border-[rgba(255,255,255,0.08)] p-3"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        {[
                          { l: "Maker", v: mvp.maker },
                          { l: "Taker", v: mvp.taker },
                          { l: "Bonus", v: mvp.bonus },
                        ].map((f) => (
                          <div key={f.l} className="flex-1 text-center">
                            <div className="mb-0.5 text-[0.65rem] uppercase tracking-[0.05em] text-[#4a5468]">
                              {f.l}
                            </div>
                            <div className="font-mono text-[0.88rem] font-bold text-[#00dfa2]">
                              {f.v}
                            </div>
                          </div>
                        ))}
                      </div>

                      {mvp.goldOz && (
                        <div
                          className="mb-5 flex items-center gap-2.5 rounded-lg border border-[rgba(0,223,162,0.25)] px-3.5 py-2.5"
                          style={{ background: "rgba(0,223,162,0.08)" }}
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] text-[#07080c]"
                            style={{
                              background:
                                "linear-gradient(135deg,#00dfa2,#00b881)",
                            }}
                          >
                            <Coins className="h-3 w-3" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-[0.78rem] font-semibold text-[#00dfa2]">
                              {mvp.goldStars && (
                                <StarRow count={mvp.goldStars} />
                              )}
                              Physical Gold Delivery
                            </div>
                            <div className="font-mono text-[0.9rem] font-bold text-[#00ffc3]">
                              {mvp.goldOz}
                            </div>
                          </div>
                        </div>
                      )}

                      <ul className="mb-5 list-none">
                        {mvp.benefits.map((b, i) => {
                          const isGold = mvp.goldBenefit && i === 1;
                          return (
                            <li
                              key={i}
                              className={`flex items-start gap-2 border-b border-[rgba(255,255,255,0.04)] py-1.5 text-[0.82rem] last:border-b-0 ${
                                isGold
                                  ? "font-medium text-[#eef2f7]"
                                  : "text-[#8b97a8]"
                              }`}
                            >
                              {isGold ? (
                                <Coins
                                  className="mt-[3px] h-[0.7rem] w-[0.7rem] shrink-0"
                                  style={{ color: "#c8e64e" }}
                                />
                              ) : (
                                <Check className="mt-[3px] h-[0.7rem] w-[0.7rem] shrink-0 text-[#00dfa2]" />
                              )}
                              <span>{b}</span>
                            </li>
                          );
                        })}
                      </ul>

                      {mvpIsCurrent ? (
                        <button
                          type="button"
                          disabled
                          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.85rem] font-semibold ${UPGRADE_BTN_STYLES[mvp.accent]}`}
                        >
                          <Check className="h-[0.85rem] w-[0.85rem]" /> Active
                          Plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleUpgrade}
                          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[0.85rem] font-semibold transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,223,162,0.25)] ${UPGRADE_BTN_STYLES[mvp.accent]}`}
                        >
                          <ArrowUp className="h-[0.8rem] w-[0.8rem]" />
                          Upgrade to {mvp.name}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SUPER MVP card — single-column inner stacking */}
                  <div
                    className="relative overflow-hidden rounded-2xl border-[1.5px] p-9 shadow-[0_8px_32px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px]"
                    style={{
                      background:
                        "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02),rgba(0,223,162,0.01))",
                      borderColor: "rgba(0,223,162,0.2)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-2xl"
                      style={{
                        background:
                          "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(0,223,162,0.03) 0%,transparent 70%)",
                      }}
                    />
                    <div className="relative grid grid-cols-1 gap-5 items-start">
                      {/* Spec block (top) */}
                      <div>
                        <div
                          className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.07em]"
                          style={{
                            color: "#00dfa2",
                            background: "rgba(0,223,162,0.08)",
                            borderColor: "rgba(0,223,162,0.18)",
                          }}
                        >
                          <InfinityIcon className="h-[0.8rem] w-[0.8rem]" />{" "}
                          Tier 10: Ultimate
                        </div>
                        <div
                          className="mb-1 font-[Outfit,sans-serif] text-[1.6rem] font-extrabold"
                          style={{
                            background:
                              "linear-gradient(135deg,#f0f4f8,#00ffc3,#f0f4f8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          SUPER MVP
                        </div>
                        <div className="font-mono text-[0.95rem] text-[#4a5468]">
                          Min. Deposit:{" "}
                          <span className="text-[1.2rem] font-bold text-[#eef2f7]">
                            {SUPER_MVP.minDeposit}
                          </span>
                        </div>

                        <div
                          className="mt-4 flex gap-3 rounded-lg border border-[rgba(255,255,255,0.08)] p-3"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                          {[
                            {
                              l: "Maker Fee",
                              v: SUPER_MVP.maker,
                              color: "#eef2f7",
                            },
                            {
                              l: "Taker Fee",
                              v: SUPER_MVP.taker,
                              color: "#eef2f7",
                            },
                            {
                              l: "First Deposit Bonus",
                              v: SUPER_MVP.bonus,
                              color: "#00dfa2",
                            },
                          ].map((f) => (
                            <div key={f.l} className="flex-1 text-center">
                              <div className="mb-0.5 text-[0.65rem] uppercase tracking-[0.05em] text-[#4a5468]">
                                {f.l}
                              </div>
                              <div
                                className="font-mono text-[1.1rem] font-bold"
                                style={{ color: f.color }}
                              >
                                {f.v}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div
                          className="mt-4 flex items-center gap-3 rounded-lg border-[1.5px] border-[rgba(255,255,255,0.08)] p-4"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.9rem] text-[#07080c]"
                            style={{
                              background:
                                "linear-gradient(135deg,#00dfa2,#00b881)",
                            }}
                          >
                            <Coins className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-[0.85rem] font-semibold text-[#eef2f7]">
                              <StarRow count={6} /> Unlimited Physical Gold
                              Delivery
                            </div>
                            <div className="font-mono text-[1.1rem] font-bold text-[#eef2f7]">
                              {SUPER_MVP.goldOz}
                            </div>
                            <div className="mt-0.5 text-[0.72rem] text-[#4a5468]">
                              Worldwide Delivery Included
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleUpgrade}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-[0.9rem] font-bold text-[#07080c] transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,223,162,0.25)]"
                          style={{
                            background:
                              "linear-gradient(135deg,#00b881,#00dfa2)",
                          }}
                        >
                          <Crown className="h-[0.95rem] w-[0.95rem]" /> Apply
                          for Super MVP Status
                        </button>
                      </div>

                      {/* Benefit groups (stacked beneath spec block) */}
                      <div className="flex flex-col gap-3">
                        {[
                          {
                            title: "Financial & Trading",
                            icon: (
                              <Coins className="h-[0.7rem] w-[0.7rem]" />
                            ),
                            items: [
                              "Zero trading fees (maker & taker)",
                              "30% first deposit bonus",
                              "Sovereign-level wealth management",
                              "Custom exchange infrastructure",
                              "Equity partnership discussions",
                              "Private blockchain node access",
                            ],
                          },
                          {
                            title: "Protection & Legal",
                            icon: (
                              <ShieldHalf className="h-[0.7rem] w-[0.7rem]" />
                            ),
                            items: [
                              "Premium insurance, $50M+ coverage",
                              "Multi-jurisdictional tax optimization",
                              "Legacy & succession planning",
                              "Premium residency assistance",
                              "Personal security consultation",
                            ],
                          },
                          {
                            title: "Exclusive Privileges",
                            icon: (
                              <Star className="h-[0.7rem] w-[0.7rem]" />
                            ),
                            items: [
                              "Dedicated team of 5+ professionals",
                              "$100K annual event travel allowance",
                              "Complete white-label platform option",
                              "Private art collection consultation",
                              "200 oz physical gold per quarter",
                            ],
                          },
                        ].map((g) => (
                          <div
                            key={g.title}
                            className="rounded-xl border border-[rgba(255,255,255,0.08)] p-5"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          >
                            <h4 className="mb-3 flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#eef2f7]">
                              <span className="text-[#00dfa2]">{g.icon}</span>
                              {g.title}
                            </h4>
                            <ul className="list-none">
                              {g.items.map((it, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 py-1 text-[0.82rem] text-[#8b97a8]"
                                >
                                  <Check className="mt-[5px] h-[0.55rem] w-[0.55rem] shrink-0 text-[#4a5468]" />
                                  <span>{it}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* COMPARE TABLE */}
        <section
          className="py-16"
          id="compare"
          style={{ background: "rgba(255,255,255,0.01)" }}
        >
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-3 inline-flex items-center gap-2 font-[Outfit,sans-serif] text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#00dfa2]">
              <ChartBar className="h-[0.75rem] w-[0.75rem]" /> Full Comparison
            </div>
            <div className="mb-2 font-[Outfit,sans-serif] text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-[-0.01em] text-[#eef2f7]">
              Benefits at a Glance
            </div>
            <p className="mb-10 max-w-[600px] text-[0.92rem] leading-[1.7] text-[#8b97a8]">
              Complete side-by-side comparison of all account tiers. Scroll
              horizontally to see all tiers.
            </p>

            <div
              className="overflow-x-auto rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.08)] backdrop-blur-[40px]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <table className="min-w-[1100px] w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      className="sticky top-0 z-10 border-b border-[rgba(255,255,255,0.08)] px-4 py-3.5 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#8b97a8]"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        minWidth: 220,
                      }}
                    >
                      Benefit
                    </th>
                    {COMPARE_HEADERS.map((h, i) => (
                      <th
                        key={h.label}
                        className="sticky top-0 z-10 whitespace-nowrap border-b border-[rgba(255,255,255,0.08)] px-4 py-3.5 text-center text-[0.72rem] font-bold uppercase tracking-[0.06em]"
                        style={{
                          color: h.color,
                          background:
                            i === COMPARE_HEADERS.length - 1
                              ? "linear-gradient(135deg,rgba(0,223,162,0.1),rgba(0,255,195,0.05))"
                              : "rgba(255,255,255,0.04)",
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_SECTIONS.map((sec) => (
                    <Fragment key={sec.category}>
                      <tr>
                        <td
                          colSpan={11}
                          className="px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#4a5468]"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                          {sec.category}
                        </td>
                      </tr>
                      {sec.rows.map((row) => (
                        <tr
                          key={`${sec.category}-${row.label}`}
                          className="transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                        >
                          <td className="border-b border-[rgba(255,255,255,0.04)] px-5 py-2.5 text-left text-[0.8rem] font-medium text-[#8b97a8]">
                            {row.label}
                          </td>
                          {row.cells.map((cell, ci) => (
                            <td
                              key={ci}
                              className="border-b border-[rgba(255,255,255,0.04)] px-3.5 py-2.5 text-center text-[0.8rem] text-[#8b97a8]"
                            >
                              {cell.kind === "mono" && (
                                <span
                                  className="font-mono text-[0.78rem] font-semibold"
                                  style={{
                                    color:
                                      cell.variant === "green"
                                        ? "#00dfa2"
                                        : cell.variant === "gold"
                                          ? "#c8e64e"
                                          : "#eef2f7",
                                  }}
                                >
                                  {cell.value}
                                </span>
                              )}
                              {cell.kind === "text" && (
                                <span
                                  style={{
                                    color:
                                      cell.variant === "gold"
                                        ? "#c8e64e"
                                        : undefined,
                                  }}
                                >
                                  {cell.value}
                                </span>
                              )}
                              {cell.kind === "check" && (
                                <Check className="mx-auto h-[0.85rem] w-[0.85rem] text-[#00dfa2]" />
                              )}
                              {cell.kind === "times" && (
                                <X className="mx-auto h-[0.8rem] w-[0.8rem] text-[#4a5468]" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PHYSICAL GOLD */}
        <section className="py-16" id="gold-delivery">
          <div className="mx-auto max-w-[1280px] px-6">
            <div
              className="relative overflow-hidden rounded-2xl border-[1.5px] border-[rgba(0,223,162,0.25)] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[40px]"
              style={{
                background:
                  "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(0,223,162,0.02))",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px]"
                style={{
                  background:
                    "radial-gradient(circle,rgba(0,223,162,0.1),transparent)",
                }}
              />
              <div className="relative">
                <div
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-[#07080c] shadow-[0_8px_32px_rgba(0,223,162,0.2)]"
                  style={{
                    background: "linear-gradient(135deg,#00dfa2,#00b881)",
                  }}
                >
                  <Vault className="h-8 w-8" />
                </div>
                <div className="mb-2 inline-flex items-center gap-2 font-[Outfit,sans-serif] text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#00dfa2]">
                  <Crown className="h-[0.75rem] w-[0.75rem]" /> Physical Gold
                  Programme
                </div>
                <h2 className="font-[Outfit,sans-serif] text-[clamp(1.4rem,3vw,2rem)] font-bold text-[#00dfa2]">
                  Request Physical Gold Delivery
                </h2>
                <p className="mb-6 mt-2 max-w-[680px] text-[0.95rem] leading-[1.75] text-[#8b97a8]">
                  Diamond, Diamond Elite, Black, Black Elite, MVP and Super MVP
                  account holders are eligible to request physical gold
                  delivery. Gold is sourced exclusively from{" "}
                  <strong className="text-[#00dfa2]">
                    LBMA-certified refineries
                  </strong>
                  , assayed to 999.9 purity, and delivered via fully insured,
                  secure courier worldwide.
                </p>

                <div className="mb-8 flex flex-wrap gap-5">
                  {[
                    {
                      icon: <Award className="h-[1.25rem] w-[1.25rem]" />,
                      title: "LBMA Certified",
                      sub: "Sourced from accredited refineries",
                      color: "#00dfa2",
                      accent: true,
                    },
                    {
                      icon: (
                        <ShieldHalf className="h-[1.25rem] w-[1.25rem]" />
                      ),
                      title: "Fully Insured Delivery",
                      sub: "Covered end-to-end, worldwide",
                      color: "#00dfa2",
                    },
                    {
                      icon: (
                        <FlaskRound className="h-[1.25rem] w-[1.25rem]" />
                      ),
                      title: "999.9 Fine Gold",
                      sub: "Highest purity available commercially",
                      color: "#89C4F8",
                    },
                    {
                      icon: <Globe className="h-[1.25rem] w-[1.25rem]" />,
                      title: "Global Delivery",
                      sub: "Delivered to 180+ countries",
                      color: "#00dfa2",
                    },
                  ].map((c) => (
                    <div
                      key={c.title}
                      className="flex-1 rounded-xl border p-4 text-center"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderColor: c.accent
                          ? "rgba(0,223,162,0.25)"
                          : "rgba(255,255,255,0.08)",
                        minWidth: 180,
                      }}
                    >
                      <div
                        className="mb-2 flex justify-center"
                        style={{ color: c.color }}
                      >
                        {c.icon}
                      </div>
                      <div
                        className="mb-1 text-[0.78rem] font-bold"
                        style={{
                          color: c.accent ? "#00dfa2" : "#eef2f7",
                        }}
                      >
                        {c.title}
                      </div>
                      <div className="text-[0.75rem] text-[#4a5468]">
                        {c.sub}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {[
                          "Account Tier",
                          "Min. Deposit",
                          "Gold Allowance",
                          "Delivery Frequency",
                          "Purity",
                          "Delivery Insurance",
                        ].map((h) => (
                          <th
                            key={h}
                            className="border-b border-[rgba(0,223,162,0.25)] px-4 py-3 text-left text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#00dfa2]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {GOLD_ROWS.map((r) => (
                        <tr
                          key={r.tier}
                          className="transition-colors hover:bg-[rgba(0,223,162,0.08)]"
                        >
                          <td
                            className="border-b border-[rgba(255,255,255,0.04)] px-4 py-3 text-[0.85rem] font-semibold"
                            style={{ color: r.accent || "#eef2f7" }}
                          >
                            {r.tier}{" "}
                            <span
                              className="ml-1.5 inline-block rounded-xl border border-[rgba(0,223,162,0.25)] px-2 py-0.5 text-[0.65rem] font-bold text-[#00dfa2]"
                              style={{ background: "rgba(0,223,162,0.08)" }}
                            >
                              {r.badge}
                            </span>
                          </td>
                          <td
                            className={`border-b border-[rgba(255,255,255,0.04)] px-4 py-3 font-mono text-[0.78rem] font-semibold ${
                              r.tier === "Super MVP"
                                ? "text-[#c8e64e]"
                                : "text-[#eef2f7]"
                            }`}
                          >
                            {r.minDeposit}
                          </td>
                          <td className="border-b border-[rgba(255,255,255,0.04)] px-4 py-3 text-[0.85rem] text-[#8b97a8]">
                            <span className="font-mono font-bold text-[#00ffc3]">
                              {r.allowance}
                            </span>
                          </td>
                          <td className="border-b border-[rgba(255,255,255,0.04)] px-4 py-3 text-[0.85rem] text-[#8b97a8]">
                            {r.frequency}
                          </td>
                          <td className="border-b border-[rgba(255,255,255,0.04)] px-4 py-3 text-[0.85rem] text-[#8b97a8]">
                            {r.purity}
                          </td>
                          <td className="border-b border-[rgba(255,255,255,0.04)] px-4 py-3 text-[0.85rem] text-[#8b97a8]">
                            {r.insurance}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-[0.78rem] text-[#4a5468]">
                  <span className="mr-1.5 text-[#00dfa2]">ⓘ</span>Gold delivery
                  is processed within 10-15 business days. Physical gold bars
                  are accompanied by official assay certificates. Storage in
                  secure vault available as alternative to delivery at no extra
                  cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* UPGRADE STEPS */}
        <section
          className="py-16"
          id="upgrade"
          style={{ background: "rgba(255,255,255,0.01)" }}
        >
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-3 inline-flex items-center gap-2 font-[Outfit,sans-serif] text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#00dfa2]">
              <ArrowUp className="h-[0.75rem] w-[0.75rem]" /> Account Upgrade
            </div>
            <div className="mb-2 font-[Outfit,sans-serif] text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-[-0.01em] text-[#eef2f7]">
              How to Upgrade Your Account
            </div>
            <p className="mb-10 max-w-[600px] text-[0.92rem] leading-[1.7] text-[#8b97a8]">
              Upgrading is straightforward. Meet the deposit threshold, submit
              your request, and your benefits are activated within 24-48 hours.
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  num: "1",
                  icon: null as null | React.ReactElement,
                  title: "Meet Deposit Requirement",
                  desc: "Ensure your account balance meets the minimum deposit threshold for your desired tier. Deposits can be made via crypto transfer, bank wire, or our exchange partner network.",
                  cta: { label: "Go to Wallet", to: "/main/wallet" },
                },
                {
                  num: "2",
                  icon: null,
                  title: "Submit Upgrade Request",
                  desc: "Contact your account manager directly or submit an upgrade request through the dashboard. Include your desired tier and preferred benefits to activate.",
                },
                {
                  num: "3",
                  icon: null,
                  title: "Verification & Approval",
                  desc: "Our compliance team verifies your account and deposit within 24-48 hours. For Black tier and above, enhanced KYC/AML checks may be required.",
                  cta: { label: "Complete KYC", to: "/main/kyc" },
                },
                {
                  num: null,
                  icon: <Check className="h-[1.1rem] w-[1.1rem]" />,
                  title: "Benefits Activated",
                  desc: "All tier benefits are activated immediately upon approval. Your account manager will reach out to onboard you and set up your personalized trading environment.",
                },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.08)] p-7 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-[40px]"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {s.num ? (
                    <div
                      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full font-mono text-[1.1rem] font-bold text-[#07080c]"
                      style={{
                        background:
                          "linear-gradient(135deg,#00dfa2,#00b881)",
                      }}
                    >
                      {s.num}
                    </div>
                  ) : (
                    <div
                      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(0,223,162,0.25)] text-[#00dfa2]"
                      style={{ background: "rgba(0,223,162,0.1)" }}
                    >
                      {s.icon}
                    </div>
                  )}
                  <h4 className="mb-2 font-[Outfit,sans-serif] text-[0.95rem] font-bold text-[#eef2f7]">
                    {s.title}
                  </h4>
                  <p className="text-[0.82rem] leading-[1.6] text-[#4a5468]">
                    {s.desc}
                  </p>
                  {s.cta && (
                    <Link
                      to={s.cta.to}
                      className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-[#00dfa2]"
                    >
                      {s.cta.label}{" "}
                      <ArrowRight className="h-[0.6rem] w-[0.6rem]" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* CTA STRIP */}
            <div
              className="mt-16 rounded-2xl border-[1.5px] border-[rgba(0,223,162,0.25)] p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] backdrop-blur-[40px]"
              style={{
                background:
                  "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02),rgba(0,223,162,0.02))",
              }}
            >
              <h2 className="mb-2 font-[Outfit,sans-serif] text-[1.5rem] font-bold text-[#eef2f7]">
                Ready to Upgrade?{" "}
                <span className="text-[#00dfa2]">
                  Unlock Elite Benefits Today
                </span>
              </h2>
              <p className="mb-6 text-[0.9rem] text-[#8b97a8]">
                Join thousands of professional traders who have upgraded their
                accounts to access institutional-grade tools, tighter spreads,
                and exclusive privileges.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/main/wallet"
                  className="inline-flex items-center gap-2 rounded-lg px-7 py-3 text-[0.88rem] font-bold text-[#07080c] transition-all hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,223,162,0.3)]"
                  style={{
                    background: "linear-gradient(145deg,#00dfa2,#00b881)",
                  }}
                >
                  <ArrowUp className="h-[0.9rem] w-[0.9rem]" /> Deposit &
                  Upgrade
                </Link>
                <Link
                  to="/main/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-[rgba(255,255,255,0.08)] bg-transparent px-7 py-3 text-[0.88rem] font-semibold text-[#eef2f7] transition-all hover:border-[#00dfa2] hover:text-[#00dfa2]"
                >
                  <Headphones className="h-[0.9rem] w-[0.9rem]" /> Contact
                  Account Manager
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16" id="faq">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-3 inline-flex items-center gap-2 font-[Outfit,sans-serif] text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#00dfa2]">
              <HelpCircle className="h-[0.75rem] w-[0.75rem]" /> FAQ
            </div>
            <div className="mb-2 font-[Outfit,sans-serif] text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-[-0.01em] text-[#eef2f7]">
              Frequently Asked Questions
            </div>
            <p className="mb-10 max-w-[600px] text-[0.92rem] leading-[1.7] text-[#8b97a8]">
              Everything you need to know about our Premium Account programme.
            </p>

            <div>
              {FAQS.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="mb-2.5 overflow-hidden rounded-xl border-[1.5px] border-[rgba(255,255,255,0.08)] backdrop-blur-[40px]"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className={`flex w-full items-center justify-between px-5 py-4 text-left text-[0.9rem] font-semibold transition-colors hover:bg-[rgba(0,223,162,0.05)] ${
                        isOpen ? "text-[#00dfa2]" : "text-[#eef2f7]"
                      }`}
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={`h-[0.75rem] w-[0.75rem] shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#00dfa2]" : "text-[#4a5468]"
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4.5 pb-4 text-[0.85rem] leading-[1.75] text-[#8b97a8]">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="mx-auto max-w-[1280px] px-6">
          <div
            className="mt-12 rounded-2xl border-[1.5px] border-[rgba(255,255,255,0.08)] p-7"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <h3 className="mb-3 flex items-center gap-2 font-[Outfit,sans-serif] text-[0.85rem] font-bold text-[#8b97a8]">
              <TriangleAlert className="h-[0.85rem] w-[0.85rem] text-[#00dfa2]" />
              Important Disclosures
            </h3>
            <p className="mb-2 text-[0.75rem] leading-[1.7] text-[#4a5468]">
              The Premium Trading Plans described on this page represent account
              upgrade thresholds starting at $10,000 and extending up to
              $200,000,000 depending on the level of upgrade selected. By
              becoming a Premium Account Holder, traders unlock exclusive access
              to specialized benefits including cutting-edge trading conditions
              tailored for {brandName}, including access to tighter fixed
              spreads and real-time technical analysis tools.
            </p>
            <p className="mb-2 text-[0.75rem] leading-[1.7] text-[#4a5468]">
              Physical gold delivery is subject to availability, applicable
              customs regulations in the recipient country, and requires
              completion of enhanced KYC/AML verification. Delivery quantities
              listed are maximum allowances per quarter and are subject to
              market availability of physical gold. All gold is sourced from
              LBMA-certified refineries. Gold prices fluctuate and the USD value
              of your quarterly gold allowance will vary.
            </p>
            <p className="mb-2 text-[0.75rem] leading-[1.7] text-[#4a5468]">
              Trading fees, spreads, and bonus percentages are subject to the
              terms and conditions set out in the Client Agreement. Bonuses are
              subject to trading volume requirements before withdrawal. Past
              performance of any trading strategy or account tier is not
              indicative of future results.
            </p>
            <p className="text-[0.75rem] text-[#4a5468]">
              © {new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer
          className="mt-16 border-t-[1.5px] border-[rgba(255,255,255,0.08)] py-7 text-center"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <p className="text-[0.75rem] text-[#4a5468]">
            © {new Date().getFullYear()} {brandName} &bull;{" "}
            <a className="text-[#00dfa2]" href="#">
              Terms
            </a>{" "}
            &bull;{" "}
            <a className="text-[#00dfa2]" href="#">
              Privacy Policy
            </a>{" "}
            &bull;{" "}
            <a className="text-[#00dfa2]" href="#">
              Cookie Policy
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
