import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketplaceItem } from "@/types/marketplace";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface MarketplaceCardProps {
    item: MarketplaceItem;
    onAction: (item: MarketplaceItem) => void;
}

export default function MarketplaceCard({ item, onAction }: MarketplaceCardProps) {
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    // Render star rating
    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <div
                        key={star}
                        className={cn(
                            "text-[0.78rem] leading-none",
                            star <= rating ? "text-[#F0B429]" : "text-[#3a4556]"
                        )}
                    >
                        ★
                    </div>
                ))}
            </div>
        );
    };


    const handlePurchaseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPurchaseModalOpen(true);
    };

    const handlePurchaseConfirm = () => {
        setIsPurchaseModalOpen(false);
        onAction(item);
    };

    return (
        <>
            <Card
                className="relative overflow-hidden rounded-[14px] border border-white/[0.06] py-0 cursor-pointer group transition-all duration-150 hover:-translate-y-px hover:border-[rgba(255,255,255,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]"
                style={{
                    background:
                        "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
                }}
                onClick={() => onAction(item)}
            >
                <div className="relative">
                    {/* Item Image */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />

                        {item.badge && (
                            <Badge className="absolute top-2 left-2 bg-[rgba(91,141,239,0.15)] text-[#5b8def] border border-[rgba(91,141,239,0.3)] text-[0.62rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 z-10">
                                {item.badge}
                            </Badge>
                        )}

                        {/* Status indicator for purchased items */}
                        {item.status === "purchased" && (
                            <Badge className="absolute top-2 right-2 bg-[rgba(0,223,162,0.12)] text-[#00dfa2] border border-[rgba(0,223,162,0.3)] text-[0.62rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 z-10">
                                Owned
                            </Badge>
                        )}

                        {/* Content overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="text-center w-full">
                                <div className="text-[0.95rem] font-extrabold text-[#eef2f7] mb-1 leading-tight">{item.title}</div>
                                <div className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#00dfa2]">Expert Advisor</div>
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4">
                    {/* Title and Rating */}
                    <div className="mb-3">
                        <h3 className="font-extrabold text-[#eef2f7] text-[0.88rem] mb-1 truncate" title={item.title}>
                            {item.title}
                        </h3>
                        <div className="flex items-center justify-between">
                            {renderStars(item.rating)}
                            {item.downloads && (
                                <span className="text-[0.65rem] text-[#4a5468] font-mono">
                                    {item.downloads.toLocaleString()} downloads
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                            <div className="font-mono text-[1.05rem] font-extrabold text-[#eef2f7]">
                                {item.price === 0 ? "Free" : `${item.price.toLocaleString()} ${item.currency}`}
                            </div>
                            {item.paymentType === "monthly" && (
                                <span className="text-[0.65rem] text-[#4a5468]">/month</span>
                            )}
                        </div>

                        <Button
                            size="sm"
                            variant={item.status === "purchased" ? "outline" : "default"}
                            className={cn(
                                "h-8 px-3.5 text-[0.72rem] font-bold rounded-[8px] cursor-pointer",
                                item.status === "purchased"
                                    ? "bg-transparent text-[#4a5468] border border-white/[0.06] cursor-default"
                                    : "bg-[#00dfa2] text-[#07080c] hover:bg-[#00dfa2]/90 border-0 shadow-[0_6px_20px_rgba(0,223,162,0.18)]"
                            )}
                            onClick={handlePurchaseClick}
                            disabled={item.status === "purchased"}
                        >
                            {item.status === "purchased" ? "Purchased" : "Purchase"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Purchase Confirmation Modal */}
            <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
                <DialogContent
                    className="rounded-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
                    style={{
                        background:
                            "linear-gradient(180deg, #0c0e15, #07080c)",
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="font-[Outfit,sans-serif] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[#eef2f7]">
                            Confirm Purchase
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-[0.87rem] text-[#8b97a8] leading-relaxed">
                            You are about to purchase{" "}
                            <span className="font-bold text-[#eef2f7]">{item.title}</span> for{" "}
                            <span className="font-mono font-bold text-[#00dfa2]">
                                {item.price.toLocaleString()} {item.currency}
                            </span>.
                            <br /><br />
                            This amount will be deducted from your account balance.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2">
                        <Button
                            variant="outline"
                            className="bg-[rgba(255,255,255,0.04)] border-white/[0.08] text-[#eef2f7] hover:bg-[rgba(255,255,255,0.08)] rounded-xl"
                            onClick={() => setIsPurchaseModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePurchaseConfirm}
                            className="bg-[#00dfa2] cursor-pointer text-[#07080c] hover:bg-[#00dfa2]/90 rounded-xl font-bold shadow-[0_6px_20px_rgba(0,223,162,0.18)]"
                        >
                            Proceed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
