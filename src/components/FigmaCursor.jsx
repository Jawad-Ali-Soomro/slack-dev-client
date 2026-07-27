import { useEffect, useRef, useState } from "react";

/**
 * A Figma-style custom cursor used site-wide.
 * - Hides the native cursor and renders its own arrow that follows the mouse.
 * - Switches to a "pointer" state over interactive elements and an
 *   "I-beam" state over text inputs (mirroring Figma's behaviour).
 * - Disabled on touch / coarse-pointer devices (keeps the native cursor).
 *
 * Position updates are written straight to the DOM via requestAnimationFrame
 * (no React re-render per mouse move); React state only tracks the discrete
 * variant + pressed/hidden flags which change infrequently.
 */

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [role="link"], [role="tab"], [role="menuitem"], ' +
  'label, summary, select, [data-cursor="pointer"], .cursor-pointer';

const TEXT_SELECTOR =
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), ' +
  'textarea, [contenteditable="true"], [contenteditable=""]';

const FigmaCursor = () => {
  const dotRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);
  const variantRef = useRef("default");
  const hiddenRef = useRef(true);

  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState("default");
  const [pressed, setPressed] = useState(false);
  const [hidden, setHidden] = useState(true);

  // Only enable on devices with a fine pointer (mouse/trackpad).
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("figma-cursor-active");

    const render = () => {
      rafId.current = null;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
    };

    const schedule = () => {
      if (rafId.current == null) rafId.current = requestAnimationFrame(render);
    };

    const resolveVariant = (target) => {
      if (!target || typeof target.closest !== "function") return "default";
      if (target.closest(TEXT_SELECTOR)) return "text";
      if (target.closest(INTERACTIVE_SELECTOR)) return "pointer";
      return "default";
    };

    const showCursor = () => {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setHidden(false);
      }
    };
    const hideCursor = () => {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setHidden(true);
      }
    };

    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      showCursor();
      schedule();

      const next = resolveVariant(e.target);
      if (next !== variantRef.current) {
        variantRef.current = next;
        setVariant(next);
      }
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleLeave = () => hideCursor();
    const handleEnter = () => showCursor();

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      document.documentElement.classList.remove("figma-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  const scale = pressed ? 0.82 : variant === "pointer" ? 1.08 : 1;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="figma-cursor-root"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      <div
        className="figma-cursor-inner"
        data-variant={variant}
        style={{ transform: `scale(${scale})` }}
      >
        {variant === "text" ? (
          <span className="figma-cursor-beam" />
        ) : (
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 2.8L4 20.6L17.8 12.8Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default FigmaCursor;
