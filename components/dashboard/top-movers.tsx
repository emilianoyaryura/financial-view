"use client";

import { cn } from "@/lib/cn";
import { formatPercent, formatCurrency } from "@/lib/utils/format";
import type { HoldingWithMarketData } from "@/lib/types";

interface TopMoversProps {
  topGainer: HoldingWithMarketData | undefined;
  topLoser: HoldingWithMarketData | undefined;
}

export function TopMovers({ topGainer, topLoser }: TopMoversProps) {
  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up h-full flex flex-col overflow-hidden">
      <h3 className="text-sm font-medium text-foreground mb-4 shrink-0">
        Today&apos;s movers
      </h3>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center space-y-4">
        {topGainer && (
          <MoverRow
            ticker={topGainer.ticker}
            name={topGainer.name}
            price={topGainer.currentPrice}
            changePercent={topGainer.dayChangePercent}
            positive
          />
        )}
        {topLoser && (
          <MoverRow
            ticker={topLoser.ticker}
            name={topLoser.name}
            price={topLoser.currentPrice}
            changePercent={topLoser.dayChangePercent}
            positive={false}
          />
        )}
        {!topGainer && !topLoser && (
          <p className="text-xs text-foreground-tertiary text-center">
            No movers today
          </p>
        )}
      </div>
    </div>
  );
}

function MoverRow({
  ticker,
  name,
  price,
  changePercent,
  positive,
}: {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-medium",
            positive ? "bg-positive-muted text-positive" : "bg-negative-muted text-negative"
          )}
        >
          {positive ? "\u2191" : "\u2193"}
        </div>
        <div>
          <span className="text-sm font-mono font-medium text-foreground block">
            {ticker}
          </span>
          <span className="text-xs text-foreground-tertiary">{name}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-sm font-mono text-foreground block">
          {formatCurrency(price)}
        </span>
        <span
          className={cn(
            "text-xs font-mono",
            positive ? "text-positive" : "text-negative"
          )}
        >
          {formatPercent(changePercent)}
        </span>
      </div>
    </div>
  );
}
