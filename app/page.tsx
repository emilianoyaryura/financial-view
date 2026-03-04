"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/dashboard/header";
import { BalanceHeader } from "@/components/dashboard/balance-header";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import {
  AllocationChart,
  TypeDistribution,
} from "@/components/dashboard/allocation-chart";
import { TopMovers } from "@/components/dashboard/top-movers";
import { NextEarnings } from "@/components/dashboard/next-earnings";
import { PortfolioTable } from "@/components/dashboard/portfolio-table";
import { WatchlistTable } from "@/components/dashboard/watchlist-table";
import { AlertsTable } from "@/components/dashboard/alerts-table";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { CreateAlertDialog } from "@/components/dashboard/create-alert-dialog";
import { StockPreviewDialog } from "@/components/dashboard/stock-preview-dialog";
import { TransactionHistoryDrawer } from "@/components/dashboard/transaction-history-drawer";
import { EmptyState } from "@/components/dashboard/empty-states";
import {
  BalanceSkeleton,
  ChartSkeleton,
  TableSkeleton,
  SideCardSkeleton,
} from "@/components/dashboard/skeletons";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/design-system/tabs";
import { useAuth } from "@/lib/hooks/use-auth";
import { usePortfolioWithQuotes } from "@/lib/hooks/use-portfolio";
import { useWatchlist, useAddToWatchlist } from "@/lib/hooks/use-watchlist";
import { useAlerts } from "@/lib/hooks/use-alerts";
import { useDollar } from "@/lib/hooks/use-dollar";
import { useTheme } from "@/lib/hooks/use-theme";
import { computePortfolioSummary } from "@/lib/data/mock";
import { Toaster, toast } from "sonner";
import type { Currency } from "@/lib/types";

