"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/supabase/client";
import type { Database } from "@/supabase/types";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

export function useAllTransactions(userId: string | null) {
  return useQuery<TransactionRow[]>({
    queryKey: ["transactions", userId, "all"],
    queryFn: async () => {
      if (!userId) return [] as TransactionRow[];
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TransactionRow[];
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useTransactionsByTicker(userId: string | null, ticker: string) {
  return useQuery<TransactionRow[]>({
    queryKey: ["transactions", userId, ticker],
    queryFn: async () => {
      if (!userId || !ticker) return [] as TransactionRow[];
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("ticker", ticker)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TransactionRow[];
    },
    enabled: !!userId && !!ticker,
    staleTime: 0,
  });
}

/**
 * Delete a transaction and recalculate the holding from all remaining transactions.
 */
export function useDeleteTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      holdingId,
    }: {
      transactionId: string;
      holdingId: string;
    }) => {
      if (!userId) throw new Error("No user");

      // Delete the transaction
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

      if (deleteError) throw deleteError;

      // Fetch all remaining transactions for this holding
      const { data: remaining, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("holding_id", holdingId)
        .order("date", { ascending: true });

      if (fetchError) throw fetchError;

      const txs = (remaining ?? []) as TransactionRow[];

      if (txs.length === 0) {
        // No transactions left — deactivate the holding
        const { error: updateError } = await supabase
          .from("holdings")
          .update({
            total_shares: 0,
            avg_cost_usd: 0,
            total_invested_usd: 0,
            realized_pnl_usd: 0,
            first_buy_date: null,
            last_transaction_date: null,
            transaction_count: 0,
            is_active: false,
          })
          .eq("id", holdingId);

        if (updateError) throw updateError;
        return { holdingId };
      }

      // Recalculate holding from scratch using remaining transactions (date-ordered)
      let shares = 0;
      let totalCost = 0; // sum of (priceUsd * shares) for buys — for weighted avg
      let totalInvested = 0;
      let realizedPnl = 0;

      for (const tx of txs) {
        const txShares = Number(tx.shares);
        const priceUsd = Number(tx.price_usd);
        const totalAmountUsd = Number(tx.total_amount_usd);

        if (tx.action === "buy") {
          totalCost += priceUsd * txShares;
          shares += txShares;
          totalInvested += totalAmountUsd;
        } else {
          // sell — realize P&L based on current avg cost
          const avgCost = shares > 0 ? totalCost / shares : 0;
          realizedPnl += (priceUsd - avgCost) * txShares;
          // Remove sold shares from cost basis proportionally
          totalCost -= avgCost * txShares;
          shares -= txShares;
        }
      }

      const avgCostUsd = shares > 0 ? totalCost / shares : 0;
      const firstBuyDate = txs
        .filter((t) => t.action === "buy")
        .reduce(
          (earliest, t) =>
            !earliest || t.date < earliest ? t.date : earliest,
          null as string | null
        );
      const lastTransactionDate = txs[txs.length - 1].date;

      const { error: updateError } = await supabase
        .from("holdings")
        .update({
          total_shares: shares,
          avg_cost_usd: avgCostUsd,
          total_invested_usd: totalInvested,
          realized_pnl_usd: realizedPnl,
          first_buy_date: firstBuyDate,
          last_transaction_date: lastTransactionDate,
          transaction_count: txs.length,
          is_active: shares > 0,
        })
        .eq("id", holdingId);

      if (updateError) throw updateError;
      return { holdingId };
    },
    onSuccess: (_data, variables) => {
      // Invalidate both holdings and transactions queries
      queryClient.invalidateQueries({ queryKey: ["holdings", userId] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", userId],
      });
    },
  });
}
