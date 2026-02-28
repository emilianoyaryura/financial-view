import { NextResponse } from "next/server";
import type { DollarRate, DollarRates } from "@/lib/types";

export async function GET() {
  try {
    const [oficialRes, mepRes, blueRes] = await Promise.all([
      fetch("https://dolarapi.com/v1/dolares/oficial", {
        next: { revalidate: 120 },
      }),
      fetch("https://dolarapi.com/v1/dolares/bolsa", {
        next: { revalidate: 120 },
      }),
      fetch("https://dolarapi.com/v1/dolares/blue", {
        next: { revalidate: 120 },
      }),
    ]);

    const fallback: DollarRate = {
      moneda: "USD",
      casa: "unknown",
      compra: 0,
      venta: 0,
      fechaActualizacion: new Date().toISOString(),
    };

    const oficial: DollarRate = oficialRes.ok
      ? await oficialRes.json()
      : { ...fallback, casa: "oficial" };
    const mep: DollarRate = mepRes.ok
      ? await mepRes.json()
      : { ...fallback, casa: "bolsa" };
    const blue: DollarRate = blueRes.ok
      ? await blueRes.json()
      : { ...fallback, casa: "blue" };

    const data: DollarRates = { oficial, mep, blue };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dollar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dollar rates" },
      { status: 500 }
    );
  }
}
