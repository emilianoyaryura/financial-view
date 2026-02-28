"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/supabase/client";
import { CEDEAR_MAP } from "@/lib/data/cedear-ratios";
import type { WatchlistItem, Quote } from "@/lib/types";
import type { Database } from "@/supabase/types";

type WatchlistRow = Database["public"]["Tables"]["watchlist"]["Row"];

export function useWatchlist(userId: string | null) {
  const { data: items, isLoading: itemsLoading } = useQuery<WatchlistRow[]>({
    queryKey: ["watchlist", userId],
    queryFn: async () => {
      if (!userId) return [] as WatchlistRow[];
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as WatchlistRow[];
    },
    enabled: !!userId,
    staleTime: 0,
  });

  const tickers = (items ?? []).map((w) => w.ticker);

  const { data: quotes, isLoading: quotesLoading } = useQuery<Quote[]>({
    queryKey: ["watchlist-quotes", tickers.join(",")],
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

  const enriched: WatchlistItem[] = (items ?? []).map((w) => {
    const quote = quoteMap.get(w.ticker);
    const cedearInfo = CEDEAR_MAP.get(w.ticker);
    return {
      id: w.id,
      ticker: w.ticker,
      name: cedearInfo?.name ?? w.ticker,
      notes: w.notes,
      targetBuyPrice: w.target_buy_price ? Number(w.target_buy_price) : null,
      addedAt: w.added_at,
      currentPrice: quote?.price,
      dayChange: quote?.change,
      dayChangePercent: quote?.changePercent,
    };
  });

  return {
    items: enriched,
    isLoading: itemsLoading || (tickers.length > 0 && quotesLoading),
    hasData: (items ?? []).length > 0,
  };
}

export function useAddToWatchlist(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticker,
      notes,
      targetBuyPrice,
    }: {
      ticker: string;
      notes?: string;
      targetBuyPrice?: number;
    }) => {
      if (!userId) throw new Error("No user");
      const supabase = getSupabaseClient();

      // Check if already in watchlist
      const { data: existing } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", userId)
        .eq("ticker", ticker)
        .single();

      if (existing) {
        throw new Error("Already in watchlist");
      }

      const { error } = await supabase.from("watchlist").insert({
        user_id: userId,
        ticker,
        notes: notes ?? null,
        target_buy_price: targetBuyPrice ?? null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", userId] });
    },
  });
}

export function useRemoveFromWatchlist(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", userId] });
    },
  });
}
