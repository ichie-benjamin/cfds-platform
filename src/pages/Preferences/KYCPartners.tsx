import React, { useEffect, useState } from 'react';
import { KYC_PARTNERS } from '@/constants/kyc-partners';
import { Shield, Check, ExternalLink, Info, Menu } from 'lucide-react';
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const KYCPartners: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hide MainLayout chrome while this page is mounted (matches security/settings pattern)
  useEffect(() => {
    document.body.classList.add("kyc-partners-active");
    return () => {
      document.body.classList.remove("kyc-partners-active");
    };
  }, []);

  return (
    <>
      <style>{`
        body.kyc-partners-active .fixed.top-0.left-0.right-0.z-20,
        body.kyc-partners-active .fixed.top-\\[60px\\].left-0.bottom-0 {
          display: none !important;
        }
        body.kyc-partners-active .flex.flex-1.pt-\\[90px\\] {
          padding-top: 0 !important;
        }
        body.kyc-partners-active .flex-1.md\\:ml-\\[80px\\] {
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

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[60px_1fr] min-h-0">
          <DashboardSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="overflow-y-auto px-4 py-7 md:px-8" style={{ maxHeight: "100%" }}>
            <div className="md:hidden mb-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#8b97a8] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#eef2f7]"
              >
                <Menu className="h-[1.05rem] w-[1.05rem]" />
              </button>
            </div>

            <div className="min-h-full py-6 px-2 pb-24">
              <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,223,162,0.1)] border border-[rgba(0,223,162,0.2)] text-[#00dfa2] text-[11px] font-bold uppercase tracking-[0.08em] mb-2">
            <Shield className="w-3.5 h-3.5" />
            Verified Partners
          </div>
          <h1 className="font-[Outfit,sans-serif] text-[1.65rem] sm:text-[2rem] md:text-[2.4rem] font-extrabold tracking-[-0.03em] leading-tight text-[#eef2f7]">
            Integrated KYC Ecosystem
          </h1>
          <p className="text-[0.95rem] text-[#8b97a8] leading-relaxed">
            We've partnered with the world's leading cryptocurrency exchanges to provide a seamless,
            secure, and instant identity verification experience across our entire network.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KYC_PARTNERS.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.06)] p-5 flex flex-col items-center justify-center transition-all duration-150 hover:-translate-y-px hover:border-[rgba(0,223,162,0.35)] cursor-pointer no-underline shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{
                background:
                  "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
              }}
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3.5 h-3.5 text-[#4a5468]" />
              </div>

              <div className="relative w-20 h-20 mb-4 transition-transform duration-200 group-hover:scale-105">
                <div className="absolute inset-0 bg-[#00dfa2] rounded-full blur-[40px] opacity-0 group-hover:opacity-[0.12] transition-opacity" />
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 brightness-110"
                />
              </div>

              <h3 className="text-[0.72rem] font-extrabold text-[#eef2f7] group-hover:text-[#00dfa2] transition-colors uppercase tracking-[0.16em] text-center">
                {partner.name}
              </h3>

              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(0,223,162,0.1)] text-[0.58rem] font-bold text-[#00dfa2] uppercase tracking-[0.08em] border border-[rgba(0,223,162,0.2)]">
                <Check className="w-2.5 h-2.5" />
                Sync Active
              </div>
            </a>
          ))}
        </div>

        {/* Info Section */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] mt-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          }}
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00dfa2]/[0.05] blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center relative z-10">
            <div className="space-y-6">
              <h2 className="font-[Outfit,sans-serif] text-[1.45rem] md:text-[1.65rem] font-extrabold tracking-[-0.03em] leading-tight text-[#eef2f7]">
                How our integrated <br/>verification works
              </h2>
              <div className="space-y-5">
                {[
                  {
                    title: "Single Identity Profile",
                    desc: "Your verification status is shared across our secure network of partner exchanges instantly."
                  },
                  {
                    title: "Privacy First",
                    desc: "We use zero-knowledge protocols and advanced encryption to protect your sensitive data."
                  },
                  {
                    title: "Global Compliance",
                    desc: "Standardized KYC procedures that meet international regulatory and anti-money laundering requirements."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,223,162,0.1)] flex items-center justify-center flex-shrink-0 border border-[rgba(0,223,162,0.2)] text-[#00dfa2]">
                      <div className="w-2 h-2 rounded-full bg-[#00dfa2] shadow-[0_0_10px_rgba(0,223,162,0.6)]" />
                    </div>
                    <div>
                      <h4 className="text-[0.95rem] font-extrabold text-[#eef2f7] mb-1">{item.title}</h4>
                      <p className="text-[0.82rem] text-[#8b97a8] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative rounded-2xl border border-white/[0.06] p-6 md:p-7 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
              }}
            >
              <div className="flex items-center gap-3 text-[#00dfa2]">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(0,223,162,0.1)]">
                    <Info className="w-4 h-4" />
                </div>
                <h4 className="text-[1.05rem] font-extrabold text-[#eef2f7]">Service Limits</h4>
              </div>
              <p className="text-[0.87rem] text-[#8b97a8] leading-relaxed">
                Integrated KYC allows you to trade up to <span className="text-[#eef2f7] font-bold">$50,000 USD</span> daily across all partner platforms
                without repeating the verification process.
              </p>

              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-[#4a5468] uppercase tracking-[0.08em]">
                        <span>Network Synchronization</span>
                        <span className="text-[#00dfa2]">99.9% Uptime</span>
                    </div>
                    <div className="h-2 w-full bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                        <div className="h-full w-full bg-gradient-to-r from-[#00dfa2] to-[#1ED760] rounded-full shadow-[0_0_15px_rgba(0,223,162,0.35)]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-3.5">
                        <p className="text-[0.6rem] font-bold text-[#4a5468] uppercase tracking-[0.08em] mb-1">Response Time</p>
                        <p className="font-mono text-[1.1rem] font-extrabold text-[#eef2f7]">{'<'} 2s</p>
                    </div>
                    <div className="rounded-[10px] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-3.5">
                        <p className="text-[0.6rem] font-bold text-[#4a5468] uppercase tracking-[0.08em] mb-1">Encryption</p>
                        <p className="font-mono text-[1.1rem] font-extrabold text-[#eef2f7]">AES-256</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default KYCPartners;
