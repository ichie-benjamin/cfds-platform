import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";
import Logo from "@/components/Logo";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-50">
      {/* Left section with logo */}
      <div className="flex items-center">
        <Logo />
      </div>

      {/* Right section with buttons */}
      <div className="flex items-center gap-3">
        <Button
          className="header-action-button withdraw-button"
          onClick={() => navigate("/main/withdrawal")}
        >
          Withdraw
        </Button>

        <Button
          className="header-action-button deposit-button"
          onClick={() => navigate("/main/wallet?tab=deposit")}
        >
          Deposit
        </Button>

        <Button
          className="header-action-button trade-button flex items-center gap-2"
          onClick={() => navigate("/trading")}
        >
          <BarChart className="h-4 w-4" />
          <span>Trade Room</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
