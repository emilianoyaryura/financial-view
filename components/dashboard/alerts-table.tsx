"use client";

import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useDeleteAlert } from "@/lib/hooks/use-alerts";
import type { Alert } from "@/lib/types";

interface AlertsTableProps {
  alerts: Alert[];
}

export function AlertsTable({ alerts }: AlertsTableProps) {
  const active = alerts.filter((a) => a.isActive);
  const triggered = alerts.filter((a) => !a.isActive);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div>
          <p className="text-xs text-foreground-tertiary uppercase tracking-wider mb-3">
            Active
          </p>
          <div className="space-y-2">
            {active.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {triggered.length > 0 && (
        <div>
          <p className="text-xs text-foreground-tertiary uppercase tracking-wider mb-3">
            Triggered
          </p>
          <div className="space-y-2">
            {triggered.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const deleteAlert = useDeleteAlert();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-lg border border-border group",
        alert.isActive ? "bg-surface" : "bg-background-secondary opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono font-medium text-foreground">
          {alert.ticker}
        </span>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded font-medium",
            alert.condition === "above"
              ? "bg-positive-muted text-positive"
              : "bg-negative-muted text-negative"
          )}
        >
          {alert.condition === "above" ? "Above" : "Below"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-foreground">
          {formatCurrency(alert.targetPrice, alert.currency)}
        </span>
        {alert.triggeredAt && (
          <span className="text-xs text-foreground-tertiary">
            {new Date(alert.triggeredAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        <button
          onClick={() => deleteAlert.mutate(alert.id)}
          className="text-foreground-tertiary hover:text-negative transition-colors opacity-0 group-hover:opacity-100 p-1"
          title="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
