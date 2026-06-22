import React, { useRef } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import {
  RocketIcon,
  LayoutDashboard,
  Lock,
  Lightbulb,
  ToolCase,
  ArrowRight,
  Zap,
  Users,
  GitBranch,
  CheckCircle2,
  Sparkles,
} from "lucide-react"
import { PiUsersDuotone } from "react-icons/pi"
import { useNavigate } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const HERO_WORDS = ["Professional", "Developer", "Leader"]
const CTA_WORDS = ["Started", "Connected", "Developed"]

const FEATURES = [
  {
    icon: <RocketIcon size={22} />,
    title: "Fast Deployment",
    description:
      "Deploy projects in seconds with one-click pipelines and automated CI/CD workflows.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: <PiUsersDuotone size={24} />,
    title: "Team Collaboration",
    description:
      "Real-time collaboration, shared workspaces, and seamless team communication.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop",
    span: "col-span-1",
  },
  {
    icon: <Lock size={22} />,
    title: "Enterprise Security",
    description:
      "Enterprise-grade encryption, role-based access, and compliance built in.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&h=1080&fit=crop",
    span: "col-span-1",
  },
  {
    icon: <LayoutDashboard size={22} />,
    title: "Analytics & Insights",
    description:
      "Comprehensive dashboards with actionable metrics for every project.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop",
    span: "col-span-2",
  },
  
  {
    icon: <Lightbulb size={22} />,
    title: "Lightning Fast",
    description:
      "Optimized performance with advanced caching and global CDN delivery.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=1080&fit=crop",
    span: "col-span-1 md:col-span-2",
  },
  {
    icon: <ToolCase size={22} />,
    title: "Developer Tools",
    description:
      "Full suite of dev tools and integrations with your favorite services.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop",
    span: "col-span-1",
  },
]

const STATS = [
  { value: 50, suffix: "K+", label: "Active Developers" },
  { value: 100, suffix: "K+", label: "Projects Deployed" },
  { value: 99.9, suffix: "%", label: "Uptime Guarantee", decimals: 1 },
  { value: 24, suffix: "/7", label: "Support Available" },
]

