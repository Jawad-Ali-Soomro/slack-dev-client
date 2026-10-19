import { useEffect, useRef, useState } from "react";

const DEFAULT_VIEWPORT = 630;

export function useWindowedRows({
  count,
  scrollRef,
  estimatedRowHeight = 73,
  overscan = 8,
}) {
  const [rowHeight, setRowHeight] = useState(estimatedRowHeight);
  const [range, setRange] = useState({ start: 0, end: 0 });
  const measured = useRef(false);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el || measured.current || count <= 0) return;
    const row = el.querySelector("tbody tr:not([aria-hidden='true'])");
    if (!row) return;
    const next = Math.round(row.getBoundingClientRect().height);
    if (next <= 0) return;
    measured.current = true;
    setRowHeight((prev) => (prev === next ? prev : next));
  }, [count, scrollRef]);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el || count <= 0) {
      setRange((prev) =>
        prev.start === 0 && prev.end === 0 ? prev : { start: 0, end: 0 },
      );
      return undefined;
    }

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewport = el.clientHeight || DEFAULT_VIEWPORT;
        const start = Math.max(
          0,
          Math.floor(el.scrollTop / rowHeight) - overscan,
        );
        const end = Math.min(
          count,
          Math.ceil((el.scrollTop + viewport) / rowHeight) + overscan,
        );
        setRange((prev) =>
          prev.start === start && prev.end === end ? prev : { start, end },
        );
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [count, overscan, rowHeight, scrollRef]);

  const pending = count > 0 && range.end === 0;
  const start = pending ? 0 : Math.min(range.start, Math.max(0, count));
  const end = pending
    ? Math.min(count, Math.ceil(DEFAULT_VIEWPORT / rowHeight) + overscan)
    : Math.min(count, Math.max(range.end, start));

  return {
    start,
    end,
    paddingTop: start * rowHeight,
    paddingBottom: Math.max(0, count - end) * rowHeight,
  };
}

export function TableWindowSpacer({ height, colSpan }) {
  if (!height) return null;
  return (
    <tr aria-hidden="true" style={{ height }}>
      <td
        colSpan={colSpan}
        style={{ height, padding: 0, border: 0, lineHeight: 0 }}
      />
    </tr>
  );
}
