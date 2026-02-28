"use client";

import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@/lib/types";

export function useQuote(ticker: string) {
  return useQuery<Quote>({
    queryKey: ["quote", ticker],
    queryFn: async () => {
      const response = await fetch(
        `/api/quote?ticker=${encodeURIComponent(ticker)}`
      );
      if (!response.ok) throw new Error("Failed to fetch quote");
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    enabled: !!ticker,
  });
}

export function useQuotes(tickers: string[]) {
  return useQuery<Quote[]>({
    queryKey: ["quotes", tickers.join(",")],
    queryFn: async () => {
      const response = await fetch(
        `/api/quotes?tickers=${encodeURIComponent(tickers.join(","))}`
      );
      if (!response.ok) throw new Error("Failed to fetch quotes");
      return response.json();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: tickers.length > 0,
  });
}
