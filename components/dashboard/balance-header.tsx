"use client";

import { formatCurrency, formatChange, formatPercent } from "@/lib/utils/format";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/design-system/tooltip";
import type { Currency, DollarRates } from "@/lib/types";
import { cn } from "@/lib/cn";

interface BalanceHeaderProps {
  totalValue: number;
  totalDayChange: number;
  totalDayChangePercent: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  totalInvested: number;
  netInvested: number;
  netGain: number;
  netGainPercent: number;
  totalDividends: number;
  positionCount: number;
  firstBuyDate: string | null;
  currency: Currency;
  dollarRate: number;
  dollarRates: DollarRates | null;
}

export function BalanceHeader({
  totalValue,
  totalDayChange,
  totalDayChangePercent,
  unrealizedPnl,
  unrealizedPnlPercent,
  totalInvested,
  netInvested,
  netGain,
  netGainPercent,
  totalDividends,
  positionCount,
  firstBuyDate,
  currency,
  dollarRate,
  dollarRates,
}: BalanceHeaderProps) {
  const displayValue =
    currency === "ARS" ? totalValue * dollarRate : totalValue;
  const secondaryValue =
    currency === "ARS" ? totalValue : totalValue * dollarRate;
  const secondaryCurrency = currency === "ARS" ? "USD" : "ARS";

  const sinceLabel = firstBuyDate
    ? `since ${new Date(firstBuyDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
    : "";

  return (
    <div className="animate-fade-in">
      {/* Main balance */}
      <div className="mb-6">
        <p className="text-foreground-tertiary text-xs uppercase tracking-wider mb-2">
          Portfolio value
        </p>
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-semibold tracking-tight font-mono">
            {formatCurrency(displayValue, currency)}
          </h1>
          <span
            className={cn(
              "text-sm font-mono font-medium px-2 py-0.5 rounded-md",
              totalDayChange >= 0
                ? "text-positive bg-positive-muted"
                : "text-negative bg-negative-muted"
            )}
          >
            {formatChange(totalDayChange, "USD")} ({formatPercent(totalDayChangePercent)})
          </span>
        </div>
        <p className="text-foreground-tertiary text-sm font-mono mt-1">
          {formatCurrency(secondaryValue, secondaryCurrency)}
        </p>
      </div>

      {/* Stats row */}
      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Invested"
            value={formatCurrency(netInvested, "USD")}
            description={`in ${positionCount} position${positionCount !== 1 ? "s" : ""}`}
          />
          <StatCard
            label="Return"
            value={formatChange(netGain, "USD")}
            subValue={formatPercent(netGainPercent)}
            positive={netGain >= 0}
            description={sinceLabel}
          />
          <StatCard
            label="Dividends"
            value={formatCurrency(totalDividends, "USD")}
            description={totalDividends > 0 ? "accumulated" : "no dividends yet"}
            tooltip="Total dividend income received from all your holdings."
          />
          <StatCard
            label="Unrealized"
            value={formatChange(unrealizedPnl, "USD")}
            subValue={formatPercent(unrealizedPnlPercent)}
            positive={unrealizedPnl >= 0}
            description="open positions"
            tooltip="Profit or loss on positions you still hold. Only realized when you sell."
          />
        </div>
      </TooltipProvider>

      {/* Dollar rates */}
      {dollarRates && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          <DollarCard
            label="Oficial"
            compra={dollarRates.oficial.compra}
            venta={dollarRates.oficial.venta}
          />
          <DollarCard
            label="MEP"
            compra={dollarRates.mep.compra}
            venta={dollarRates.mep.venta}
          />
          <DollarCard
            label="Blue"
            compra={dollarRates.blue.compra}
            venta={dollarRates.blue.venta}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  positive,
  description,
  tooltip,
}: {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
  description?: string;
  tooltip?: string;
}) {
  return (
    <div className="border border-border rounded-lg px-4 py-3 bg-surface">
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-foreground-tertiary text-xs mb-1 cursor-help border-b border-dashed border-foreground-tertiary/30 w-fit">
              {label}
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px]">{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <p className="text-foreground-tertiary text-xs mb-1">{label}</p>
      )}
      <p
        className={cn(
          "text-sm font-mono font-medium",
          positive !== undefined
            ? positive
              ? "text-positive"
              : "text-negative"
            : "text-foreground"
        )}
      >
        {value}
        {subValue && (
          <span className="text-foreground-tertiary ml-1 text-xs font-normal">
            {subValue}
          </span>
        )}
      </p>
      {description && (
        <p className="text-[11px] text-foreground-tertiary mt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}

function DollarCard({
  label,
  compra,
  venta,
}: {
  label: string;
  compra: number;
  venta: number;
}) {
  const spread = venta > 0 && compra > 0
    ? ((venta - compra) / compra * 100).toFixed(1)
    : null;

  return (
    <div className="border border-border rounded-lg px-4 py-3 bg-surface">
      <p className="text-foreground-tertiary text-xs mb-1.5">{label}</p>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[11px] text-foreground-tertiary">C </span>
          <span className="text-sm font-mono text-foreground">
            {compra > 0 ? formatCurrency(compra, "ARS") : "—"}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-foreground-tertiary">V </span>
          <span className="text-sm font-mono text-foreground">
            {venta > 0 ? formatCurrency(venta, "ARS") : "—"}
          </span>
        </div>
      </div>
      {spread && (
        <p className="text-[10px] text-foreground-tertiary mt-1 font-mono">
          spread {spread}%
        </p>
      )}
    </div>
  );
}
