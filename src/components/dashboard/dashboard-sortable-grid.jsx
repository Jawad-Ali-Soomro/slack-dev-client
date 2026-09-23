import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";

export const DASHBOARD_LAYOUT_KEY = "dashboard-widget-order-v6";
export const DASHBOARD_SIZES_KEY = "dashboard-widget-sizes-v6";

export const DEFAULT_WIDGET_ORDER = [
  "overview",
  "taskStats",
  "meeting",
  "taskList",
  "meetingStatus",
  "projects",
  "github",
  "calendar",
  "team",
];

export const DEFAULT_WIDGET_SIZES = {
  overview: { cols: 5, height: null },
  taskStats: { cols: 4, height: null },
  meeting: { cols: 3, height: null },
  taskList: { cols: 6, height: null },
  meetingStatus: { cols: 6, height: null },
  projects: { cols: 3, height: null },
  github: { cols: 4, height: null },
  team: { cols: 12, height: null },
  calendar: { cols: 5, height: null },
};

const MIN_COLS = 3;
const MAX_COLS = 12;
const MIN_H = 180;
const MAX_H = 1200;

const COL_SPAN_CLASS = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

export function spanClassForCols(cols) {
  const n = Math.min(MAX_COLS, Math.max(MIN_COLS, Number(cols) || 4));
  return COL_SPAN_CLASS[n] || "lg:col-span-4";
}

/** @deprecated */
export const WIDGET_SPANS = Object.fromEntries(
  Object.entries(DEFAULT_WIDGET_SIZES).map(([id, s]) => [
    id,
    spanClassForCols(s.cols),
  ]),
);

function loadOrder() {
  try {
    const raw = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
    if (!raw) return [...DEFAULT_WIDGET_ORDER];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_WIDGET_ORDER];
    const valid = parsed.filter((id) => DEFAULT_WIDGET_ORDER.includes(id));
    const missing = DEFAULT_WIDGET_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return [...DEFAULT_WIDGET_ORDER];
  }
}

function normalizeSize(id, s) {
  const fallback = DEFAULT_WIDGET_SIZES[id] || { cols: 4, height: null };

  let cols = Number(s?.cols);
  if (!Number.isFinite(cols) && Number.isFinite(Number(s?.widthPct))) {
    cols = Math.round((Number(s.widthPct) / 100) * 12);
  }
  if (!Number.isFinite(cols)) cols = fallback.cols;
  cols = Math.min(MAX_COLS, Math.max(MIN_COLS, cols));

  const rawH = s?.height;
  const isAuto =
    rawH === null ||
    rawH === undefined ||
    rawH === "auto" ||
    s?.autoHeight === true;
  let height = null;
  if (!isAuto) {
    const n = Number(rawH ?? s?.minH);
    if (Number.isFinite(n)) height = Math.min(MAX_H, Math.max(MIN_H, n));
  }

  return { cols, height };
}

function loadSizes() {
  try {
    const next = {};
    for (const id of DEFAULT_WIDGET_ORDER) {
      next[id] = { ...DEFAULT_WIDGET_SIZES[id] };
    }
    const raw = localStorage.getItem(DASHBOARD_SIZES_KEY);
    if (!raw) return next;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return next;
    for (const id of DEFAULT_WIDGET_ORDER) {
      if (parsed[id]) next[id] = normalizeSize(id, parsed[id]);
    }
    return next;
  } catch {
    return Object.fromEntries(
      DEFAULT_WIDGET_ORDER.map((id) => [id, { ...DEFAULT_WIDGET_SIZES[id] }]),
    );
  }
}

