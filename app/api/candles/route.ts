import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");
  const range = request.nextUrl.searchParams.get("range") || "1M";

  if (!ticker) {
    return NextResponse.json(
      { error: "Missing ticker parameter" },
      { status: 400 }
    );
  }

  try {
    // Map our range to Yahoo Finance query params
    let yfRange: string;
    let yfInterval: string;

    switch (range) {
      case "1W":
        yfRange = "5d";
        yfInterval = "1d";
        break;
      case "1M":
        yfRange = "1mo";
        yfInterval = "1d";
        break;
      case "3M":
        yfRange = "3mo";
        yfInterval = "1d";
        break;
      case "6M":
        yfRange = "6mo";
        yfInterval = "1d";
        break;
      case "1Y":
        yfRange = "1y";
        yfInterval = "1wk";
        break;
      case "5Y":
        yfRange = "5y";
        yfInterval = "1wk";
        break;
      case "MAX":
        yfRange = "max";
        yfInterval = "1mo";
        break;
      default:
        yfRange = "1mo";
        yfInterval = "1d";
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${yfRange}&interval=${yfInterval}&includePrePost=false`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("Yahoo Finance response:", response.status);
      throw new Error(`Yahoo Finance error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json([]);
    }

    const timestamps = result.timestamp;
    const quote = result.indicators?.quote?.[0];

    if (!timestamps || !quote) {
      return NextResponse.json([]);
    }

    const candles = timestamps
      .map((ts: number, i: number) => {
        const close = quote.close?.[i];
        if (close == null) return null;
        return {
          date: new Date(ts * 1000).toISOString().split("T")[0],
          close: Math.round(close * 100) / 100,
          open: quote.open?.[i] ? Math.round(quote.open[i] * 100) / 100 : close,
          high: quote.high?.[i] ? Math.round(quote.high[i] * 100) / 100 : close,
          low: quote.low?.[i] ? Math.round(quote.low[i] * 100) / 100 : close,
          volume: quote.volume?.[i] ?? 0,
        };
      })
      .filter(Boolean);

    return NextResponse.json(candles);
  } catch (error) {
    console.error("Candles API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candles" },
      { status: 500 }
    );
  }
}
