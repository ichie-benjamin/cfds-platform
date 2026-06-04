import { useMemo } from "react";
import useDataStore from "@/store/dataStore";
import useCurrencyStore from "@/store/currencyStore";

export function useCurrency() {
    const { data, isLoading } = useDataStore();
    const { selectedCurrencyCode, setSelectedCurrencyCode } = useCurrencyStore();

    const currencies = useMemo(() => {
        return data?.currencies || [];
    }, [data]);

    const selectedCurrency = useMemo(() => {
        if (!currencies.length) return null;
        return currencies.find(c => c.code === selectedCurrencyCode) || currencies[0];
    }, [currencies, selectedCurrencyCode]);

    const convertCurrency = useMemo(() => {
        return (amount: number) => {
            if (!selectedCurrency) return amount;

            const rate = parseFloat(selectedCurrency.rate);
            return amount * rate;
        };
    }, [selectedCurrency]);

    const formatCurrencyValue = (amount: number, symbol: string = "$") => {
        return `${symbol}${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatWithSymbol = useMemo(() => {
        return (amount: number) => {
            if (!selectedCurrency) return `$${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

            // Sanitize an unwanted leading "A" the API sometimes prefixes to "$"
            // (e.g. "A$" arriving for USD). Only strips a single leading "A"
            // directly before "$"; all other symbols pass through untouched.
            const symbol = selectedCurrency.symbol.replace(/^A(?=\$)/, "");

            // Format with the appropriate symbol and thousands separators
            return `${symbol}${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        };
    }, [selectedCurrency]);

    // Combined function to convert and format in one step
    const formatCurrency = useMemo(() => {
        return (amount: number) => {
            const convertedAmount = convertCurrency(amount);
            return formatWithSymbol(convertedAmount);
        };
    }, [convertCurrency, formatWithSymbol]);

    return {
        convertCurrency,
        formatWithSymbol,
        formatCurrencyValue,
        formatCurrency,
        selectedCurrency,
        currencies,
        setSelectedCurrency: setSelectedCurrencyCode,
        isLoading
    };
}
