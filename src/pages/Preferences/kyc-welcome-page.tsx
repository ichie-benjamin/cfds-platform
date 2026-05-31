import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Asterisk,
  BadgeCheck,
  Bell,
  Bolt,
  Building2,
  Cake,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  Clock,
  Crown,
  Database,
  DollarSign,
  EyeOff,
  FileSignature,
  FileText,
  FileUp,
  Flag,
  Gem,
  Globe,
  Hash,
  Home,
  IdCard,
  Info,
  Landmark,
  Layers,
  LineChart,
  Lock,
  Map,
  MapPin,
  MapPinned,
  MessageCircle,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShieldHalf,
  SquareUserRound,
  Star,
  UserCheck,
  User as UserIcon,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import useUserStore from "@/store/userStore";
import { WalletNav } from "@/components/wallet/WalletNav";
import { VerifyLaterModal } from "@/components/kyc/VerifyLaterModal";

// ──────────────────────────────────────────────────────────────
// Data constants (presentational only — match reference)
// ──────────────────────────────────────────────────────────────

type TierId = "basic" | "intermediate" | "advanced";
type StepId = 1 | 2 | 4 | 5;

const BASIC_STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "Select Tier" },
  { id: 2, label: "Personal Info" },
  { id: 5, label: "Review & Submit" },
];

const ADVANCED_STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "Select Tier" },
  { id: 2, label: "Personal Info" },
  { id: 4, label: "Address Proof" },
  { id: 5, label: "Review & Submit" },
];

const ACCEPTED_DOCS = [
  { id: "utility", icon: Bolt, name: "Utility Bill", hint: "Electricity, water, gas or internet" },
  { id: "bank", icon: Building2, name: "Bank Statement", hint: "Official bank or credit card statement" },
  { id: "gov", icon: Landmark, name: "Government Letter", hint: "Tax assessment or benefits letter" },
  { id: "lease", icon: FileSignature, name: "Lease Agreement", hint: "Signed rental or mortgage letter" },
] as const;

const FAQS = [
  {
    q: "How long does verification take?",
    a: "Most verifications complete within 1–3 business days. Automated checks run instantly. You may trade with Basic tier limits while pending.",
  },
  {
    q: "Which documents are accepted?",
    a: "Passport, National ID, or Driver's License for identity. Utility bill, bank statement, or government letter (within 3 months) for address proof.",
  },
  {
    q: "Can I trade while verifying?",
    a: "Yes, you can trade immediately with Basic tier limits ($2,000/day, $10,000/month). Full limits activate upon approval.",
  },
  {
    q: "Why do you need my address?",
    a: "Address verification is a FINMA regulatory requirement under AML/KYC guidelines and is standard across all regulated financial platforms.",
  },
  {
    q: "What if my document is rejected?",
    a: "You'll receive an email explaining the reason. You can resubmit immediately. Common reasons include blurry images, expired documents, or mismatched information.",
  },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Switzerland", "Germany", "France",
  "Canada", "Australia", "Singapore", "UAE", "Other",
];

const SOURCE_OF_FUNDS = [
  "Employment Income", "Business Income", "Investment Returns",
  "Inheritance", "Personal Savings", "Other",
];

const TRUST_SEALS = [
  { icon: Landmark, title: "FINMA Compliant", sub: "Swiss regulatory standard", color: "#00dfa2", bg: "rgba(0,223,162,0.10)" },
  { icon: Lock, title: "256-bit SSL Encryption", sub: "Bank-grade data protection", color: "#1ED760", bg: "rgba(30,215,96,0.10)" },
  { icon: Globe, title: "GDPR Protected", sub: "EU data privacy rights", color: "#4A90E2", bg: "rgba(74,144,226,0.10)" },
  { icon: EyeOff, title: "No Third-Party Sharing", sub: "Your data stays private", color: "#F0B429", bg: "rgba(240,180,41,0.10)" },
];

const ETA_ROWS: { label: string; val: string; green?: boolean }[] = [
  { label: "Automated checks", val: "~2 min" },
  { label: "Compliance review", val: "1–3 days" },
  { label: "Approval notification", val: "Email + app" },
  { label: "Trading during review", val: "✓ Allowed", green: true },
];

const COMPLIANCE_BADGES = [
  { icon: ShieldCheck, label: "SOC 2 Type II", color: "#1ED760" },
  { icon: Lock, label: "256-bit SSL", color: "#F0B429" },
  { icon: BadgeCheck, label: "KYC / AML Compliant", color: "#00dfa2" },
  { icon: Globe, label: "VASP Licensed", color: "#4A90E2" },
  { icon: Database, label: "Cold Storage", color: "#8b5cf6" },
  { icon: ShieldHalf, label: "2FA Protected", color: "#f43f5e" },
];

const FOOTER_COLS = [
  {
    h: "Products",
    links: ["Spot Trading", "Futures", "Margin Trading", "Staking & Earn", "OTC Desk", "Launchpad"],
  },
  {
    h: "Services",
    links: ["Buy Crypto", "P2P Trading", "Convert", "Gold Market", "Institutional", "VIP Program"],
  },
  {
    h: "Support",
    links: ["Help Center", "API Documentation", "Fee Schedule", "System Status", "Submit a Request", "Bug Bounty"],
  },
  {
    h: "Company",
    links: ["About Us", "Careers", "Blog", "Press & Media", "Community", "Affiliate Program"],
  },
];

// ──────────────────────────────────────────────────────────────
// Inline style block — keyframes, body chrome hide, scrollbar
// ──────────────────────────────────────────────────────────────

const PAGE_STYLE = `
  body.kyc-active .fixed.top-0.left-0.right-0.z-20,
  body.kyc-active .fixed.top-\\[60px\\].left-0.bottom-0 { display: none !important; }
  body.kyc-active .flex.flex-1.pt-\\[90px\\] { padding-top: 0 !important; }
  body.kyc-active .flex-1.md\\:ml-\\[80px\\] { margin-left: 0 !important; }

  .kyc-page-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .kyc-page-scroll::-webkit-scrollbar-track { background: #0d0f15; }
  .kyc-page-scroll::-webkit-scrollbar-thumb { background: rgba(0,223,162,.2); border-radius: 3px; }

  @keyframes kycOrbFloat {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(40px,-30px) scale(1.1); }
    66%  { transform: translate(-20px,40px) scale(.95); }
    100% { transform: translate(30px,20px) scale(1.05); }
  }
  @keyframes kycHeroShimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes kycFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes kycRimShift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }

  .kyc-hero-title {
    background: linear-gradient(135deg,#ffffff 0%,#e0f7ef 25%,#00ffc3 50%,#e0f7ef 75%,#ffffff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: kycHeroShimmer 4s linear infinite;
    filter: drop-shadow(0 2px 4px rgba(0,223,162,.15));
  }
  .kyc-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); animation: kycOrbFloat 22s ease-in-out infinite alternate; }
  .kyc-grid-tex {
    position: absolute; inset: 0; pointer-events: none; opacity: .04;
    background-image:
      linear-gradient(rgba(0,223,162,.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,223,162,.4) 1px, transparent 1px);
    background-size: 72px 72px;
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent);
            mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent);
  }
  .kyc-step-anim { animation: kycFadeUp .3s ease both; }
  .kyc-logo-rim {
    position: absolute; inset: -1px; border-radius: 9px; border: 1px solid transparent;
    background:
      linear-gradient(145deg, rgba(255,255,255,.25), rgba(0,223,162,.3), rgba(91,141,239,.2), rgba(139,92,246,.2), rgba(0,223,162,.15)) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
    animation: kycRimShift 5s linear infinite;
  }
`;