export default function Dashboard() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [prefillTicker, setPrefillTicker] = useState("");
  const [activeTab, setActiveTab] = useState("portfolio");

  // Stock preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTicker, setPreviewTicker] = useState("");
  const [previewName, setPreviewName] = useState("");

  // Create alert
  const [createAlertOpen, setCreateAlertOpen] = useState(false);

  // Transaction history
  const [historyOpen, setHistoryOpen] = useState(false);

  // Theme
  const { theme } = useTheme();

  // Data
  const { userId, isLoading: userLoading } = useAuth();
  const {
    holdings,
    isLoading: portfolioLoading,
    hasData: hasHoldings,
  } = usePortfolioWithQuotes(userId);
  const {
    items: watchlistItems,
    isLoading: watchlistLoading,
    hasData: hasWatchlist,
  } = useWatchlist(userId);
  const {
    alerts,
    isLoading: alertsLoading,
    hasData: hasAlerts,
  } = useAlerts(userId);
  const { data: dollar } = useDollar();

  const addToWatchlist = useAddToWatchlist(userId);

  const dollarRate = dollar?.mep?.venta ?? 0;
  const summary = hasHoldings ? computePortfolioSummary(holdings) : null;
  const isInitialLoading = userLoading || portfolioLoading;

  const handleSelectStock = useCallback(
    (ticker: string, name: string) => {
      setPreviewTicker(ticker);
      setPreviewName(name);
      setPreviewOpen(true);
    },
    []
  );

  const handleAddToPortfolio = useCallback(
    (ticker: string, _name?: string) => {
      setPrefillTicker(ticker);
      setAddTxOpen(true);
    },
    []
  );

  const handleAddToWatchlist = useCallback(
    (ticker: string, _name?: string) => {
      addToWatchlist.mutate(
        { ticker },
        {
          onSuccess: () => toast.success(`${ticker} added to watchlist`),
          onError: (err) =>
            toast.error(err.message || "Failed to add to watchlist"),
        }
      );
    },
    [addToWatchlist]
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        theme={theme}
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontSize: "13px",
          },
        }}
      />

      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onSelectStock={handleSelectStock}
      />

      <main className="contain py-8 space-y-8">
        {/* Balance + Stats */}
        {isInitialLoading ? (
          <BalanceSkeleton />
        ) : summary ? (
          <BalanceHeader
            totalValue={summary.totalValue}
            totalDayChange={summary.totalDayChange}
            totalDayChangePercent={summary.totalDayChangePercent}
            unrealizedPnl={summary.unrealizedPnl}
            unrealizedPnlPercent={summary.unrealizedPnlPercent}
            totalInvested={summary.totalInvested}
            netInvested={summary.netInvested}
            netGain={summary.netGain}
            netGainPercent={summary.netGainPercent}
            totalDividends={summary.totalDividends}
            positionCount={summary.positionCount}
            firstBuyDate={summary.firstBuyDate}
            currency={currency}
            dollarRate={dollarRate}
            dollarRates={dollar ?? null}
          />
        ) : (
          <BalanceHeader
            totalValue={0}
            totalDayChange={0}
            totalDayChangePercent={0}
            unrealizedPnl={0}
            unrealizedPnlPercent={0}
            totalInvested={0}
            netInvested={0}
            netGain={0}
            netGainPercent={0}
            totalDividends={0}
            positionCount={0}
            firstBuyDate={null}
            currency={currency}
            dollarRate={dollarRate}
            dollarRates={dollar ?? null}
          />
        )}

        {/* Chart + Top Movers side by side */}
        {isInitialLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <SideCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <PortfolioChart
                holdings={holdings.map((h) => ({
                  ticker: h.ticker,
                  totalShares: h.totalShares,
                  type: h.type,
                  avgCostUsd: h.avgCostUsd,
                  cedearRatio: h.cedearRatio
                    ? parseInt(h.cedearRatio.split(":")[0], 10) || 1
                    : 1,
                }))}
                firstTransactionDate={
                  holdings.reduce((earliest, h) => {
                    if (!h.firstBuyDate) return earliest;
                    return !earliest || h.firstBuyDate < earliest
                      ? h.firstBuyDate
                      : earliest;
                  }, null as string | null)
                }
              />
            </div>
            {hasHoldings && summary && (
              <div className="flex flex-col gap-4 min-h-0">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <TopMovers
                    topGainer={summary.topGainer}
                    topLoser={summary.topLoser}
                  />
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <NextEarnings
                    tickers={[
                      ...holdings.map((h) => h.ticker),
                      ...watchlistItems.map((w) => w.ticker),
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Allocation row */}
        {isInitialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SideCardSkeleton />
            <SideCardSkeleton />
          </div>
        ) : hasHoldings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AllocationChart holdings={holdings} />
            <TypeDistribution holdings={holdings} />
          </div>
        ) : null}

        {/* Portfolio / Watchlist / Alerts tabs */}
        <div>
          <Tabs defaultValue="portfolio" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="portfolio">
                  Portfolio
                  {hasHoldings && (
                    <span className="ml-1.5 text-foreground-tertiary text-[10px]">
                      {holdings.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="watchlist">
                  Watchlist
                  {hasWatchlist && (
                    <span className="ml-1.5 text-foreground-tertiary text-[10px]">
                      {watchlistItems.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="alerts">
                  Alerts
                  {hasAlerts && (
                    <span className="ml-1.5 text-foreground-tertiary text-[10px]">
                      {alerts.filter((a) => a.isActive).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {activeTab === "alerts" ? (
                <button
                  onClick={() => setCreateAlertOpen(true)}
                  className="btn-primary text-xs font-medium px-3.5 py-2 rounded-lg"
                >
                  + Create alert
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {activeTab === "portfolio" && (
                    <button
                      onClick={() => setHistoryOpen(true)}
                      className="text-xs font-medium px-3.5 py-2 rounded-lg bg-background-secondary border border-border text-foreground hover:bg-surface-hover transition-colors"
                    >
                      History
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setPrefillTicker("");
                      setAddTxOpen(true);
                    }}
                    className="btn-primary text-xs font-medium px-3.5 py-2 rounded-lg"
                  >
                    + Add transaction
                  </button>
                </div>
              )}
            </div>

            <TabsContent value="portfolio">
              {portfolioLoading ? (
                <TableSkeleton rows={4} />
              ) : hasHoldings ? (
                <PortfolioTable
                  holdings={holdings}
                  currency={currency}
                  dollarRate={dollarRate}
                  onSelectStock={handleSelectStock}
                />
              ) : (
                <EmptyState
                  title="No holdings yet"
                  description="Search for a stock and add your first transaction to start tracking your portfolio."
                  action={{
                    label: "Add transaction",
                    onClick: () => setAddTxOpen(true),
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="watchlist">
              {watchlistLoading ? (
                <TableSkeleton rows={3} />
              ) : hasWatchlist ? (
                <WatchlistTable items={watchlistItems} userId={userId} onSelectStock={handleSelectStock} />
              ) : (
                <EmptyState
                  title="Watchlist is empty"
                  description="Search for stocks you want to follow and add them to your watchlist."
                />
              )}
            </TabsContent>

            <TabsContent value="alerts">
              {alertsLoading ? (
                <TableSkeleton rows={2} />
              ) : hasAlerts ? (
                <AlertsTable alerts={alerts} />
              ) : (
                <EmptyState
                  title="No alerts set"
                  description="Create price alerts to get notified when a stock hits your target."
                  action={{
                    label: "Create alert",
                    onClick: () => setCreateAlertOpen(true),
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-border">
          <p className="text-xs text-foreground-tertiary text-center">
            StockAR — Portfolio tracking for Argentine investors
          </p>
        </footer>
      </main>

      {/* Dialogs */}
      <AddTransactionDialog
        open={addTxOpen}
        onOpenChange={setAddTxOpen}
        userId={userId}
        prefillTicker={prefillTicker}
      />

      <StockPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        ticker={previewTicker}
        name={previewName}
        userId={userId}
        onAddToPortfolio={handleAddToPortfolio}
        onAddToWatchlist={handleAddToWatchlist}
      />

      <CreateAlertDialog
        open={createAlertOpen}
        onOpenChange={setCreateAlertOpen}
        userId={userId}
      />

      <TransactionHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        userId={userId}
      />
    </div>
  );
}
