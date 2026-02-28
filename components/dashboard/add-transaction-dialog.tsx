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
import { useCedearRatios } from "@/lib/hooks/use-cedear-ratios";
import { useAddTransaction } from "@/lib/hooks/use-portfolio";
import { useDollar } from "@/lib/hooks/use-dollar";
import { useSearch } from "@/lib/hooks/use-search";
import type { AssetType, TransactionAction, Currency } from "@/lib/types";
import { toast } from "sonner";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  prefillTicker?: string;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  userId,
  prefillTicker,
}: AddTransactionDialogProps) {
  const [action, setAction] = useState<TransactionAction>("buy");
  const [ticker, setTicker] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [tickerQuery, setTickerQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const tickerInputRef = useRef<HTMLInputElement>(null);

  const addTransaction = useAddTransaction(userId);
  const { data: dollar } = useDollar();
  const { ratioMap: dbRatioMap, hasData: hasDbRatios } = useCedearRatios();
  const { data: searchResults, isLoading: searchLoading } = useSearch(tickerQuery);

  // Check if ticker has a CEDEAR — prefer DB, fall back to static
  const tickerUpper = ticker.toUpperCase();
  const dbEntry = hasDbRatios ? dbRatioMap.get(tickerUpper) : undefined;
  const staticEntry = CEDEAR_MAP.get(tickerUpper);
  const canBeCedear = !!(dbEntry || staticEntry);
  const cedearRatioDisplay = dbEntry?.ratio ?? staticEntry?.ratio;

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

  const handleSelectTicker = useCallback(
    (symbol: string) => {
      setTicker(symbol);
      setTickerQuery("");
      setShowResults(false);
      tickerInputRef.current?.blur();
      const upper = symbol.toUpperCase();
      const isCedear =
        (hasDbRatios && dbRatioMap.has(upper)) || CEDEAR_MAP.has(upper);
      setAssetType(isCedear ? "cedear" : "stock");
    },
    [hasDbRatios, dbRatioMap]
  );

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

  // Prefill ticker when opening from search
  useEffect(() => {
    if (prefillTicker && open) {
      setTicker(prefillTicker);
      const upper = prefillTicker.toUpperCase();
      const isCedear = (hasDbRatios && dbRatioMap.has(upper)) || CEDEAR_MAP.has(upper);
      setAssetType(isCedear ? "cedear" : "stock");
    }
  }, [prefillTicker, open, hasDbRatios, dbRatioMap]);

  // When user types a ticker, auto-set type
  useEffect(() => {
    if (ticker) {
      const upper = ticker.toUpperCase();
      const isCedear = (hasDbRatios && dbRatioMap.has(upper)) || CEDEAR_MAP.has(upper);
      setAssetType(isCedear ? "cedear" : "stock");
    }
  }, [ticker, hasDbRatios, dbRatioMap]);

  const parsedShares = parseFloat(shares || "0");
  const parsedPrice = parseFloat(price || "0");
  const totalAmount = parsedShares * parsedPrice;
  const hasTicker = ticker.trim().length > 0;
  const hasShares = parsedShares > 0;
  const hasPrice = parsedPrice > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const exchangeRate =
      currency === "ARS" && dollar ? dollar.mep.venta : null;

    addTransaction.mutate(
      {
        ticker: ticker.toUpperCase(),
        type: assetType,
        action,
        shares: parsedShares,
        pricePerShare: parsedPrice,
        currency,
        exchangeRate,
        date,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success(
            action === "buy"
              ? `Bought ${shares} ${ticker.toUpperCase()}`
              : `Sold ${shares} ${ticker.toUpperCase()}`
          );
          onOpenChange(false);
          resetForm();
        },
        onError: (err) => {
          toast.error("Failed to save transaction", {
            description: err.message,
          });
        },
      }
    );
  }

  function resetForm() {
    setAction("buy");
    setTicker("");
    setTickerQuery("");
    setShowResults(false);
    setSelectedIndex(-1);
    setAssetType("stock");
    setShares("");
    setPrice("");
    setCurrency("USD");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-background border-border !max-w-md">
        <DialogHeader className="!border-b-0 !pb-0 !pt-0">
          <DialogTitle className="!text-base font-medium text-foreground">
            Add transaction
          </DialogTitle>
          <DialogDescription className="!text-xs !text-foreground-tertiary">
            Record a buy or sell.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Buy / Sell toggle */}
          <div className="flex bg-background-secondary rounded-full p-0.5">
            {(["buy", "sell"] as const).map((a, i) => (
              <button
                key={a}
                type="button"
                onClick={() => setAction(a)}
                className={cn(
                  "flex-1 text-xs font-medium py-2 transition-colors capitalize",
                  i === 0 ? "rounded-l-full" : "rounded-r-full",
                  action === a
                    ? a === "buy"
                      ? "bg-positive-muted text-positive"
                      : "bg-negative-muted text-negative"
                    : "text-foreground-tertiary hover:text-foreground-secondary"
                )}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Ticker */}
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

              {/* Autocomplete dropdown */}
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
            {/* Stock / CEDEAR toggle — only show when ticker has a CEDEAR equivalent */}
            {canBeCedear ? (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex bg-background-secondary rounded-full p-0.5">
                  {(["stock", "cedear"] as const).map((t, i) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAssetType(t)}
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-1 transition-colors uppercase tracking-wide",
                        i === 0 ? "rounded-l-full" : "rounded-r-full",
                        assetType === t
                          ? "bg-surface text-foreground"
                          : "text-foreground-tertiary hover:text-foreground-secondary"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-foreground-tertiary">
                  {assetType === "cedear" && cedearRatioDisplay ? `Ratio ${cedearRatioDisplay}:1` : assetType === "cedear" ? "CEDEAR" : "US Stock"}
                </span>
              </div>
            ) : (
              <p className={cn("text-xs mt-1 h-4", hasTicker ? "text-foreground-tertiary" : "text-transparent")}>
                {hasTicker ? "US Stock" : "\u00A0"}
              </p>
            )}
          </div>

          {/* Shares + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn("text-xs block mb-1.5", hasTicker ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
                {assetType === "cedear" ? "CEDEARs" : "Shares"}
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0"
                step="any"
                min="0"
                disabled={!hasTicker}
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-foreground-tertiary/50 focus:outline-none focus:border-foreground-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label className={cn("text-xs block mb-1.5", hasTicker ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
                Price per share
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                disabled={!hasTicker}
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-foreground-tertiary/50 focus:outline-none focus:border-foreground-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Currency + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn("text-xs block mb-1.5", hasShares && hasPrice ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
                Currency
              </label>
              <div className={cn("flex bg-background-secondary rounded-full p-0.5", !(hasShares && hasPrice) && "opacity-40 pointer-events-none")}>
                {(["USD", "ARS"] as const).map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    disabled={!(hasShares && hasPrice)}
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
            <div>
              <label className={cn("text-xs block mb-1.5", hasShares && hasPrice ? "text-foreground-tertiary" : "text-foreground-tertiary/40")}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!(hasShares && hasPrice)}
                className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-foreground-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Total */}
          <div className="bg-background-secondary rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-foreground-tertiary">Total</span>
            <span className={cn("text-sm font-mono font-medium", totalAmount > 0 ? "text-foreground" : "text-foreground-tertiary")}>
              {totalAmount > 0 ? (
                <>
                  $
                  {totalAmount.toLocaleString(
                    currency === "ARS" ? "es-AR" : "en-US",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                  <span className="text-foreground-tertiary ml-1 text-xs">
                    {currency}
                  </span>
                </>
              ) : (
                "$0.00"
              )}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-foreground-tertiary block mb-1.5">
              Notes
              <span className="text-foreground-tertiary/50 ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Investment thesis..."
              rows={2}
              className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary/50 focus:outline-none focus:border-foreground-tertiary transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={addTransaction.isPending || !hasTicker || !hasShares || !hasPrice}
            className={cn(
              "w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              action === "buy"
                ? "btn-primary"
                : "bg-negative/90 text-white hover:bg-negative"
            )}
          >
            {addTransaction.isPending
              ? "Saving..."
              : action === "buy"
                ? "Record purchase"
                : "Record sale"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
