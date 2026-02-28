"use client";

import { cn } from "@/lib/cn";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  pnlColor,
  pnlBgColor,
} from "@/lib/utils/format";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/design-system/tooltip";
import type { HoldingWithMarketData, Currency } from "@/lib/types";

interface PortfolioTableProps {
  holdings: HoldingWithMarketData[];
  currency: Currency;
  dollarRate: number;
  onSelectStock?: (ticker: string, name: string) => void;
}

export function PortfolioTable({
  holdings,
  currency,
  dollarRate,
  onSelectStock,
}: PortfolioTableProps) {
  const sorted = [...holdings]
    .filter((h) => h.isActive)
    .sort((a, b) => b.currentValue - a.currentValue);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-tertiary text-sm">No holdings yet</p>
        <p className="text-foreground-tertiary text-xs mt-1">
          Add your first transaction to get started
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="overflow-x-auto md:overflow-x-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 pr-4">
                Asset
              </th>
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3">
                Price
              </th>
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3 hidden sm:table-cell">
                Shares
              </th>
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3">
                Value
              </th>
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3 hidden md:table-cell">
                Day
              </th>
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-foreground-tertiary/30">
                      Return
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Unrealized gain/loss since purchase
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3 hidden lg:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-foreground-tertiary/30">
                      Holding
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Average time you&apos;ve held this position
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="text-right text-xs font-normal text-foreground-tertiary py-2.5 pl-3 hidden lg:table-cell">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-foreground-tertiary/30">
                      Allocation
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Percentage of your total portfolio value
                  </TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((holding, i) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                currency={currency}
                dollarRate={dollarRate}
                index={i}
                onSelect={onSelectStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}

function HoldingRow({
  holding,
  currency,
  dollarRate,
  index,
  onSelect,
}: {
  holding: HoldingWithMarketData;
  currency: Currency;
  dollarRate: number;
  index: number;
  onSelect?: (ticker: string, name: string) => void;
}) {
  const price =
    currency === "ARS"
      ? holding.currentPrice * dollarRate
      : holding.currentPrice;
  const value =
    currency === "ARS"
      ? holding.currentValue * dollarRate
      : holding.currentValue;

  // Guard against absurd percentages (avg cost near zero = bad data)
  const returnPercent =
    Math.abs(holding.unrealizedPnlPercent) > 10000
      ? null
      : holding.unrealizedPnlPercent;

  return (
    <tr
      className={cn(
        "border-b border-border/50 hover:bg-surface-hover transition-colors group",
        onSelect && "cursor-pointer"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onSelect?.(holding.ticker, holding.name)}
    >
      {/* Asset */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium font-mono text-foreground">
                {holding.ticker}
              </span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wider",
                  holding.type === "cedear"
                    ? "bg-foreground/10 text-foreground-secondary"
                    : "bg-accent/10 text-accent"
                )}
              >
                {holding.type === "cedear" ? "CEDEAR" : "STOCK"}
              </span>
            </div>
            <span className="text-xs text-foreground-tertiary">
              {holding.name}
            </span>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-3 px-3 text-left">
        <span className="text-sm font-mono text-foreground">
          {formatCurrency(price, currency)}
        </span>
      </td>

      {/* Shares */}
      <td className="py-3 px-3 text-left hidden sm:table-cell">
        <span className="text-sm font-mono text-foreground-secondary">
          {formatNumber(holding.totalShares, holding.totalShares % 1 === 0 ? 0 : 2)}
        </span>
      </td>

      {/* Value */}
      <td className="py-3 px-3 text-left">
        <span className="text-sm font-mono text-foreground">
          {formatCurrency(value, currency)}
        </span>
      </td>

      {/* Day Change */}
      <td className="py-3 px-3 text-left hidden md:table-cell">
        <span
          className={cn("text-sm font-mono", pnlColor(holding.dayChangePercent))}
        >
          {formatPercent(holding.dayChangePercent)}
        </span>
      </td>

      {/* Return */}
      <td className="py-3 px-3 text-left">
        {returnPercent !== null ? (
          <span
            className={cn(
              "text-xs font-mono px-1.5 py-0.5 rounded",
              pnlBgColor(returnPercent)
            )}
          >
            {formatPercent(returnPercent)}
          </span>
        ) : (
          <span className="text-xs font-mono text-foreground-tertiary">
            —
          </span>
        )}
      </td>

      {/* Avg Holding Period */}
      <td className="py-3 px-3 text-left hidden lg:table-cell">
        <span className="text-xs font-mono text-foreground-secondary">
          {formatHoldingPeriod(holding.firstBuyDate)}
        </span>
      </td>

      {/* Allocation */}
      <td className="py-3 pl-3 text-right hidden lg:table-cell">
        <div className="flex items-center justify-end gap-2">
          <div className="w-12 h-1 bg-background-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground-tertiary rounded-full"
              style={{ width: `${holding.weight}%` }}
            />
          </div>
          <span className="text-xs font-mono text-foreground-tertiary w-10 text-right">
            {holding.weight.toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  );
}

function formatHoldingPeriod(firstBuyDate: string | null): string {
  if (!firstBuyDate) return "—";
  // Parse as date-only to avoid timezone issues (e.g. "2024-06-15" or "2024-06-15T00:00:00+00:00")
  const dateOnly = firstBuyDate.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  // Reset time parts to compare dates only
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "today";
  if (days === 1) return "1d";
  if (days < 30) return `${days}d`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}mo`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  return remainingMonths > 0 ? `${years}y ${remainingMonths}mo` : `${years}y`;
}
