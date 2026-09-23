import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/utils";

export function BarcodeSpark({ series = [], className }) {
  const heights = useMemo(() => {
    const values = series.length ? series : Array.from({ length: 28 }, () => 0);
    const max = Math.max(1, ...values);
    return values.map((v) => Math.max(12, Math.round((Number(v) / max) * 100)));
  }, [series]);

  return (
    <div
      className={cn("flex items-end gap-[2px] h-8 w-[72px]", className)}
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px] bg-gray-300 dark:bg-gray-600"
          style={{
            height: `${h}%`,
            opacity: 0.3 + (h / 100) * 0.6,
          }}
        />
      ))}
    </div>
  );
}

export function StreakHeatmap({ series = [], cols = 12, rows = 4, className }) {
  const cells = useMemo(() => {
    const total = cols * rows;
    const values = Array.from({ length: total }, (_, i) =>
      Number(series[series.length - total + i] ?? 0),
    );
    const max = Math.max(1, ...values);
    return values.map((v) => {
      if (v <= 0) return 0;
      const ratio = v / max;
      if (ratio < 0.25) return 1;
      if (ratio < 0.5) return 2;
      if (ratio < 0.75) return 3;
      return 4;
    });
  }, [series, cols, rows]);

  const tone = (level) => {
    if (level <= 0) return "bg-gray-100 dark:bg-white/10";
    if (level === 1) return "bg-emerald-100 dark:bg-emerald-900/40";
    if (level === 2) return "bg-emerald-300 dark:bg-emerald-700/60";
    if (level === 3) return "bg-emerald-400 dark:bg-emerald-600";
    return "bg-emerald-500 dark:bg-emerald-500";
  };

  return (
    <div
      className={cn("grid gap-[3px]", className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        width: 100,
      }}
      aria-hidden
    >
      {cells.map((level, i) => (
        <span
          key={i}
          className={cn("aspect-square rounded-[2px]", tone(level))}
        />
      ))}
    </div>
  );
}

export function MiniProgress({
  value = 0,
  trackClassName,
  fillClassName,
  className,
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      className={cn(
        "relative h-2.5 w-[72px] rounded-full overflow-hidden",
        trackClassName || "bg-gray-100 dark:bg-white/10",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
          fillClassName || "bg-emerald-300 dark:bg-emerald-500",
        )}
        style={{ width: `${pct}%` }}
      />
      {pct > 0 && pct < 100 && (
        <span
          className="absolute top-0 bottom-0 w-px bg-gray-900 dark:bg-white"
          style={{ left: `${pct}%` }}
        />
      )}
    </div>
  );
}

export function MiniLineChart({
  series = [],
  className,
  stroke = "currentColor",
}) {
  const points = useMemo(() => {
    const values = series.length ? series.map(Number) : [0, 0, 0, 0, 0, 0, 0];
    const w = 100;
    const h = 28;
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const range = Math.max(1, max - min);
    return values
      .map((v, i) => {
        const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
      })
      .join(" ");
  }, [series]);

  return (
    <svg
      viewBox="0 0 72 28"
      className={cn("w-[72px] h-7 text-[#75FC96]", className)}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function MiniBarChart({ series = [], className, color = "#10B981" }) {
  const heights = useMemo(() => {
    const values = series.length ? series : [0, 0, 0, 0, 0, 0, 0];
    const max = Math.max(1, ...values);
    return values.map((v) => Math.max(v > 0 ? 18 : 8, Math.round((v / max) * 100)));
  }, [series]);

  return (
    <div
      className={cn("flex items-end gap-[3px] h-10 w-[100px]", className)}
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-[2px]"
          style={{
            height: `${h}%`,
            backgroundColor: color,
            opacity: 0.35 + (h / 100) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

export function StatChip({ label, value, visual, onClick, className }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-2xl border border-gray-200 dark:border-white/10",
        "bg-white dark:bg-zinc-900 px-4 py-3.5 shadow-sm",
        onClick &&
          "hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {label}
        </p>
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 group-hover:bg-gray-200 dark:group-hover:bg-white/15 transition-colors"
          aria-hidden
        >
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white leading-none tabular-nums">
          {value}
        </p>
        <div className="shrink-0 pb-0.5">{visual}</div>
      </div>
    </Comp>
  );
}

export default function LiveStatChips({ items = [], className, columns = 4 }) {
  const colClass =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={cn(`grid grid-cols-1 ${colClass} gap-3`, className)}>
      {items.map((item) => (
        <StatChip
          key={item.id || item.label}
          label={item.label}
          value={item.value}
          visual={item.visual}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}

export function buildDailySeries(records, days = 56, dateKeys = ["createdAt", "updatedAt"]) {
  const counts = Array.from({ length: days }, () => 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const record of records || []) {
    let raw;
    for (const key of dateKeys) {
      if (record?.[key]) {
        raw = record[key];
        break;
      }
    }
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff >= 0 && diff < days) counts[days - 1 - diff] += 1;
  }
  return counts;
}
