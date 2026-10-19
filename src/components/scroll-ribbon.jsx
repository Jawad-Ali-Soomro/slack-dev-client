import { useEffect, useRef } from "react";

const STOPS = [
  ".lp-hero-actions",
  ".lp-feature",
  ".lp-step",
  ".lp-mac",
  ".lp-auto-card",
  ".lp-stat",
  ".lp-band",
].join(",");

function anchors(root) {
  const rootBox = root.getBoundingClientRect();
  return [...root.querySelectorAll(STOPS)].map((node, index) => {
    const box = node.getBoundingClientRect();
    const fromLeft = index % 2 === 0;
    return {
      x: fromLeft
        ? box.left - rootBox.left - 14
        : box.right - rootBox.left + 14,
      y: box.top - rootBox.top + box.height * 0.55,
    };
  });
}

function stitch(points, progress) {
  if (points.length < 2) return "";
  const swing = 46 + progress * 70;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const outward = i % 2 === 0 ? swing : -swing;
    const bow = Math.sin(progress * Math.PI * 2 + i * 0.8) * 28;
    const c1x = prev.x + outward + bow;
    const c2x = next.x - outward * 0.65 - bow * 0.4;
    const span = next.y - prev.y;
    d += ` C ${c1x} ${prev.y + span * 0.28}, ${c2x} ${prev.y + span * 0.72}, ${next.x} ${next.y}`;
  }
  return d;
}

function diamonds(points, reachedY) {
  return points
    .filter((point) => point.y <= reachedY)
    .map((point) => {
      const size = 5;
      return `M ${point.x} ${point.y - size} L ${point.x + size} ${point.y} L ${point.x} ${point.y + size} L ${point.x - size} ${point.y} Z`;
    })
    .join(" ");
}

function lengthAtY(path, targetY) {
  const total = path.getTotalLength();
  let low = 0;
  let high = total;
  for (let i = 0; i < 20; i += 1) {
    const mid = (low + high) / 2;
    if (path.getPointAtLength(mid).y < targetY) low = mid;
    else high = mid;
  }
  return low;
}

function paint(svg, line, echo, knots, tip) {
  const root = svg.closest(".lp");
  if (!root) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const width = root.clientWidth;
  const height = root.scrollHeight;
  const points = anchors(root);
  if (points.length < 2 || width < 1 || height < 1) return;

  const focusY = window.innerHeight * 0.58 - root.getBoundingClientRect().top;
  const progress = Math.min(1, Math.max(0, focusY / Math.max(height, 1)));

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.height = `${height}px`;

  const d = stitch(points, reduce ? 0.35 : progress);
  line.setAttribute("d", d);
  echo.setAttribute("d", d);

  const total = line.getTotalLength();
  const drawn = reduce ? total : lengthAtY(line, focusY);
  const hide = Math.max(0, total - drawn);
  line.style.strokeDasharray = `${total}`;
  line.style.strokeDashoffset = `${hide}`;
  echo.style.strokeDasharray = `7 11 ${Math.max(total - 18, 0)}`;
  echo.style.strokeDashoffset = `${hide + progress * 24}`;

  knots.setAttribute("d", diamonds(points, focusY + 8));

  const head = line.getPointAtLength(Math.max(0, Math.min(drawn, total - 0.5)));
  const size = 6;
  tip.setAttribute(
    "d",
    `M ${head.x} ${head.y - size} L ${head.x + size} ${head.y} L ${head.x} ${head.y + size} L ${head.x - size} ${head.y} Z`,
  );
  tip.style.opacity = drawn > 12 ? "1" : "0";
}

export default function ScrollRibbon() {
  const svgRef = useRef(null);
  const lineRef = useRef(null);
  const echoRef = useRef(null);
  const knotsRef = useRef(null);
  const tipRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const svg = svgRef.current;
      const line = lineRef.current;
      const echo = echoRef.current;
      const knots = knotsRef.current;
      const tip = tipRef.current;
      if (!svg || !line || !echo || !knots || !tip) return;
      paint(svg, line, echo, knots, tip);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    draw();
    const root = svgRef.current?.closest(".lp");
    const observer = root ? new ResizeObserver(onScroll) : null;
    if (root) observer.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="lp-scroll-art" aria-hidden="true">
      <svg ref={svgRef} className="lp-scroll-svg">
        <path ref={echoRef} className="lp-scroll-line lp-scroll-line--echo" />
        <path ref={lineRef} className="lp-scroll-line" />
        <path ref={knotsRef} className="lp-scroll-knots" />
        <path ref={tipRef} className="lp-scroll-dot" />
      </svg>
    </div>
  );
}
