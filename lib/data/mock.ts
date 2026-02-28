import type {
  HoldingWithMarketData,
  WatchlistItem,
  Alert,
  PortfolioSnapshot,
} from "@/lib/types";

export const MOCK_HOLDINGS: HoldingWithMarketData[] = [
  {
    id: "1",
    ticker: "AAPL",
    name: "Apple Inc.",
    type: "cedear",
    totalShares: 40,
    avgCostUsd: 165.2,
    totalInvestedUsd: 6608,
    realizedPnlUsd: 0,
    totalDividendsUsd: 48,
    cedearRatio: "10:1",
    firstBuyDate: "2024-03-15",
    lastTransactionDate: "2024-11-20",
    transactionCount: 4,
    notes: null,
    isActive: true,
    currentPrice: 189.84,
    currentValue: 7593.6,
    dayChange: 2.34,
    dayChangePercent: 1.25,
    unrealizedPnl: 985.6,
    unrealizedPnlPercent: 14.92,
    weight: 18.2,
  },
  {
    id: "2",
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    type: "cedear",
    totalShares: 25,
    avgCostUsd: 98.5,
    totalInvestedUsd: 2462.5,
    realizedPnlUsd: 1200,
    totalDividendsUsd: 0,
    cedearRatio: "5:1",
    firstBuyDate: "2024-01-10",
    lastTransactionDate: "2024-09-05",
    transactionCount: 3,
    notes: "AI thesis long-term",
    isActive: true,
    currentPrice: 131.28,
    currentValue: 3282,
    dayChange: -1.56,
    dayChangePercent: -1.18,
    unrealizedPnl: 819.5,
    unrealizedPnlPercent: 33.27,
    weight: 7.9,
  },
  {
    id: "3",
    ticker: "MELI",
    name: "MercadoLibre Inc.",
    type: "cedear",
    totalShares: 5,
    avgCostUsd: 1620,
    totalInvestedUsd: 8100,
    realizedPnlUsd: 0,
    totalDividendsUsd: 0,
    cedearRatio: "1:1",
    firstBuyDate: "2024-06-01",
    lastTransactionDate: "2024-08-15",
    transactionCount: 2,
    notes: "LatAm e-commerce + fintech",
    isActive: true,
    currentPrice: 2085.5,
    currentValue: 10427.5,
    dayChange: 15.2,
    dayChangePercent: 0.73,
    unrealizedPnl: 2327.5,
    unrealizedPnlPercent: 28.73,
    weight: 25.0,
  },
  {
    id: "4",
    ticker: "MSFT",
    name: "Microsoft Corp.",
    type: "stock",
    totalShares: 12,
    avgCostUsd: 380.0,
    totalInvestedUsd: 4560,
    realizedPnlUsd: 0,
    totalDividendsUsd: 96,
    cedearRatio: null,
    firstBuyDate: "2024-04-20",
    lastTransactionDate: "2024-10-01",
    transactionCount: 2,
    notes: null,
    isActive: true,
    currentPrice: 442.58,
    currentValue: 5310.96,
    dayChange: 3.82,
    dayChangePercent: 0.87,
    unrealizedPnl: 750.96,
    unrealizedPnlPercent: 16.47,
    weight: 12.7,
  },
  {
    id: "5",
    ticker: "TSLA",
    name: "Tesla Inc.",
    type: "cedear",
    totalShares: 15,
    avgCostUsd: 210.5,
    totalInvestedUsd: 3157.5,
    realizedPnlUsd: 450,
    totalDividendsUsd: 0,
    cedearRatio: "3:1",
    firstBuyDate: "2024-02-28",
    lastTransactionDate: "2025-01-10",
    transactionCount: 5,
    notes: null,
    isActive: true,
    currentPrice: 248.42,
    currentValue: 3726.3,
    dayChange: -4.18,
    dayChangePercent: -1.65,
    unrealizedPnl: 568.8,
    unrealizedPnlPercent: 18.02,
    weight: 8.9,
  },
  {
    id: "6",
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    type: "cedear",
    totalShares: 30,
    avgCostUsd: 142.0,
    totalInvestedUsd: 4260,
    realizedPnlUsd: 0,
    totalDividendsUsd: 24,
    cedearRatio: "3:1",
    firstBuyDate: "2024-05-10",
    lastTransactionDate: "2024-12-01",
    transactionCount: 3,
    notes: null,
    isActive: true,
    currentPrice: 178.35,
    currentValue: 5350.5,
    dayChange: 1.92,
    dayChangePercent: 1.09,
    unrealizedPnl: 1090.5,
    unrealizedPnlPercent: 25.6,
    weight: 12.8,
  },
  {
    id: "7",
    ticker: "GLOB",
    name: "Globant S.A.",
    type: "cedear",
    totalShares: 10,
    avgCostUsd: 195.0,
    totalInvestedUsd: 1950,
    realizedPnlUsd: 0,
    totalDividendsUsd: 0,
    cedearRatio: "2:1",
    firstBuyDate: "2024-07-15",
    lastTransactionDate: "2024-07-15",
    transactionCount: 1,
    notes: "Argentine tech",
    isActive: true,
    currentPrice: 218.6,
    currentValue: 2186,
    dayChange: -0.85,
    dayChangePercent: -0.39,
    unrealizedPnl: 236,
    unrealizedPnlPercent: 12.1,
    weight: 5.2,
  },
  {
    id: "8",
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    type: "stock",
    totalShares: 20,
    avgCostUsd: 178.0,
    totalInvestedUsd: 3560,
    realizedPnlUsd: 0,
    totalDividendsUsd: 0,
    cedearRatio: null,
    firstBuyDate: "2024-08-01",
    lastTransactionDate: "2024-11-15",
    transactionCount: 2,
    notes: null,
    isActive: true,
    currentPrice: 195.72,
    currentValue: 3914.4,
    dayChange: 1.44,
    dayChangePercent: 0.74,
    unrealizedPnl: 354.4,
    unrealizedPnlPercent: 9.96,
    weight: 9.4,
  },
];