const TESTIMONIALS = [
  {
    quote:
      "This platform transformed how we manage our projects. The deployment process is so smooth!",
    author: "Sarah Chen",
    role: "Senior Developer at TechCorp",
    avatar:
      "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=500&auto=format&fit=crop&q=60",
  },
  {
    quote:
      "Incredible tool for team collaboration. Our productivity increased by 300% since switching.",
    author: "Mike Rodriguez",
    role: "Lead Engineer at Startup",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote:
      "The best developer experience I've ever had. Everything just works out of the box.",
    author: "Alex Johnson",
    role: "Freelance Developer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
]

const STEPS = [
  {
    step: "01",
    title: "Register Account",
    description:
      "Create your account in seconds and get instant access to all features.",
    icon: <Zap size={20} />,
  },
  {
    step: "02",
    title: "Connect Workflow",
    description:
      "Link your repositories and invite your team members to start collaborating.",
    icon: <GitBranch size={20} />,
  },
  {
    step: "03",
    title: "Ship Projects",
    description:
      "Push your code and watch it deploy automatically with zero configuration.",
    icon: <RocketIcon size={20} />,
  },
]

function useWordRotator(ref, words) {
  useGSAP(
    () => {
      if (!ref.current || words.length === 0) return
      const el = ref.current
      let index = 0
      el.textContent = words[0]

      const rotate = () => {
        const nextIndex = (index + 1) % words.length
        gsap
          .timeline({
            onComplete: () => {
              index = nextIndex
              gsap.delayedCall(2.2, rotate)
            },
          })
          .to(el, { y: -24, opacity: 0, duration: 0.35, ease: "power2.in" })
          .call(() => {
            el.textContent = words[nextIndex]
          })
          .fromTo(
            el,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
          )
      }

      const starter = gsap.delayedCall(2, rotate)
      return () => starter.kill()
    },
    { scope: ref, dependencies: [words] }
  )
}

const Indexing = () => {
  const containerRef = useRef(null)
  const heroWordRef = useRef(null)
  const ctaWordRef = useRef(null)
  const navigate = useNavigate()

  document.title = "Slack Developers - Where Development Meets Creativity!"

  useWordRotator(heroWordRef, HERO_WORDS)
  useWordRotator(ctaWordRef, CTA_WORDS)

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
      if (prefersReducedMotion) {
        gsap.set("[data-animate]", { opacity: 1, y: 0, scale: 1 })
        return
      }

      // Hero entrance timeline
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } })
      heroTl
        .from(".landing-orb", {
          scale: 0,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out",
        })
        .from(
          ".landing-header",
          { y: -30, opacity: 0, duration: 0.7 },
          "-=0.8"
        )
        .from(
          ".hero-badge",
          { scale: 0.8, opacity: 0, duration: 0.5 },
          "-=0.4"
        )
        .from(".hero-line", { y: 60, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.3")
        .from(".hero-sub", { y: 30, opacity: 0, duration: 0.7 }, "-=0.4")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.3")
        .from(".hero-trust", { y: 15, opacity: 0, duration: 0.5 }, "-=0.2")
        .from(
          ".hero-mockup",
          { y: 80, opacity: 0, scale: 0.92, duration: 1, ease: "power2.out" },
          "-=0.5"
        )

      // Floating orbs parallax
      gsap.to(".landing-orb-1", {
        y: -120,
        scrollTrigger: { trigger: ".landing-hero", start: "top top", end: "bottom top", scrub: 1.5 },
      })
      gsap.to(".landing-orb-2", {
        y: -80,
        x: 40,
        scrollTrigger: { trigger: ".landing-hero", start: "top top", end: "bottom top", scrub: 1.5 },
      })
      gsap.to(".landing-orb-3", {
        y: -60,
        x: -30,
        scrollTrigger: { trigger: ".landing-hero", start: "top top", end: "bottom top", scrub: 1.5 },
      })

      // Continuous orb float
      gsap.to(".landing-orb", {
        y: "+=30",
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.8, from: "random" },
      })

      // Section reveals
      gsap.utils.toArray("[data-section]").forEach((section) => {
        gsap.from(section.querySelectorAll("[data-reveal]"), {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        })
      })

      // Feature cards
      gsap.from(".feature-card", {
        y: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 75%",
        },
      })

      // Stat counters
      document.querySelectorAll(".stat-number").forEach((el) => {
        const target = parseFloat(el.dataset.value)
        const decimals = parseInt(el.dataset.decimals || "0", 10)
        const suffix = el.dataset.suffix || ""

        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            const counter = { val: 0 }
            gsap.to(counter, {
              val: target,
              duration: 2,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent =
                  (decimals
                    ? counter.val.toFixed(decimals)
                    : Math.floor(counter.val)) + suffix
              },
            })
          },
        })
      })

      // Steps line draw
      gsap.from(".steps-line", {
        scaleX: 0,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 70%",
        },
      })

      // CTA magnetic glow pulse
      gsap.to(".cta-glow", {
        scale: 1.05,
        opacity: 0.6,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })

      // Marquee
      const marquee = gsap.to(".marquee-track", {
        xPercent: -50,
        duration: 20,
        ease: "none",
        repeat: -1,
      })

      return () => {
        marquee.kill()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="landing-page flex flex-col items-center relative overflow-hidden bg-background"
    >
      {/* Animated background */}
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-orb landing-orb-1 landing-orb-enhanced" />
      <div className="landing-orb landing-orb-2 landing-orb-enhanced" />
      <div className="landing-orb landing-orb-3 landing-orb-enhanced" />

      <div className="landing-header w-full">
        <Header />
      </div>

      {/* Hero */}
      <section className="landing-hero flex flex-col items-center text-center relative z-10 min-h-screen w-full pt-32 pb-20 px-6">
        <span className="hero-badge inline-flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs uppercase tracking-widest font-bold bg-white/80 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-full text-gray-700 dark:text-gray-200">
          <Sparkles size={12} className="text-theme" />
          From Developer to Developers
        </span>

        <h1 className="mt-8 max-w-5xl">
          <span className="hero-line block text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.05]">
            Manage Your Projects
          </span>
          <span className="hero-line block text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mt-1">
            Like A{" "}
            <span className="hero-word-wrap inline-block relative overflow-hidden align-bottom">
              <span ref={heroWordRef} className="hero-word text-stroke" />
            </span>
          </span>
        </h1>

        <p className="hero-sub text-sm md:text-lg mt-6 text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed font-medium">
          Streamline your development workflow with our powerful project
          management toolkit. Built by developers, for developers.
        </p>

        <div className="hero-cta flex flex-col sm:flex-row gap-4 mt-10">
          <button
            className="landing-btn-primary group relative px-8 py-4 bg-black text-white font-bold rounded-2xl text-sm cursor-pointer overflow-hidden dark:bg-white dark:text-black"
            onClick={() => navigate("/login")}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button
            className="landing-btn-secondary px-8 py-4 font-bold rounded-2xl text-sm cursor-pointer border border-black/10 dark:border-white/20 text-gray-800 dark:text-white backdrop-blur-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            onClick={() => navigate("/about")}
          >
            Learn More
          </button>
        </div>

        <div className="hero-trust flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12 text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {[
            { color: "bg-emerald-500", label: "Free Forever" },
            { color: "bg-[#e8772e]", label: "No Credit Card" },
            { color: "bg-theme", label: "Setup in Minutes" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`w-2 h-2 ${item.color} rounded-full`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="hero-mockup mt-16 w-full max-w-4xl">
          <div className="landing-mockup glass-card-enhanced rounded-2xl p-1 shadow-2xl">
            <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/10">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-[10px] text-gray-400 ml-2 font-mono">
                  slack-dev / dashboard
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {[
                  { icon: <LayoutDashboard size={16} />, label: "Projects", val: "24" },
                  { icon: <Users size={16} />, label: "Team", val: "12" },
                  { icon: <CheckCircle2 size={16} />, label: "Tasks Done", val: "186" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      {card.icon}
                      <span className="text-[10px] uppercase tracking-wide">{card.label}</span>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                      {card.val}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 space-y-2">
                {[85, 62, 94].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-theme" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-theme-gradient"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="w-full py-6 border-y border-black/5 dark:border-white/10 overflow-hidden relative z-10" data-section>
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(2)].map((_, set) => (
            <div key={set} className="flex shrink-0">
              {["React", "Node.js", "TypeScript", "Docker", "GitHub", "AWS", "MongoDB", "Socket.io", "Stripe", "Vite"].map(
                (tech) => (
                  <span
                    key={`${set}-${tech}`}
                    className="mx-8 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10" data-section>
        <div className="text-center mb-16" data-reveal>
          <span className="text-xs uppercase tracking-widest text-theme font-bold">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mt-3">
            Powerful Features
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-4 max-w-xl mx-auto">
            Everything you need to manage projects efficiently
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className={`feature-card group ${feature.span} relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 feature-card-hover transition-colors duration-300`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[rgba(255,145,75,0.05)] group-hover:to-[rgba(232,119,46,0.1)] transition-all duration-500" />
              <div className="relative p-6 md:p-8 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-4 text-gray-900 dark:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                  {feature.description}
                </p>
                <div className="mt-4 w-full h-32 rounded-xl overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section
        className="w-full relative z-10 py-20 border-y border-black/5 dark:border-white/10"
        data-section
      >
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((stat, index) => (
            <div key={index} data-reveal>
              <div
                className="stat-number text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2"
                data-value={stat.value}
                data-suffix={stat.suffix}
                data-decimals={stat.decimals || 0}
              >
                0{stat.suffix}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 relative z-10" data-section>
        <div className="text-center mb-14" data-reveal>
          <span className="text-xs uppercase tracking-widest text-theme font-bold">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mt-3">
            What Developers Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <div
              key={index}
              data-reveal
              className="testimonial-card p-8 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="text-3xl text-theme mb-4 leading-none">"</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {t.quote}
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-11 h-11 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {t.author}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24 relative z-10" data-section>
        <div className="text-center mb-16" data-reveal>
          <span className="text-xs uppercase tracking-widest text-theme font-bold">
            Process
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mt-3">
            How It Works
          </h2>
        </div>

        <div className="steps-container relative">
          <div className="steps-line steps-line-theme hidden md:block absolute top-10 left-[16%] right-[16%] h-px origin-left" />
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step, index) => (
              <div key={index} data-reveal className="text-center relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex flex-col items-center justify-center font-black">
                  <span className="text-[10px] opacity-60">{step.step}</span>
                  {step.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="w-full relative z-10 py-24 px-6"
        data-section
      >
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="cta-glow cta-glow-theme absolute inset-0 rounded-3xl blur-3xl -z-10" />
          <div
            data-reveal
            className="p-10 md:p-14 rounded-3xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white">
              Let's Get{" "}
              <span className="hero-word-wrap inline-block overflow-hidden align-bottom">
                <span ref={ctaWordRef} className="hero-word text-stroke" />
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mt-4 mb-10">
              Join thousands of developers who trust our platform
            </p>
            <button
              className="landing-btn-primary group relative px-10 py-4 bg-black text-white font-bold rounded-2xl text-base cursor-pointer overflow-hidden dark:bg-white dark:text-black"
              onClick={() => navigate("/signup")}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Your Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Indexing