// ──────────────────────────────────────────────────────────────
// Small inline helpers
// ──────────────────────────────────────────────────────────────

function LogoBox({ size = 34 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-baseline justify-center overflow-hidden rounded-[8px] pt-1"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(145deg,#00ffc3 0%,#00e8aa 25%,#00dfa2 50%,#00c78a 75%,#00b881 100%)",
        boxShadow:
          "0 0 20px rgba(0,223,162,.2),0 4px 14px rgba(0,223,162,.25),0 2px 4px rgba(0,0,0,.3),inset 0 2px 0 rgba(255,255,255,.4),inset 0 -3px 6px rgba(0,0,0,.22)",
      }}
    >
      <span className="kyc-logo-rim" />
      <span
        className="relative z-[2] font-[Outfit,sans-serif] font-black leading-none text-black"
        style={{ fontSize: size * 0.28, textShadow: "0 1px 0 rgba(255,255,255,.35)" }}
      >
        1
      </span>
      <span
        className="relative z-[2] ml-[1px] mt-[1px] self-start font-[Outfit,sans-serif] font-extrabold leading-none"
        style={{ fontSize: size * 0.14, color: "rgba(0,0,0,.65)" }}
      >
        TM
      </span>
    </div>
  );
}

interface SectionCardProps {
  iconBg: string;
  iconColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function SectionCard({ iconBg, iconColor, Icon, title, subtitle, children }: SectionCardProps) {
  return (
    <div
      className="kyc-step-anim mb-5 overflow-hidden rounded-[18px] border border-white/[0.08]"
      style={{
        background: "rgba(13,15,21,.6)",
        backdropFilter: "blur(28px) saturate(1.3)",
        WebkitBackdropFilter: "blur(28px) saturate(1.3)",
      }}
    >
      <div className="flex items-center gap-3.5 border-b border-white/[0.08] px-5 py-5 sm:px-6">
        <div
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon className="h-[1.05rem] w-[1.05rem]" />
        </div>
        <div>
          <div className="text-[1rem] font-bold text-[#eef2f7]">{title}</div>
          <div className="mt-0.5 text-[0.75rem] text-[#4a5468]">{subtitle}</div>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

interface SidebarCardProps {
  iconBg: string;
  iconColor: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  bodyClass?: string;
}

function SidebarCard({ iconBg, iconColor, Icon, title, children, bodyClass = "" }: SidebarCardProps) {
  return (
    <div
      className="overflow-hidden rounded-[18px] border border-white/[0.08]"
      style={{
        background: "rgba(13,15,21,.6)",
        backdropFilter: "blur(28px) saturate(1.3)",
        WebkitBackdropFilter: "blur(28px) saturate(1.3)",
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-[18px] py-[14px]">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/[0.08]"
          style={{
            background: iconBg,
            color: iconColor,
            boxShadow:
              "0 4px 10px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.15),inset 0 -2px 4px rgba(0,0,0,.2)",
          }}
        >
          <Icon className="h-[0.88rem] w-[0.88rem]" />
        </div>
        <div className="text-[0.88rem] font-bold text-[#eef2f7]">{title}</div>
      </div>
      <div className={`px-[18px] py-4 ${bodyClass}`}>{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  Icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}

function Field({ label, required, Icon, type = "text", placeholder, value, onChange, options }: FieldProps) {
  const isSelect = !!options;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-[#8b97a8]">
        {label}
        {required && <span className="text-[0.7rem] text-[#00dfa2]">*</span>}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-[0.85rem] w-[0.85rem] -translate-y-1/2 text-[#2a3040]" />
        {isSelect ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none rounded-[10px] border-[1.5px] border-white/[0.08] bg-[#10131a] py-[10px] pl-9 pr-9 text-[0.84rem] text-[#eef2f7] outline-none transition-all focus:border-[#00dfa2] focus:shadow-[0_0_0_3px_rgba(0,223,162,0.10)]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238A9CC4' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options!.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-[10px] border-[1.5px] border-white/[0.08] bg-[#10131a] py-[10px] pl-9 pr-3 text-[0.84rem] text-[#eef2f7] outline-none transition-all placeholder:text-[#2a3040] focus:border-[#00dfa2] focus:shadow-[0_0_0_3px_rgba(0,223,162,0.10)]"
          />
        )}
      </div>
    </div>
  );
}

function NoticeBar({
  variant,
  Icon,
  children,
}: {
  variant: "red" | "gold" | "green" | "blue";
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  const tone = {
    red:   { bg: "linear-gradient(145deg,rgba(0,223,162,.12),rgba(0,223,162,.04))", border: "rgba(0,223,162,.25)", color: "#00dfa2" },
    gold:  { bg: "linear-gradient(145deg,rgba(240,180,41,.12),rgba(240,180,41,.04))", border: "rgba(240,180,41,.3)", color: "#F0B429" },
    green: { bg: "linear-gradient(145deg,rgba(30,215,96,.12),rgba(30,215,96,.04))",  border: "rgba(30,215,96,.28)", color: "#1ED760" },
    blue:  { bg: "linear-gradient(145deg,rgba(74,144,226,.10),rgba(74,144,226,.03))", border: "rgba(74,144,226,.25)", color: "#4A90E2" },
  }[variant];
  return (
    <div
      className="relative mb-4 flex items-start gap-2.5 overflow-hidden rounded-[10px] border px-3.5 py-3 text-[0.8rem] leading-[1.5] text-[#8b97a8] shadow-[0_2px_8px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.06)]"
      style={{ background: tone.bg, borderColor: tone.border }}
    >
      <Icon className="mt-px h-[0.9rem] w-[0.9rem] shrink-0" style={{ color: tone.color }} />
      <div>{children}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────────────────────

export default function KYCWelcomePage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  // Preserved logic from previous welcome page — show verified state if approved
  const status = user?.verification_status;
  const isApproved = status === "approved" || status === "verified";

  // ─── Local UI state (presentational only) ───
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [selectedTier, setSelectedTier] = useState<TierId>("intermediate");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedAddressDoc, setSelectedAddressDoc] = useState<typeof ACCEPTED_DOCS[number]["id"]>("utility");
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [addressDragOver, setAddressDragOver] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showGoldNotice, setShowGoldNotice] = useState(false);
  const [showLater, setShowLater] = useState(false);

  // Personal info form state (local only — never submitted to backend)
  const [pi, setPi] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    nationality: "",
    country: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    sourceFunds: "",
    pep: "",
  });

  const setPiField = (key: keyof typeof pi) => (v: string) =>
    setPi((s) => ({ ...s, [key]: v }));

  // Step list adapts to tier
  const STEPS = useMemo(
    () => (selectedTier === "advanced" ? ADVANCED_STEPS : BASIC_STEPS),
    [selectedTier],
  );

  // Hide MainLayout chrome while this page is mounted
  useEffect(() => {
    document.body.classList.add("kyc-active");
    return () => {
      document.body.classList.remove("kyc-active");
    };
  }, []);

  // ─── Step navigation ───
  const goNext = (from: StepId) => {
    if (from === 1) return setCurrentStep(2);
    if (from === 2) return setCurrentStep(selectedTier === "advanced" ? 4 : 5);
    if (from === 4) return setCurrentStep(5);
  };
  const goBack = () => {
    if (currentStep === 5) return setCurrentStep(selectedTier === "advanced" ? 4 : 2);
    if (currentStep === 4) return setCurrentStep(2);
    if (currentStep === 2) return setCurrentStep(1);
  };

  // Safe submit — route to existing real KYC flow rather than fake a submission
  const handleSubmit = () => {
    if (!termsAccepted) return;
    navigate("/main/kyc/flow");
  };

  // ─── Tier selection (presentational) ───
  const handleSelectTier = (t: TierId) => {
    setSelectedTier(t);
    setShowGoldNotice(t === "advanced");
  };

  // ─── Address proof file (local preview only, no upload API) ───
  const handleAddressFile = (f: File | null) => {
    if (!f) return;
    setAddressFile(f);
  };

  // ─── If user is already verified, short-circuit to a compact verified card ───
  if (isApproved) {
    return (
      <>
        <style>{PAGE_STYLE}</style>
        <div
          className="kyc-page-scroll fixed inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto px-4 py-10 font-[Inter,-apple-system,sans-serif]"
          style={{ background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)", color: "#eef2f7" }}
        >
          <div className="w-full max-w-[480px]">
            <div
              className="relative overflow-hidden rounded-2xl border-[1.5px] border-white/[0.08] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
              style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))" }}
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg,#00dfa2,#00ffc3)", color: "#07080c" }}
              >
                <CircleCheck className="h-7 w-7" />
              </div>
              <h1 className="text-center font-[Outfit,sans-serif] text-[1.6rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
                Account verified
              </h1>
              <p className="mt-2 text-center text-[0.88rem] leading-[1.6] text-[#8b97a8]">
                Your account is fully verified. All trading features and withdrawal limits are unlocked.
              </p>
              <button
                onClick={() => navigate("/main/dashboard")}
                className="mt-7 w-full rounded-[10px] bg-gradient-to-br from-[#00dfa2] to-[#00b881] py-3.5 text-[0.92rem] font-extrabold text-[#07080c] shadow-[0_4px_16px_rgba(0,223,162,0.3)] transition-all hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,223,162,0.4)] active:scale-[0.98]"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Step bar ───
  const renderStepBar = () => {
    const currentIdx = STEPS.findIndex((s) => s.id === currentStep);
    const progress = currentIdx >= 0 ? (currentIdx / (STEPS.length - 1)) * 100 : 0;
    return (
      <div
        className="relative mb-7 flex items-center justify-between rounded-[18px] border border-white/[0.08] px-4 py-5 sm:px-7"
        style={{
          background: "rgba(13,15,21,.6)",
          backdropFilter: "blur(28px) saturate(1.3)",
          WebkitBackdropFilter: "blur(28px) saturate(1.3)",
        }}
      >
        <div className="pointer-events-none absolute left-[60px] right-[60px] top-1/2 h-[2px] -translate-y-1/2 rounded-[2px] bg-white/[0.08] sm:left-[80px] sm:right-[80px]">
          <div
            className="h-full rounded-[2px] transition-all duration-500"
            style={{ width: `${progress}%`, background: "#1ED760" }}
          />
        </div>
        {STEPS.map((s, i) => {
          const state: "done" | "active" | "wait" =
            s.id < currentStep ? "done" : s.id === currentStep ? "active" : "wait";
          return (
            <div key={s.id} className="relative z-[1] flex flex-1 flex-col items-center gap-2">
              <div
                className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-[0.78rem] font-bold sm:h-[38px] sm:w-[38px]"
                style={
                  state === "done"
                    ? {
                        background: "linear-gradient(145deg,#2EE080,#1ED760,#18a84e)",
                        color: "#fff",
                        boxShadow:
                          "0 0 0 4px rgba(30,215,96,.10),0 4px 12px rgba(30,215,96,.25),inset 0 2px 0 rgba(255,255,255,.30),inset 0 -2px 4px rgba(0,0,0,.2)",
                      }
                    : state === "active"
                      ? {
                          background: "linear-gradient(145deg,#00ffc3,#00dfa2,#00b881)",
                          color: "#000",
                          boxShadow:
                            "0 0 0 4px rgba(0,223,162,.10),0 4px 14px rgba(0,223,162,.3),inset 0 2px 0 rgba(255,255,255,.35),inset 0 -2px 4px rgba(0,0,0,.2)",
                        }
                      : {
                          background: "linear-gradient(145deg,#151821,#10131a)",
                          color: "#2a3040",
                          border: "2px solid rgba(255,255,255,.08)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,.06),inset 0 -2px 4px rgba(0,0,0,.15)",
                        }
                }
              >
                {state === "done" ? <Check className="h-[0.85rem] w-[0.85rem]" /> : i + 1}
              </div>
              <div
                className="max-w-[74px] text-center text-[0.62rem] font-semibold leading-[1.3] sm:text-[0.68rem]"
                style={{
                  color: state === "done" ? "#1ED760" : state === "active" ? "#00dfa2" : "#2a3040",
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Tier card renderer ───
  const renderTierCard = (
    id: TierId,
    opts: {
      ribbon: { label: string; Icon: React.ComponentType<{ className?: string }>; bg: string; color: string };
      tierIcon: React.ComponentType<{ className?: string }>;
      tierName: string;
      nameColor: string;
      iconBg: string;
      iconColor: string;
      limits: { daily: string; monthly: string };
      feats: { label: string; tone: "green" | "gold" | "blue" }[];
      pill: { label: string; Icon: React.ComponentType<{ className?: string }>; bg: string; color: string; border: string };
      cardBaseClass: string;
    },
  ) => {
    const selected = selectedTier === id;
    const TierIcon = opts.tierIcon;
    const PillIcon = opts.pill.Icon;
    const RibbonIcon = opts.ribbon.Icon;
    return (
      <button
        type="button"
        onClick={() => handleSelectTier(id)}
        className={`group relative cursor-pointer overflow-hidden rounded-[14px] border-[1.5px] p-0 text-left transition-all hover:-translate-y-0.5 ${opts.cardBaseClass} ${
          selected ? "border-[#00dfa2] shadow-[0_0_0_2px_rgba(0,223,162,0.3),0_8px_24px_rgba(0,223,162,0.12)]" : ""
        }`}
      >
        <div
          className="flex items-center justify-center px-3 py-[5px] text-center text-[0.58rem] font-extrabold uppercase tracking-[0.1em]"
          style={{ background: opts.ribbon.bg, color: opts.ribbon.color }}
        >
          <RibbonIcon className="mr-1 h-[0.65rem] w-[0.65rem]" />
          {opts.ribbon.label}
        </div>
        <div className="p-[18px]">
          <div className="mb-3.5 flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border"
              style={{
                background: opts.iconBg,
                color: opts.iconColor,
                borderColor: "rgba(255,255,255,0.10)",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.20),inset 0 -3px 6px rgba(0,0,0,.22)",
              }}
            >
              <TierIcon className="h-[0.95rem] w-[0.95rem]" />
            </div>
            <div className="text-[0.95rem] font-extrabold tracking-[-0.01em]" style={{ color: opts.nameColor }}>
              {opts.tierName}
            </div>
          </div>
          <div className="mb-3.5 rounded-[10px] bg-black/[0.18] p-3">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-[7px]">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.07em] text-[#4a5468]">Daily</div>
              <div className="font-[JetBrains_Mono,monospace] text-[0.88rem] font-extrabold text-[#eef2f7]">
                {opts.limits.daily}
              </div>
            </div>
            <div className="flex items-center justify-between pt-[7px]">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.07em] text-[#4a5468]">Monthly</div>
              <div className="font-[JetBrains_Mono,monospace] text-[0.88rem] font-extrabold text-[#eef2f7]">
                {opts.limits.monthly}
              </div>
            </div>
          </div>
          <div className="grid gap-[7px]">
            {opts.feats.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-[0.78rem] text-[#8b97a8]">
                <div
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                  style={
                    f.tone === "green"
                      ? { background: "rgba(30,215,96,.10)", color: "#1ED760" }
                      : f.tone === "gold"
                        ? { background: "rgba(240,180,41,.10)", color: "#F0B429" }
                        : { background: "rgba(96,212,168,.10)", color: "#60D4A8" }
                  }
                >
                  <Check className="h-[0.6rem] w-[0.6rem]" />
                </div>
                {f.label}
              </div>
            ))}
          </div>
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.67rem] font-bold uppercase tracking-[0.06em]"
            style={{ background: opts.pill.bg, color: opts.pill.color, borderColor: opts.pill.border }}
          >
            <PillIcon className="h-[0.65rem] w-[0.65rem]" />
            {opts.pill.label}
          </div>
        </div>
      </button>
    );
  };

  // ─── STEP 1 — TIER SELECT ───
  const renderStep1 = () => (
    <>
      <SectionCard
        Icon={Layers}
        iconBg="rgba(240,180,41,0.1)"
        iconColor="#F0B429"
        title="Select Your Verification Tier"
        subtitle="Choose the tier that matches your trading needs. You can upgrade anytime."
      >
        <div className="grid gap-3.5 md:grid-cols-3">
          {renderTierCard("basic", {
            ribbon: { label: "Current Tier", Icon: Check, bg: "#C0C0C0", color: "#0E1529" },
            tierIcon: Star,
            tierName: "Basic",
            nameColor: "#C0C0C0",
            iconBg: "rgba(192,192,192,0.10)",
            iconColor: "#C0C0C0",
            limits: { daily: "$2,000", monthly: "$10,000" },
            feats: [
              { label: "Email verification", tone: "green" },
              { label: "Phone verification", tone: "green" },
              { label: "Basic trading access", tone: "green" },
            ],
            pill: { label: "Active", Icon: CircleCheck, bg: "rgba(192,192,192,0.10)", color: "#C0C0C0", border: "rgba(192,192,192,0.30)" },
            cardBaseClass: "border-[rgba(192,192,192,0.30)] bg-gradient-to-br from-[#10131a] to-[rgba(192,192,192,0.10)]",
          })}
          {renderTierCard("intermediate", {
            ribbon: { label: "Recommended", Icon: Bolt, bg: "#00dfa2", color: "#000" },
            tierIcon: ShieldHalf,
            tierName: "Intermediate",
            nameColor: "#eef2f7",
            iconBg: "rgba(0,223,162,0.10)",
            iconColor: "#00dfa2",
            limits: { daily: "$50,000", monthly: "$500,000" },
            feats: [
              { label: "Government-issued ID", tone: "green" },
              { label: "Personal information", tone: "green" },
              { label: "Full trading & withdrawals", tone: "green" },
            ],
            pill: { label: "In Progress", Icon: LineChart, bg: "rgba(0,223,162,0.10)", color: "#00dfa2", border: "rgba(0,223,162,0.30)" },
            cardBaseClass:
              "border-[#00dfa2] bg-gradient-to-br from-[#10131a] to-[rgba(0,223,162,0.10)] shadow-[0_0_0_1px_rgba(0,223,162,0.2),0_8px_24px_rgba(0,223,162,0.12)]",
          })}
          {renderTierCard("advanced", {
            ribbon: { label: "Advanced", Icon: Gem, bg: "#60D4A8", color: "#fff" },
            tierIcon: Crown,
            tierName: "Advanced",
            nameColor: "#60D4A8",
            iconBg: "rgba(96,212,168,0.10)",
            iconColor: "#60D4A8",
            limits: { daily: "Unlimited", monthly: "Unlimited" },
            feats: [
              { label: "Address verification required", tone: "blue" },
              { label: "Enhanced due diligence", tone: "blue" },
              { label: "OTC & institutional access", tone: "blue" },
            ],
            pill: { label: "Locked", Icon: Lock, bg: "rgba(96,212,168,0.10)", color: "#60D4A8", border: "rgba(96,212,168,0.30)" },
            cardBaseClass: "border-[rgba(96,212,168,0.30)] bg-gradient-to-br from-[#10131a] to-[rgba(96,212,168,0.10)]",
          })}
        </div>
        {showGoldNotice && (
          <div
            className="relative mt-3 overflow-hidden rounded-[14px] border px-5 py-4 text-[0.82rem] leading-[1.6] text-[#8b97a8]"
            style={{
              background: "linear-gradient(145deg,rgba(240,180,41,.15),rgba(240,180,41,.05))",
              borderColor: "rgba(240,180,41,.25)",
              boxShadow:
                "0 4px 16px rgba(240,180,41,.1),inset 0 1px 0 rgba(255,255,255,.12),inset 0 -2px 6px rgba(0,0,0,.15)",
            }}
          >
            <Star className="mr-2 inline h-[0.85rem] w-[0.85rem] -translate-y-px" style={{ color: "#F0B429" }} />
            Gold delivery requires a verified KYC Level 3 account and a confirmed postal address. Check your verification status.
          </div>
        )}
      </SectionCard>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 border-t border-white/[0.06] pt-4">
        <TrustBadge tone="green" Icon={ShieldHalf} label="FINMA Compliant" />
        <TrustBadge tone="gold" Icon={Lock} label="256-bit Encryption" />
        <TrustBadge tone="blue" Icon={UserCheck} label="GDPR Protected" />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <GhostButton onClick={() => setShowLater(true)}>I'll do it later</GhostButton>
        <PrimaryButton onClick={() => goNext(1)}>Continue</PrimaryButton>
      </div>
    </>
  );

  // ─── STEP 2 — PERSONAL INFO ───
  const renderStep2 = () => (
    <SectionCard
      Icon={UserIcon}
      iconBg="rgba(30,215,96,0.1)"
      iconColor="#1ED760"
      title="Personal Information"
      subtitle="Enter your details exactly as they appear on your government-issued ID"
    >
      <FormSectionLabel Icon={IdCard}>Identity</FormSectionLabel>
      <div className="grid gap-3.5 md:grid-cols-2">
        <Field label="First Name" required Icon={UserIcon} placeholder="John" value={pi.firstName} onChange={setPiField("firstName")} />
        <Field label="Last Name" required Icon={UserIcon} placeholder="Smith" value={pi.lastName} onChange={setPiField("lastName")} />
        <Field label="Date of Birth" required Icon={Cake} type="date" value={pi.dob} onChange={setPiField("dob")} />
        <Field label="Gender" required Icon={UsersRound} value={pi.gender} onChange={setPiField("gender")} options={["Male", "Female", "Other", "Prefer not to say"]} />
      </div>

      <div className="mt-5">
        <FormSectionLabel Icon={Globe}>Nationality &amp; Residency</FormSectionLabel>
        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="Nationality" required Icon={Flag} value={pi.nationality} onChange={setPiField("nationality")} options={COUNTRIES} />
          <Field label="Country of Residence" required Icon={MapPin} value={pi.country} onChange={setPiField("country")} options={COUNTRIES} />
        </div>
      </div>

      <div className="mt-5">
        <FormSectionLabel Icon={MapPin}>Residential Address</FormSectionLabel>
        <div className="grid gap-3.5">
          <Field label="Street Address" required Icon={Home} placeholder="123 Main Street, Suite 100" value={pi.address} onChange={setPiField("address")} />
          <div className="grid gap-3.5 md:grid-cols-3">
            <Field label="City" required Icon={Building2} placeholder="New York" value={pi.city} onChange={setPiField("city")} />
            <Field label="State / Province" required Icon={Map} placeholder="NY" value={pi.state} onChange={setPiField("state")} />
            <Field label="ZIP / Postal Code" required Icon={Hash} placeholder="10001" value={pi.zip} onChange={setPiField("zip")} />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <FormSectionLabel Icon={DollarSign}>Financial &amp; Compliance</FormSectionLabel>
        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="Phone Number" required Icon={Phone} type="tel" placeholder="+1 (555) 123-4567" value={pi.phone} onChange={setPiField("phone")} />
          <Field label="Source of Funds" required Icon={Wallet} value={pi.sourceFunds} onChange={setPiField("sourceFunds")} options={SOURCE_OF_FUNDS} />
          <Field
            label="Politically Exposed Person (PEP)?"
            required
            Icon={Landmark}
            value={pi.pep}
            onChange={setPiField("pep")}
            options={["No, I am not a PEP", "Yes, I am a PEP"]}
          />
        </div>
      </div>

      <NoticeBar variant="blue" Icon={Info}>
        Your information is encrypted with 256-bit SSL and stored on FINMA-compliant Swiss servers. We never share your data with third parties without explicit consent.
      </NoticeBar>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
        <div className="flex items-center gap-1 text-[0.72rem] text-[#2a3040]">
          <Asterisk className="h-[0.55rem] w-[0.55rem]" /> Required fields
        </div>
        <div className="flex items-center gap-3">
          <GhostButton onClick={goBack}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </GhostButton>
          <PrimaryButton onClick={() => goNext(2)}>
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </PrimaryButton>
        </div>
      </div>
    </SectionCard>
  );

  // ─── STEP 4 — ADDRESS PROOF ───
  const renderStep4 = () => (
    <SectionCard
      Icon={MapPinned}
      iconBg="rgba(255,152,0,0.1)"
      iconColor="#FF9800"
      title="Proof of Address"
      subtitle="Upload a document dated within the last 3 months that shows your name and residential address"
    >
      <FormSectionLabel Icon={FileText}>Accepted Document Types</FormSectionLabel>
      <div className="mb-5 grid gap-2.5 md:grid-cols-2">
        {ACCEPTED_DOCS.map((d) => {
          const Icon = d.icon;
          const active = selectedAddressDoc === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedAddressDoc(d.id)}
              className={`flex items-center gap-3 rounded-[14px] border-[1.5px] p-3.5 text-left transition-all ${
                active ? "border-[#00dfa2] bg-[rgba(0,223,162,0.10)]" : "border-white/[0.08] bg-[#10131a] hover:border-white/[0.14]"
              }`}
            >
              <div
                className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border"
                style={{
                  background: active ? "rgba(0,223,162,0.15)" : "linear-gradient(145deg,rgba(0,223,162,.28),rgba(0,223,162,.08))",
                  color: active ? "#00dfa2" : "#8b97a8",
                  borderColor: "rgba(0,223,162,0.22)",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.2),inset 0 -3px 6px rgba(0,0,0,.22)",
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[0.82rem] font-bold text-[#eef2f7]">{d.name}</div>
                <div className="mt-px text-[0.68rem] text-[#4a5468]">{d.hint}</div>
              </div>
            </button>
          );
        })}
      </div>

      <FormSectionLabel Icon={FileUp}>Upload Document</FormSectionLabel>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setAddressDragOver(true);
        }}
        onDragLeave={() => setAddressDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setAddressDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleAddressFile(f);
        }}
        className={`flex min-h-[160px] cursor-pointer flex-col overflow-hidden rounded-[14px] border-[2px] border-dashed bg-[#10131a] transition-all ${
          addressFile
            ? "border-solid border-[#1ED760] bg-[rgba(30,215,96,0.10)]"
            : addressDragOver
              ? "border-[#00dfa2] bg-[rgba(0,223,162,0.10)]"
              : "border-white/[0.08] hover:border-[rgba(0,223,162,0.45)] hover:bg-[rgba(0,223,162,0.10)]"
        }`}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => handleAddressFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-1 items-center justify-center gap-5 px-6 py-6 text-left">
          <div className="text-[2.4rem]" style={{ color: addressFile ? "#1ED760" : "#2a3040" }}>
            {addressFile ? <CircleCheck className="h-9 w-9" /> : <FileUp className="h-9 w-9" />}
          </div>
          <div className="flex-1">
            {addressFile ? (
              <>
                <div className="text-[0.84rem] font-bold text-[#eef2f7]">{addressFile.name}</div>
                <div className="mt-1 text-[0.68rem] text-[#1ED760]">Ready to submit</div>
              </>
            ) : (
              <>
                <div className="mb-1 text-[0.84rem] font-semibold text-[#8b97a8]">Click or drag to upload</div>
                <div className="text-[0.67rem] text-[#2a3040]">JPG, PNG, or PDF · Max 10 MB</div>
                <div className="mt-0.5 text-[0.67rem] text-[#2a3040]">
                  Must be dated within the last <strong className="text-[#8b97a8]">3 months</strong>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] bg-[#10131a] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-[#4a5468]">
            <Paperclip className="h-3 w-3" /> Address Proof
          </span>
          <span className="text-[0.7rem] font-semibold text-[#00dfa2]">JPG / PNG / PDF</span>
        </div>
      </label>

      <NoticeBar variant="blue" Icon={Info}>
        The document must display your <strong className="text-[#eef2f7]">full name</strong> and{" "}
        <strong className="text-[#eef2f7]">residential address</strong> exactly as entered in Step 1. PO Box addresses are not accepted.
      </NoticeBar>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
        <GhostButton onClick={goBack}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </GhostButton>
        <PrimaryButton onClick={() => goNext(4)}>
          Continue <ArrowRight className="h-3.5 w-3.5" />
        </PrimaryButton>
      </div>
    </SectionCard>
  );

  // ─── STEP 5 — REVIEW & SUBMIT ───
  const fullName = [pi.firstName, pi.lastName].filter(Boolean).join(" ") || "...";
  const dobDisplay = pi.dob
    ? new Date(pi.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "...";

  const renderStep5 = () => (
    <SectionCard
      Icon={CheckCircle2}
      iconBg="rgba(30,215,96,0.1)"
      iconColor="#1ED760"
      title="Review & Submit"
      subtitle="Confirm your details are correct before final submission"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[14px] border border-white/[0.08] bg-[#10131a] p-[18px]">
          <div className="mb-3 flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#4a5468]">
            <UserIcon className="h-3 w-3" /> Personal Details
          </div>
          {[
            { k: "Full Name", v: fullName },
            { k: "Date of Birth", v: dobDisplay },
            { k: "Nationality", v: pi.nationality || "..." },
            { k: "Country", v: pi.country || "..." },
            { k: "Phone", v: pi.phone || "..." },
            { k: "Source of Funds", v: pi.sourceFunds || "..." },
          ].map((r, i, arr) => (
            <div
              key={r.k}
              className={`flex items-start justify-between gap-3 py-1.5 ${i < arr.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              <div className="text-[0.77rem] text-[#4a5468]">{r.k}</div>
              <div className="text-right text-[0.77rem] font-semibold text-[#eef2f7]">{r.v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[14px] border border-white/[0.08] bg-[#10131a] p-[18px]">
          <div className="mb-3 flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#4a5468]">
            <FileText className="h-3 w-3" /> Verification Status
          </div>
          <DocStatusRow Icon={IdCard} name="Identity Document" badge={{ label: "Submitted via ID Verify", tone: "ready" }} />
          <DocStatusRow Icon={UserIcon} name="Personal Information" badge={{ label: "Complete", tone: "ready" }} />
          {selectedTier === "advanced" && (
            <DocStatusRow
              Icon={FileText}
              name="Proof of Address"
              badge={addressFile ? { label: "Ready", tone: "ready" } : { label: "Missing", tone: "pending" }}
            />
          )}

          <div className="mt-4 border-t border-white/[0.06] pt-3.5">
            <div className="mb-3 flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#4a5468]">
              <Clock className="h-3 w-3" /> What Happens Next
            </div>
            <ProcessingTimeline />
          </div>
        </div>
      </div>

      <label
        className="mt-5 flex cursor-pointer items-start gap-3.5 rounded-[14px] border-[1.5px] bg-[#10131a] px-[18px] py-4 transition-colors"
        style={{ borderColor: termsAccepted ? "#1ED760" : "rgba(255,255,255,0.08)" }}
      >
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#1ED760]"
        />
        <div className="text-[0.8rem] leading-[1.6] text-[#8b97a8]">
          I confirm that all information provided is accurate, complete, and belongs to me. I understand that submitting false
          information may result in permanent account suspension and may be reported to relevant authorities. I have read and agree
          to the <a className="font-semibold text-[#00dfa2] hover:underline" href="#">Terms of Service</a>,{" "}
          <a className="font-semibold text-[#00dfa2] hover:underline" href="#">Privacy Policy</a>, and{" "}
          <a className="font-semibold text-[#00dfa2] hover:underline" href="#">KYC/AML Policy</a>.
        </div>
      </label>

      <NoticeBar variant="green" Icon={CircleCheck}>
        You can <strong className="text-[#eef2f7]">start trading immediately</strong> with your current Basic tier limits while
        your verification is being reviewed. Full limits unlock upon approval.
      </NoticeBar>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
        <GhostButton onClick={goBack}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </GhostButton>
        <SuccessButton onClick={handleSubmit} disabled={!termsAccepted}>
          <Send className="h-3.5 w-3.5" /> Submit Verification
        </SuccessButton>
      </div>
    </SectionCard>
  );

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <div
        className="kyc-page-scroll fixed inset-0 z-30 flex flex-col overflow-y-auto font-[Inter,-apple-system,sans-serif]"
        style={{ background: "#07080c", color: "#eef2f7" }}
      >
        {/* ─── Background atmosphere ─── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 1200px 800px at 15% 0%,rgba(0,223,162,.12) 0%,transparent 55%),radial-gradient(ellipse 900px 700px at 90% 45%,rgba(91,141,239,.07) 0%,transparent 55%),radial-gradient(ellipse 800px 600px at 45% 100%,rgba(139,92,246,.05) 0%,transparent 55%)",
            }}
          />
          <div className="kyc-orb" style={{ width: 400, height: 400, top: -100, left: -100, background: "rgba(0,223,162,.06)", animationDuration: "25s" }} />
          <div className="kyc-orb" style={{ width: 300, height: 300, bottom: "10%", right: -80, background: "rgba(91,141,239,.05)", animationDuration: "20s", animationDelay: "-5s" }} />
          <div className="kyc-orb" style={{ width: 250, height: 250, top: "50%", left: "30%", background: "rgba(139,92,246,.04)", animationDuration: "22s", animationDelay: "-10s" }} />
          <div className="kyc-grid-tex" />
        </div>

        {/* ─── Existing platform top nav ─── */}
        <WalletNav />

        {/* ─── Page hero ─── */}
        <section
          className="relative border-b border-white/[0.06] px-4 py-7 sm:px-8"
          style={{ background: "linear-gradient(135deg,#0d0f15,rgba(13,15,21,.6))" }}
        >
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#4a5468]">
                <span className="inline-block h-px w-5 bg-white/[0.12]" />
                Account Management
                <span className="inline-block h-px w-5 bg-white/[0.12]" />
              </div>
              <h1 className="kyc-hero-title font-[Outfit,sans-serif] text-[1.55rem] font-extrabold tracking-[-0.02em]">
                Identity Verification
              </h1>
              <div className="mt-0.5 text-[0.83rem] text-[#4a5468]">
                Complete KYC to unlock full trading limits and premium features
              </div>
            </div>
          </div>
        </section>

        {/* ─── Notification banner ─── */}
        {!bannerDismissed && (
          <div className="relative mx-auto mt-4 w-full max-w-[1280px] px-4 sm:px-8">
            <div
              className="relative flex items-center gap-3.5 overflow-hidden rounded-[14px] border-[1.5px] px-5 py-4"
              style={{
                background: "linear-gradient(145deg,rgba(0,223,162,.12),rgba(0,223,162,.04))",
                borderColor: "rgba(0,223,162,.25)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[40%] rounded-t-[14px]"
                style={{ background: "linear-gradient(175deg,rgba(255,255,255,.06),transparent)" }}
              />
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border text-[#00dfa2]"
                style={{
                  background: "linear-gradient(145deg,rgba(0,223,162,.3),rgba(0,223,162,.1))",
                  borderColor: "rgba(0,223,162,.25)",
                  boxShadow:
                    "0 4px 12px rgba(0,223,162,.2),inset 0 2px 0 rgba(255,255,255,.2),inset 0 -2px 4px rgba(0,0,0,.15)",
                }}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="relative flex-1">
                <div className="text-[0.88rem] font-bold text-[#eef2f7]">Complete your verification</div>
                <div className="mt-0.5 text-[0.78rem] leading-[1.5] text-[#4a5468]">
                  All new users must complete Basic and Intermediate KYC to access full trading features. Please fill out your information below.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss"
                className="relative shrink-0 rounded-md p-2 text-[#4a5468] transition-colors hover:bg-white/[0.06] hover:text-[#eef2f7]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Main container ─── */}
        <div className="relative mx-auto grid w-full max-w-[1280px] gap-7 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_320px]">
          {/* MAIN COLUMN */}
          <div className="min-w-0">
            {renderStepBar()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          {/* SIDEBAR */}
          <aside className="flex flex-col gap-5">
            <SidebarCard Icon={ShieldHalf} iconBg="rgba(30,215,96,.1)" iconColor="#1ED760" title="Security & Privacy">
              <div className="grid gap-2.5">
                {TRUST_SEALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.title} className="flex items-center gap-2.5 rounded-[10px] border border-white/[0.06] bg-[#10131a] px-3 py-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border"
                        style={{
                          background: s.bg,
                          color: s.color,
                          borderColor: "rgba(255,255,255,0.06)",
                          boxShadow:
                            "0 4px 10px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.1),inset 0 -1px 3px rgba(0,0,0,.12)",
                        }}
                      >
                        <Icon className="h-[0.85rem] w-[0.85rem]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[0.78rem] font-bold text-[#eef2f7]">{s.title}</div>
                        <div className="mt-px text-[0.66rem] text-[#4a5468]">{s.sub}</div>
                      </div>
                      <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[rgba(30,215,96,0.10)] text-[#1ED760]">
                        <Check className="h-[0.55rem] w-[0.55rem]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SidebarCard>

            <SidebarCard Icon={Clock} iconBg="rgba(240,180,41,.1)" iconColor="#F0B429" title="Review Timeline">
              {ETA_ROWS.map((r, i, arr) => (
                <div
                  key={r.label}
                  className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                >
                  <div className="text-[0.75rem] text-[#4a5468]">{r.label}</div>
                  <div
                    className="font-[JetBrains_Mono,monospace] text-[0.78rem] font-bold"
                    style={{ color: r.green ? "#1ED760" : "#eef2f7" }}
                  >
                    {r.val}
                  </div>
                </div>
              ))}
              <div
                className="mt-3 flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3 text-[0.75rem] text-[#8b97a8]"
                style={{
                  background: "linear-gradient(145deg,rgba(240,180,41,.12),rgba(240,180,41,.04))",
                  borderColor: "rgba(240,180,41,.3)",
                }}
              >
                <Bolt className="mt-px h-[0.85rem] w-[0.85rem] shrink-0" style={{ color: "#F0B429" }} />
                <span>
                  Most verifications are approved within <strong className="text-[#eef2f7]">24 hours</strong> during business days.
                </span>
              </div>
            </SidebarCard>

            <SidebarCard Icon={CircleHelp} iconBg="rgba(74,144,226,.1)" iconColor="#4A90E2" title="FAQ" bodyClass="!px-0 !py-0">
              {FAQS.map((f, i) => {
                const open = openFaqIndex === i;
                return (
                  <div key={f.q} className={`${i < FAQS.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(open ? null : i)}
                      className="flex w-full items-center justify-between gap-2.5 px-[18px] py-3.5 text-left text-[0.82rem] font-semibold text-[#eef2f7] transition-colors hover:bg-[#10131a]"
                    >
                      <span>{f.q}</span>
                      <ChevronDown
                        className={`h-[0.85rem] w-[0.85rem] shrink-0 text-[#2a3040] transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && <div className="px-[18px] pb-3.5 text-[0.78rem] leading-[1.6] text-[#4a5468]">{f.a}</div>}
                  </div>
                );
              })}
            </SidebarCard>

            <SidebarCard Icon={MessageCircle} iconBg="rgba(0,223,162,.1)" iconColor="#00dfa2" title="Need Help?">
              <div className="mb-3.5 text-center text-[0.82rem] leading-[1.5] text-[#4a5468]">
                Need help completing your verification? Our support team is available 24/7.
              </div>
              <button
                type="button"
                onClick={() => navigate("/main/chat")}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-white/[0.08] bg-[#10131a] px-3 py-2.5 text-[0.82rem] font-semibold text-[#8b97a8] transition-all hover:border-white/[0.14] hover:text-[#eef2f7]"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Live Chat Support
              </button>
            </SidebarCard>
          </aside>
        </div>

        {/* ─── Footer ─── */}
        <footer
          className="relative mt-12 border-t border-white/[0.06] px-4 pt-12 sm:px-8"
          style={{
            background: "rgba(13,15,21,.85)",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          }}
        >
          <div className="mx-auto grid max-w-[1280px] gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <LogoBox size={30} />
                <span className="font-[Outfit,sans-serif] text-[1.05rem] font-extrabold text-[#eef2f7]">
                  1 Trade <em className="not-italic text-[#00dfa2]">Market</em>
                </span>
              </div>
              <div className="max-w-[280px] text-[0.78rem] leading-[1.6] text-[#4a5468]">
                The next-generation cryptocurrency and precious metals trading platform. Secure, fast, and built for serious traders worldwide.
              </div>
            </div>

            {FOOTER_COLS.map((col) => (
              <div key={col.h}>
                <h4 className="mb-4 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-[#eef2f7]">{col.h}</h4>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="mb-2.5 block text-[0.8rem] text-[#4a5468] transition-colors hover:text-[#00dfa2]"
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-9 flex max-w-[1280px] flex-wrap items-center justify-center gap-3 border-t border-white/[0.06] py-7">
            {COMPLIANCE_BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="relative flex items-center gap-1.5 overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-3.5 py-[7px] text-[0.7rem] font-semibold text-[#4a5468] shadow-[0_2px_6px_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.08),inset_0_-1px_3px_rgba(0,0,0,.12)] transition-all hover:border-[rgba(0,223,162,0.25)]"
                >
                  <Icon className="h-[0.72rem] w-[0.72rem]" style={{ color: b.color }} />
                  {b.label}
                </div>
              );
            })}
          </div>

          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-5 text-[0.72rem] text-[#2a3040] md:flex-row">
            <div>&copy; {new Date().getFullYear()} 1 Trade Market. All rights reserved.</div>
            <div className="flex flex-wrap items-center justify-center gap-5">
              {["Terms of Service", "Privacy Policy", "Cookie Policy", "AML Policy", "Risk Disclosure"].map((l) => (
                <a
                  key={l}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-[0.72rem] text-[#2a3040] transition-colors hover:text-[#8b97a8]"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* Preserved VerifyLaterModal from original /main/kyc page */}
      <VerifyLaterModal
        open={showLater}
        onClose={() => setShowLater(false)}
        onStartNow={() => {
          setShowLater(false);
          navigate("/main/kyc/flow");
        }}
        onLater={() => {
          setShowLater(false);
          navigate("/main/dashboard");
        }}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Small JSX helpers used inside step renders
// ──────────────────────────────────────────────────────────────

function FormSectionLabel({
  Icon,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#4a5468]">
      <Icon className="h-3 w-3 text-[#2a3040]" />
      {children}
      <span className="ml-1 h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function TrustBadge({
  tone,
  Icon,
  label,
}: {
  tone: "green" | "gold" | "blue";
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const map = {
    green: { bg: "linear-gradient(145deg,rgba(30,215,96,.18),rgba(30,215,96,.06))", color: "#1ED760", border: "rgba(30,215,96,0.28)" },
    gold: { bg: "linear-gradient(145deg,rgba(240,180,41,.18),rgba(240,180,41,.06))", color: "#F0B429", border: "rgba(240,180,41,0.3)" },
    blue: { bg: "linear-gradient(145deg,rgba(74,144,226,.18),rgba(74,144,226,.06))", color: "#4A90E2", border: "rgba(74,144,226,0.3)" },
  }[tone];
  return (
    <div
      className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-[20px] border px-3.5 py-[7px] text-[0.7rem] font-semibold shadow-[0_2px_8px_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.1),inset_0_-1px_3px_rgba(0,0,0,.15)]"
      style={{ background: map.bg, color: map.color, borderColor: map.border }}
    >
      <Icon className="h-[0.78rem] w-[0.78rem]" />
      {label}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-[10px] px-6 py-[11px] text-[0.85rem] font-bold text-black transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      style={{
        background: disabled
          ? "#2a3040"
          : "linear-gradient(145deg,#00ffc3,#00dfa2,#00b881)",
        boxShadow: disabled
          ? "none"
          : "0 4px 14px rgba(0,223,162,.3),0 2px 4px rgba(0,0,0,.2),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -3px 6px rgba(0,0,0,.15)",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-white/[0.08] px-6 py-[11px] text-[0.85rem] font-bold text-[#8b97a8] transition-all hover:-translate-y-px hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-[#eef2f7]"
      style={{
        background: "linear-gradient(145deg,rgba(255,255,255,.06),transparent)",
        boxShadow: "0 2px 6px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 3px rgba(0,0,0,.1)",
      }}
    >
      {children}
    </button>
  );
}

function SuccessButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-[10px] px-6 py-[11px] text-[0.85rem] font-bold text-[#0E1529] transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      style={{
        background: disabled ? "#2a3040" : "linear-gradient(145deg,#2EE080,#1ED760,#18a84e)",
        boxShadow: disabled
          ? "none"
          : "0 4px 14px rgba(30,215,96,.25),0 2px 4px rgba(0,0,0,.2),inset 0 2px 0 rgba(255,255,255,.25),inset 0 -3px 6px rgba(0,0,0,.15)",
      }}
    >
      {children}
    </button>
  );
}

function DocStatusRow({
  Icon,
  name,
  badge,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  badge: { label: string; tone: "ready" | "pending" };
}) {
  const tone =
    badge.tone === "ready"
      ? { bg: "rgba(30,215,96,.10)", color: "#1ED760", border: "rgba(30,215,96,0.28)" }
      : { bg: "rgba(255,152,0,.10)", color: "#FF9800", border: "rgba(255,152,0,0.30)" };
  return (
    <div className="flex items-center gap-2.5 border-b border-white/[0.06] py-2 last:border-0">
      <div
        className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border text-[#8b97a8]"
        style={{
          background: "linear-gradient(145deg,rgba(0,223,162,.28),rgba(0,223,162,.08))",
          borderColor: "rgba(0,223,162,0.22)",
          boxShadow:
            "0 4px 10px rgba(0,0,0,.25),inset 0 2px 0 rgba(255,255,255,.2),inset 0 -2px 5px rgba(0,0,0,.22)",
        }}
      >
        <Icon className="h-[0.78rem] w-[0.78rem] text-[#00dfa2]" />
      </div>
      <div className="flex-1 text-[0.78rem] font-semibold text-[#eef2f7]">{name}</div>
      <span
        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.64rem] font-bold"
        style={{ background: tone.bg, color: tone.color, borderColor: tone.border }}
      >
        {badge.tone === "ready" ? <Check className="h-[0.55rem] w-[0.55rem]" /> : <Clock className="h-[0.55rem] w-[0.55rem]" />}
        {badge.label}
      </span>
    </div>
  );
}

function ProcessingTimeline() {
  const items: { state: "done" | "active" | "wait"; Icon: React.ComponentType<{ className?: string }>; name: string; sub: string }[] = [
    { state: "done", Icon: Check, name: "Submission received", sub: "Instantly upon submit" },
    { state: "active", Icon: Search, name: "Automated checks", sub: "AI document validation · ~2 min" },
    { state: "wait", Icon: SquareUserRound, name: "Manual review", sub: "Compliance team · 1–3 business days" },
    { state: "wait", Icon: CircleCheck, name: "Tier upgrade confirmed", sub: "Email & in-app notification" },
  ];
  return (
    <div className="flex flex-col">
      {items.map((it, idx) => {
        const Icon = it.Icon;
        return (
          <div key={idx} className={`relative flex items-start gap-3.5 pb-3.5 last:pb-0 ${idx < items.length - 1 ? "" : ""}`}>
            {idx < items.length - 1 && (
              <span className="absolute left-[14px] top-[30px] h-[calc(100%-30px)] w-[1.5px] bg-white/[0.08]" />
            )}
            <div
              className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px]"
              style={
                it.state === "done"
                  ? {
                      background: "linear-gradient(145deg,rgba(30,215,96,.2),rgba(30,215,96,.06))",
                      borderColor: "rgba(30,215,96,0.28)",
                      color: "#1ED760",
                    }
                  : it.state === "active"
                    ? {
                        background: "linear-gradient(145deg,rgba(0,223,162,.2),rgba(0,223,162,.06))",
                        borderColor: "rgba(0,223,162,0.4)",
                        color: "#00dfa2",
                      }
                    : {
                        background: "linear-gradient(145deg,#151821,#10131a)",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: "#2a3040",
                      }
              }
            >
              <Icon className="h-[0.65rem] w-[0.65rem]" />
            </div>
            <div>
              <div className="text-[0.8rem] font-bold text-[#eef2f7]">{it.name}</div>
              <div className="mt-px text-[0.71rem] text-[#4a5468]">{it.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

