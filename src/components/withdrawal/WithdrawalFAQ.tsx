import { useState } from "react";
import { HelpCircle, Plus, X, Lightbulb, Shield } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  highlight?: string;
  highlightIcon?: "lightbulb" | "shield";
}

const faqItems: FAQItem[] = [
  {
    question: "What is the 10% early exit fee and when does it apply?",
    answer:
      'The 10% early exit fee applies to the gross amount for any exit within the 6-month hold period. Withdrawing $50,000 early means $5,000 is deducted — you receive $45,000 before taxes.',
    highlight: "After 6 months, withdrawals are completely fee-free.",
    highlightIcon: "lightbulb",
  },
  {
    question: "Can I withdraw a portion of my staked portfolio?",
    answer:
      "Partial withdrawals are allowed. The 10% fee applies only to the withdrawn portion. Your remaining balance stays invested and actively managed. Minimum partial withdrawal is $1,000.",
  },
  {
    question: "What happens to my open positions on early withdrawal?",
    answer:
      "All active portfolio positions are immediately force-closed at current market prices. Unrealised gains are added; unrealised losses are crystallised and deducted from your payout.",
  },
  {
    question: "Are there tax implications on early withdrawal?",
    answer:
      "Early exits may trigger CGT in your home country. Retirement Staking™ is structured in a crypto-friendly jurisdiction to minimise exposure, but local laws vary. Consult a tax professional.",
    highlight:
      "Long-term holders (5+ years) benefit from the most favourable tax-efficient exit structure.",
    highlightIcon: "shield",
  },
  {
    question: "How long does an early withdrawal take?",
    answer:
      "24–48 hours after approval, including force-close of positions. After the 6-month hold period, standard withdrawals process within 1–3 business days.",
  },
];

export function WithdrawalFAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="scard">
      <div className="scard-title">
        <HelpCircle
          className="h-[0.85rem] w-[0.85rem]"
          style={{ color: "var(--accent)" }}
        />
        Withdrawal FAQ
      </div>
      <div className="flex flex-col gap-1.5">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`cursor-pointer overflow-hidden rounded-lg border transition-colors duration-150 ${
                isOpen
                  ? "border-white/[0.08]"
                  : "border-white/[0.04] hover:border-white/[0.08]"
              }`}
              onClick={() => toggle(idx)}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-xs font-bold text-white">{item.question}</span>
                <span className="flex-shrink-0 text-[#4a5468]">
                  {isOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 text-xs leading-relaxed text-[#a8b5c8]">
                  {item.answer}
                  {item.highlight && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-[#3DDBA9]/20 bg-[#3DDBA9]/[0.06] p-2.5 text-[11px] text-[#3DDBA9]">
                      {item.highlightIcon === "shield" ? (
                        <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span>{item.highlight}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
