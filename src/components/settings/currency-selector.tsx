import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";
import { Loader2 } from "lucide-react";

export function CurrencySelector() {
    const { selectedCurrency, currencies, setSelectedCurrency, isLoading } = useCurrency();

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading currencies...
                </div>
            </div>
        );
    }

    if (!selectedCurrency || currencies.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-4">
                No currencies available
            </div>
        );
    }

    return (
        <RadioGroup
            value={selectedCurrency.code}
            onValueChange={setSelectedCurrency}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[7px]"
        >
            {currencies.map((curr) => {
                const isSelected = curr.code === selectedCurrency.code;
                return (
                    <Label
                        key={curr.id}
                        htmlFor={`currency-${curr.code}`}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-[9px] text-[0.76rem] transition-colors ${
                            isSelected
                                ? "border-[#00dfa2]/30 bg-[#00dfa2]/[0.08] font-semibold text-[#00dfa2]"
                                : "border-white/[0.06] font-medium text-[#4a5468] hover:border-white/[0.12] hover:bg-white/[0.035]"
                        }`}
                    >
                        <RadioGroupItem
                            value={curr.code}
                            id={`currency-${curr.code}`}
                            className="!size-[13px] shrink-0 rounded-full border-2 border-[#3a4556] !bg-transparent shadow-none transition-all data-[state=checked]:border-[#00dfa2] data-[state=checked]:!bg-[#00dfa2] data-[state=checked]:shadow-[inset_0_0_0_2.5px_#0a0d15] [&_[data-slot=radio-group-indicator]]:hidden"
                        />
                        <span className="text-[0.95rem] leading-none">{curr.icon}</span>
                        <span className="leading-none">{curr.code}</span>
                    </Label>
                );
            })}
        </RadioGroup>
    );
}
