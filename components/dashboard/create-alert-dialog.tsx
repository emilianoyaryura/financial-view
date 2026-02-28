"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/design-system/dialog";
import { cn } from "@/lib/cn";
import { CEDEAR_MAP } from "@/lib/data/cedear-ratios";
import { useAddAlert } from "@/lib/hooks/use-alerts";
import { useSearch } from "@/lib/hooks/use-search";
import type { AlertCondition, Currency } from "@/lib/types";
import { toast } from "sonner";

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  prefillTicker?: string;
}

export function CreateAlertDialog({
  open,
  onOpenChange,
  userId,
  prefillTicker,
}: CreateAlertDialogProps) {
  const [ticker, setTicker] = useState("");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");

  // Autocomplete state
  const [tickerQuery, setTickerQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const tickerInputRef = useRef<HTMLInputElement>(null);

  const addAlert = useAddAlert(userId);
  const { data: searchResults, isLoading: searchLoading } = useSearch(tickerQuery);

  // Prefill ticker
  useEffect(() => {
    if (prefillTicker && open) {
      setTicker(prefillTicker);
    }
  }, [prefillTicker, open]);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        tickerContainerRef.current &&
        !tickerContainerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  const handleSelectTicker = useCallback((symbol: string) => {
    setTicker(symbol);
    setTickerQuery("");
    setShowResults(false);
    tickerInputRef.current?.blur();
  }, []);

  function handleTickerKeyDown(e: React.KeyboardEvent) {
    if (!searchResults?.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectTicker(searchResults[selectedIndex].ticker);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  }

  const hasTicker = ticker.trim().length > 0;
  const parsedPrice = parseFloat(targetPrice || "0");
  const hasPrice = parsedPrice > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    addAlert.mutate(
      {
        ticker: ticker.toUpperCase(),
        condition,
        targetPrice: parsedPrice,
        currency,
      },
      {
        onSuccess: () => {
          toast.success(
            `Alert: ${ticker.toUpperCase()} ${condition} $${parsedPrice}`
          );
          onOpenChange(false);
          resetForm();
        },
        onError: (err) => {
          toast.error("Failed to create alert", {
            description: err.message,
          });
        },
      }
    );
  }

  function resetForm() {
    setTicker("");
    setTickerQuery("");
    setShowResults(false);
    setSelectedIndex(-1);
    setCondition("above");
    setTargetPrice("");
    setCurrency("USD");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-background border-border !max-w-sm">
        <DialogHeader className="!border-b-0 !pb-0 !pt-0">
          <DialogTitle className="!text-base font-medium text-foreground">
            Create alert
          </DialogTitle>
          <DialogDescription className="!text-xs !text-foreground-tertiary">
            Get notified when a stock hits your target price.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Ticker with autocomplete */}
          <div ref={tickerContainerRef}>
            <label className="text-xs text-foreground-tertiary block mb-1.5">
              Ticker
            </label>
            <div className="relative">
              <input
                ref={tickerInputRef}
                type="text"
                value={ticker}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setTicker(val);
                  setTickerQuery(val);
                  setShowResults(true);
                }}
                onFocus={() => {
                  if (ticker.length > 0) setShowResults(true);
                }}
                onKeyDown={handleTickerKeyDown}
                placeholder="Search AAPL, MSFT..."
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-foreground-tertiary/50 focus:outline-none focus:border-foreground-tertiary transition-colors"
                autoComplete="off"
              />

              {showResults && ticker.length >= 1 && (
                <div className="absolute top-full mt-1 w-full bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-scale-in">
                  {searchLoading ? (
                    <div className="px-4 py-3 text-xs text-foreground-tertiary">
                      Searching...
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="py-1 max-h-48 overflow-y-auto">
                      {searchResults.map((result, index) => {
                        const isCedear = CEDEAR_MAP.has(result.ticker);
                        return (
                          <button
                            key={result.ticker}
                            type="button"
                            onClick={() => handleSelectTicker(result.ticker)}
                            className={cn(
                              "w-full text-left px-4 py-2 flex items-center justify-between transition-colors",
                              selectedIndex === index
                                ? "bg-surface-active"
                                : "hover:bg-surface-hover"
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-mono font-medium text-foreground shrink-0">
                                {result.ticker}
                              </span>
                              <span className="text-xs text-foreground-tertiary truncate">
                                {result.name}
                              </span>
                            </div>
                            {isCedear && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground-secondary shrink-0 ml-2">
                                CEDEAR
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-xs text-foreground-tertiary">
                      No results for &ldquo;{ticker}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Condition toggle */}
          <div>
            <label className={cn("text-xs block mb-1.5", hasTicker ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
              Condition
            </label>
            <div className={cn("flex bg-background-secondary rounded-full p-0.5", !hasTicker && "opacity-40 pointer-events-none")}>
              {(["above", "below"] as const).map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  disabled={!hasTicker}
                  className={cn(
                    "flex-1 text-xs font-medium py-2 transition-colors capitalize",
                    i === 0 ? "rounded-l-full" : "rounded-r-full",
                    condition === c
                      ? c === "above"
                        ? "bg-positive-muted text-positive"
                        : "bg-negative-muted text-negative"
                      : "text-foreground-tertiary hover:text-foreground-secondary"
                  )}
                >
                  Price {c}
                </button>
              ))}
            </div>
          </div>

          {/* Target price + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn("text-xs block mb-1.5", hasTicker ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
                Target price
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                disabled={!hasTicker}
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-foreground-tertiary/50 focus:outline-none focus:border-foreground-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className={cn("text-xs block mb-1.5", hasTicker ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
                Currency
              </label>
              <div className={cn("flex bg-background-secondary rounded-full p-0.5", !hasTicker && "opacity-40 pointer-events-none")}>
                {(["USD", "ARS"] as const).map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    disabled={!hasTicker}
                    className={cn(
                      "flex-1 text-xs font-mono py-2 transition-colors",
                      i === 0 ? "rounded-l-full" : "rounded-r-full",
                      currency === c
                        ? "bg-surface text-foreground"
                        : "text-foreground-tertiary hover:text-foreground-secondary"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {hasTicker && hasPrice && (
            <div className="bg-background-secondary rounded-lg px-4 py-3">
              <p className="text-xs text-foreground-tertiary">
                You&apos;ll be notified when{" "}
                <span className="font-mono font-medium text-foreground">{ticker.toUpperCase()}</span>
                {" "}goes{" "}
                <span className={cn("font-medium", condition === "above" ? "text-positive" : "text-negative")}>
                  {condition}
                </span>
                {" "}
                <span className="font-mono font-medium text-foreground">
                  ${parsedPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} {currency}
                </span>
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={addAlert.isPending || !hasTicker || !hasPrice}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 btn-primary"
          >
            {addAlert.isPending ? "Creating..." : "Create alert"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
