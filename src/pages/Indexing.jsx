import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  CheckSquare,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { IoLogInOutline } from "react-icons/io5";
import { useAuth } from "../contexts/auth-context";
import BrandLogo from "../components/brand-logo";
import UserAvatar from "../components/user-avatar";
import "./indexing.css";

const TRUST_TEAM = [
  {
    username: "Maya Chen",
    email: "maya_chen@slackdev.seed",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80",
  },
  {
    username: "Liam Okonkwo",
    email: "liam_okonkwo@slackdev.seed",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80",
  },
  {
    username: "Sofia Rossi",
    email: "sofia_rossi@slackdev.seed",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&h=96&q=80",
  },
];

const NAV = [
  { id: "home", label: "Home" },
  { id: "features", label: "Product" },
  { id: "workspace", label: "Workspace" },
  { to: "/contact", label: "Contact" },
];

const HEADLINE_WORDS = ["ships", "assigns", "aligns", "scales"];

const LIVE_COPY = [
  "Auto-assign matching frontend & backend roles",
  "8 members online across Atlas and Nova",
  "Sprint review in 12 minutes · Conference A",
  "Least-busy developer picked in realtime",
];

const STATS = [
  { target: 12, suffix: "k+", decimals: 0, label: "Tasks coordinated" },
  { target: 98, suffix: "%", decimals: 0, label: "On-time delivery" },
  { target: 24, suffix: "/7", decimals: 0, label: "Workspace availability" },
  { target: 99.9, suffix: "%", decimals: 1, label: "Workspace uptime" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Workspaces",
    body: "Invite, role, and organize people into the squads that actually ship. Owners, admins, and members stay in their lane.",
  },
  {
    icon: CheckCircle2,
    title: "Tasks",
    body: "Assign work by hand or let Auto assign pick the least-busy developer from frontend or backend in the description.",
  },
  {
    icon: FolderOpen,
    title: "Projects",
    body: "Keep repos, tasks, and people on one board so progress is visible without chasing status in chat.",
  },
  {
    icon: Calendar,
    title: "Meetings",
    body: "Schedule standups and reviews, assign an owner, and keep the calendar next to the work it is about.",
  },
  {
    icon: MessageSquare,
    title: "Chat",
    body: "Talk in context with the same members you assign. No extra tool just to ask who owns a ticket.",
  },
  {
    icon: Zap,
    title: "Automation",
    body: "Admins switch on workspace rules. Auto-assign is live — more triggers for overdue work and follow-ups are ready.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Stand up the workspace",
    body: "Create a workspace, invite friends, and set job roles — frontend, backend, fullstack — plus busy or available status.",
  },
  {
    step: "02",
    title: "Capture the work",
    body: "Spin up a task, link a GitHub repo, and describe it. Mention frontend or backend and the workspace already knows who fits.",
  },
  {
    step: "03",
    title: "Let the system assign",
    body: "One click Auto assign skips busy people and gives the ticket to the member with the lightest active load.",
  },
];

const MARQUEE = [
  "Workspaces",
  "Tasks",
  "Projects",
  "Meetings",
  "Chat",
  "Automation",
  "GitHub",
  "Availability",
  "Auto assign",
  "Roles",
];

const FLOATS = [
  {
    title: "Auto-assigned",
    body: "Maya · frontend · 2 open",
    x: "-8%",
    y: "18%",
    depth: 28,
  },
  {
    title: "Sprint review",
    body: "Today · 10:00 · Atlas",
    x: "72%",
    y: "14%",
    depth: 18,
  },
  {
    title: "Workspace Atlas",
    body: "8 online · 3 busy",
    x: "80%",
    y: "62%",
    depth: 22,
  },
];

const DASH_METRICS = [
  { label: "System Status", value: "All Systems Active" },
  { label: "Tasks This Week", value: "12" },
  { label: "Completion Rate", value: "86%" },
  { label: "Active Projects", value: "4" },
];

const LINE_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const LINE_VALUES = [8, 12, 10, 22, 18, 30, 26];

