import { useEffect } from "react";

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  '[role="button"]',
  '[data-slot="button"]',
  '[data-slot="dropdown-menu-item"]',
  '[data-slot="dropdown-menu-checkbox-item"]',
  '[data-slot="dropdown-menu-radio-item"]',
  '[data-slot="dropdown-menu-sub-trigger"]',
  '[data-slot="dropdown-menu-trigger"]',
  '[data-slot="tabs-trigger"]',
  '[data-slot="select-trigger"]',
  '[data-slot="select-item"]',
  '[data-slot="checkbox"]',
  '[data-slot="popover-trigger"]',
  "[data-slot$='-trigger']",
  "summary",
  ".cursor-pointer",
].join(",");

const SKIP_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "OPTION", "HTML", "BODY"]);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDisabled(el) {
  return (
    el.disabled ||
    el.getAttribute("aria-disabled") === "true" ||
    el.getAttribute("data-disabled") === "" ||
    el.getAttribute("data-disabled") === "true" ||
    el.hasAttribute("disabled")
  );
}

function shouldSkip(el) {
  if (!el || SKIP_TAGS.has(el.tagName)) return true;
  if (el.dataset.noRipple != null) return true;
  if (el.closest("[data-no-ripple]")) return true;
  if (isDisabled(el)) return true;

  const rect = el.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return true;
  if (
    rect.width > window.innerWidth * 0.85 &&
    rect.height > window.innerHeight * 0.85
  ) {
    return true;
  }

  return false;
}

function spawnRipple(host, clientX, clientY) {
  const rect = host.getBoundingClientRect();
  const styles = getComputedStyle(host);
  const originX =
    (Number.isFinite(clientX) ? clientX : rect.left + rect.width / 2) - rect.left;
  const originY =
    (Number.isFinite(clientY) ? clientY : rect.top + rect.height / 2) - rect.top;

  const overlay = document.createElement("span");
  overlay.className = "mui-ripple-overlay";
  overlay.style.cssText = [
    `left:${rect.left}px`,
    `top:${rect.top}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    "border-radius:15px",
  ].join(";");

  const wave = document.createElement("span");
  wave.className = "mui-ripple-wave";
  wave.style.cssText = [
    "width:100%",
    "height:100%",
    "left:0",
    "top:0",
    `background-color:${styles.color}`,
    "border-radius:15px",
    `transform-origin:${originX}px ${originY}px`,
  ].join(";");

  overlay.appendChild(wave);
  document.body.appendChild(overlay);

  const cleanup = () => overlay.remove();
  wave.addEventListener("animationend", cleanup, { once: true });
  window.setTimeout(cleanup, 700);
}

function findHost(eventTarget) {
  if (!(eventTarget instanceof Element)) {
    const node = eventTarget?.parentElement;
    if (!node) return null;
    return node.closest(INTERACTIVE_SELECTOR);
  }
  return eventTarget.closest(INTERACTIVE_SELECTOR);
}

export function GlobalRipple() {
  useEffect(() => {
    const onPointerDown = (event) => {
      if (event.button !== 0 || prefersReducedMotion()) return;
      const host = findHost(event.target);
      if (!host || shouldSkip(host)) return;
      spawnRipple(host, event.clientX, event.clientY);
    };

    const onKeyDown = (event) => {
      if (event.repeat || prefersReducedMotion()) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const host = findHost(event.target);
      if (!host || shouldSkip(host)) return;
      const rect = host.getBoundingClientRect();
      spawnRipple(host, rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
