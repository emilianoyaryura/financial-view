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
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!ticker,
  });
}

export interface HoldingForChart {
  ticker: string;
  totalShares: number;
  type: "stock" | "cedear";
  cedearRatio: number;
  avgCostUsd: number;
}

export interface PortfolioChartPoint {
  date: string;
  portfolio: number;
  sp500: number | null;
  portfolioValue: number;
}

/**
 * Fetch candles for ALL portfolio tickers + SPY, then compute
 * portfolio return vs cost basis at each date point.
 *
 * Portfolio return = (market_value - cost_basis) / cost_basis * 100
 * SP500 return = what if the user had invested cost_basis in SPY on firstTransactionDate
 */
export function usePortfolioCandles(
  holdings: HoldingForChart[],
  period: ChartPeriod,
  firstTransactionDate?: string | null
) {
  const tickers = holdings.map((h) => h.ticker);
  const totalCostBasis = holdings.reduce(
    (sum, h) => sum + h.avgCostUsd * h.totalShares,
    0
  );

  return useQuery<PortfolioChartPoint[]>({
    queryKey: ["portfolio-candles", tickers.join(","), period, firstTransactionDate],
    queryFn: async () => {
      // Fetch candles for all tickers + SPY in parallel
      const allFetches = [
        ...holdings.map(async (h) => {
          const res = await fetch(
            `/api/candles?ticker=${encodeURIComponent(h.ticker)}&range=${period}`
          );
          if (!res.ok) return { ticker: h.ticker, candles: [] as HistoricalPoint[] };
          const candles: HistoricalPoint[] = await res.json();
          return { ticker: h.ticker, candles };
        }),
        (async () => {
          const res = await fetch(`/api/candles?ticker=SPY&range=${period}`);
          if (!res.ok) return { ticker: "SPY", candles: [] as HistoricalPoint[] };
          const candles: HistoricalPoint[] = await res.json();
          return { ticker: "SPY", candles };
        })(),
      ];

      const results = await Promise.all(allFetches);

      // Build price lookup: ticker -> Map<date, close>
      const priceMaps = new Map<string, Map<string, number>>();
      for (const { ticker, candles } of results) {
        priceMaps.set(ticker, new Map(candles.map((c) => [c.date, c.close])));
      }

      // Use SPY dates as the reference timeline
      const spyResult = results.find((r) => r.ticker === "SPY");
      let spyCandles = spyResult?.candles ?? [];

      // Filter from firstTransactionDate if set
      if (firstTransactionDate) {
        spyCandles = spyCandles.filter((c) => c.date >= firstTransactionDate);
      }

      if (spyCandles.length === 0 || totalCostBasis <= 0) return [];

      const lastKnown = new Map<string, number>();
      const spyStart = spyCandles[0].close;

      const points: PortfolioChartPoint[] = [];

      for (const spyCandle of spyCandles) {
        const date = spyCandle.date;
        let portfolioValue = 0;
        let hasAllPrices = true;

        for (const h of holdings) {
          const priceMap = priceMaps.get(h.ticker);
          let price = priceMap?.get(date);

          if (price != null) {
            lastKnown.set(h.ticker, price);
          } else {
            price = lastKnown.get(h.ticker);
          }

          if (price == null) {
            hasAllPrices = false;
            continue;
          }

          // For CEDEARs, the candle price is the US stock price
          // Per-CEDEAR value = stockPrice / ratio
          const perShareValue = price / h.cedearRatio;
          portfolioValue += perShareValue * h.totalShares;
        }

        if (!hasAllPrices) continue;

        // Portfolio return vs cost basis — this matches the "Return" in the portfolio table
        const portfolioReturn =
          ((portfolioValue - totalCostBasis) / totalCostBasis) * 100;

        // SP500: "what if I had invested totalCostBasis in SPY on firstTransactionDate"
        const spyReturn = ((spyCandle.close - spyStart) / spyStart) * 100;

        points.push({
          date,
          portfolio: Math.round(portfolioReturn * 100) / 100,
          sp500: Math.round(spyReturn * 100) / 100,
          portfolioValue: Math.round(portfolioValue * 100) / 100,
        });
      }

      return points;
    },
    enabled: holdings.length > 0,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