export function useDashboardLayout() {
  const [order, setOrder] = useState(loadOrder);
  const [sizes, setSizes] = useState(loadSizes);

  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(order));
    } catch {
      /* ignore */
    }
  }, [order]);

  useEffect(() => {
    try {
      localStorage.setItem(DASHBOARD_SIZES_KEY, JSON.stringify(sizes));
    } catch {
      /* ignore */
    }
  }, [sizes]);

  const moveWidget = useCallback((fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(fromId);
      const toIndex = next.indexOf(toId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, fromId);
      return next;
    });
  }, []);

  const setWidgetSize = useCallback((id, patch) => {
    setSizes((prev) => {
      const cur = normalizeSize(id, prev[id]);
      return {
        ...prev,
        [id]: normalizeSize(id, { ...cur, ...patch }),
      };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setOrder([...DEFAULT_WIDGET_ORDER]);
    setSizes(
      Object.fromEntries(
        DEFAULT_WIDGET_ORDER.map((id) => [id, { ...DEFAULT_WIDGET_SIZES[id] }]),
      ),
    );
  }, []);

  return {
    order,
    sizes,
    moveWidget,
    setWidgetSize,
    resetLayout,
  };
}

/**
 * Grid tile: fills column span, hugs content height by default (no scrollbar).
 * Drag edges/corner to resize; shrinking below content enables scroll.
 */
export function SortableWidget({
  id,
  children,
  onMove,
  order,
  cols = 4,
  height = null,
  onSetSize,
  className,
}) {
  const panelRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState(false);
  const resizeSession = useRef(null);
  const isFixedHeight = height != null && Number.isFinite(Number(height));

  useEffect(() => {
    const onPtrMove = (e) => {
      const session = resizeSession.current;
      if (!session || !panelRef.current) return;
      const board = panelRef.current.closest("[data-dashboard-board]");
      const boardW = board?.clientWidth || 1;
      const dx = e.clientX - session.startX;
      const dy = e.clientY - session.startY;

      const patch = {};
      if (session.mode === "se" || session.mode === "e") {
        const colW = boardW / 12;
        const nextCols = Math.round(session.startCols + dx / colW);
        patch.cols = nextCols;
      }
      if (session.mode === "se" || session.mode === "s") {
        patch.height = session.startH + dy;
      }
      onSetSize?.(id, patch);
    };

    const onPtrUp = () => {
      if (!resizeSession.current) return;
      resizeSession.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onPtrMove);
    window.addEventListener("pointerup", onPtrUp);
    window.addEventListener("pointercancel", onPtrUp);
    return () => {
      window.removeEventListener("pointermove", onPtrMove);
      window.removeEventListener("pointerup", onPtrUp);
      window.removeEventListener("pointercancel", onPtrUp);
    };
  }, [id, onSetSize]);

  const startResize = (mode, e) => {
    e.preventDefault();
    e.stopPropagation();
    const measured =
      panelRef.current?.getBoundingClientRect()?.height || MIN_H;
    resizeSession.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startCols: cols,
      startH: isFixedHeight ? Number(height) : measured,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      mode === "e" ? "ew-resize" : mode === "s" ? "ns-resize" : "nwse-resize";
  };

  return (
    <div
      ref={panelRef}
      data-widget-id={id}
      className={cn(
        "group/panel relative min-w-0 col-span-1 transition-[opacity,box-shadow] duration-150",
        spanClassForCols(cols),
        dragging && "opacity-50",
        over && "ring-2 ring-[var(--theme-accent)] ring-offset-2 rounded-[20px]",
        className,
      )}
      style={{
        order: order ?? 0,
        height: isFixedHeight ? height : "auto",
      }}
      draggable
      onDragStart={(e) => {
        if (resizeSession.current) {
          e.preventDefault();
          return;
        }
        const t = e.target;
        if (
          t?.closest?.("[data-resize-handle]") ||
          t?.closest?.("[data-swiper]") ||
          t?.closest?.("button, a, input, textarea, select")
        ) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("text/widget-id", id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => {
        setDragging(false);
        setOver(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const fromId = e.dataTransfer.getData("text/widget-id");
        onMove?.(fromId, id);
      }}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        title="Drag to move"
        className="absolute top-3 left-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-400 shadow-sm hover:text-[var(--theme-accent)] dark:border-white/10 dark:bg-zinc-900 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div
        className={cn(
          "w-full pt-1 pl-8 pr-2 pb-3",
          isFixedHeight ? "h-full min-h-0 overflow-hidden" : "h-auto overflow-visible",
        )}
      >
        <div
          className={cn(
            "w-full",
            isFixedHeight
              ? "h-full min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]"
              : "h-auto overflow-visible",
          )}
        >
          {children}
        </div>
      </div>

      <div
        data-resize-handle
        className="absolute right-0 top-2 bottom-2 z-20 w-2 cursor-ew-resize"
        onPointerDown={(e) => startResize("e", e)}
        title="Drag to resize width"
      />
      <div
        data-resize-handle
        className="absolute left-2 right-2 bottom-0 z-20 h-2 cursor-ns-resize"
        onPointerDown={(e) => startResize("s", e)}
        title="Drag to resize height"
      />
      <div
        data-resize-handle
        className="absolute bottom-0.5 right-0.5 z-20 flex h-4 w-4 cursor-nwse-resize items-end justify-end opacity-40 hover:opacity-100"
        onPointerDown={(e) => startResize("se", e)}
        title="Drag to resize"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-gray-400">
          <path
            d="M6 14h8M10 10h4M13 6h1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

export function DashboardLayoutReset({ onReset }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[var(--theme-accent)] transition-colors"
      title="Reset dashboard layout & sizes"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      Reset layout
    </button>
  );
}
