"use client";

import { useQuery } from "@tanstack/react-query";

export interface Fundamentals {
  ticker: string;
  forwardPE: number | null;
  trailingPE: number | null;
  pegRatio: number | null;
  priceToBook: number | null;
  marketCap: number | null;
  marketCapFmt: string | null;
  enterpriseValue: number | null;
  enterpriseValueFmt: string | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  dividendYield: number | null;
  dividendYieldFmt: string | null;
  revenueGrowth: number | null;
  revenueGrowthFmt: string | null;
  profitMargins: number | null;
  profitMarginsFmt: string | null;
  nextEarningsDate: string | null;
  beta: number | null;
  epsAnnual: number | null;
  psTTM: number | null;
}

export function useFundamentals(ticker: string, enabled = true) {
  return useQuery<Fundamentals>({
    queryKey: ["fundamentals", ticker],
    queryFn: async () => {
      const response = await fetch(
        `/api/fundamentals?ticker=${encodeURIComponent(ticker)}`
      );
      if (!response.ok) throw new Error("Failed to fetch fundamentals");
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    enabled: !!ticker && enabled,
  });
}
