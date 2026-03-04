"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/cn";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { usePortfolioCandles } from "@/lib/hooks/use-candles";
import type { HoldingForChart } from "@/lib/hooks/use-candles";
import type { ChartPeriod } from "@/lib/types";

interface PortfolioChartProps {
  holdings: HoldingForChart[];
  firstTransactionDate?: string | null;
}

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "5Y", value: "5Y" },
  { label: "MAX", value: "MAX" },
];

export function PortfolioChart({ holdings, firstTransactionDate }: PortfolioChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("3M");

  const { data: chartData, isLoading } = usePortfolioCandles(
    holdings,
    period,
    firstTransactionDate
  );

  const lastPoint = chartData?.[chartData.length - 1];
  const periodReturn = lastPoint?.portfolio ?? 0;
  const sp500Return = lastPoint?.sp500 ?? 0;
  const isPositive = periodReturn >= 0;

  const hasNoHoldings = holdings.length === 0;

  // Unique gradient IDs
  const gradientId = `portfolio-${period}-${isPositive ? "up" : "down"}`;
  const sp500GradientId = `sp500-${period}`;

  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-foreground">Performance</h3>
          {!isLoading && chartData && chartData.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-0.5 rounded-full"
                  style={{ backgroundColor: isPositive ? "var(--positive)" : "var(--negative)" }}
                />
                <span
                  className={cn(
                    "text-xs font-mono font-medium",
                    isPositive ? "text-positive" : "text-negative"
                  )}
                >
                  {formatPercent(periodReturn)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-0.5 rounded-full bg-accent" />
                <span className="text-xs font-mono font-medium text-accent">
                  {formatPercent(sp500Return)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center bg-background-secondary rounded-full p-0.5">
          {PERIODS.map((p, i) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                "text-xs px-2 py-1 transition-colors font-mono",
                i === 0 && "rounded-l-full",
                i === PERIODS.length - 1 && "rounded-r-full",
                i > 0 && i < PERIODS.length - 1 && "rounded-md",
                period === p.value
                  ? "bg-surface text-foreground"
                  : "text-foreground-tertiary hover:text-foreground-secondary"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-0.5 rounded-full"
            style={{ backgroundColor: isPositive ? "var(--positive)" : "var(--negative)" }}
          />
          <span className="text-foreground-tertiary">Portfolio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-accent" />
          <span className="text-foreground-tertiary">S&P 500</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[420px] -ml-2">
        {hasNoHoldings ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-foreground-tertiary">
            Add holdings to see performance
          </div>
        ) : isLoading ? (
          <div className="w-full h-full bg-background-secondary rounded-lg animate-pulse-subtle" />
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "var(--positive)" : "var(--negative)"}
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "var(--positive)" : "var(--negative)"}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id={sp500GradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value: string) => {
                  const d = new Date(value + "T00:00:00");
                  if (period === "1W") {
                    return d.toLocaleDateString("en-US", { weekday: "short" });
                  }
                  if (period === "1Y" || period === "5Y" || period === "MAX") {
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    });
                  }
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                interval="equidistantPreserveStart"
                minTickGap={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                width={45}
              />
              <ReferenceLine
                y={0}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <Tooltip content={<ChartTooltip />} />

              {/* S&P 500 line (rendered first = behind) */}
              <Area
                type="monotone"
                dataKey="sp500"
                stroke="var(--accent)"
                strokeWidth={1.5}
                fill={`url(#${sp500GradientId})`}
                dot={false}
                animationDuration={500}
                connectNulls
              />

              {/* Portfolio line (rendered second = in front) */}
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke={isPositive ? "var(--positive)" : "var(--negative)"}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-foreground-tertiary">
            No chart data available
          </div>
        )}
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      portfolio: number;
      sp500: number | null;
      portfolioValue: number;
    };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-foreground-tertiary mb-1.5">
        {new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: data.portfolio >= 0 ? "var(--positive)" : "var(--negative)",
            }}
          />
          <span className="text-foreground-tertiary">Portfolio</span>
          <span
            className={cn(
              "font-mono font-medium ml-auto",
              data.portfolio >= 0 ? "text-positive" : "text-negative"
            )}
          >
            {formatPercent(data.portfolio)}
          </span>
        </div>
        {data.sp500 !== null && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-foreground-tertiary">S&P 500</span>
            <span className="font-mono text-accent font-medium ml-auto">
              {formatPercent(data.sp500)}
            </span>
          </div>
        )}
        <div className="pt-1 border-t border-border mt-1">
          <span className="text-foreground-tertiary">Value </span>
          <span className="font-mono text-foreground">
            {formatCurrency(data.portfolioValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