export const MOCK_WATCHLIST: WatchlistItem[] = [
  {
    id: "w1",
    ticker: "META",
    name: "Meta Platforms",
    notes: "Waiting for pullback to $500",
    targetBuyPrice: 500,
    addedAt: "2025-01-05",
    currentPrice: 585.25,
    dayChange: 4.12,
    dayChangePercent: 0.71,
  },
  {
    id: "w2",
    ticker: "PLTR",
    name: "Palantir Technologies",
    notes: "Government AI contracts",
    targetBuyPrice: 60,
    addedAt: "2025-01-10",
    currentPrice: 78.32,
    dayChange: -1.24,
    dayChangePercent: -1.56,
  },
  {
    id: "w3",
    ticker: "COIN",
    name: "Coinbase Global",
    notes: "Crypto exposure",
    targetBuyPrice: 200,
    addedAt: "2024-12-20",
    currentPrice: 258.15,
    dayChange: 6.8,
    dayChangePercent: 2.71,
  },
  {
    id: "w4",
    ticker: "CRWD",
    name: "CrowdStrike",
    notes: "Cybersecurity leader",
    targetBuyPrice: 300,
    addedAt: "2025-01-15",
    currentPrice: 342.78,
    dayChange: 2.15,
    dayChangePercent: 0.63,
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    ticker: "AAPL",
    condition: "above",
    targetPrice: 200,
    currency: "USD",
    isActive: true,
    triggeredAt: null,
    notificationSent: false,
    createdAt: "2025-01-10",
  },
  {
    id: "a2",
    ticker: "TSLA",
    condition: "below",
    targetPrice: 200,
    currency: "USD",
    isActive: true,
    triggeredAt: null,
    notificationSent: false,
    createdAt: "2025-01-12",
  },
  {
    id: "a3",
    ticker: "NVDA",
    condition: "above",
    targetPrice: 150,
    currency: "USD",
    isActive: true,
    triggeredAt: null,
    notificationSent: false,
    createdAt: "2025-01-08",
  },
  {
    id: "a4",
    ticker: "META",
    condition: "below",
    targetPrice: 500,
    currency: "USD",
    isActive: false,
    triggeredAt: "2025-01-20",
    notificationSent: true,
    createdAt: "2024-12-15",
  },
];

