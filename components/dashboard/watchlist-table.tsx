"use client";

import { cn } from "@/lib/cn";
import { formatCurrency, formatPercent, pnlColor } from "@/lib/utils/format";
import { useRemoveFromWatchlist } from "@/lib/hooks/use-watchlist";
import type { WatchlistItem } from "@/lib/types";

interface WatchlistTableProps {
  items: WatchlistItem[];
  userId: string | null;
  onSelectStock?: (ticker: string, name: string) => void;
}

export function WatchlistTable({ items, userId, onSelectStock }: WatchlistTableProps) {
  const removeFromWatchlist = useRemoveFromWatchlist(userId);

  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto md:overflow-x-visible">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 pr-4">
              Ticker
            </th>
            <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3">
              Price
            </th>
            <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3">
              Day
            </th>
            <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3 hidden sm:table-cell">
              Target
            </th>
            <th className="text-left text-xs font-normal text-foreground-tertiary py-2.5 px-3 hidden md:table-cell">
              Notes
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className={cn(
                "border-b border-border/50 hover:bg-surface-hover transition-colors group",
                onSelectStock && "cursor-pointer"
              )}
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => onSelectStock?.(item.ticker, item.name)}
            >
              <td className="py-3 pr-4">
                <span className="text-sm font-mono font-medium text-foreground">
                  {item.ticker}
                </span>
                <span className="text-xs text-foreground-tertiary block">
                  {item.name}
                </span>
              </td>
              <td className="py-3 px-3 text-left">
                <span className="text-sm font-mono text-foreground">
                  {item.currentPrice
                    ? formatCurrency(item.currentPrice)
                    : "\u2014"}
                </span>
              </td>
              <td className="py-3 px-3 text-left">
                <span
                  className={cn(
                    "text-sm font-mono",
                    pnlColor(item.dayChangePercent ?? 0)
                  )}
                >
                  {item.dayChangePercent !== undefined
                    ? formatPercent(item.dayChangePercent)
                    : "\u2014"}
                </span>
              </td>
              <td className="py-3 px-3 text-left hidden sm:table-cell">
                <span className="text-sm font-mono text-foreground-tertiary">
                  {item.targetBuyPrice
                    ? formatCurrency(item.targetBuyPrice)
                    : "\u2014"}
                </span>
              </td>
              <td className="py-3 px-3 hidden md:table-cell">
                <span className="text-xs text-foreground-tertiary truncate max-w-[200px] block">
                  {item.notes ?? "\u2014"}
                </span>
              </td>
              <td className="py-3 pl-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist.mutate(item.id);
                  }}
                  className="text-foreground-tertiary hover:text-negative transition-colors opacity-0 group-hover:opacity-100 p-1"
                  title="Remove"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
