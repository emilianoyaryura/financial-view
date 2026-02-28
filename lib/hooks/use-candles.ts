"use client";

import { useQuery } from "@tanstack/react-query";
import type { HistoricalPoint, ChartPeriod } from "@/lib/types";

export function useCandles(ticker: string, range: ChartPeriod = "1M") {
  return useQuery<HistoricalPoint[]>({
    queryKey: ["candles", ticker, range],
    queryFn: async () => {
      const response = await fetch(
        `/api/candles?ticker=${encodeURIComponent(ticker)}&range=${range}`
      );
      if (!response.ok) throw new Error("Failed to fetch candles");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!ticker,
  });
}
