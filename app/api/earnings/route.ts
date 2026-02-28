import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

interface FinnhubEarning {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  const tickersParam = request.nextUrl.searchParams.get("tickers");

  if (!tickersParam) {
    return NextResponse.json(
      { error: "Missing tickers parameter" },
      { status: 400 }
    );
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "Finnhub API key not configured" },
      { status: 500 }
    );
  }

  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: "No valid tickers provided" },
      { status: 400 }
    );
  }

  try {
    const from = formatDate(new Date());
    const to = formatDate(
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    );

    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Finnhub error: ${response.status}`);
    }

    const data: { earningsCalendar: FinnhubEarning[] } = await response.json();

    const tickerSet = new Set(tickers);
    const filtered = data.earningsCalendar
      .filter((e) => tickerSet.has(e.symbol))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        symbol: e.symbol,
        date: e.date,
        epsEstimate: e.epsEstimate,
        hour: e.hour,
        quarter: e.quarter,
        year: e.year,
      }));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Earnings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings calendar" },
      { status: 500 }
    );
  }
}
