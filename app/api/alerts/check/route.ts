import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { AlertTriggeredEmail } from "@/emails/alert-triggered";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AlertRow {
  id: string;
  user_id: string;
  ticker: string;
  condition: string;
  target_price: number;
  currency: string;
  is_active: boolean;
  triggered_at: string | null;
  notification_sent: boolean;
  created_at: string;
}

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // change percent
}

async function fetchQuote(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_API_KEY}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data: FinnhubQuote = await res.json();
    return data.c > 0 ? data.c : null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    // Fetch all active alerts
    const { data, error: alertsError } = await supabase
      .from("alerts")
      .select("*")
      .eq("is_active", true)
      .eq("notification_sent", false);

    const alerts = (data ?? []) as AlertRow[];

    if (alertsError) {
      console.error("Failed to fetch alerts:", alertsError);
      return NextResponse.json(
        { error: "Failed to fetch alerts" },
        { status: 500 }
      );
    }

    if (alerts.length === 0) {
      return NextResponse.json({ checked: 0, triggered: 0 });
    }

    // Get unique tickers to minimize API calls
    const uniqueTickers = [...new Set(alerts.map((a) => a.ticker))];
    const priceMap = new Map<string, number>();

    // Fetch quotes (sequential to respect rate limits)
    for (const ticker of uniqueTickers) {
      const price = await fetchQuote(ticker);
      if (price !== null) {
        priceMap.set(ticker, price);
      }
    }

    let triggered = 0;

    // Check each alert
    for (const alert of alerts) {
      const currentPrice = priceMap.get(alert.ticker);
      if (currentPrice == null) continue;

      const isTriggered =
        (alert.condition === "above" && currentPrice >= alert.target_price) ||
        (alert.condition === "below" && currentPrice <= alert.target_price);

      if (!isTriggered) continue;

      // Mark alert as triggered
      await supabase
        .from("alerts")
        .update({
          is_active: false,
          triggered_at: new Date().toISOString(),
          notification_sent: true,
        })
        .eq("id", alert.id);

      // Get user email for notification
      const { data: userData } = await supabase.auth.admin.getUserById(
        alert.user_id
      );

      const userEmail = userData?.user?.email;

      if (userEmail) {
        try {
          await resend.emails.send({
            from: "StockAR <alerts@stockar.app>",
            to: userEmail,
            subject: `${alert.ticker} is ${alert.condition} $${alert.target_price}`,
            react: AlertTriggeredEmail({
              ticker: alert.ticker,
              condition: alert.condition as "above" | "below",
              targetPrice: alert.target_price,
              currentPrice,
              currency: alert.currency,
            }),
          });
        } catch (emailError) {
          console.error(
            `Failed to send email for alert ${alert.id}:`,
            emailError
          );
          // Still count as triggered even if email fails
        }
      }

      triggered++;
    }

    return NextResponse.json({
      checked: alerts.length,
      triggered,
      quotes: uniqueTickers.length,
    });
  } catch (error) {
    console.error("Alert check error:", error);
    return NextResponse.json(
      { error: "Alert check failed" },
      { status: 500 }
    );
  }
}
