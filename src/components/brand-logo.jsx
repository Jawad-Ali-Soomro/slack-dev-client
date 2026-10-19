import "./brand-logo.css";

export default function BrandLogo({
  size = 46,
  className = "",
  animated = true,
  title = "Slack Dev",
}) {
  const cls = [
    "brand-logo",
    animated ? "brand-logo--animated" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={cls}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="brand-logo__ring brand-logo__ring--outer" cx="32" cy="32" r="26" />
        <circle className="brand-logo__ring brand-logo__ring--mid" cx="32" cy="32" r="17" />

        <g className="brand-logo__orbit">
          <circle cx="32" cy="6" r="2.4" fill="#111" />
          <circle cx="54.6" cy="21" r="2.1" fill="#111" />
          <circle cx="50.2" cy="48.6" r="2.1" fill="#111" />
          <circle cx="13.8" cy="48.6" r="2.1" fill="#111" />
          <circle cx="9.4" cy="21" r="2.1" fill="#111" />
        </g>

        <g className="brand-logo__core">
          <path
            className="brand-logo__links"
            d="M32 20 L44 40 H20 Z"
            stroke="#111"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="20" r="3.2" fill="#111" />
          <circle cx="44" cy="40" r="3.2" fill="#111" />
          <circle cx="20" cy="40" r="3.2" fill="#111" />
          <circle className="brand-logo__pulse" cx="32" cy="32" r="4.4" fill="#111" />
        </g>
      </svg>
    </span>
  );
}
