import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Plus,
  Headset,
  Ticket,
  CircleCheck,
  Loader,
  Clock,
  Inbox,
  ArrowUpRightFromSquare,
  CircleArrowDown,
  ShieldCheck,
  IdCard,
  LineChart,
  UserCog,
  Wrench,
  MoreHorizontal,
  Search,
  Archive,
  MailOpen,
  Star,
  ArrowUp,
  ArrowLeft,
  ChevronDown,
  Folder,
  Flag,
  Calendar,
  Mail,
  Reply,
  Send,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { MarketSidebar } from "@/components/market/MarketSidebar";

// ─────────────────────────────────────────────────────────────────────────────
// Local UI-only demo data (no API / store / hook involved).
// ─────────────────────────────────────────────────────────────────────────────

type Priority = "urgent" | "high" | "medium" | "low";
type Category =
  | "Withdrawal"
  | "Deposit"
  | "Security"
  | "KYC"
  | "Trading"
  | "Account"
  | "Technical"
  | "Other";

interface DemoTicket {
  id: number;
  from: string;
  fromShort: string;
  fromCls: "support" | "user";
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
  priority: Priority;
  category: Category;
  messages: number;
  attachments: number;
}

interface ThreadMessage {
  from: string;
  avatar: string;
  cls: "support" | "user";
  role?: string;
  date: string;
  body: string;
  attachments?: { name: string; size: string }[];
}

const DEMO_TICKETS: DemoTicket[] = [
  {
    id: 1,
    from: "Sarah M. - 1TM Support",
    fromShort: "SM",
    fromCls: "support",
    subject: "Re: Withdrawal pending for over 48 hours",
    preview:
      "Yes, the funds will be sent to the wallet address you specified in the withdrawal request...",
    date: "Jun 5",
    unread: true,
    priority: "high",
    category: "Withdrawal",
    messages: 4,
    attachments: 0,
  },
  {
    id: 2,
    from: "Security Team - 1TM",
    fromShort: "ST",
    fromCls: "support",
    subject: "Re: Unrecognized login attempt from unknown device",
    preview:
      "We have flagged this login attempt and blocked the IP address...",
    date: "Jun 2",
    unread: true,
    priority: "urgent",
    category: "Security",
    messages: 2,
    attachments: 0,
  },
  {
    id: 3,
    from: "Alex K. - 1TM Support",
    fromShort: "AK",
    fromCls: "support",
    subject: "Re: KYC verification document rejected",
    preview:
      "I reviewed your submission and the image appears to have some glare on the photo page...",
    date: "Jun 2",
    unread: false,
    priority: "medium",
    category: "KYC",
    messages: 3,
    attachments: 2,
  },
  {
    id: 4,
    from: "Maria L. - 1TM Support",
    fromShort: "ML",
    fromCls: "support",
    subject: "Re: Bank wire deposit not credited after 5 business days",
    preview:
      "We have located the transfer. It was held by the intermediary bank...",
    date: "May 30",
    unread: true,
    priority: "medium",
    category: "Deposit",
    messages: 4,
    attachments: 1,
  },
  {
    id: 5,
    from: "You",
    fromShort: "UA",
    fromCls: "user",
    subject: "How to change my registered email address",
    preview:
      "I would like to update the email address associated with my account...",
    date: "May 25",
    unread: true,
    priority: "low",
    category: "Account",
    messages: 1,
    attachments: 0,
  },
  {
    id: 6,
    from: "Trading Desk - 1TM",
    fromShort: "TD",
    fromCls: "support",
    subject: "Re: Order execution delay during high volatility",
    preview: "We have reviewed your order ORD-884521...",
    date: "May 20",
    unread: false,
    priority: "medium",
    category: "Trading",
    messages: 3,
    attachments: 0,
  },
  {
    id: 7,
    from: "Sarah M. - 1TM Support",
    fromShort: "SM",
    fromCls: "support",
    subject: "Re: Crypto deposit showing 0 confirmations",
    preview: "We require 12 network confirmations for ETH deposits...",
    date: "May 10",
    unread: false,
    priority: "low",
    category: "Deposit",
    messages: 3,
    attachments: 0,
  },
  {
    id: 8,
    from: "Tech Support - 1TM",
    fromShort: "TS",
    fromCls: "support",
    subject: "Re: Mobile app keeps logging me out",
    preview: "This is a known issue with version 2.3.1 on iOS 17.5...",
    date: "May 5",
    unread: false,
    priority: "low",
    category: "Technical",
    messages: 3,
    attachments: 1,
  },
  {
    id: 9,
    from: "Product Team - 1TM",
    fromShort: "PT",
    fromCls: "support",
    subject: "Re: Feature request - Dark mode toggle",
    preview: "We have added this to our product roadmap for Q3...",
    date: "Apr 29",
    unread: false,
    priority: "low",
    category: "Other",
    messages: 2,
    attachments: 0,
  },
  {
    id: 10,
    from: "Security Team - 1TM",
    fromShort: "ST",
    fromCls: "support",
    subject: "Re: Enable IP whitelisting for API access",
    preview: "Go to Settings > API Management > IP Restrictions...",
    date: "Apr 12",
    unread: false,
    priority: "high",
    category: "Security",
    messages: 3,
    attachments: 0,
  },
];

