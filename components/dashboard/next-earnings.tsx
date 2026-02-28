"use client";

import { useEarnings } from "@/lib/hooks/use-earnings";
import { cn } from "@/lib/cn";

interface NextEarningsProps {
  tickers: string[];
}

function formatEarningsDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHour(hour: string): string | null {
  if (hour === "bmo") return "BMO";
  if (hour === "amc") return "AMC";
  return null;
}

export function NextEarnings({ tickers }: NextEarningsProps) {
  const { data: earnings, isLoading } = useEarnings(tickers);

  if (isLoading) {
    return <NextEarningsSkeleton />;
  }

  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up h-full flex flex-col">
      <h3 className="text-sm font-medium text-foreground mb-4">
        Next earnings
      </h3>

      {!earnings || earnings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-foreground-tertiary">
            No upcoming earnings
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="space-y-2.5">
            {earnings.map((earning) => {
              const hourLabel = formatHour(earning.hour);
              return (
                <div
                  key={`${earning.symbol}-${earning.date}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-mono font-medium text-foreground">
                    {earning.symbol}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-foreground-secondary">
                      {formatEarningsDate(earning.date)}
                    </span>
                    {hourLabel && (
                      <span
                        className={cn(
                          "text-xs font-mono px-1.5 py-0.5 rounded",
                          "bg-background-secondary text-foreground-tertiary"
                        )}
                      >
                        {hourLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NextEarningsSkeleton() {
  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up h-full flex flex-col">
      <div className="bg-background-secondary rounded animate-pulse-subtle h-4 w-24 mb-4" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="bg-background-secondary rounded animate-pulse-subtle h-3.5 w-12" />
            <div className="flex items-center gap-3">
              <div className="bg-background-secondary rounded animate-pulse-subtle h-3.5 w-14" />
              <div className="bg-background-secondary rounded animate-pulse-subtle h-5 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
