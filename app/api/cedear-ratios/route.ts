import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import type { Database } from "@/supabase/types";

const COMAFI_XLSX_URL =
  "https://www.comafi.com.ar/Multimedios/otros/7279.xlsx";

function getSupabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * GET /api/cedear-ratios — return all ratios from DB
 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cedear_ratios")
    .select("ticker, name, ratio, market")
    .order("ticker");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/cedear-ratios — sync from Banco Comafi XLSX
 * Downloads the official CEDEAR spreadsheet and upserts all ratios into DB.
 *
 * Comafi XLSX structure (as of 2025):
 *   Row 7 (0-indexed): Headers
 *   Row 8+: Data
 *   Columns (0-indexed):
 *     0: Row number
 *     1: Name ("DENOMINACION DEL PROGRAMA CEDEAR")
 *     2: Ticker ("Identificación Mercado")
 *     3: Código Caja de Valores
 *     4: ISIN CEDEAR
 *     5: ISIN Subyacente
 *     6: Cusip
 *     7: Ratio ("Ratio Cedear/Acción ó ADR") — e.g. "4:1", "20:1"
 *     8: Montos Máximos
 *     9: Market ("Mercado de Negociación") — e.g. "NYSE", "NASDAQ GS"
 *    10: Underlying type ("Valor Subyacente") — e.g. "Common Stock", "ADR"
 *    11: Dividend frequency
 *    12: Country ("País de Origen")
 *    13: Industry
 *    14: Industry description
 *    15: Mercado Elegible
 */
export async function POST() {
  try {
    // 1. Download the XLSX
    const response = await fetch(COMAFI_XLSX_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch Comafi XLSX: ${response.status}` },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Parse as array of arrays (positional columns)
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: "",
    });

    // Find the header row — look for a row containing "Ratio" and "Mercado"
    let headerIdx = -1;
    for (let i = 0; i < Math.min(20, rows.length); i++) {
      const rowStr = rows[i].map((c) => String(c).toLowerCase());
      if (
        rowStr.some((c) => c.includes("ratio")) &&
        rowStr.some((c) => c.includes("mercado"))
      ) {
        headerIdx = i;
        break;
      }
    }

    // Detect column positions from header row
    let colName = 1;
    let colTicker = 2;
    let colRatio = 7;
    let colMarket = 9;
    let colType = 10;
    let colCountry = 12;
    let colIndustry = 13;

    if (headerIdx >= 0) {
      const headers = rows[headerIdx].map((c) => String(c).toLowerCase());
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].includes("denominacion")) colName = i;
        else if (headers[i].includes("identificaci")) colTicker = i;
        else if (headers[i].includes("ratio")) colRatio = i;
        else if (headers[i].includes("mercado de negoci")) colMarket = i;
        else if (headers[i].includes("valor subyacente")) colType = i;
        else if (headers[i].includes("pa")) {
          if (headers[i].includes("s de origen") || headers[i].includes("ís de origen"))
            colCountry = i;
        }
        else if (headers[i] === "industria") colIndustry = i;
      }
    }

    // Data rows start after the header
    const dataStartIdx = (headerIdx >= 0 ? headerIdx : 7) + 1;

    const entries: {
      ticker: string;
      name: string;
      ratio: number;
      market: string | null;
      underlying_type: string | null;
      country: string | null;
      industry: string | null;
    }[] = [];

    for (let i = dataStartIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 8) continue;

      const ticker = String(row[colTicker] ?? "").trim().toUpperCase();
      const name = String(row[colName] ?? "").trim();
      const ratioStr = String(row[colRatio] ?? "").trim();
      const market = String(row[colMarket] ?? "").trim() || null;
      const underlyingType = String(row[colType] ?? "").trim() || null;
      const country = String(row[colCountry] ?? "").trim() || null;
      const industry = String(row[colIndustry] ?? "").trim() || null;

      if (!ticker || !ratioStr) continue;

      const ratio = parseRatio(ratioStr);
      if (ratio === null || ratio <= 0) continue;

      entries.push({
        ticker,
        name: name || ticker,
        ratio,
        market,
        underlying_type: underlyingType,
        country,
        industry,
      });
    }

    if (entries.length === 0) {
      return NextResponse.json(
        {
          error: "No valid entries found in XLSX. Column format may have changed.",
          debug: {
            headerIdx,
            totalRows: rows.length,
            sampleRow: rows[dataStartIdx]?.slice(0, 10),
          },
        },
        { status: 422 }
      );
    }

    // 3. Upsert into DB
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    let upserted = 0;
    for (let i = 0; i < entries.length; i += 50) {
      const batch = entries.slice(i, i + 50).map((e) => ({
        ...e,
        updated_at: now,
      }));

      const { error } = await supabase
        .from("cedear_ratios")
        .upsert(batch, { onConflict: "ticker" });

      if (error) {
        return NextResponse.json(
          { error: `Upsert error: ${error.message}`, upserted },
          { status: 500 }
        );
      }
      upserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      count: upserted,
      source: COMAFI_XLSX_URL,
    });
  } catch (err) {
    console.error("CEDEAR sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** Parse ratio string like "20:1", "144 : 1", "1:3" → number of CEDEARs per 1 share */
function parseRatio(str: string): number | null {
  const cleaned = str.replace(/\s/g, "");
  const match = cleaned.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  const left = parseInt(match[1], 10);
  const right = parseInt(match[2], 10);
  if (right === 0) return null;
  // "20:1" → 20 CEDEARs = 1 share → ratio = 20
  // "1:3" → 1 CEDEAR = 3 shares → ratio ≈ 0.33 (rare edge case)
  return left / right;
}
