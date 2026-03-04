"use client";

import { useState, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/design-system/drawer";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/utils/format";
import {
  useAllTransactions,
  useDeleteTransaction,
} from "@/lib/hooks/use-transactions";
import type { Database } from "@/supabase/types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

interface TransactionHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function TransactionHistoryDrawer({
  open,
  onOpenChange,
  userId,
}: TransactionHistoryDrawerProps) {
  const { data: transactions, isLoading } = useAllTransactions(
    open ? userId : null
  );
  const deleteTransaction = useDeleteTransaction(userId);

  const grouped = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    return groupByMonth(transactions);
  }, [transactions]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Transaction history</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <TransactionsSkeleton />
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <p className="text-sm text-foreground-tertiary">
                No transactions yet
              </p>
              <p className="text-xs text-foreground-tertiary mt-1">
                Add your first transaction to see it here
              </p>
            </div>
          ) : (
            <div className="pb-6">
              {grouped.map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 z-10 bg-background px-6 py-2.5 border-b border-border/50">
                    <span className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">
                      {group.label}
                    </span>
                    <span className="text-[11px] text-foreground-tertiary ml-2">
                      ({group.transactions.length})
                    </span>
                  </div>
                  <div className="px-6">
                    {group.transactions.map((tx) => (
                      <HistoryTransactionItem
                        key={tx.id}
                        tx={tx}
                        onDelete={(transactionId, holdingId) =>
                          deleteTransaction.mutate({ transactionId, holdingId })
                        }
                        isDeleting={deleteTransaction.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {!isLoading && transactions && transactions.length > 0 && (
          <div className="shrink-0 border-t border-border px-6 py-4">
            <div className="flex items-center justify-between text-xs text-foreground-tertiary">
              <span>{transactions.length} transactions</span>
              <span className="font-mono">
                {formatCurrency(
                  transactions
                    .filter((t) => t.action === "buy")
                    .reduce((sum, t) => sum + Number(t.total_amount_usd), 0),
                  "USD"
                )}{" "}
                invested
              </span>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function HistoryTransactionItem({
  tx,
  onDelete,
  isDeleting,
}: {
  tx: TransactionRow;
  onDelete: (transactionId: string, holdingId: string) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isBuy = tx.action === "buy";

  if (confirmDelete) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0 h-[60px]">
        <span className="text-xs text-foreground-tertiary">
          Delete this transaction?
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-[11px] px-2 py-1 rounded text-foreground-tertiary hover:text-foreground transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(tx.id, tx.holding_id)}
            className="text-[11px] px-2 py-1 rounded bg-negative/10 text-negative hover:bg-negative/20 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0 group h-[60px]">
      {/* Buy/Sell badge */}
      <div
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-medium mt-0.5 shrink-0",
          isBuy
            ? "bg-positive-muted text-positive"
            : "bg-negative-muted text-negative"
        )}
      >
        {isBuy ? "B" : "S"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-medium text-foreground">
              {tx.ticker}
            </span>
            <span
              className={cn(
                "text-[9px] px-1 py-0.5 rounded font-medium tracking-wider",
                tx.type === "cedear"
                  ? "bg-foreground/10 text-foreground-secondary"
                  : "bg-accent/10 text-accent"
              )}
            >
              {tx.type === "cedear" ? "CEDEAR" : "STOCK"}
            </span>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover:opacity-100 text-foreground-tertiary hover:text-negative transition-all ml-1 shrink-0"
            title="Delete transaction"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] text-foreground-tertiary">
            {tx.shares} shares @{" "}
            {formatCurrency(
              tx.price_per_share,
              tx.currency as "USD" | "ARS"
            )}
          </span>
          <span className="text-[11px] font-mono text-foreground-secondary">
            {formatCurrency(tx.total_amount_usd, "USD")}
          </span>
        </div>
        <div className="mt-0.5">
          <span className="text-[10px] text-foreground-tertiary">
            {parseDate(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div>
      {/* Month header skeleton */}
      <div className="px-6 py-2.5 border-b border-border/50">
        <div className="h-3 w-24 bg-background-secondary rounded animate-pulse-subtle" />
      </div>
      {/* Transaction row skeletons */}
      <div className="px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0 h-[60px]"
          >
            <div className="w-5 h-5 rounded bg-background-secondary animate-pulse-subtle mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-background-secondary rounded animate-pulse-subtle" />
                <div className="h-3 w-14 bg-background-secondary rounded animate-pulse-subtle" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-28 bg-background-secondary rounded animate-pulse-subtle" />
                <div className="h-2.5 w-12 bg-background-secondary rounded animate-pulse-subtle" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Second month header */}
      <div className="px-6 py-2.5 border-b border-border/50">
        <div className="h-3 w-20 bg-background-secondary rounded animate-pulse-subtle" />
      </div>
      <div className="px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0 h-[60px]"
          >
            <div className="w-5 h-5 rounded bg-background-secondary animate-pulse-subtle mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-background-secondary rounded animate-pulse-subtle" />
                <div className="h-3 w-14 bg-background-secondary rounded animate-pulse-subtle" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-28 bg-background-secondary rounded animate-pulse-subtle" />
                <div className="h-2.5 w-12 bg-background-secondary rounded animate-pulse-subtle" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Parse a date string safely, handling both "2026-01-15" and "2026-01-15T00:00:00+00:00" */
function parseDate(dateStr: string): Date {
  const dateOnly = dateStr.split("T")[0];
  return new Date(dateOnly + "T00:00:00");
}

/** Group transactions by month, e.g. "March 2026" */
function groupByMonth(
  transactions: TransactionRow[]
): { label: string; transactions: TransactionRow[] }[] {
  const groups = new Map<string, TransactionRow[]>();

  for (const tx of transactions) {
    const d = parseDate(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  }

  // Sort keys descending (newest first) and return with labels
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, txs]) => {
      const d = parseDate(txs[0].date);
      return {
        label: d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        transactions: txs,
      };
    });
}
