// ── Currency & Display ────────────────────────────────────

export type Currency = "USD" | "ARS";
export type DollarType = "mep" | "ccl" | "blue";
export type Theme = "light" | "dark" | "system";
export type AssetType = "stock" | "cedear";
export type TransactionAction = "buy" | "sell";
export type AlertCondition = "above" | "below";

// ── Market Data ───────────────────────────────────────────

export interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface DollarRate {
  moneda: string;
  casa: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface DollarRates {
  oficial: DollarRate;
  mep: DollarRate;
  blue: DollarRate;
}

export interface HistoricalPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

// ── Portfolio ─────────────────────────────────────────────

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  totalShares: number;
  avgCostUsd: number;
  totalInvestedUsd: number;
  realizedPnlUsd: number;
  totalDividendsUsd: number;
  cedearRatio: string | null;
  firstBuyDate: string | null;
  lastTransactionDate: string | null;
  transactionCount: number;
  notes: string | null;
  isActive: boolean;
}

export interface HoldingWithMarketData extends Holding {
  currentPrice: number;
  currentValue: number;
  dayChange: number;
  dayChangePercent: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  weight: number;
}

// ── Transactions ──────────────────────────────────────────

export interface Transaction {
  id: string;
  ticker: string;
  type: AssetType;
  action: TransactionAction;
  shares: number;
  pricePerShare: number;
  priceUsd: number;
  currency: Currency;
  exchangeRate: number | null;
  totalAmount: number;
  totalAmountUsd: number;
  commission: number | null;
  date: string;
  notes: string | null;
}

// ── Watchlist ─────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  notes: string | null;
  targetBuyPrice: number | null;
  addedAt: string;
  currentPrice?: number;
  dayChange?: number;
  dayChangePercent?: number;
}

// ── Alerts ────────────────────────────────────────────────

export interface Alert {
  id: string;
  ticker: string;
  condition: AlertCondition;
  targetPrice: number;
  currency: Currency;
  isActive: boolean;
  triggeredAt: string | null;
  notificationSent: boolean;
  createdAt: string;
}

// ── CEDEAR ────────────────────────────────────────────────

export interface CedearInfo {
  ticker: string;
  name: string;
  ratio: number;
  market: string;
}

// ── Chart ─────────────────────────────────────────────────

export type ChartPeriod = "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export interface PortfolioSnapshot {
  date: string;
  value: number;
  sp500Value?: number;
}
