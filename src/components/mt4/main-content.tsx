import ChartArea from "./main-content/chart-area";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import AutomatedTrading from "./right-panels/automated-trading";
import useOverlayStore from "@/store/overlayStore";
import PositionDisplay from "./main-content/position-display";
import RightPanels from "./main-content/right-panels";

// Import panel components
import MarketWatchPanel from "../trading/trading-interface-components/panels/market-watch-panel";
import ActiveOrdersPanel from "../trading/trading-interface-components/panels/active-orders-panel";
import TradingHistoryPanel from "../trading/trading-interface-components/panels/trading-history-panel";
import CalendarPanel from "../trading/trading-interface-components/panels/calendar-panel";
import MarketNewsPanel from "../trading/trading-interface-components/panels/market-news-panel";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function MainContent() {
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const isMobile = useMobile(768);
  const { automatedTrading, selectedAdvisorId, activePanel, setActivePanel } =
    useOverlayStore();

  const addCurrencyPair = (pair: string) => {
    console.log("Adding currency pair:", pair);
  };

  const renderActivePanel = () => {
    if (!activePanel) return null;

    const panels: Record<string, React.ReactNode> = {
      "market-watch": <MarketWatchPanel addCurrencyPair={addCurrencyPair} />,
      "active-orders": <ActiveOrdersPanel />,
      "trading-history": <TradingHistoryPanel />,
      calendar: <CalendarPanel />,
      "market-news": <MarketNewsPanel />,
    };

    const PanelComponent = panels[activePanel];

    // If it's one of the implemented panels, return it
    if (PanelComponent)
      return (
        <div className="w-[300px] border-r border-border overflow-y-auto">
          {PanelComponent}
        </div>
      );

    // For non-implemented panels, show a generic panel
    return (
      <div className="w-[300px] border-r border-white/[0.06]">
        <Card
          className="rounded-none border-0 py-0 text-[#eef2f7] shadow-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
            <CardTitle className="text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#eef2f7]">
              {activePanel
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-[8px] text-[#8b97a8] hover:text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)]"
              onClick={() => setActivePanel(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-5">
            <div className="rounded-[10px] border border-white/[0.04] bg-[rgba(255,255,255,0.02)] p-4 text-center">
              <p className="text-[0.82rem] text-[#8b97a8] leading-relaxed">
                This panel is under development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col h-full relative">
      {/* Chart and Right Panels Container */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel from Sidebar */}
        {!isMobile && renderActivePanel()}
        {/* Chart Area with Automated Trading */}
        <div className="flex-1 relative h-full">
          <ChartArea />
          {/* Automated Trading Panel */}
          {automatedTrading && (
            <div className="top-0 left-0 z-50 absolute">
              <AutomatedTrading advisorId={selectedAdvisorId} />
            </div>
          )}

          {/* Mobile Panel Overlay */}
          {isMobile && activePanel && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-30"
                onClick={() => setActivePanel(null)}
              />
              <div className="fixed left-0 top-0 bottom-0 w-[300px] z-40 bg-background">
                {renderActivePanel()}
              </div>
            </>
          )}
        </div>
        {/* Right Panels */}
        {/* Toggle Button */}
        <button
          onClick={() => setIsRightPanelVisible(!isRightPanelVisible)}
          className="absolute right-0 top-8 z-50 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#8b97a8] hover:text-[#eef2f7] p-1.5 rounded-l-md shadow-[0_4px_16px_rgba(0,0,0,0.45)] border border-white/[0.08] transition-colors duration-150"
        >
          {isRightPanelVisible ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isMobile
              ? "fixed right-0 top-0 bottom-0 z-40" // Mobile overlay
              : "relative", // Desktop inline
            !isRightPanelVisible &&
              (isMobile ? "translate-x-full" : "w-0 opacity-0"),
            isRightPanelVisible &&
              (isMobile ? "translate-x-0" : "w-80 opacity-100")
          )}
        >
          <RightPanels />
        </div>
        {/* Overlay for mobile */}
        {isMobile && isRightPanelVisible && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsRightPanelVisible(false)}
          />
        )}
      </div>

      {/* Position Display - Full width of main content */}
      <PositionDisplay />
    </main>
  );
}
