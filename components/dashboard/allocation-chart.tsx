"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/utils/format";
import type { HoldingWithMarketData } from "@/lib/types";

interface AllocationChartProps {
  holdings: HoldingWithMarketData[];
}

const COLORS = [
  "#6886c5",
  "#7bc8a4",
  "#e8a87c",
  "#c47e8d",
  "#9b8ec4",
  "#6db5b5",
  "#c9a96e",
  "#8caacc",
];

export function AllocationChart({ holdings }: AllocationChartProps) {
  const data = holdings
    .filter((h) => h.isActive)
    .sort((a, b) => b.weight - a.weight)
    .map((h) => ({
      name: h.ticker,
      value: h.weight,
      fullName: h.name,
    }));

  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up">
      <h3 className="text-sm font-medium text-foreground mb-4">Allocation</h3>

      <div className="flex items-start gap-6">
        {/* Donut chart */}
        <div className="w-[140px] h-[140px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                animationDuration={600}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 pt-1">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
                <span className="text-foreground-secondary font-mono">
                  {item.name}
                </span>
              </div>
              <span className="text-foreground-tertiary font-mono">
                {formatPercent(item.value).replace("+", "")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TypeDistribution({
  holdings,
}: {
  holdings: HoldingWithMarketData[];
}) {
  const stocks = holdings.filter((h) => h.type === "stock" && h.isActive);
  const cedears = holdings.filter((h) => h.type === "cedear" && h.isActive);

  const stockValue = stocks.reduce((sum, h) => sum + h.currentValue, 0);
  const cedearValue = cedears.reduce((sum, h) => sum + h.currentValue, 0);
  const total = stockValue + cedearValue;

  const stockPct = total > 0 ? (stockValue / total) * 100 : 0;
  const cedearPct = total > 0 ? (cedearValue / total) * 100 : 0;

  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up">
      <h3 className="text-sm font-medium text-foreground mb-4">
        Asset type
      </h3>

      <div className="space-y-3">
        <DistributionBar
          label="CEDEARs"
          count={cedears.length}
          percent={cedearPct}
        />
        <DistributionBar
          label="Stocks"
          count={stocks.length}
          percent={stockPct}
        />
      </div>
    </div>
  );
}

function DistributionBar({
  label,
  count,
  percent,
}: {
  label: string;
  count: number;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-foreground-secondary">
          {label}
          <span className="text-foreground-tertiary ml-1">({count})</span>
        </span>
        <span className="text-foreground-tertiary font-mono">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-background-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            label === "CEDEARs" ? "bg-accent" : "bg-[#7bc8a4]"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
