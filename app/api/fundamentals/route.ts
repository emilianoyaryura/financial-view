import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json(
      { error: "Missing ticker parameter" },
      { status: 400 }
    );
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "Finnhub API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch basic financials and earnings calendar in parallel
    const [metricsRes, earningsRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${FINNHUB_API_KEY}`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://finnhub.io/api/v1/calendar/earnings?symbol=${encodeURIComponent(ticker)}&from=${todayStr()}&to=${futureStr()}&token=${FINNHUB_API_KEY}`,
        { next: { revalidate: 3600 } }
      ),
    ]);

    const metricsData = metricsRes.ok ? await metricsRes.json() : {};
    const earningsData = earningsRes.ok ? await earningsRes.json() : {};

    const m = metricsData.metric ?? {};

    // Find next earnings date (first future date)
    const earningsCalendar = earningsData.earningsCalendar ?? [];
    const nextEarnings = earningsCalendar.find(
      (e: { epsActual: number | null }) => e.epsActual === null
    );

    const fundamentals = {
      ticker: ticker.toUpperCase(),
      // Valuation
      forwardPE: m.peNormalizedAnnual ?? null,
      trailingPE: m.peTTM ?? null,
      pegRatio: null as number | null,
      priceToBook: m.pbAnnual ?? null,
      // Key stats
      marketCap: m.marketCapitalization ? m.marketCapitalization * 1_000_000 : null,
      marketCapFmt: m.marketCapitalization ? formatMarketCap(m.marketCapitalization * 1_000_000) : null,
      enterpriseValue: null as number | null,
      enterpriseValueFmt: null as string | null,
      // 52-week
      fiftyTwoWeekHigh: m["52WeekHigh"] ?? null,
      fiftyTwoWeekLow: m["52WeekLow"] ?? null,
      fiftyDayAverage: null as number | null,
      twoHundredDayAverage: null as number | null,
      // Dividends
      dividendYield: m.dividendYieldIndicatedAnnual ?? null,
      dividendYieldFmt: m.dividendYieldIndicatedAnnual
        ? `${m.dividendYieldIndicatedAnnual.toFixed(2)}%`
        : null,
      // Financial
      revenueGrowth: m.revenueGrowth5Y ?? null,
      revenueGrowthFmt: m.revenueGrowth5Y
        ? `${m.revenueGrowth5Y.toFixed(1)}%`
        : null,
      profitMargins: m.netProfitMarginTTM ?? null,
      profitMarginsFmt: m.netProfitMarginTTM
        ? `${m.netProfitMarginTTM.toFixed(1)}%`
        : null,
      // Earnings
      nextEarningsDate: nextEarnings?.date ?? null,
      // Beta
      beta: m.beta ?? null,
      // Extra
      epsAnnual: m.epsNormalizedAnnual ?? null,
      psTTM: m.psTTM ?? null,
    };

    return NextResponse.json(fundamentals);
  } catch (error) {
    console.error("Fundamentals API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fundamentals" },
      { status: 500 }
    );
  }
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function futureStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}
