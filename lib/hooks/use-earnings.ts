"use client";

import { useQuery } from "@tanstack/react-query";

export interface Earning {
  symbol: string;
  date: string;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  year: number;
}

export function useEarnings(tickers: string[]) {
  return useQuery<Earning[]>({
    queryKey: ["earnings", tickers.join(",")],
    queryFn: async () => {
      const response = await fetch(
        `/api/earnings?tickers=${encodeURIComponent(tickers.join(","))}`
      );
      if (!response.ok) throw new Error("Failed to fetch earnings");
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    enabled: tickers.length > 0,
  });
}
