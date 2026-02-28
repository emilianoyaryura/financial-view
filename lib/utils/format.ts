import type { Currency } from "@/lib/types";

/**
 * Format a number as currency.
 * USD: $1,230.50
 * ARS: $1.230,50
 */
export function formatCurrency(
  value: number,
  currency: Currency = "USD"
): string {
  if (!Number.isFinite(value)) return "—";
  if (currency === "ARS") {
    return (
      "$" +
      value.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return (
    "$" +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format a compact currency value for large numbers.
 * e.g. $12.4K, $1.2M
 */
export function formatCompactCurrency(
  value: number,
  currency: Currency = "USD"
): string {
  if (Math.abs(value) >= 1_000_000) {
    return "$" + (value / 1_000_000).toFixed(1) + "M";
  }
  if (Math.abs(value) >= 1_000) {
    return "$" + (value / 1_000).toFixed(1) + "K";
  }
  return formatCurrency(value, currency);
}

/**
 * Format a percentage with 1 decimal (e.g. +1.2%, -0.5%).
 */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return sign + value.toFixed(1) + "%";
}

/**
 * Format a number change with sign (e.g. +$234.50, -$12.30).
 */
export function formatChange(
  value: number,
  currency: Currency = "USD"
): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return sign + formatCurrency(value, currency);
}

/**
 * Format a number with commas (no currency symbol).
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Returns the color class for a P&L value.
 */
export function pnlColor(value: number): string {
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-muted";
}

/**
 * Returns the background color class for a P&L badge.
 */
export function pnlBgColor(value: number): string {
  if (value > 0) return "bg-positive-muted text-positive";
  if (value < 0) return "bg-negative-muted text-negative";
  return "bg-muted/10 text-muted";
}
