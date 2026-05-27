import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Sparkles } from "lucide-react";

interface DepositPromptModalProps {
  onDeposit: () => void;
}

const DepositPromptModal: React.FC<DepositPromptModalProps> = ({ onDeposit }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show after 2 seconds on every refresh
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeposit = () => {
    setIsOpen(false);
    onDeposit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px] !border-none !bg-transparent !shadow-none p-0 overflow-visible transition-none [&>button]:hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="mt-12 relative overflow-hidden rounded-2xl border-[1.5px] border-[#00BF87] bg-[#111319] p-8 sm:p-9 font-[Inter,-apple-system,sans-serif] shadow-[0_0_60px_-12px_rgba(0,223,162,0.28),0_0_120px_-32px_rgba(0,184,129,0.18),0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              {/* Glossy top-light overlay (matches Dashboard gcard/scard) */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(175deg,rgba(255,255,255,0.03),transparent_40%)]" />

              {/* Decorative ambient glows */}
              <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 bg-[#00dfa2]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 " />
              <div className="pointer-events-none absolute bottom-0 left-0 w-24 h-24 bg-[#00dfa2]/[0.06] rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03] text-[#8b97a8] transition-colors hover:bg-white/[0.06] hover:text-[#eef2f7]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative flex flex-col items-center text-center space-y-5">
                <motion.div
                  initial={{ rotate: -10, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <img
                    src="/assets/deposit-prompt.png"
                    alt="Deposit illustration"
                    className="w-40 h-40 object-contain drop-shadow-2xl"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-2 -right-2 p-2 rounded-2xl bg-[linear-gradient(135deg,#00dfa2,#00b881)] text-[#07080c] shadow-[0_4px_16px_rgba(0,223,162,0.35)]"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                </motion.div>

                <div className="space-y-2">
                  <h2 className="font-[Outfit,sans-serif] text-2xl font-extrabold tracking-[-0.03em] text-[#eef2f7]">
                    Ready to trade?
                  </h2>
                  <p className="mx-auto max-w-[240px] text-sm leading-relaxed text-[#8b97a8]">
                    Top up your account now and start your trading journey today!
                  </p>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <Button
                    onClick={handleDeposit}
                    className="w-full h-12 rounded-xl border-none bg-[linear-gradient(135deg,#00dfa2,#00b881)] text-[0.95rem] font-bold tracking-[0.02em] text-[#07080c] shadow-[0_4px_16px_rgba(0,223,162,0.2)] transition-all hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,223,162,0.3)] active:translate-y-0"
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Deposit Now
                  </Button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6b82] transition-colors hover:text-[#eef2f7]"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DepositPromptModal;
