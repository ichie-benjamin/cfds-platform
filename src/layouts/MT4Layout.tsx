import Header from "@/components/mt4/header";
import Sidebar from "@/components/mt4/sidebar";
import TotalPortfolio from "@/components/mt4/total-portfolio";
import AssetPriceStreamInitializer from "@/components/trading/AssetPriceStreamInitializer";
import { Outlet } from "react-router-dom";

const MT4Layout = () =>{
    return (
      <div
        className="h-screen text-[#eef2f7] flex flex-col overflow-hidden font-[Inter,-apple-system,sans-serif]"
        style={{
          background: "linear-gradient(135deg,#07080c 0%,#0a0d15 100%)",
        }}
      >
        <AssetPriceStreamInitializer />
        {/* Header - Full width at top */}
        <Header />

        {/* Main Layout Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Left navigation */}
          <Sidebar />

          {/* Main Content - Chart, Right Panels, Position Display */}
          <Outlet />
        </div>

        {/* Total Portfolio - Full width at bottom, independent of other components */}
        <TotalPortfolio />
      </div>
    );

}

export default MT4Layout;
