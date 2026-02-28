"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/design-system/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/design-system/tooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuote } from "@/lib/hooks/use-quote";
import { useCandles } from "@/lib/hooks/use-candles";
import { useFundamentals } from "@/lib/hooks/use-fundamentals";
import { useTransactionsByTicker } from "@/lib/hooks/use-transactions";
import { useCedearRatios } from "@/lib/hooks/use-cedear-ratios";
import { cn } from "@/lib/cn";
import { formatCurrency, formatPercent, formatChange } from "@/lib/utils/format";
import { CEDEAR_MAP } from "@/lib/data/cedear-ratios";
import type { ChartPeriod } from "@/lib/types";
import type { Database } from "@/supabase/types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

interface StockPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticker: string;
  name: string;
  userId: string | null;
  onAddToPortfolio: (ticker: string, name: string) => void;
  onAddToWatchlist: (ticker: string, name: string) => void;
}

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
];

export function StockPreviewDialog({
  open,
  onOpenChange,
  ticker,
  name,
  userId,
  onAddToPortfolio,
  onAddToWatchlist,
}: StockPreviewDialogProps) {
  const [period, setPeriod] = useState<ChartPeriod>("1M");
  const { data: quote, isLoading: quoteLoading } = useQuote(
    open ? ticker : ""
  );
  const { data: candles, isLoading: candlesLoading } = useCandles(
    open ? ticker : "",
    period
  );
  const { data: fundamentals, isLoading: fundamentalsLoading } = useFundamentals(
    open ? ticker : "",
    open
  );
  const { data: transactions } = useTransactionsByTicker(
    open ? userId : null,
    open ? ticker : ""
  );
  const { ratioMap: dbRatioMap, hasData: hasDbRatios } = useCedearRatios();

  // Prefer DB ratio, fall back to static
  const dbEntry = hasDbRatios ? dbRatioMap.get(ticker) : undefined;
  const staticEntry = CEDEAR_MAP.get(ticker);
  const cedearInfo = dbEntry
    ? { ticker, name: dbEntry.name, ratio: dbEntry.ratio, market: dbEntry.market ?? "" }
    : staticEntry ?? null;
  // Determine chart color based on period variation (start vs end of candle data)
  const periodReturn = candles && candles.length >= 2
    ? ((candles[candles.length - 1].close - candles[0].close) / candles[0].close) * 100
    : null;
  const isPositive = periodReturn !== null ? periodReturn >= 0 : (quote?.changePercent ?? 0) >= 0;
  const hasTransactions = transactions && transactions.length > 0;

  // 52-week position
  const fiftyTwoHigh = fundamentals?.fiftyTwoWeekHigh;
  const fiftyTwoLow = fundamentals?.fiftyTwoWeekLow;
  const currentPrice = quote?.price;
  const fiftyTwoPercent =
    fiftyTwoHigh && fiftyTwoLow && currentPrice
      ? ((currentPrice - fiftyTwoLow) / (fiftyTwoHigh - fiftyTwoLow)) * 100
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "!bg-background border-border !p-0 !max-h-[90vh] overflow-y-auto",
          hasTransactions ? "!max-w-4xl" : "!max-w-xl"
        )}
      >
        <TooltipProvider delayDuration={200}>
          <div className={cn("flex", hasTransactions && "flex-col md:flex-row")}>
            {/* Left: Stock info */}
            <div className={cn("flex-1 min-w-0", hasTransactions && "md:border-r md:border-border")}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="!text-base font-medium text-foreground flex items-center gap-2">
                      {ticker}
                      {cedearInfo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground-secondary font-normal">
                          CEDEAR {cedearInfo.ratio}:1
                        </span>
                      )}
                    </DialogTitle>
                    <p className="text-xs text-foreground-tertiary mt-0.5">{name}</p>
                  </div>

                  <div className="text-right">
                    {quoteLoading ? (
                      <div className="space-y-1.5">
                        <div className="h-5 w-20 bg-background-secondary rounded animate-pulse-subtle" />
                        <div className="h-4 w-16 bg-background-secondary rounded animate-pulse-subtle ml-auto" />
                      </div>
                    ) : quote ? (
                      <>
                        <p className="text-lg font-mono font-medium text-foreground">
                          {formatCurrency(quote.price)}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-mono",
                            isPositive ? "text-positive" : "text-negative"
                          )}
                        >
                          {formatChange(quote.change)} (
                          {formatPercent(quote.changePercent)})
                        </p>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="px-6 pb-2">
                <div className="h-[180px]">
                  {candlesLoading ? (
                    <div className="w-full h-full bg-background-secondary rounded-lg animate-pulse-subtle" />
                  ) : candles && candles.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={candles}>
                        <defs>
                          <linearGradient
                            id={`preview-${period}-${isPositive}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={isPositive ? "var(--positive)" : "var(--negative)"}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor={isPositive ? "var(--positive)" : "var(--negative)"}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={["auto", "auto"]} />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs">
                                <span className="text-foreground-tertiary">
                                  {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span className="font-mono text-foreground ml-2">
                                  {formatCurrency(d.close)}
                                </span>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="close"
                          stroke={isPositive ? "var(--positive)" : "var(--negative)"}
                          strokeWidth={1.5}
                          fill={`url(#preview-${period}-${isPositive})`}
                          dot={false}
                          animationDuration={400}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-foreground-tertiary">
                      No chart data available
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-background-secondary rounded-full p-0.5">
                    {PERIODS.map((p, i) => (
                      <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={cn(
                          "text-xs px-2.5 py-1 transition-colors font-mono",
                          i === 0 && "rounded-l-full",
                          i === PERIODS.length - 1 && "rounded-r-full",
                          i > 0 && i < PERIODS.length - 1 && "rounded-md",
                          period === p.value
                            ? "bg-surface-active text-foreground"
                            : "text-foreground-tertiary hover:text-foreground-secondary"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {periodReturn !== null && (
                    <span
                      className={cn(
                        "text-xs font-mono font-medium",
                        isPositive ? "text-positive" : "text-negative"
                      )}
                    >
                      {formatPercent(periodReturn)}
                    </span>
                  )}
                </div>
              </div>

              {/* 52-week range bar */}
              {fiftyTwoHigh && fiftyTwoLow && fiftyTwoPercent !== null && (
                <div className="px-6 py-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-foreground-tertiary cursor-help border-b border-dashed border-foreground-tertiary/30">
                          52W Range
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Lowest and highest price in the last 52 weeks. The bar shows where the current price sits within this range.
                      </TooltipContent>
                    </Tooltip>
                    <span className="font-mono text-foreground-secondary">
                      {formatCurrency(fiftyTwoLow)} — {formatCurrency(fiftyTwoHigh)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-background-secondary rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-foreground-tertiary rounded-full"
                      style={{ width: `${Math.min(Math.max(fiftyTwoPercent, 2), 98)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Day Stats */}
              {quote && (
                <div className="px-6 py-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    <StatRow label="Open" value={formatCurrency(quote.open)} tooltip="Price at market open today" />
                    <StatRow label="Prev. close" value={formatCurrency(quote.previousClose)} tooltip="Closing price from the previous trading day" />
                    <StatRow label="Day high" value={formatCurrency(quote.high)} tooltip="Highest price reached today" />
                    <StatRow label="Day low" value={formatCurrency(quote.low)} tooltip="Lowest price reached today" />
                    {cedearInfo && (
                      <>
                        <StatRow label="Ratio" value={`${cedearInfo.ratio}:1`} tooltip="How many CEDEARs represent one share of the underlying stock" />
                        <StatRow label="Market" value={cedearInfo.market} />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Fundamentals */}
              {fundamentalsLoading ? (
                <div className="px-6 py-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-3 w-16 bg-background-secondary rounded animate-pulse-subtle" />
                        <div className="h-3 w-12 bg-background-secondary rounded animate-pulse-subtle" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : fundamentals && hasFundamentals(fundamentals) ? (
                <div className="px-6 py-4 border-t border-border">
                  <h4 className="text-xs font-medium text-foreground-secondary mb-3">Fundamentals</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {fundamentals.marketCapFmt && (
                      <StatRow label="Market cap" value={fundamentals.marketCapFmt} tooltip="Total market value of all outstanding shares" />
                    )}
                    {fundamentals.forwardPE !== null && (
                      <StatRow label="PE (fwd)" value={fundamentals.forwardPE.toFixed(1)} tooltip="Price-to-Earnings ratio based on estimated future earnings. Lower may indicate better value." />
                    )}
                    {fundamentals.fiftyTwoWeekHigh !== null && (
                      <StatRow label="All-time high" value={formatCurrency(fundamentals.fiftyTwoWeekHigh)} tooltip="Highest price reached in the last 52 weeks" />
                    )}
                    {fundamentals.profitMarginsFmt && (
                      <StatRow label="Profit margin" value={fundamentals.profitMarginsFmt} tooltip="Percentage of revenue that becomes profit after all expenses" />
                    )}
                    {fundamentals.revenueGrowthFmt && (
                      <StatRow label="Rev. growth" value={fundamentals.revenueGrowthFmt} tooltip="Revenue growth rate over the last 5 years (annualized)" />
                    )}
                    {fundamentals.nextEarningsDate && (
                      <StatRow label="Next earnings" value={fundamentals.nextEarningsDate} tooltip="Date of the next quarterly earnings report" />
                    )}
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="px-6 py-4 border-t border-border flex gap-2">
                <button
                  onClick={() => {
                    onAddToPortfolio(ticker, name);
                    onOpenChange(false);
                  }}
                  className="flex-1 text-xs font-medium btn-primary py-2.5 rounded-lg"
                >
                  Add to portfolio
                </button>
                <button
                  onClick={() => {
                    onAddToWatchlist(ticker, name);
                    onOpenChange(false);
                  }}
                  className="flex-1 text-xs font-medium bg-background-secondary border border-border text-foreground py-2.5 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  Add to watchlist
                </button>
              </div>
            </div>

            {/* Right: Transaction history */}
            {hasTransactions && (
              <div className="w-full md:w-[280px] shrink-0 border-t md:border-t-0 border-border">
                <div className="px-5 pt-5 pb-3">
                  <h4 className="text-xs font-medium text-foreground-secondary">
                    Your history
                  </h4>
                </div>
                <div className="px-5 pb-5 space-y-0">
                  {transactions.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}

function TransactionItem({ tx }: { tx: TransactionRow }) {
  const isBuy = tx.action === "buy";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-b-0">
      <div
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-medium mt-0.5 shrink-0",
          isBuy ? "bg-positive-muted text-positive" : "bg-negative-muted text-negative"
        )}
      >
        {isBuy ? "B" : "S"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">
            {tx.shares} shares @ {formatCurrency(tx.price_per_share, tx.currency as "USD" | "ARS")}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] text-foreground-tertiary">
            {new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-[11px] font-mono text-foreground-secondary">
            {formatCurrency(tx.total_amount_usd, "USD")}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between">
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-foreground-tertiary cursor-help border-b border-dashed border-foreground-tertiary/30">
              {label}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px]">{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-xs text-foreground-tertiary">{label}</span>
      )}
      <span className="text-xs font-mono text-foreground">{value}</span>
    </div>
  );
}

function hasFundamentals(f: {
  forwardPE: number | null;
  marketCapFmt: string | null;
  profitMarginsFmt: string | null;
  revenueGrowthFmt: string | null;
  nextEarningsDate: string | null;
  fiftyTwoWeekHigh: number | null;
}): boolean {
  return !!(
    f.forwardPE ||
    f.marketCapFmt ||
    f.profitMarginsFmt ||
    f.revenueGrowthFmt ||
    f.nextEarningsDate ||
    f.fiftyTwoWeekHigh
  );
}