const TICKET_THREADS: Record<number, ThreadMessage[]> = {
  1: [
    { from: "You", avatar: "UA", cls: "user", date: "Jun 3, 2025 - 14:22 UTC", body: "<p>I submitted a withdrawal of <code>0.5 BTC</code> on June 3rd and it still shows as processing. Transaction ID: <code>WD-77341</code>.</p><p>Could you please look into this urgently? It has been over 48 hours now.</p>" },
    { from: "Sarah M.", avatar: "SM", cls: "support", role: "Withdrawal Specialist", date: "Jun 3, 2025 - 18:45 UTC", body: "<p>Thank you for reaching out. I can see your withdrawal request <code>WD-77341</code> in our system.</p><p>This transaction requires additional verification due to the amount. Our compliance team is reviewing it and should complete the process within the next 12-24 hours.</p>" },
    { from: "You", avatar: "UA", cls: "user", date: "Jun 4, 2025 - 09:10 UTC", body: "<p>Thank you for the update Sarah. Will the funds be sent to my original wallet address?</p>" },
    { from: "Sarah M.", avatar: "SM", cls: "support", role: "Withdrawal Specialist", date: "Jun 5, 2025 - 10:30 UTC", body: "<p>Yes, the funds will be sent to the wallet address you specified in the withdrawal request. You will receive an email confirmation once the transaction is broadcast to the network.</p><blockquote>Estimated processing: 12-24 hours from compliance approval</blockquote><div class=\"sig\"><strong>Sarah M.</strong><br>Withdrawal Specialist - 1 Trade Market</div>" },
  ],
  2: [
    { from: "You", avatar: "UA", cls: "user", date: "Jun 1, 2025 - 22:08 UTC", body: "<p>I received an email alert about a login attempt from an IP address I do not recognize (<code>185.xxx.xxx.42</code>, location: Germany). I am based in the US.</p><p>I have already changed my password but want to make sure my account is secure.</p>" },
    { from: "Security Team", avatar: "ST", cls: "support", role: "Security Operations", date: "Jun 2, 2025 - 01:15 UTC", body: "<p>We have flagged this login attempt and blocked the IP address. After reviewing your account activity, <strong>no unauthorized transactions were detected</strong>.</p><p>We recommend enabling 2FA via <code>Settings &gt; Security</code> for additional protection.</p><div class=\"sig\"><strong>1TM Security Team</strong><br>Protecting your assets 24/7</div>" },
  ],
  3: [
    { from: "You", avatar: "UA", cls: "user", date: "Jun 2, 2025 - 09:15 UTC", body: "<p>My identity document was rejected during KYC verification. The system says the image is unclear.</p>", attachments: [{ name: "passport_scan.pdf", size: "2.4 MB" }] },
    { from: "Alex K.", avatar: "AK", cls: "support", role: "KYC Specialist", date: "Jun 2, 2025 - 13:40 UTC", body: "<p>I reviewed your submission and the image appears to have some glare. Tips for a successful upload:</p><ul><li>Place document on a <strong>dark, flat surface</strong></li><li>Ensure even lighting <em>without flash</em></li><li>All four corners must be visible</li><li>Text must be readable</li></ul><div class=\"sig\"><strong>Alex K.</strong><br>KYC Specialist - 1 Trade Market</div>" },
    { from: "You", avatar: "UA", cls: "user", date: "Jun 3, 2025 - 10:22 UTC", body: "<p>Thanks Alex. I have retaken the photo and resubmitted.</p>", attachments: [{ name: "passport_v2.jpg", size: "1.2 MB" }] },
  ],
  4: [
    { from: "You", avatar: "UA", cls: "user", date: "May 28, 2025 - 11:30 UTC", body: "<p>I sent a bank wire of <strong>$25,000</strong> on May 22.</p><pre>Reference: WIRE-2025-0522-UA\nAmount: $25,000 USD</pre><p>5 business days have passed and it has not appeared.</p>" },
    { from: "Maria L.", avatar: "ML", cls: "support", role: "Banking Operations", date: "May 28, 2025 - 15:20 UTC", body: "<p>I have escalated this. Could you upload a copy of the wire confirmation?</p>" },
    { from: "You", avatar: "UA", cls: "user", date: "May 29, 2025 - 08:44 UTC", body: "<p>Here is the wire confirmation.</p>", attachments: [{ name: "wire_confirmation.pdf", size: "340 KB" }] },
    { from: "Maria L.", avatar: "ML", cls: "support", role: "Banking Operations", date: "May 30, 2025 - 12:10 UTC", body: "<p>We have located the transfer. The funds should be credited within <strong>24-48 hours</strong>.</p><div class=\"sig\"><strong>Maria L.</strong><br>Banking Operations - 1 Trade Market</div>" },
  ],
  5: [
    { from: "You", avatar: "UA", cls: "user", date: "May 25, 2025 - 16:42 UTC", body: "<p>I would like to update the email address associated with my account. What documents or verification steps are required?</p>" },
  ],
  6: [
    { from: "You", avatar: "UA", cls: "user", date: "May 19, 2025 - 20:15 UTC", body: "<p>During the BTC flash crash, my stop-loss at <code>$62,500</code> executed at <code>$61,800</code>. Slippage of <strong>$700</strong>.</p><p>Order ID: <code>ORD-884521</code></p>" },
    { from: "Trading Desk", avatar: "TD", cls: "support", role: "Trade Execution", date: "May 20, 2025 - 09:30 UTC", body: "<p>We have reviewed your order. BTC dropped ~8% in under 3 minutes. Your stop-loss was a <strong>market order</strong>.</p><blockquote>We recommend <strong>stop-limit orders</strong> during volatile periods.</blockquote>" },
    { from: "Trading Desk", avatar: "TD", cls: "support", role: "Trade Execution", date: "May 20, 2025 - 16:45 UTC", body: "<p>In the Trade Room, select <code>Stop-Limit</code> from the order type dropdown.</p><div class=\"sig\"><strong>1TM Trading Desk</strong></div>" },
  ],
  7: [
    { from: "You", avatar: "UA", cls: "user", date: "May 10, 2025 - 07:50 UTC", body: "<p>I deposited <code>5.2 ETH</code>. TX Hash: <code>0x2c1e...d4f8</code>. Still shows 0 confirmations.</p>" },
    { from: "Sarah M.", avatar: "SM", cls: "support", role: "Deposit Specialist", date: "May 10, 2025 - 08:15 UTC", body: "<p>We require <strong>12 confirmations</strong> for ETH. Your transaction has 8. It should complete in 5-10 minutes.</p>" },
    { from: "You", avatar: "UA", cls: "user", date: "May 10, 2025 - 08:32 UTC", body: "<p>Confirmed - the deposit just appeared. Thank you!</p>" },
  ],
  8: [
    { from: "You", avatar: "UA", cls: "user", date: "May 5, 2025 - 13:20 UTC", body: "<p>The mobile app on my iPhone 15 Pro keeps ending my session after 5 minutes.</p>", attachments: [{ name: "app_screenshot.png", size: "890 KB" }] },
    { from: "Tech Support", avatar: "TS", cls: "support", role: "Technical Support", date: "May 5, 2025 - 16:00 UTC", body: "<p>Known issue with <code>2.3.1</code> on iOS 17.5. Please update to <code>2.3.2</code>.</p>" },
    { from: "You", avatar: "UA", cls: "user", date: "May 6, 2025 - 09:15 UTC", body: "<p>Updated to 2.3.2 and fixed. Thanks!</p>" },
  ],
  9: [
    { from: "You", avatar: "UA", cls: "user", date: "Apr 28, 2025 - 15:00 UTC", body: "<p>Would love a dark/light theme toggle option.</p>" },
    { from: "Product Team", avatar: "PT", cls: "support", role: "Product", date: "Apr 29, 2025 - 10:30 UTC", body: "<p>Added to <strong>roadmap</strong> for Q3 2025. We will notify you!</p><div class=\"sig\"><strong>1TM Product Team</strong></div>" },
  ],
  10: [
    { from: "You", avatar: "UA", cls: "user", date: "Apr 12, 2025 - 08:45 UTC", body: "<p>How do I set up IP whitelisting for my API keys?</p>" },
    { from: "Security Team", avatar: "ST", cls: "support", role: "Security Operations", date: "Apr 12, 2025 - 11:20 UTC", body: "<p>Navigate to:</p><pre>Settings &gt; API Management &gt; [your key] &gt; IP Restrictions</pre><p>Up to <strong>10 IPs</strong> per key. Non-whitelisted IPs get <code>403</code>.</p>" },
    { from: "You", avatar: "UA", cls: "user", date: "Apr 13, 2025 - 14:00 UTC", body: "<p>Set up and confirmed working. Thank you!</p>" },
  ],
};

