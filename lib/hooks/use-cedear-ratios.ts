"use client";

import { useQuery } from "@tanstack/react-query";

export interface CedearRatioEntry {
  ticker: string;
  name: string;
  ratio: number;
  market: string | null;
}

/**
 * Fetches CEDEAR ratios from our DB (populated via POST /api/cedear-ratios).
 * Returns a Map<ticker, CedearRatioEntry> for O(1) lookups.
 * Cached for 24 hours since ratios rarely change.
 */
export function useCedearRatios() {
  const query = useQuery<CedearRatioEntry[]>({
    queryKey: ["cedear-ratios"],
    queryFn: async () => {
      const res = await fetch("/api/cedear-ratios");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  });

  const ratioMap = new Map<string, CedearRatioEntry>(
    (query.data ?? []).map((entry) => [entry.ticker, entry])
  );

  return {
    ratioMap,
    isLoading: query.isLoading,
    hasData: (query.data ?? []).length > 0,
  };
}
