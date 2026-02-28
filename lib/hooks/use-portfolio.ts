"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/supabase/client";
import { CEDEAR_MAP } from "@/lib/data/cedear-ratios";
import { useCedearRatios } from "@/lib/hooks/use-cedear-ratios";
import type { HoldingWithMarketData, Quote } from "@/lib/types";
import type { Database } from "@/supabase/types";

type HoldingRow = Database["public"]["Tables"]["holdings"]["Row"];

export function useHoldings(userId: string | null) {
  return useQuery<HoldingRow[]>({
    queryKey: ["holdings", userId],
    queryFn: async () => {
      if (!userId) return [] as HoldingRow[];
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("total_invested_usd", { ascending: false });

      if (error) throw error;
      return (data ?? []) as HoldingRow[];
    },
    enabled: !!userId,
    staleTime: 0,
  });
}

/**
 * Combines holdings from DB with live quotes to produce HoldingWithMarketData[]
 * Uses CEDEAR ratios from DB (falls back to static file if DB is empty).
 */
export function usePortfolioWithQuotes(userId: string | null) {
  const { data: holdings, isLoading: holdingsLoading } = useHoldings(userId);
  const { ratioMap: dbRatioMap, hasData: hasDbRatios } = useCedearRatios();

  const tickers = (holdings ?? []).map((h) => h.ticker);

  const { data: quotes, isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["quotes", tickers.join(",")],
    queryFn: async () => {
      if (tickers.length === 0) return [];
      const response = await fetch(
        `/api/quotes?tickers=${encodeURIComponent(tickers.join(","))}`
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: tickers.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const quoteMap = new Map((quotes ?? []).map((q) => [q.ticker, q]));

  /** Get the CEDEAR ratio for a ticker — prefer DB, fall back to static */
  function getRatio(ticker: string): number {
    if (hasDbRatios) {
      const dbEntry = dbRatioMap.get(ticker);
      if (dbEntry) return dbEntry.ratio;
    }
    const staticEntry = CEDEAR_MAP.get(ticker);
    return staticEntry?.ratio ?? 1;
  }

  /** Get display name for a ticker */
  function getName(ticker: string): string {
    if (hasDbRatios) {
      const dbEntry = dbRatioMap.get(ticker);
      if (dbEntry) return dbEntry.name;
    }
    const staticEntry = CEDEAR_MAP.get(ticker);
    return staticEntry?.name ?? ticker;
  }

  const enrichedHoldings: HoldingWithMarketData[] = (holdings ?? []).map(
    (h) => {
      const quote = quoteMap.get(h.ticker);
      const stockPrice = quote?.price ?? 0;
      const totalShares = Number(h.total_shares);
      const avgCost = Number(h.avg_cost_usd);
      const totalInvested = Number(h.total_invested_usd);

      // For CEDEARs, convert stock price to per-CEDEAR price using the ratio
      const cedearRatio = h.type === "cedear" ? getRatio(h.ticker) : 1;
      const currentPrice = stockPrice / cedearRatio;

      const currentValue = currentPrice * totalShares;
      const unrealizedPnl = currentValue - avgCost * totalShares;
      const unrealizedPnlPercent =
        avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

      return {
        id: h.id,
        ticker: h.ticker,
        name: getName(h.ticker),
        type: h.type as "stock" | "cedear",
        totalShares,
        avgCostUsd: avgCost,
        totalInvestedUsd: totalInvested,
        realizedPnlUsd: Number(h.realized_pnl_usd),
        totalDividendsUsd: Number(h.total_dividends_usd),
        cedearRatio: h.cedear_ratio,
        firstBuyDate: h.first_buy_date,
        lastTransactionDate: h.last_transaction_date,
        transactionCount: h.transaction_count ?? 0,
        notes: h.notes,
        isActive: h.is_active,
        currentPrice,
        currentValue,
        dayChange: (quote?.change ?? 0) / cedearRatio,
        dayChangePercent: quote?.changePercent ?? 0,
        unrealizedPnl,
        unrealizedPnlPercent,
        weight: 0, // calculated below
      };
    }
  );

  // Calculate weights
  const totalValue = enrichedHoldings.reduce(
    (sum, h) => sum + h.currentValue,
    0
  );
  for (const h of enrichedHoldings) {
    h.weight = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
  }

  return {
    holdings: enrichedHoldings,
    isLoading: holdingsLoading || (tickers.length > 0 && quotesLoading),
    hasData: (holdings ?? []).length > 0,
  };
}

/**
 * Add a transaction and recalculate the holding.
 */
export function useAddTransaction(userId: string | null) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();

  return useMutation({
    mutationFn: async (tx: {
      ticker: string;
      type: "stock" | "cedear";
      action: "buy" | "sell";
      shares: number;
      pricePerShare: number;
      currency: "USD" | "ARS";
      exchangeRate: number | null;
      date: string;
      notes: string | null;
    }) => {
      if (!userId) throw new Error("No user");

      const priceUsd =
        tx.currency === "ARS" && tx.exchangeRate
          ? tx.pricePerShare / tx.exchangeRate
          : tx.pricePerShare;
      const totalAmount = tx.shares * tx.pricePerShare;
      const totalAmountUsd = tx.shares * priceUsd;

      // Find or create holding (scoped by type so stock + cedear are separate)
      let { data: holding } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", userId)
        .eq("ticker", tx.ticker)
        .eq("type", tx.type)
        .single() as { data: HoldingRow | null };

      if (!holding) {
        // Try to get ratio from DB first, then static
        let ratioStr: string | null = null;
        if (tx.type === "cedear") {
          try {
            const { data: dbRatio } = await supabase
              .from("cedear_ratios")
              .select("ratio")
              .eq("ticker", tx.ticker)
              .single();
            if (dbRatio) {
              ratioStr = `${dbRatio.ratio}:1`;
            }
          } catch {
            // ignore, fall back to static
          }
          if (!ratioStr) {
            const cedearInfo = CEDEAR_MAP.get(tx.ticker);
            if (cedearInfo) ratioStr = `${cedearInfo.ratio}:1`;
          }
        }

        const { data: newHolding, error } = await supabase
          .from("holdings")
          .insert({
            user_id: userId,
            ticker: tx.ticker,
            type: tx.type,
            total_shares: 0,
            avg_cost_usd: 0,
            total_invested_usd: 0,
            realized_pnl_usd: 0,
            total_dividends_usd: 0,
            cedear_ratio: ratioStr,
            first_buy_date: tx.date,
            is_active: true,
            transaction_count: 0,
          })
          .select("*")
          .single() as { data: HoldingRow | null; error: Error | null };

        if (error) throw error;
        holding = newHolding;
      }

      if (!holding) throw new Error("Failed to find or create holding");

      // Insert transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          holding_id: holding.id,
          ticker: tx.ticker,
          type: tx.type,
          action: tx.action,
          shares: tx.shares,
          price_per_share: tx.pricePerShare,
          price_usd: priceUsd,
          currency: tx.currency,
          exchange_rate: tx.exchangeRate,
          total_amount: totalAmount,
          total_amount_usd: totalAmountUsd,
          date: tx.date,
          notes: tx.notes,
        });

      if (txError) throw txError;

      // Recalculate holding
      const currentShares = Number(holding.total_shares);
      const currentAvg = Number(holding.avg_cost_usd);
      const currentInvested = Number(holding.total_invested_usd);
      const currentRealized = Number(holding.realized_pnl_usd);
      const currentCount = holding.transaction_count ?? 0;

      let newShares: number;
      let newAvg: number;
      let newInvested: number;
      let newRealized: number;

      if (tx.action === "buy") {
        newShares = currentShares + tx.shares;
        // Weighted average cost
        newAvg =
          newShares > 0
            ? (currentAvg * currentShares + priceUsd * tx.shares) / newShares
            : 0;
        newInvested = currentInvested + totalAmountUsd;
        newRealized = currentRealized;
      } else {
        // sell
        newShares = currentShares - tx.shares;
        newAvg = currentAvg; // avg cost doesn't change on sell
        newInvested = currentInvested;
        // Realized P&L: (sell price - avg cost) * shares sold
        newRealized =
          currentRealized + (priceUsd - currentAvg) * tx.shares;
      }

      // Keep first_buy_date as the earliest date
      const existingFirst = holding.first_buy_date;
      const newFirst =
        tx.action === "buy" && (!existingFirst || tx.date < existingFirst)
          ? tx.date
          : existingFirst;

      const { error: updateError } = await supabase
        .from("holdings")
        .update({
          total_shares: newShares,
          avg_cost_usd: newAvg,
          total_invested_usd: newInvested,
          realized_pnl_usd: newRealized,
          first_buy_date: newFirst,
          last_transaction_date: tx.date,
          transaction_count: currentCount + 1,
          is_active: newShares > 0,
        })
        .eq("id", holding.id);

      if (updateError) throw updateError;

      return { holdingId: holding.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings", userId] });
    },
  });
}