const PIE_SLICES = [
  { label: "Done", value: 46, color: "#ff914b" },
  { label: "Progress", value: 32, color: "#75fc96" },
  { label: "Pending", value: 22, color: "#d4d4d8" },
];

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx, cy, r, rInner, startAngle, endAngle) {
  const gap = 3;
  const a0 = startAngle + gap / 2;
  const a1 = endAngle - gap / 2;
  const large = a1 - a0 > 180 ? 1 : 0;
  const p1 = polarToCartesian(cx, cy, r, a0);
  const p2 = polarToCartesian(cx, cy, r, a1);
  const p3 = polarToCartesian(cx, cy, rInner, a1);
  const p4 = polarToCartesian(cx, cy, rInner, a0);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

function LpLineChart() {
  const w = 320;
  const h = 128;
  const padX = 10;
  const padY = 18;
  const max = 36;
  const peak = LINE_VALUES.indexOf(Math.max(...LINE_VALUES));
  const pts = LINE_VALUES.map((v, i) => {
    const x = padX + (i * (w - padX * 2)) / (LINE_VALUES.length - 1);
    const y = h - padY - (v / max) * (h - padY * 2);
    return { x, y, v };
  });
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${pts[0].x},${h - padY} ${pts.map((p) => `L ${p.x},${p.y}`).join(" ")} L ${pts[pts.length - 1].x},${h - padY} Z`;

  return (
    <div className="lp-chart-card">
      <div className="lp-chart-head">
        <small>Weekly activity</small>
        <span>
          <TrendingUp size={12} />
          +18%
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="lp-line-svg" aria-hidden="true">
        <defs>
          <linearGradient id="lpLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff914b" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#ff914b" stopOpacity="0" />
          </linearGradient>
          <filter id="lpLineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={w - padX}
            y1={padY + t * (h - padY * 2)}
            y2={padY + t * (h - padY * 2)}
            stroke="rgba(0,0,0,0.06)"
          />
        ))}
        <line
          x1={pts[peak].x}
          x2={pts[peak].x}
          y1={padY}
          y2={h - padY}
          stroke="rgba(255,145,75,0.22)"
          strokeDasharray="3 4"
        />
        <path d={area} fill="url(#lpLineFill)" className="lp-line-area" />
        <polyline
          className="lp-line-path"
          points={line}
          fill="none"
          stroke="#ff914b"
          strokeWidth="2.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#lpLineGlow)"
        />
        {pts.map((p, i) => (
          <circle
            key={p.x}
            cx={p.x}
            cy={p.y}
            r={i === peak ? 4.4 : 3.2}
            fill="#fff"
            stroke="#ff914b"
            strokeWidth="2"
          />
        ))}
        <text
          x={pts[peak].x}
          y={pts[peak].y - 10}
          textAnchor="middle"
          fill="#ff914b"
          fontSize="9"
          fontWeight="800"
        >
          {pts[peak].v}
        </text>
      </svg>
      <div className="lp-line-days">
        {LINE_DAYS.map((d, i) => (
          <span key={d} className={i === peak ? "is-peak" : undefined}>
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

function LpPieChart() {
  const cx = 48;
  const cy = 48;
  const r = 40;
  const rInner = 24;
  let angle = 0;
  const slices = PIE_SLICES.map((slice) => {
    const start = angle;
    const end = angle + (slice.value / 100) * 360;
    angle = end;
    return { ...slice, d: donutSlicePath(cx, cy, r, rInner, start, end) };
  });

  return (
    <div className="lp-chart-card lp-pie-card">
      <div className="lp-chart-head">
        <small>Task mix</small>
        <span className="lp-chart-meta">This week</span>
      </div>
      <div className="lp-pie-wrap">
        <svg viewBox="0 0 96 96" className="lp-pie-svg" aria-hidden="true">
          <circle cx={cx} cy={cy} r={r} fill="#f7f7f8" />
          {slices.map((slice) => (
            <path key={slice.label} d={slice.d} fill={slice.color} />
          ))}
          <circle cx={cx} cy={cy} r={rInner - 1} fill="#fff" />
          <text
            x={cx}
            y={cy - 1}
            textAnchor="middle"
            fill="#111"
            fontSize="14"
            fontWeight="800"
          >
            24
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="7"
            fontWeight="700"
          >
            tasks
          </text>
        </svg>
        <ul>
          {PIE_SLICES.map((slice) => (
            <li key={slice.label}>
              <i style={{ background: slice.color }} />
              {slice.label}
              <em>{slice.value}%</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useRotator(words, interval = 2400) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("in");
  const reduce = useRef(prefersReducedMotion());

  useEffect(() => {
    if (reduce.current || words.length < 2) return undefined;
    let timeout;
    const id = setInterval(() => {
      setPhase("out");
      timeout = window.setTimeout(() => {
        setIndex((n) => (n + 1) % words.length);
        setPhase("in");
      }, 280);
    }, interval);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, [words, interval]);

  return { word: words[index], phase };
}

function formatStat(value, decimals) {
  return decimals ? value.toFixed(decimals) : String(Math.floor(value));
}

const Indexing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [statValues, setStatValues] = useState(STATS.map(() => "0"));
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const statsRef = useRef(null);
  const counted = useRef(false);
  const reduce = useRef(prefersReducedMotion());

  const headline = useRotator(HEADLINE_WORDS, 2600);
  const live = useRotator(LIVE_COPY, 3200);

  const { scrollY } = useScroll();
  const gridY = useTransform(scrollY, [0, 1600], [0, reduce.current ? 0 : 160]);
  const orb1Y = useTransform(scrollY, [0, 1600], [0, reduce.current ? 0 : 240]);
  const orb2Y = useTransform(scrollY, [0, 1600], [0, reduce.current ? 0 : -180]);
  const orb3Y = useTransform(scrollY, [0, 1600], [0, reduce.current ? 0 : 140]);
  const heroShift = useTransform(scrollY, [0, 700], [0, reduce.current ? 0 : 36]);

  useEffect(() => {
    document.title = "Slack Dev — Workspace";
    document.documentElement.classList.add("lp-lock");
    document.body.classList.add("lp-lock");
    return () => {
      document.documentElement.classList.remove("lp-lock");
      document.body.classList.remove("lp-lock");
      document.body.classList.remove("menu-open");
    };
  }, []);

  useEffect(() => {
    const id = location.hash?.replace("#", "");
    if (!id) return undefined;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduce.current ? "auto" : "smooth",
        block: "start",
      });
    }, 80);
    return () => clearTimeout(t);
  }, [location.hash]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    document.body.classList.add("menu-open");
  }, []);

  const toggleMenu = () => {
    if (menuOpen) closeMenu();
    else openMenu();
  };

  const goSection = (id) => {
    closeMenu();
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: reduce.current ? "auto" : "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce.current ? "auto" : "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const onResize = () => {
      if (window.innerWidth > 720) closeMenu();
    };
    const onScroll = () => setStuck(window.scrollY > 24);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [closeMenu]);

  useEffect(() => {
    const root = statsRef.current;
    if (!root) return undefined;

    const run = () => {
      if (counted.current) return;
      counted.current = true;
      STATS.forEach((stat, i) => {
        const duration = 1500 + i * 80;
        const delay = 180 + i * 90;
        window.setTimeout(() => {
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const value = stat.target * easeOutCubic(t);
            setStatValues((prev) => {
              const next = [...prev];
              next[i] = formatStat(value, stat.decimals);
              return next;
            });
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, delay);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) run();
      },
      { threshold: 0.5 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const onPointerMove = (e) => {
    if (reduce.current) return;
    const { innerWidth, innerHeight } = window;
    setMouse({
      x: (e.clientX / innerWidth - 0.5) * 2,
      y: (e.clientY / innerHeight - 0.5) * 2,
    });
  };

  const goAuth = () => {
    closeMenu();
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  const renderNavLink = (item, extra = "") => {
    if (item.to) {
      return (
        <Link
          key={item.label}
          to={item.to}
          className={extra}
          onClick={closeMenu}
        >
          <span className="uppercase text-[12px] font-bold">{item.label}</span>
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        className={extra}
        onClick={() => goSection(item.id)}
      >
        <span className="uppercase text-[12px] font-bold">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="lp landing-page" onMouseMove={onPointerMove}>
      <div className="lp-bg" aria-hidden="true">
        <motion.div className="landing-grid lp-grid" style={{ y: gridY }} />
        <motion.div
          className="landing-orb landing-orb-1 lp-orb"
          style={{ y: orb1Y, x: mouse.x * 36 }}
        />
        <motion.div
          className="landing-orb landing-orb-2 lp-orb"
          style={{ y: orb2Y, x: mouse.x * -28 }}
        />
        <motion.div
          className="landing-orb landing-orb-3 lp-orb"
          style={{ y: orb3Y, x: mouse.y * 22 }}
        />
      </div>

      <div className="lp-page">
        <div
          className="lp-overlay"
          hidden={!menuOpen}
          onClick={closeMenu}
          aria-hidden="true"
        />
        

        <header className={`flex justify-between items-center w-[calc(100%-35%)] fixed top-5 left-1/2 -translate-x-1/2 z-10 `}>
         <div className="flex gap-2 items-center">
         <button
            type="button"
            className="lp-logo-btn"
            onClick={() => goSection("home")}
            aria-label="Home"
          >
            <BrandLogo size={46} />
          </button>
          <h1 className="text-2xl font-bold">Slack Developers</h1>
         </div>

         

         <div className="flex bg-black h-[50px] px-1 pr-8 rounded-full text-white items-center gap-2"  onClick={goAuth}>
         <button
            type="button"
            className="rounded-full p-2 bg-white text-black flex items-center justify-center"
           
            aria-label={isAuthenticated ? "Dashboard" : "Sign in"}
          >
            {isAuthenticated ? (
              <LayoutDashboard size={20} />
            ) : (
              <IoLogInOutline size={22} />
            )}
          </button>
          <span>
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </span>
         </div>

          <button
            type="button"
            className={`lp-burger${menuOpen ? " is-open" : ""}`}
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <section className="lp-hero" id="home">
          {FLOATS.map((card) => (
            <motion.aside
              key={card.title}
              className="lp-float text-center"
              style={{
                left: card.x,
                top: card.y,
                x: mouse.x * card.depth,
                y: mouse.y * (card.depth * 0.7),
              }}
              aria-hidden="true"
            >
              <span className="lp-float-kicker">{card.title}</span>
              <span className="lp-float-body">{card.body}</span>
            </motion.aside>
          ))}

          <motion.div className="lp-hero-inner" style={{ y: heroShift }}>
            <div className="lp-badge anim" style={{ "--d": "0.02s" }}>
              <Sparkles size={11} />
              Developer Platform
            </div>

            <div className="lp-trust anim" style={{ "--d": "0.05s" }}>
              {TRUST_TEAM.map((person, index) => (
                <span
                  key={person.username}
                  className={`lp-avatar lp-a${index + 1}`}
                >
                  <span className="lp-avatar-face">
                    <UserAvatar
                      user={person}
                      size="sm"
                      ring={false}
                      className="h-full w-full"
                    />
                  </span>
                </span>
              ))}
              <span className="lp-trust-pill">Built for product &amp; engineering teams</span>
            </div>

            <div className="lp-live anim" style={{ "--d": "0.1s" }}>
              <span className="lp-live-dot" />
              <span className="lp-live-label">Live</span>
              <span className={`lp-live-copy lp-rotator is-${live.phase}`}>
                {live.word}
              </span>
            </div>

            <h1 className="lp-headline">
              <span className="lp-line lp-line-1">Teamwork that</span>
              <span className="lp-line lp-line-2">
                <span className={`lp-rotator text-stroke is-${headline.phase}`}>
                  {headline.word}
                </span>{" "}
                together.
              </span>
            </h1>

            <p className="lp-sub anim" style={{ "--d": "0.28s" }}>
              One place for workspaces, tasks, projects, meetings, and chat —
              with automations that assign work to the least busy developer.
            </p>

            <div className="lp-hero-actions anim" style={{ "--d": "0.4s" }}>
              <button
                type="button"
                className="lp-cta"
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/signup")
                }
              >
                Get Started
              </button>
              <button
                type="button"
                className="lp-cta-ghost"
                onClick={() => goSection("features")}
              >
                See the workspace
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </section>

        <div className="lp-marquee" aria-hidden="true">
          <div className="lp-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={`${item}-${i}`}>
                {item}
                <span className="lp-marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        <section className="lp-section" id="features">
          <motion.div
            className="lp-section-head"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="lp-kicker">The system</p>
            <h2>Everything a workspace needs to move work, not status updates.</h2>
            <p>
              Slack Dev is a workspace OS: people, tickets, repos, calendars, and
              automation in the same place — so assigning work is a decision,
              not a scavenger hunt.
            </p>
          </motion.div>

          <div className="lp-feature-grid">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  className="lp-feature"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: reduce.current ? 0 : -6 }}
                >
                  <span className="lp-feature-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="lp-section lp-section--steps">
          <motion.div
            className="lp-section-head"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="lp-kicker">How it runs</p>
            <h2>From invite to auto-assign in three moves.</h2>
          </motion.div>

          <div className="lp-steps">
            {STEPS.map((item, i) => (
              <motion.article
                key={item.step}
                className="lp-step"
                initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="lp-step-num">{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="lp-section" id="workspace">
          <motion.div
            className="lp-section-head"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="lp-kicker">Inside the workspace</p>
            <h2>See load, role, and status before you hand off a task.</h2>
          </motion.div>

          <motion.div
            className="lp-mac"
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              rotateX: reduce.current ? 0 : mouse.y * -5,
              rotateY: reduce.current ? 0 : mouse.x * 7,
            }}
          >
            <div className="lp-mac-window">
              <div className="lp-mac-bar">
                <div className="lp-mac-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="lp-mac-title">
                  <LayoutDashboard size={12} />
                  Slack Dev — Dashboard
                </div>
              </div>

              <div className="lp-mock">
                <aside className="lp-dash-rail" aria-hidden="true">
                  <span className="is-on">
                    <LayoutDashboard size={16} />
                  </span>
                  <span>
                    <CheckCircle2 size={16} />
                  </span>
                  <span>
                    <Calendar size={16} />
                  </span>
                  <span>
                    <FolderOpen size={16} />
                  </span>
                  <span>
                    <Users size={16} />
                  </span>
                  <span>
                    <Zap size={16} />
                  </span>
                </aside>

                <div className="lp-dash-main">
                  <div className="lp-dash-top">
                    <div>
                      <h3>Dashboard</h3>
                      <p>Welcome back, Maya</p>
                    </div>
                    <div className="lp-dash-tools">
                      <Search size={16} />
                      <span className="lp-dash-bell">
                        <Bell size={16} />
                        <i />
                      </span>
                      <b>M</b>
                    </div>
                  </div>

                  <div className="lp-dash-metrics">
                    {DASH_METRICS.map((item) => (
                      <div key={item.label}>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="lp-dash-grid">
                    <LpLineChart />
                    <LpPieChart />
                    <div className="lp-spotlight-stack">
                      <article className="lp-spotlight">
                        <div className="lp-spotlight-head">
                          <span>Task</span>
                          <MoreHorizontal size={16} />
                        </div>
                        <h4>This Is Also New Task!</h4>
                        <p>Due: 11 Aug · 01:00 am · In progress</p>
                        <button type="button" tabIndex={-1}>
                          <CheckSquare size={16} />
                          View Task
                        </button>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lp-mac-base" aria-hidden="true" />
          </motion.div>
        </section>

        <section className="lp-section lp-auto">
          <motion.div
            className="lp-auto-card"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="lp-kicker">
              <GitBranch className="h-3.5 w-3.5" />
              Automation
            </span>
            <h2>Admins turn it on. The workspace picks who is free.</h2>
            <p>
              Enable Auto-assign and a button appears next to Assign to. It
              reads frontend / backend in the description, skips anyone marked
              busy, and hands the task to the member with the fewest open
              tickets.
            </p>
            <ul>
              <li>Role match from the write-up</li>
              <li>Busy status respected</li>
              <li>Least active load wins</li>
            </ul>
          </motion.div>
        </section>

        <div className="lp-stats" ref={statsRef}>
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="lp-stat anim"
              style={{ "--d": `${0.05 + i * 0.08}s` }}
            >
              <span className="lp-stat-value">
                {statValues[i]}
                {stat.suffix}
              </span>
              <span className="lp-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <section className="lp-band">
          <h2>Put everyone in one workspace.</h2>
          <p>Sign up and start assigning work that already knows who can take it.</p>
          <button
            type="button"
            className="lp-cta"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
          >
            Get Started
          </button>
        </section>

        <footer className="lp-foot">
          <div className="lp-foot-brand">
            <BrandLogo size={36} />
            <span>Slack Dev</span>
          </div>
          <div className="lp-foot-links">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <button type="button" onClick={() => goSection("features")}>
              Product
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Indexing;