// Generate portfolio performance data for charts
function generatePortfolioHistory(): PortfolioSnapshot[] {
  const points: PortfolioSnapshot[] = [];
  const now = new Date();
  let portfolioValue = 32000;
  let sp500Value = 32000;

  for (let i = 365; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Random daily returns
    const portfolioReturn = (Math.random() - 0.47) * 0.025;
    const sp500Return = (Math.random() - 0.47) * 0.015;

    portfolioValue *= 1 + portfolioReturn;
    sp500Value *= 1 + sp500Return;

    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(portfolioValue * 100) / 100,
      sp500Value: Math.round(sp500Value * 100) / 100,
    });
  }

  return points;
}

export const MOCK_PORTFOLIO_HISTORY = generatePortfolioHistory();

export const MOCK_DOLLAR_MEP = {
  moneda: "USD",
  casa: "bolsa",
  compra: 1385.5,
  venta: 1390.0,
  fechaActualizacion: new Date().toISOString(),
};

// Compute portfolio summary from holdings
export function computePortfolioSummary(holdings: HoldingWithMarketData[]) {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvestedUsd, 0);
  const totalDayChange = holdings.reduce(
    (sum, h) => sum + h.dayChange * h.totalShares,
    0
  );
  const totalRealizedPnl = holdings.reduce(
    (sum, h) => sum + h.realizedPnlUsd,
    0
  );
  const totalDividends = holdings.reduce(
    (sum, h) => sum + h.totalDividendsUsd,
    0
  );
  const unrealizedPnl = totalValue - totalInvested;
  const totalPnl = unrealizedPnl + totalRealizedPnl;

  // Net invested = cost basis of current positions minus realized gains from sales
  // This equals: total money put in - total money taken out via sells
  const netInvested = totalInvested - totalRealizedPnl;
  const netGain = totalValue - netInvested;

  // Find earliest buy date across all holdings
  const firstBuyDate = holdings.reduce((earliest, h) => {
    if (!h.firstBuyDate) return earliest;
    return !earliest || h.firstBuyDate < earliest ? h.firstBuyDate : earliest;
  }, null as string | null);

  return {
    totalValue,
    totalInvested,
    netInvested,
    netGain,
    netGainPercent: netInvested > 0 ? (netGain / netInvested) * 100 : 0,
    unrealizedPnl,
    unrealizedPnlPercent:
      totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0,
    realizedPnl: totalRealizedPnl,
    totalPnl,
    totalPnlPercent: totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0,
    totalDayChange,
    totalDayChangePercent:
      totalValue > 0
        ? (totalDayChange / (totalValue - totalDayChange)) * 100
        : 0,
    totalDividends,
    firstBuyDate,
    positionCount: holdings.filter((h) => h.isActive).length,
    topGainer: (() => {
      const sorted = [...holdings].sort(
        (a, b) => b.dayChangePercent - a.dayChangePercent
      );
      return sorted[0]?.dayChangePercent >= 0 ? sorted[0] : undefined;
    })(),
    topLoser: (() => {
      const sorted = [...holdings].sort(
        (a, b) => a.dayChangePercent - b.dayChangePercent
      );
      const candidate = sorted[0];
      // Don't show same ticker as both gainer and loser
      const gainer = [...holdings].sort(
        (a, b) => b.dayChangePercent - a.dayChangePercent
      )[0];
      if (candidate?.id === gainer?.id) return sorted[1]?.dayChangePercent < 0 ? sorted[1] : undefined;
      return candidate?.dayChangePercent < 0 ? candidate : undefined;
    })(),
  };
}
