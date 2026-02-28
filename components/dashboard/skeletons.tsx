import { cn } from "@/lib/cn";

function Bone({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "bg-background-secondary rounded animate-pulse-subtle",
        className
      )}
      style={style}
    />
  );
}

export function BalanceSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Bone className="h-3 w-20 mb-3" />
        <Bone className="h-10 w-56 mb-2" />
        <Bone className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg px-4 py-3 bg-surface">
            <Bone className="h-3 w-14 mb-2" />
            <Bone className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <Bone className="h-4 w-24" />
        <Bone className="h-7 w-48" />
      </div>
      <Bone className="h-[280px] w-full rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-8 py-2.5 border-b border-border">
        {[80, 60, 50, 60, 50, 60, 60].map((w, i) => (
          <Bone key={i} className="h-3" style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-8 py-3 border-b border-border/50"
          style={{ opacity: 1 - i * 0.12 }}
        >
          <div className="flex items-center gap-2">
            <Bone className="h-4 w-12" />
            <Bone className="h-4 w-16" />
          </div>
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-10" />
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-12" />
          <Bone className="h-5 w-14 rounded" />
          <Bone className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function SideCardSkeleton() {
  return (
    <div className="border border-border rounded-lg bg-surface p-5 animate-fade-up">
      <Bone className="h-4 w-20 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bone className="h-2 w-2 rounded-full" />
              <Bone className="h-3 w-10" />
            </div>
            <Bone className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
