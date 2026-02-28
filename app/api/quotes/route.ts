import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
  const tickers = request.nextUrl.searchParams.get("tickers");

  if (!tickers) {
    return NextResponse.json(
      { error: "Missing tickers parameter (comma-separated)" },
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
    const tickerList = tickers.split(",").map((t) => t.trim().toUpperCase());

    const quotes = await Promise.all(
      tickerList.map(async (ticker) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_API_KEY}`,
            { next: { revalidate: 60 } }
          );

          if (!response.ok) return null;

          const data = await response.json();
          return {
            ticker,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            previousClose: data.pc,
            timestamp: data.t,
          };
        } catch {
          return null;
        }
      })
    );

    const validQuotes = quotes.filter(Boolean);
    return NextResponse.json(validQuotes);
  } catch (error) {
    console.error("Quotes API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
