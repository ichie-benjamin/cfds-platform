import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "@/components/ui/sonner";
import useUserStore from "@/store/userStore";

// Components
import MarketplaceCard from "@/components/marketplace/marketplace-card";
import MarketplaceFilters from "@/components/marketplace/marketplace-filters";
// import LoadingScreen from "@/components/loading-screen";
import { TickerBar } from "@/components/dashboard/TickerBar";
import DashboardNavbar from "@/components/nav/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

// Types and constants
import type { MarketplaceItem, CategoryFilter, SecondaryFilter } from "@/types/marketplace";
import {
    CATEGORY_FILTERS,
    SECONDARY_FILTERS,
    DEFAULT_CATEGORY,
    DEFAULT_SECONDARY,
    filterByCategory,
    filterBySecondary,
    filterBySearch,
} from "@/constants/marketplace";

// Type for API response items
type ExpertAdvisorApiItem = {
    id: string;
    name: string;
    rating: string;
    amount: string;
    amount_val: string;
    type: string;
    popular: number;
    downloads: number;
    description: string;
    slug: string;
    image: string;
};

export default function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Hide MainLayout chrome while this page is mounted (matches security/settings pattern)
    useEffect(() => {
        document.body.classList.add("marketplace-active");
        return () => {
            document.body.classList.remove("marketplace-active");
        };
    }, []);

    // State management
    const searchTerm = searchParams.get("search") || "";
    const selectedCategory = (searchParams.get("category") as CategoryFilter) || DEFAULT_CATEGORY;
    const selectedSecondary = (searchParams.get("filter") as SecondaryFilter) || DEFAULT_SECONDARY;

    const shellStyles = (
        <style>{`
            body.marketplace-active .fixed.top-0.left-0.right-0.z-20,
            body.marketplace-active .fixed.top-\\[60px\\].left-0.bottom-0 {
              display: none !important;
            }
            body.marketplace-active .flex.flex-1.pt-\\[90px\\] {
              padding-top: 0 !important;
            }
            body.marketplace-active .flex-1.md\\:ml-\\[80px\\] {
              margin-left: 0 !important;
            }
        `}</style>
    );

    const renderShell = (children: React.ReactNode) => (
        <>
            {shellStyles}
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
                        {children}
                    </main>
                </div>
            </div>
        </>
    );

    // Fetch expert advisors using React Query
    const { data: apiItems, isLoading, error } = useQuery({
        queryKey: ["expertAdvisors"],
        queryFn: async () => {
            const response = await axiosInstance.get<{ data: ExpertAdvisorApiItem[] }>("/expert_advisors");
            return response.data.data;
        },
    });

    // Map API items to MarketplaceItem format
    const items = useMemo(() => {
        if (!apiItems) return [];
        return apiItems.map((item): MarketplaceItem => ({
            id: item.id,
            title: item.name,
            description: item.description,
            price: parseFloat(item.amount_val) || parseFloat(item.amount) || 0,
            currency: "USD",
            image: item.image,
            category: item.type,
            paymentType: "one-time",
            status: "available",
            rating: Number(item.rating) || 0,
            features: [],
            author: "",
            downloads: item.downloads,
        }));
    }, [apiItems]);

    // Update URL parameters when filters change
    const updateSearchParams = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== (key === "category" ? DEFAULT_CATEGORY : DEFAULT_SECONDARY)) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        setSearchParams(params, { replace: true });
    }, [searchParams, setSearchParams]);

    // Handlers
    const handleSearchChange = useCallback((value: string) => {
        updateSearchParams("search", value);
    }, [updateSearchParams]);

    const handleCategoryChange = useCallback((category: CategoryFilter) => {
        updateSearchParams("category", category);
    }, [updateSearchParams]);

    const handleSecondaryChange = useCallback((filter: SecondaryFilter) => {
        updateSearchParams("filter", filter);
    }, [updateSearchParams]);

    const getCurrentUser = useUserStore((state) => state.getCurrentUser);

    const handleItemAction = useCallback((item: MarketplaceItem) => {
        if (item.status === "purchased") {
            console.log("Already purchased:", item.title);
        } else {
            console.log("Purchasing:", item.title);

            // Make a POST request to purchase the expert advisor
            axiosInstance.post("/purchase/ea", { expert_advisor_id: item.id })
                .then((response) => {
                    if (response.data.status === "success") {
                        // Show success toast
                        toast.success("Expert Advisor purchased successfully");

                        // Refresh user data
                        getCurrentUser();
                    } else {
                        // Show error toast if status is not success
                        toast.error(response.data.message || "Failed to purchase Expert Advisor");
                    }
                })
                .catch((error) => {
                    // Show error toast with the error message from the response
                    const errorMessage = error.response?.data?.message ||
                                        error.response?.data?.error ||
                                        "Failed to purchase Expert Advisor";
                    toast.error(errorMessage);
                });
        }
    }, [getCurrentUser]);

    // Filter items
    const filteredItems = useMemo(() => {
        let filtered = items;
        filtered = filterByCategory(filtered, selectedCategory);
        filtered = filterBySecondary(filtered, selectedSecondary);
        filtered = filterBySearch(filtered, searchTerm);
        return filtered;
    }, [items, searchTerm, selectedCategory, selectedSecondary]);

    // Loading state
    if (isLoading) {
        return renderShell(
            <div className="flex flex-col gap-3 justify-center items-center min-h-[60vh] text-[#8b97a8]">
                <div className="h-10 w-10 rounded-full border-2 border-[#00dfa2]/30 border-t-[#00dfa2] animate-spin" />
                <p className="text-[0.87rem]">Loading marketplace…</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return renderShell(
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="rounded-2xl border border-[rgba(244,63,94,0.2)] bg-[rgba(244,63,94,0.06)] px-6 py-5 mb-5">
                    <p className="text-[#f43f5e] text-[0.95rem] font-extrabold mb-1">Failed to load marketplace items</p>
                    <p className="text-[#8b97a8] text-[0.82rem]">Please retry, or check back in a moment.</p>
                </div>
                <Button
                    variant="outline"
                    className="bg-[rgba(255,255,255,0.02)] border-white/[0.08] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)] rounded-xl"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </Button>
            </div>
        );
    }

    return renderShell(
        <div>
            <div className="container- mx-auto py-2">
                {/* Header */}
                <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00dfa2]/10">
                        <Search className="h-5 w-5 text-[#00dfa2]" />
                    </div>
                    <div>
                        <h1 className="font-[Outfit,sans-serif] text-[1.65rem] font-extrabold tracking-[-0.03em] text-[#eef2f7]">Marketplace</h1>
                        <p className="mt-0.5 text-[0.87rem] text-[#4a5468]">Discover and purchase Expert Advisors built for your trading strategy</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4a5468] z-10 pointer-events-none" />
                        <Input
                            placeholder="Search marketplace"
                            className="pl-10 h-11 rounded-[12px] bg-[rgba(255,255,255,0.02)] dark:bg-[rgba(255,255,255,0.02)] border border-white/[0.06] text-[#eef2f7] placeholder:text-[#4a5468] shadow-none transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)] focus-visible:border-[#00dfa2] focus-visible:ring-[rgba(0,223,162,0.1)]"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters */}
                <MarketplaceFilters
                    categoryFilters={CATEGORY_FILTERS}
                    secondaryFilters={SECONDARY_FILTERS}
                    selectedCategory={selectedCategory}
                    selectedSecondary={selectedSecondary}
                    onCategoryChange={handleCategoryChange}
                    onSecondaryChange={handleSecondaryChange}
                />

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filteredItems.map((item) => (
                        <MarketplaceCard
                            key={item.id}
                            item={item}
                            onAction={handleItemAction}
                        />
                    ))}
                </div>

                {/* No Results */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-16 rounded-2xl border border-white/[0.06] mt-6"
                         style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
                            <Search className="h-5 w-5 text-[#4a5468]" />
                        </div>
                        <p className="text-[#eef2f7] text-[0.95rem] font-extrabold mb-1">No items found</p>
                        <p className="text-[#8b97a8] text-[0.82rem] mb-5">Try adjusting your search or filters.</p>
                        <Button
                            variant="outline"
                            className="bg-[rgba(255,255,255,0.02)] border-white/[0.08] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.06)] rounded-xl"
                            onClick={() => {
                                handleSearchChange("");
                                handleCategoryChange(DEFAULT_CATEGORY);
                                handleSecondaryChange(DEFAULT_SECONDARY);
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
