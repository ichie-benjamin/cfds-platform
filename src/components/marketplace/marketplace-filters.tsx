import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CategoryFilter, SecondaryFilter } from "@/types/marketplace";

interface FilterOption<T> {
    value: T;
    label: string;
}

interface MarketplaceFiltersProps {
    categoryFilters: readonly FilterOption<CategoryFilter>[];
    secondaryFilters: readonly FilterOption<SecondaryFilter>[];
    selectedCategory: CategoryFilter;
    selectedSecondary: SecondaryFilter;
    onCategoryChange: (category: CategoryFilter) => void;
    onSecondaryChange: (filter: SecondaryFilter) => void;
}

export default function MarketplaceFilters({
                                               categoryFilters,
                                               secondaryFilters,
                                               selectedCategory,
                                               selectedSecondary,
                                               onCategoryChange,
                                               onSecondaryChange,
                                           }: MarketplaceFiltersProps) {
    const pillBase =
        "rounded-full px-4 h-9 text-[12px] font-bold uppercase tracking-[0.06em] transition-all duration-150 border";
    const pillActive =
        "bg-[rgba(0,223,162,0.1)] text-[#00dfa2] border-[rgba(0,223,162,0.25)] hover:bg-[rgba(0,223,162,0.14)]";
    const pillInactive =
        "bg-[rgba(255,255,255,0.02)] text-[#8b97a8] border-white/[0.06] hover:text-[#eef2f7] hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]";

    return (
        <div className="space-y-3 mb-7">
            {/* Category Filters */}
            <div>
                <div className="flex gap-2 flex-wrap">
                    {categoryFilters.map((filter) => (
                        <Button
                            key={filter.value}
                            variant={selectedCategory === filter.value ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                pillBase,
                                selectedCategory === filter.value ? pillActive : pillInactive
                            )}
                            onClick={() => onCategoryChange(filter.value)}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Secondary Filters */}
            <div>
                <div className="flex gap-2 flex-wrap">
                    {secondaryFilters.map((filter) => (
                        <Button
                            key={filter.value}
                            variant={selectedSecondary === filter.value ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                pillBase,
                                selectedSecondary === filter.value ? pillActive : pillInactive
                            )}
                            onClick={() => onSecondaryChange(filter.value)}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