type CategoryFilter = "all" | Category;

const CATEGORY_TABS: { key: CategoryFilter; label: string; Icon: typeof Inbox }[] = [
  { key: "all", label: "All Tickets", Icon: Inbox },
  { key: "Withdrawal", label: "Withdrawal", Icon: ArrowUpRightFromSquare },
  { key: "Deposit", label: "Deposit", Icon: CircleArrowDown },
  { key: "Security", label: "Security", Icon: ShieldCheck },
  { key: "KYC", label: "KYC", Icon: IdCard },
  { key: "Trading", label: "Trading", Icon: LineChart },
  { key: "Account", label: "Account", Icon: UserCog },
  { key: "Technical", label: "Technical", Icon: Wrench },
  { key: "Other", label: "Other", Icon: MoreHorizontal },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SupportCenterPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedTicket, setSelectedTicket] = useState<DemoTicket | null>(null);

  useEffect(() => {
    document.body.classList.add("support-center-active");
    return () => {
      document.body.classList.remove("support-center-active");
    };
  }, []);

  const tickets = DEMO_TICKETS;

  const counts = useMemo(() => {
    const map: Record<CategoryFilter, number> = {
      all: tickets.length,
      Withdrawal: 0,
      Deposit: 0,
      Security: 0,
      KYC: 0,
      Trading: 0,
      Account: 0,
      Technical: 0,
      Other: 0,
    };
    tickets.forEach((t) => {
      map[t.category]++;
    });
    return map;
  }, [tickets]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.unread).length;
    const inProgress = tickets.filter(
      (t) => t.messages > 1 && t.fromCls === "support",
    ).length;
    return { total, open, inProgress, avgResponse: "~4h" };
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (activeTab !== "all" && t.category !== activeTab) return false;
      if (!q) return true;
      return (
        t.subject.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [tickets, activeTab, query]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    visibleTickets.length > 0 &&
    visibleTickets.every((t) => selectedIds.has(t.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleTickets.forEach((t) => next.delete(t.id));
      } else {
        visibleTickets.forEach((t) => next.add(t.id));
      }
      return next;
    });
  };

  return (
    <>
      <style>{`
        body.support-center-active .fixed.top-0.left-0.right-0.z-20,
        body.support-center-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.support-center-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.support-center-active .flex-1.md\\:ml-\\[80px\\] {
          margin-left: 0 !important;
        }
      `}</style>

      <div
        className="fixed inset-0 z-30 flex flex-col font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
          color: "#eef2f7",
        }}
      >
        <TickerBar />
        <DashboardNavbar />

        {/* Mobile-only sidebar trigger */}
        <div className="flex items-center border-b border-white/[0.06] bg-[rgba(7,8,12,0.75)] px-3 py-1.5 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03] text-[#6b7a90] transition-colors hover:bg-white/[0.06] hover:text-[#eef2f7]"
          >
            <Menu className="h-[1.05rem] w-[1.05rem]" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[60px_1fr]">
          <MarketSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex min-h-0 flex-col overflow-y-auto">
            {/* PAGE HEADER */}
            <header className="relative flex flex-wrap items-center gap-3 border-b border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.005] px-4 py-4 backdrop-blur-[40px] sm:gap-3.5 sm:px-6 sm:py-[18px]">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] border border-[rgba(61,219,169,0.2)] text-[#3DDBA9] shadow-[0_4px_12px_rgba(0,0,0,.25),inset_0_1px_1px_rgba(255,255,255,.15)]"
                style={{
                  background:
                    "linear-gradient(145deg,rgba(61,219,169,0.15),rgba(61,219,169,0.06))",
                }}
              >
                <Headset className="h-[0.95rem] w-[0.95rem]" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-[Outfit,sans-serif] text-[1.05rem] font-extrabold leading-tight tracking-[-0.03em] text-[#eef2f7] sm:text-[1.15rem]">
                  Support <span className="text-[#3DDBA9]">Center</span>
                </h1>
                <p className="mt-0.5 text-[0.7rem] leading-[1.4] text-[#4d5b6e] sm:text-[0.74rem]">
                  Submit tickets, track issues, and communicate with our support
                  team
                </p>
              </div>
              <button
                type="button"
                className="flex flex-shrink-0 items-center gap-2 rounded-[10px] px-4 py-2 text-[0.76rem] font-extrabold text-[#07080c] shadow-[0_4px_16px_rgba(61,219,169,.2),inset_0_1px_2px_rgba(255,255,255,.3)] transition-transform hover:-translate-y-px sm:px-[22px] sm:py-2.5 sm:text-[0.8rem]"
                style={{
                  background:
                    "linear-gradient(135deg,#6EECC4,#3DDBA9,#1A9E78)",
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">New Ticket</span>
              </button>
            </header>

            {/* STATS ROW */}
            <section className="grid grid-cols-2 gap-2.5 border-b border-white/[0.06] bg-gradient-to-br from-white/[0.015] to-white/[0.005] px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:grid-cols-4">
              <StatCard
                label="Total Tickets"
                value={String(stats.total)}
                icon={<Ticket className="h-3 w-3" />}
                tone="green"
                trend="+2"
              />
              <StatCard
                label="Open"
                value={String(stats.open)}
                icon={<CircleCheck className="h-3 w-3" />}
                tone="blue"
              />
              <StatCard
                label="In Progress"
                value={String(stats.inProgress)}
                icon={<Loader className="h-3 w-3" />}
                tone="purple"
              />
              <StatCard
                label="Avg Response"
                value={stats.avgResponse}
                icon={<Clock className="h-3 w-3" />}
                tone="orange"
              />
            </section>

            {/* CATEGORY TABS + SEARCH */}
            <nav className="flex items-stretch gap-0 overflow-x-auto border-b border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-white/[0.008] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORY_TABS.map((tab) => {
                const active = activeTab === tab.key;
                const count = counts[tab.key];
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-3 text-[0.74rem] transition-colors sm:gap-2 sm:px-[18px] sm:text-[0.78rem] " +
                      (active
                        ? "border-[#3DDBA9] font-semibold text-[#eef2f7]"
                        : "border-transparent font-medium text-[#4d5b6e] hover:bg-white/[0.025] hover:text-[#a3adbf]")
                    }
                  >
                    <tab.Icon
                      className={
                        "h-[0.78rem] w-[0.78rem] " +
                        (active ? "text-[#3DDBA9]" : "")
                      }
                    />
                    {tab.label}
                    <span
                      className={
                        "ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-[10px] px-1.5 font-mono text-[0.6rem] font-bold " +
                        (active
                          ? "bg-[rgba(61,219,169,0.12)] text-[#3DDBA9]"
                          : "bg-white/[0.06] text-[#4d5b6e]")
                      }
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              <div className="ml-auto hidden flex-shrink-0 items-center gap-2 self-center rounded-[8px] border border-white/[0.06] bg-white/[0.04] px-3 focus-within:border-[rgba(61,219,169,0.3)] focus-within:shadow-[0_0_0_3px_rgba(61,219,169,.06)] md:flex md:mr-4 md:min-w-[180px]">
                <Search className="h-[0.7rem] w-[0.7rem] text-[#4d5b6e]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="flex-1 bg-transparent py-2 text-[0.76rem] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
                />
              </div>
            </nav>

            {/* MOBILE SEARCH */}
            <div className="border-b border-white/[0.05] px-4 py-2.5 md:hidden">
              <div className="flex items-center gap-2 rounded-[8px] border border-white/[0.06] bg-white/[0.04] px-3 focus-within:border-[rgba(61,219,169,0.3)] focus-within:shadow-[0_0_0_3px_rgba(61,219,169,.06)]">
                <Search className="h-[0.7rem] w-[0.7rem] text-[#4d5b6e]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="flex-1 bg-transparent py-2 text-[0.8rem] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
                />
              </div>
            </div>

            {selectedTicket ? (
              <TicketDetailView
                ticket={selectedTicket}
                onBack={() => setSelectedTicket(null)}
              />
            ) : (
              <>
            {/* LIST TOOLBAR */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.05] bg-white/[0.015] px-4 py-2 sm:px-[14px]">
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                aria-label="Select all visible"
                className={
                  "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] border-2 transition-colors " +
                  (allVisibleSelected
                    ? "border-[#3DDBA9] bg-[#3DDBA9]"
                    : "border-white/[0.15] bg-transparent hover:border-white/[0.3]")
                }
              >
                {allVisibleSelected && (
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2 w-2 text-[#07080c]"
                    fill="currentColor"
                  >
                    <path d="M4.5 8.5 2 6l-1 1 3.5 3.5L11 4l-1-1z" />
                  </svg>
                )}
              </button>
              <span className="mx-0.5 h-5 w-px bg-white/[0.06]" />
              <ToolbarBtn label="Archive">
                <Archive className="h-3 w-3" />
              </ToolbarBtn>
              <ToolbarBtn label="Mark as read">
                <MailOpen className="h-3 w-3" />
              </ToolbarBtn>
              <ToolbarBtn label="Mark important">
                <Star className="h-3 w-3" />
              </ToolbarBtn>
              <div className="flex-1" />
              <span className="whitespace-nowrap font-mono text-[0.65rem] text-[#4d5b6e]">
                {visibleTickets.length > 0
                  ? `1-${visibleTickets.length} of ${visibleTickets.length}`
                  : "0 of 0"}
              </span>
            </div>

            {/* TICKETS LIST */}
            <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
              {visibleTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center text-[#4d5b6e]">
                  <Inbox className="mb-3 h-7 w-7 opacity-30" />
                  <div className="text-[0.82rem]">No tickets found</div>
                </div>
              ) : (
                <>
                  {/* DESKTOP: TABLE ROWS */}
                  <ul className="hidden md:block">
                    {visibleTickets.map((t) => (
                      <li
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={
                          "relative grid cursor-pointer grid-cols-[22px_42px_180px_1fr_auto_90px] items-center gap-x-4 border-b border-white/[0.04] px-7 py-[18px] transition-colors hover:bg-white/[0.028] " +
                          (t.unread ? "bg-white/[0.02]" : "")
                        }
                      >
                        {t.unread && (
                          <span className="absolute left-[8px] top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[#3DDBA9] shadow-[0_0_8px_rgba(61,219,169,.5)]" />
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(t.id);
                          }}
                          aria-label="Select ticket"
                          className={
                            "flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] transition-colors " +
                            (selectedIds.has(t.id)
                              ? "border-[#3DDBA9] bg-[#3DDBA9]"
                              : "border-white/[0.12] hover:border-white/[0.3]")
                          }
                        >
                          {selectedIds.has(t.id) && (
                            <svg
                              viewBox="0 0 12 12"
                              className="h-2 w-2 text-[#07080c]"
                              fill="currentColor"
                            >
                              <path d="M4.5 8.5 2 6l-1 1 3.5 3.5L11 4l-1-1z" />
                            </svg>
                          )}
                        </button>

                        <Avatar
                          short={t.fromShort}
                          tone={t.fromCls}
                          size="md"
                        />

                        <div
                          className={
                            "min-w-0 truncate text-[0.84rem] " +
                            (t.unread
                              ? "font-bold text-[#eef2f7]"
                              : "font-semibold text-[#a3adbf]")
                          }
                        >
                          {t.from}
                        </div>

                        <div className="min-w-0">
                          <div
                            className={
                              "mb-[3px] truncate text-[0.88rem] leading-[1.3] tracking-[-0.01em] " +
                              (t.unread
                                ? "font-bold text-[#eef2f7]"
                                : "font-semibold text-[#a3adbf]")
                            }
                          >
                            {t.subject}
                          </div>
                          <div className="truncate text-[0.74rem] leading-[1.4] text-[#4d5b6e]">
                            {t.preview}
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-1.5">
                          <PriorityTag priority={t.priority} />
                          <CategoryTag category={t.category} />
                          {t.attachments > 0 && (
                            <span className="inline-flex items-center gap-1 text-[0.56rem] text-[#4d5b6e]">
                              <Paperclip className="h-[0.5rem] w-[0.5rem]" />
                              {t.attachments}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 text-right">
                          <span className="block whitespace-nowrap font-mono text-[0.68rem] text-[#4d5b6e]">
                            {t.date}
                          </span>
                          <div className="mt-[3px] flex items-center justify-end gap-1 font-mono text-[0.58rem] text-[#4d5b6e]">
                            <MessageSquare className="h-[0.48rem] w-[0.48rem]" />
                            {t.messages}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* MOBILE: STACKED CARDS */}
                  <ul className="flex flex-col gap-2 p-3 md:hidden">
                    {visibleTickets.map((t) => (
                      <li
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={
                          "relative cursor-pointer overflow-hidden rounded-[12px] border pl-3 pr-3 py-3 transition-colors " +
                          (t.unread
                            ? "border-[rgba(61,219,169,0.15)] bg-[rgba(61,219,169,0.035)]"
                            : "border-white/[0.05] bg-white/[0.02]")
                        }
                      >
                        {t.unread && (
                          <span className="absolute left-0 top-0 h-full w-[3px] bg-[#3DDBA9] shadow-[0_0_8px_rgba(61,219,169,.4)]" />
                        )}

                        {/* TOP ROW: checkbox + avatar + name/date */}
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(t.id);
                            }}
                            aria-label="Select ticket"
                            className={
                              "mt-1 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors " +
                              (selectedIds.has(t.id)
                                ? "border-[#3DDBA9] bg-[#3DDBA9]"
                                : "border-white/[0.18] hover:border-white/[0.3]")
                            }
                          >
                            {selectedIds.has(t.id) && (
                              <svg
                                viewBox="0 0 12 12"
                                className="h-2 w-2 text-[#07080c]"
                                fill="currentColor"
                              >
                                <path d="M4.5 8.5 2 6l-1 1 3.5 3.5L11 4l-1-1z" />
                              </svg>
                            )}
                          </button>

                          <Avatar
                            short={t.fromShort}
                            tone={t.fromCls}
                            size="sm"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={
                                  "min-w-0 flex-1 truncate text-[0.78rem] leading-tight " +
                                  (t.unread
                                    ? "font-bold text-[#eef2f7]"
                                    : "font-semibold text-[#a3adbf]")
                                }
                              >
                                {t.from}
                              </span>
                              <span className="flex-shrink-0 whitespace-nowrap font-mono text-[0.62rem] text-[#6b7a90]">
                                {t.date}
                              </span>
                            </div>
                            <div
                              className={
                                "mt-0.5 inline-flex items-center gap-1 font-mono text-[0.56rem] uppercase tracking-[0.06em] " +
                                (t.fromCls === "user"
                                  ? "text-[#3DDBA9]"
                                  : "text-[#5B8DEF]")
                              }
                            >
                              {t.fromCls === "user" ? "You" : "Support"}
                            </div>
                          </div>
                        </div>

                        {/* SUBJECT */}
                        <div
                          className={
                            "mt-2 break-words text-[0.84rem] leading-[1.3] tracking-[-0.01em] " +
                            (t.unread
                              ? "font-bold text-[#eef2f7]"
                              : "font-semibold text-[#a3adbf]")
                          }
                        >
                          {t.subject}
                        </div>

                        {/* PREVIEW */}
                        <p className="mt-1 line-clamp-2 break-words text-[0.72rem] leading-[1.45] text-[#4d5b6e]">
                          {t.preview}
                        </p>

                        {/* BADGES + META */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <PriorityTag priority={t.priority} />
                          <CategoryTag category={t.category} />
                          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.6rem] text-[#6b7a90]">
                            <MessageSquare className="h-[0.6rem] w-[0.6rem]" />
                            {t.messages}
                            {t.attachments > 0 && (
                              <>
                                <Paperclip className="ml-1 h-[0.6rem] w-[0.6rem]" />
                                {t.attachments}
                              </>
                            )}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local presentational pieces
// ─────────────────────────────────────────────────────────────────────────────

type Tone = "green" | "blue" | "purple" | "orange";

const TONE_STYLES: Record<Tone, { wrap: string; color: string }> = {
  green: {
    wrap: "border-[rgba(61,219,169,0.2)] bg-[linear-gradient(145deg,rgba(61,219,169,0.18),rgba(61,219,169,0.06))]",
    color: "text-[#3DDBA9]",
  },
  blue: {
    wrap: "border-[rgba(91,141,239,0.2)] bg-[linear-gradient(145deg,rgba(91,141,239,0.18),rgba(91,141,239,0.06))]",
    color: "text-[#5B8DEF]",
  },
  purple: {
    wrap: "border-[rgba(139,92,246,0.2)] bg-[linear-gradient(145deg,rgba(139,92,246,0.18),rgba(139,92,246,0.06))]",
    color: "text-[#8B5CF6]",
  },
  orange: {
    wrap: "border-[rgba(232,169,77,0.2)] bg-[linear-gradient(145deg,rgba(232,169,77,0.18),rgba(232,169,77,0.06))]",
    color: "text-[#E8A94D]",
  },
};

function StatCard({
  label,
  value,
  icon,
  tone,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: Tone;
  trend?: string;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div
      className="group relative overflow-hidden rounded-[14px] border border-white/[0.06] p-[16px_18px] transition-all hover:-translate-y-px hover:border-[rgba(61,219,169,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,.15)]"
      style={{
        background:
          "linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))",
      }}
    >
      <div className="mb-3.5 flex items-center justify-between">
        <div
          className={
            "flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border shadow-[0_4px_12px_rgba(0,0,0,.25),inset_0_1px_1px_rgba(255,255,255,.15)] " +
            t.wrap +
            " " +
            t.color
          }
        >
          {icon}
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(61,219,169,0.08)] px-2 py-0.5 font-mono text-[0.6rem] font-bold text-[#3DDBA9]">
            <ArrowUp className="h-[0.5rem] w-[0.5rem]" />
            {trend}
          </span>
        )}
      </div>
      <div className="font-[Outfit,sans-serif] text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-[#eef2f7]">
        {value}
      </div>
      <div className="mt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#4d5b6e]">
        {label}
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#4d5b6e] transition-colors hover:bg-white/[0.06] hover:text-[#eef2f7]"
    >
      {children}
    </button>
  );
}

function Avatar({
  short,
  tone,
  size = "md",
}: {
  short: string;
  tone: "support" | "user";
  size?: "sm" | "md";
}) {
  const dims =
    size === "sm"
      ? "h-9 w-9 text-[0.62rem]"
      : "h-[42px] w-[42px] text-[0.68rem]";
  const bg =
    tone === "user"
      ? "linear-gradient(135deg,#3DDBA9,#1A9E78)"
      : "linear-gradient(135deg,#5B8DEF,#3d6fef)";
  const color = tone === "user" ? "#07080c" : "#fff";
  return (
    <span
      className={
        "relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold shadow-[0_3px_10px_rgba(0,0,0,.25),inset_0_1px_1px_rgba(255,255,255,.2)] " +
        dims
      }
      style={{ background: bg, color, fontFamily: "Outfit, sans-serif" }}
    >
      {short}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  urgent: "bg-[rgba(232,93,93,.08)] text-[#E85D5D]",
  high: "bg-[rgba(232,169,77,.07)] text-[#E8A94D]",
  medium: "bg-[rgba(91,141,239,.08)] text-[#5B8DEF]",
  low: "bg-[rgba(52,199,123,.08)] text-[#34C77B]",
};

function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span
      className={
        "whitespace-nowrap rounded-[5px] px-2 py-[3px] text-[0.58rem] font-bold uppercase tracking-[0.04em] " +
        PRIORITY_STYLES[priority]
      }
    >
      {priority}
    </span>
  );
}

function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="whitespace-nowrap rounded-[5px] bg-white/[0.05] px-2 py-[3px] text-[0.58rem] font-bold uppercase tracking-[0.04em] text-[#6b7a90]">
      {category}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ticket detail / reply view (UI-only)
// ─────────────────────────────────────────────────────────────────────────────

function TicketDetailView({
  ticket,
  onBack,
}: {
  ticket: DemoTicket;
  onBack: () => void;
}) {
  const [showEarlier, setShowEarlier] = useState(false);
  const [replyText, setReplyText] = useState("");
  const thread = TICKET_THREADS[ticket.id] ?? [];
  const last = thread[thread.length - 1];
  const earlier = thread.slice(0, -1);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* DETAIL TOOLBAR */}
      <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5 border-b border-white/[0.05] bg-gradient-to-br from-white/[0.025] to-white/[0.008] px-3 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] flex-shrink-0 items-center gap-2 rounded-full border border-[rgba(61,219,169,0.2)] bg-[linear-gradient(145deg,rgba(61,219,169,0.12),rgba(61,219,169,0.05))] px-5 py-[9px] text-[0.78rem] font-bold text-[#3DDBA9] shadow-[0_2px_8px_rgba(0,0,0,.15),inset_0_1px_1px_rgba(255,255,255,.08)] transition-all hover:-translate-x-0.5 hover:border-[rgba(61,219,169,0.35)] hover:bg-[linear-gradient(145deg,rgba(61,219,169,0.2),rgba(61,219,169,0.1))]"
        >
          <ArrowLeft className="h-[0.7rem] w-[0.7rem]" />
          Back to tickets
        </button>
        <div className="flex-1" />
        <ToolbarBtn label="Archive">
          <Archive className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Mark unread">
          <Mail className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn label="Mark important">
          <Star className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* BODY (scrolls on desktop; flows into page scroll on mobile) */}
      <div className="flex-1 px-3 md:min-h-0 md:overflow-y-auto md:px-6">
        <div className="mx-auto w-full max-w-[880px]">
          {/* SUBJECT HERO */}
          <div className="border-b border-white/[0.04] py-6 sm:py-7">
            <div className="font-[Outfit,sans-serif] text-[1.05rem] font-extrabold leading-[1.3] tracking-[-0.03em] text-[#eef2f7] sm:text-[1.4rem]">
              {ticket.subject}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <PriorityTag priority={ticket.priority} />
              <CategoryTag category={ticket.category} />
            </div>
          </div>

          {/* INFO STRIP */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.04] bg-gradient-to-br from-white/[0.03] to-white/[0.01] py-3.5">
            <InfoItem icon={<Folder className="h-[0.6rem] w-[0.6rem]" />}>
              <strong className="font-semibold text-[#a3adbf]">
                {ticket.category}
              </strong>
            </InfoItem>
            <InfoItem icon={<Flag className="h-[0.6rem] w-[0.6rem]" />}>
              <strong className="font-semibold capitalize text-[#a3adbf]">
                {ticket.priority}
              </strong>{" "}
              priority
            </InfoItem>
            <InfoItem icon={<MessageSquare className="h-[0.6rem] w-[0.6rem]" />}>
              <strong className="font-semibold text-[#a3adbf]">
                {thread.length}
              </strong>{" "}
              message{thread.length > 1 ? "s" : ""}
            </InfoItem>
            {thread[0] && (
              <InfoItem icon={<Calendar className="h-[0.6rem] w-[0.6rem]" />}>
                Created{" "}
                <strong className="font-semibold text-[#a3adbf]">
                  {thread[0].date}
                </strong>
              </InfoItem>
            )}
          </div>

          {/* EARLIER MESSAGES (collapsed) */}
          {earlier.length > 0 && (
            <div className="pt-5">
              <button
                type="button"
                onClick={() => setShowEarlier((v) => !v)}
                className="flex w-full items-center gap-2 rounded-[10px] border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-[0.72rem] font-medium text-[#6b7a90] transition-colors hover:bg-white/[0.04] hover:text-[#a3adbf]"
              >
                <ChevronDown
                  className={
                    "h-3 w-3 transition-transform " +
                    (showEarlier ? "rotate-180" : "")
                  }
                />
                <span>
                  {showEarlier
                    ? "Hide earlier messages"
                    : `${earlier.length} earlier message${earlier.length > 1 ? "s" : ""}`}
                </span>
              </button>
              {showEarlier && (
                <div className="pt-3">
                  {earlier.map((m, i) => (
                    <MessageCard key={i} message={m} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LATEST MESSAGE */}
          {last && (
            <div className="py-3 pb-5">
              <MessageCard message={last} latest />
            </div>
          )}
        </div>
      </div>

      {/* REPLY BOX */}
      <div className="m-3 flex-shrink-0 overflow-hidden rounded-[14px] border border-white/[0.07] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] transition focus-within:border-[rgba(61,219,169,0.25)] focus-within:shadow-[0_0_0_3px_rgba(61,219,169,.05),0_8px_30px_rgba(0,0,0,.15)] sm:mx-6 sm:mb-6">
        <div className="mx-auto w-full max-w-[880px]">
          <div className="flex items-center gap-1.5 px-5 pb-1.5 pt-3 text-[0.68rem] font-medium text-[#6b7a90]">
            <Reply className="h-[0.6rem] w-[0.6rem] text-[#3DDBA9]" />
            Reply to {ticket.from}
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            rows={4}
            className="block w-full resize-y border-y border-white/[0.04] bg-transparent px-5 py-3 text-[0.84rem] leading-[1.6] text-[#eef2f7] outline-none placeholder:text-[#4d5b6e]"
          />
          <div className="flex flex-wrap items-center gap-2 px-3.5 py-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-[6px] border border-white/[0.06] bg-white/[0.04] px-3 py-1.5 text-[0.68rem] font-semibold text-[#6b7a90] transition hover:bg-white/[0.08] hover:text-[#eef2f7]"
            >
              <Paperclip className="h-[0.62rem] w-[0.62rem] text-[#3DDBA9]" />
              Attach file
            </button>
            <button
              type="button"
              disabled={replyText.trim().length === 0}
              onClick={() => setReplyText("")}
              className="ml-auto flex items-center gap-1.5 rounded-[8px] px-5 py-2 text-[0.78rem] font-extrabold text-[#07080c] shadow-[0_4px_14px_rgba(61,219,169,.2)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              style={{
                background: "linear-gradient(135deg,#3DDBA9,#1A9E78)",
              }}
            >
              <Send className="h-[0.62rem] w-[0.62rem]" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[0.7rem] text-[#6b7a90]">
      <span className="flex w-3.5 items-center justify-center text-[#4d5b6e]">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

function MessageCard({
  message,
  latest,
}: {
  message: ThreadMessage;
  latest?: boolean;
}) {
  return (
    <div
      className={
        "relative mb-3 overflow-hidden rounded-[14px] border " +
        (latest
          ? "border-[rgba(61,219,169,0.15)] bg-[linear-gradient(160deg,rgba(61,219,169,0.04),rgba(255,255,255,0.02))] shadow-[0_4px_20px_rgba(0,0,0,.12),0_0_30px_rgba(61,219,169,.03)]"
          : "border-white/[0.06] bg-[linear-gradient(160deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))]")
      }
    >
      <span
        className={
          "absolute left-0 top-0 h-full w-[3px] " +
          (latest
            ? "bg-[linear-gradient(180deg,#6EECC4,#3DDBA9)]"
            : message.cls === "user"
              ? "bg-[linear-gradient(180deg,#3DDBA9,rgba(61,219,169,0.3))]"
              : "bg-[linear-gradient(180deg,#5B8DEF,rgba(91,141,239,0.3))]")
        }
      />
      <div className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-5">
        <Avatar short={message.avatar} tone={message.cls} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-[0.82rem] font-bold text-[#eef2f7]">
            {message.from}
            {message.role && (
              <span className="ml-1.5 text-[0.68rem] font-normal text-[#6b7a90]">
                {message.role}
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[0.6rem] text-[#4d5b6e]">
            {message.date}
          </div>
        </div>
      </div>
      <div
        className="px-4 pb-4 text-[0.84rem] leading-[1.7] text-[#eef2f7] sm:px-5 [&_code]:rounded-[3px] [&_code]:bg-white/[0.08] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.78em] [&_code]:text-[#3DDBA9] [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#3DDBA9] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#a3adbf] [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:rounded-[8px] [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[0.76rem] [&_pre]:text-[#a3adbf] [&_p]:mb-2 [&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic [&_.sig]:mt-3 [&_.sig]:border-t [&_.sig]:border-white/[0.06] [&_.sig]:pt-2 [&_.sig]:text-[0.72rem] [&_.sig]:text-[#6b7a90]"
        dangerouslySetInnerHTML={{ __html: message.body }}
      />
      {message.attachments && message.attachments.length > 0 && (
        <div className="border-t border-white/[0.04] px-4 py-3 sm:px-5">
          <div className="mb-2 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-[#6b7a90]">
            <Paperclip className="h-[0.6rem] w-[0.6rem]" />
            {message.attachments.length} attachment
            {message.attachments.length > 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-[8px] border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[0.7rem] text-[#a3adbf]"
              >
                <Paperclip className="h-[0.62rem] w-[0.62rem] text-[#3DDBA9]" />
                <span className="font-medium">{a.name}</span>
                <span className="font-mono text-[0.6rem] text-[#4d5b6e]">
                  {a.size}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
