import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "Finnhub API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } } // cache 5 min
    );

    if (!response.ok) {
      throw new Error(`Finnhub search error: ${response.status}`);
    }

    const data = await response.json();

    // Filter to common stock types only and limit results
    const results = (data.result || [])
      .filter(
        (item: { type: string; symbol: string }) =>
          item.type === "Common Stock" && !item.symbol.includes(".")
      )
      .slice(0, 8)
      .map((item: { symbol: string; description: string }) => ({
        ticker: item.symbol,
        name: item.description,
      }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
