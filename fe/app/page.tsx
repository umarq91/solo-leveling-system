"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Swords, Trophy, Zap, Activity, Calendar, Infinity as InfinityIcon, Flame } from "lucide-react";
import type HlsType from "hls.js";
import { getToken } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── Constants ────────────────────────────────────────────────────────────────

const HLS_SRC = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
const HERO_ROLES = ["Hunter", "Warrior", "Champion", "Monarch"];
const LOADING_WORDS = ["Arise", "Hunt", "Ascend", ""];

const QUESTS = [
  {
    icon: Calendar,
    color: "#00d4ff",
    label: "Daily",
    title: "Daily Quests",
    desc: "5 system-assigned tasks every dawn. Complete or face the penalty zone.",
    examples: ["Run 5km", "Read 30 pages", "Meditate 10 min"],
    xp: "500",
    difficulty: "D",
    diffColor: "var(--rank-d)",
  },
  {
    icon: Activity,
    color: "#a78bfa",
    label: "Weekly",
    title: "Weekly Raids",
    desc: "Multi-stage challenges with tiered XP. The grind that builds rank.",
    examples: ["Train 5× this week", "Ship a project", "100 push-ups daily"],
    xp: "2,500",
    difficulty: "B",
    diffColor: "var(--rank-b)",
  },
  {
    icon: InfinityIcon,
    color: "#fbbf24",
    label: "Permanent",
    title: "Permanent Quests",
    desc: "Your boss fights. Massive XP, no time limit, life-altering milestones.",
    examples: ["Read 24 books", "Run a marathon", "Launch your business"],
    xp: "∞",
    difficulty: "S",
    diffColor: "var(--rank-s)",
  },
];

const FEATURES = [
  {
    title: "Quest System",
    desc: "Daily, weekly, and permanent quests assigned at dawn. Complete or face the penalty zone.",
    image: "/sl/hero.jpg",
    tag: "01 — Quests",
    span: "md:col-span-7",
    accent: "#00d4ff",
  },
  {
    title: "The Gate Opens",
    desc: "Enter ranked gates. Defeat your weaknesses. Claim your XP.",
    image: "/sl/gate.jpg",
    tag: "02 — Gates",
    span: "md:col-span-5",
    accent: "#7b2fff",
  },
  {
    title: "Rank Progression",
    desc: "Climb E to S. Every level-up is permanent, earned, irreversible.",
    image: "/sl/rank-up.png",
    tag: "03 — Ranks",
    span: "md:col-span-5",
    accent: "#c084fc",
  },
  {
    title: "Shadow Army",
    desc: "Built in public. A growing legion transforming their real lives.",
    image: "/sl/shadow-army.jpg",
    tag: "04 — Community",
    span: "md:col-span-7",
    accent: "#f87171",
  },
];

const HUNTER_LOGS = [
  { image: "/sl/hero.jpg", title: "System Awakening", desc: "The moment E-Rank changes. First quest assigned.", meta: "Day 1", xp: "+500", rank: "E", rankColor: "var(--rank-e)" },
  { image: "/sl/gate.jpg", title: "First Gate Cleared", desc: "Solo run. B-Rank dungeon. No casualties.", meta: "Day 7", xp: "+1,200", rank: "D", rankColor: "var(--rank-d)" },
  { image: "/sl/rank-up.png", title: "Rank B — Veteran", desc: "Discipline streak: 30 days unbroken.", meta: "Day 30", xp: "+5,000", rank: "B", rankColor: "var(--rank-b)" },
  { image: "/sl/shadow-army.jpg", title: "Shadow Army: 7K", desc: "Built in public. The legion watches.", meta: "Day 90", xp: "+∞", rank: "S", rankColor: "var(--rank-s)" },
];

// ─── Display font shorthand ───────────────────────────────────────────────────

const DF = "var(--font-instrument)";
const IF = "var(--font-inter)";
const OF = "var(--font-orbitron)";

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let start: number | null = null;
    const duration = 2700;
    let raf: number;
    function step(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * 100));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setTimeout(() => onCompleteRef.current(), 400);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setWordIndex(i => (i + 1) % LOADING_WORDS.length), 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      style={{ background: "var(--sl-bg)" }}
    >
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-8 text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
      >
        System
      </motion.p>

      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.85 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="select-none uppercase"
            style={{
              fontFamily: DF,
              fontSize: "clamp(4rem, 13vw, 10rem)",
              color: "var(--sl-text)",
              lineHeight: 1,
              letterSpacing: "0.05em",
            }}
          >
            {LOADING_WORDS[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="absolute bottom-10 right-10 tabular-nums select-none"
        style={{ fontFamily: OF, fontSize: "clamp(2.5rem, 7vw, 6rem)", color: "var(--sl-text-muted)", lineHeight: 1 }}
      >
        {String(count).padStart(3, "0")}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full accent-gradient"
          style={{
            width: `${count}%`,
            boxShadow: "0 0 8px rgba(137,170,204,0.35)",
            transition: "width 16ms linear",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => setLoggedIn(!!getToken()), []);

  return (
    <div className="relative overflow-x-hidden" style={{ background: "var(--sl-bg)", color: "var(--sl-text)" }}>
      <AnimatePresence>{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      <Nav loggedIn={loggedIn} />
      <Hero />
      <ManifestoSection />
      <HunterLogSection />

      <QuestSection />
      <StatsSection />
      <SiteFooter />
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="inline-flex items-center rounded-full backdrop-blur-md border px-2 py-2 transition-all duration-300"
        style={{
          background: "rgba(10,11,24,0.75)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Logo pill */}
        <div
          className="w-9 h-9 rounded-full relative flex items-center justify-center cursor-pointer shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #89AACC, #4E85BF)" }}
        >
          <div
            className="absolute inset-[2px] rounded-full flex items-center justify-center"
            style={{ background: "var(--sl-bg)" }}
          >
            <span className="italic" style={{ fontFamily: DF, fontSize: "1rem", color: "var(--sl-text)" }}>
              S
            </span>
          </div>
        </div>

        <div className="w-px h-5 mx-2 hidden sm:block" style={{ background: "rgba(255,255,255,0.08)" }} />

        {["Home", "Quests", "Ranks"].map(link => (
          <button
            key={link}
            onClick={() => setActive(link)}
            className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-all duration-200"
            style={{
              fontFamily: IF,
              fontWeight: active === link ? 500 : 400,
              color: active === link ? "var(--sl-text)" : "var(--sl-text-muted)",
              background: active === link ? "rgba(255,255,255,0.06)" : "transparent",
            }}
          >
            {link}
          </button>
        ))}

        <div className="w-px h-5 mx-2" style={{ background: "rgba(255,255,255,0.08)" }} />

        <Link
          href={loggedIn ? "/dashboard" : "/register"}
          className="text-xs sm:text-sm rounded-full px-4 py-1.5 sm:py-2 transition-all duration-200 hover:opacity-75"
          style={{ fontFamily: IF, color: "var(--sl-cyan)" }}
        >
          {loggedIn ? "Dashboard" : "Awaken"} ↗
        </Link>
      </motion.div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = HLS_SRC;
      }
    });
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setRoleIndex(i => (i + 1) % HERO_ROLES.length), 2000);
    return () => clearInterval(iv);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo(".name-reveal", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.1 });
      tl.fromTo(".blur-in", { opacity: 0, filter: "blur(10px)", y: 20 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.12, ease: "power3.out" }, 0.3);
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-0 left-0 right-0 h-56" style={{ background: "linear-gradient(to top, var(--sl-bg), transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to bottom, rgba(5,5,14,0.55), transparent)" }} />
      </div>

      <div className="relative z-10 max-w-3xl px-8 text-center">
        <p
          className="blur-in text-xs uppercase tracking-[0.35em] mb-10"
          style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
        >
          System &#39;26
        </p>

        <h1
          className="name-reveal italic leading-[0.88] tracking-tight mb-8"
          style={{
            fontFamily: DF,
            fontSize: "clamp(3.5rem, 11vw, 9.5rem)",
            color: "var(--sl-text)",
            fontWeight: 400,
          }}
        >
          Shadow Monarch
        </h1>

        <p className="blur-in mb-5" style={{ fontFamily: IF, fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)", color: "var(--sl-text-muted)", fontWeight: 300 }}>
          Rise as a{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={roleIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="inline-block italic"
              style={{ fontFamily: DF, fontSize: "1.1em", color: "var(--sl-cyan)" }}
            >
              {HERO_ROLES[roleIndex]}
            </motion.span>
          </AnimatePresence>
          {". From weakest to strongest."}
        </p>

        <p
          className="blur-in text-sm leading-relaxed max-w-sm mx-auto mb-12"
          style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
        >
          Gamify your real life. Complete quests, earn XP, climb from E-Rank to S-Rank.
        </p>

        <div className="blur-in flex gap-4 flex-wrap justify-center">
          <Link
            href="/register"
            className="rounded-full text-sm px-7 py-3.5 transition-all duration-200 hover:scale-105 hover:opacity-90"
            style={{ background: "var(--sl-text)", color: "var(--sl-bg)", fontFamily: IF, fontWeight: 500 }}
          >
            Enter System
          </Link>
          <Link
            href="/login"
            className="rounded-full text-sm px-7 py-3.5 transition-all duration-200 hover:scale-105"
            style={{ border: "1px solid rgba(255,255,255,0.12)", color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 400 }}
          >
            Already a Hunter ↗
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--sl-text-dim)", fontFamily: IF, fontWeight: 300 }}>
          Scroll
        </span>
        <div className="relative w-px h-10 overflow-hidden" style={{ background: "var(--sl-border)" }}>
          <div className="absolute inset-x-0 animate-scroll-down" style={{ height: "40%", background: "var(--sl-cyan)" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Features Bento Grid ──────────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "var(--sl-border-bright)" }} />
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}>
                Selected Work
              </p>
            </div>
            <h2 style={{ fontFamily: DF, fontSize: "clamp(2.2rem, 5vw, 4.5rem)", color: "var(--sl-text)", lineHeight: 0.9 }}>
              Featured <em style={{ color: "var(--sl-text-muted)" }}>features</em>
            </h2>
            <p className="text-sm mt-4 max-w-xs" style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}>
              A real-time system panel for your life. Quests. XP. Rank. No excuses.
            </p>
          </div>
          <Link
            href="/register"
            className="hidden md:inline-flex items-center gap-2 text-xs px-5 py-2.5 rounded-full transition-all hover:opacity-70 shrink-0"
            style={{ border: "1px solid var(--sl-border)", color: "var(--sl-text-muted)", fontFamily: IF }}
          >
            View all ↗
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${f.span}`}
              style={{
                aspectRatio: f.span.includes("7") ? "16/9" : "4/3",
                background: "var(--sl-surface)",
                border: "1px solid var(--sl-border)",
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ backgroundImage: `url('${f.image}')` }}
              />
              <div
                className="absolute inset-0 opacity-20 mix-blend-multiply"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "4px 4px",
                }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,5,14,0.95) 0%, rgba(5,5,14,0.15) 60%)" }} />

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 backdrop-blur-[2px]"
                style={{ background: "rgba(5,5,14,0.55)" }}
              />

              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                <p className="text-[10px] uppercase tracking-[0.35em] mb-2" style={{ color: f.accent, fontFamily: IF, fontWeight: 300 }}>
                  {f.tag}
                </p>
                <h3 className="italic leading-tight" style={{ fontFamily: DF, fontSize: "clamp(1.2rem, 2.5vw, 1.9rem)", color: "var(--sl-text)" }}>
                  {f.title}
                </h3>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className="relative px-5 py-2.5 rounded-full text-sm"
                  style={{ background: "var(--sl-text)", color: "var(--sl-bg)", fontFamily: IF, fontWeight: 500 }}
                >
                  View — <em style={{ fontFamily: DF }}>{f.title}</em>
                </div>
              </div>

              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px ${f.accent}40` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Manifesto — System Awakening ─────────────────────────────────────────────

function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative py-24 md:py-40 overflow-hidden">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 60%, rgba(123,47,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        {/* System notification tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 mb-16 px-4 py-2"
          style={{
            border: "1px solid rgba(0,212,255,0.2)",
            background: "rgba(0,212,255,0.03)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--sl-cyan)" }}
          />
          <span
            className="text-[9px] uppercase tracking-[0.4em]"
            style={{ color: "var(--sl-cyan)", fontFamily: OF }}
          >
            System · Awakening Protocol
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Manifesto */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="leading-[0.9] mb-12 uppercase"
              style={{
                fontFamily: DF,
                fontSize: "clamp(2.4rem, 6vw, 5rem)",
                color: "var(--sl-text)",
                letterSpacing: "0.02em",
              }}
            >
              Turning Weak
              <br />
              Hunters Into
              <br />
              <span style={{ color: "var(--sl-cyan)" }}>Monarchs.</span>
            </motion.h2>

            {/* System message panels */}
            <div className="space-y-3">
              {[
                {
                  label: "PROBLEM",
                  text: "Most people live at E-Rank their entire lives. They scroll, survive, and stay weak by choice — or by default.",
                  color: "#f87171",
                },
                {
                  label: "SOLUTION",
                  text: "The System assigns your quests, tracks your XP, and ranks you against the only opponent who matters — your past self.",
                  color: "var(--sl-cyan)",
                },
                {
                  label: "RESULT",
                  text: "Real discipline. Real growth. Every completed quest is permanent progress. No shortcuts. No resets.",
                  color: "#c084fc",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="flex gap-4 p-5"
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    border: "1px solid var(--sl-border)",
                    borderLeft: `2px solid ${item.color}`,
                  }}
                >
                  <div className="shrink-0 pt-0.5 w-20">
                    <span
                      className="text-[8px] uppercase tracking-[0.35em]"
                      style={{ color: item.color, fontFamily: OF }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
                  >
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="h-px w-12" style={{ background: "var(--sl-border-bright)" }} />
              <p
                className="text-[9px] uppercase tracking-[0.35em]"
                style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
              >
                Real discipline. Real growth.
              </p>
            </motion.div>
          </div>

          {/* Right: Hunter Profile Card */}
          <motion.div style={{ y: cardY }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
              style={{
                background: "var(--sl-surface)",
                border: "1px solid var(--sl-border-bright)",
                boxShadow:
                  "0 0 60px rgba(0,212,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Card header bar */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--sl-border)",
                  background: "rgba(0,212,255,0.025)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--sl-cyan)" }}
                  />
                  <span
                    className="text-[9px] uppercase tracking-[0.4em]"
                    style={{ color: "var(--sl-cyan)", fontFamily: OF }}
                  >
                    Hunter Profile
                  </span>
                </div>
                <span
                  className="text-[8px] uppercase tracking-[0.3em]"
                  style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                >
                  Status: Unawakened
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Rank display */}
                <div className="flex items-end justify-between">
                  <div>
                    <p
                      className="text-[8px] uppercase tracking-[0.35em] mb-1.5"
                      style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                    >
                      Current Rank
                    </p>
                    <div
                      className="text-5xl font-bold tabular-nums leading-none"
                      style={{
                        fontFamily: OF,
                        color: "var(--rank-e)",
                        textShadow: "0 0 24px rgba(156,163,175,0.35)",
                      }}
                    >
                      E
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    {["E", "D", "C", "B", "A", "S"].map((r, i) => (
                      <div
                        key={r}
                        className="text-[10px] font-bold flex items-center justify-center"
                        style={{
                          fontFamily: OF,
                          width: "22px",
                          height: "22px",
                          color: ["var(--rank-e)","var(--rank-d)","var(--rank-c)","var(--rank-b)","var(--rank-a)","var(--rank-s)"][i],
                          border: `1px solid ${["var(--rank-e)","var(--rank-d)","var(--rank-c)","var(--rank-b)","var(--rank-a)","var(--rank-s)"][i]}40`,
                          background: i === 0 ? `${"var(--rank-e)"}18` : "transparent",
                          opacity: i === 0 ? 1 : 0.35,
                        }}
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* XP bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span
                      className="text-[8px] uppercase tracking-[0.3em]"
                      style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                    >
                      XP Progress
                    </span>
                    <span
                      className="text-[8px]"
                      style={{ color: "var(--sl-cyan)", fontFamily: OF }}
                    >
                      0 / 500
                    </span>
                  </div>
                  <div className="xp-bar-track">
                    <div className="xp-bar-fill" style={{ width: "4%", animation: "none" }} />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Daily Quests", value: "0 / 5" },
                    { label: "Streak", value: "—" },
                    { label: "Gates Cleared", value: "0" },
                    { label: "Shadow Army", value: "—" },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="px-3 py-2.5"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--sl-border)",
                      }}
                    >
                      <p
                        className="text-[7px] uppercase tracking-[0.3em] mb-1"
                        style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                      >
                        {stat.label}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div
                  className="pt-4 border-t text-center"
                  style={{ borderColor: "var(--sl-border)" }}
                >
                  <p
                    className="text-xs"
                    style={{
                      color: "var(--sl-text-muted)",
                      fontFamily: DF,
                      fontStyle: "italic",
                      letterSpacing: "0.02em",
                    }}
                  >
                    &ldquo;The System has chosen you.&rdquo;
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href="/register"
                  className="block w-full text-center py-3 transition-all hover:opacity-80"
                  style={{
                    background: "rgba(0,212,255,0.07)",
                    border: "1px solid rgba(0,212,255,0.28)",
                    color: "var(--sl-cyan)",
                    fontFamily: OF,
                    fontSize: "0.65rem",
                    letterSpacing: "0.22em",
                    textDecoration: "none",
                  }}
                >
                  INITIALIZE SYSTEM ↗
                </Link>
              </div>

              {/* Corner accent lines */}
              <div
                className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
                style={{
                  borderTop: "1px solid rgba(0,212,255,0.3)",
                  borderRight: "1px solid rgba(0,212,255,0.3)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none"
                style={{
                  borderBottom: "1px solid rgba(0,212,255,0.3)",
                  borderLeft: "1px solid rgba(0,212,255,0.3)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Hunter Log — Combat Archives ────────────────────────────────────────────

function HunterLogSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px" style={{ background: "var(--sl-border-bright)" }} />
              <span
                className="text-[9px] uppercase tracking-[0.4em]"
                style={{ color: "var(--sl-cyan)", fontFamily: OF }}
              >
                ◈ Mission Archives
              </span>
            </div>
            <h2
              className="uppercase"
              style={{
                fontFamily: DF,
                fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
                color: "var(--sl-text)",
                lineHeight: 0.92,
                letterSpacing: "0.04em",
              }}
            >
              Combat{" "}
              <span style={{ color: "var(--sl-text-muted)" }}>Records</span>
            </h2>
          </div>
          <Link
            href="#"
            className="hidden md:inline-flex text-[9px] px-4 py-2 transition hover:opacity-70 uppercase tracking-[0.15em]"
            style={{
              border: "1px solid var(--sl-border)",
              color: "var(--sl-text-muted)",
              fontFamily: OF,
            }}
          >
            View All ↗
          </Link>
        </motion.div>

        <div className="space-y-2">
          {HUNTER_LOGS.map((log, i) => (
            <motion.div
              key={log.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ background: "rgba(10,11,24,0.7)" }}
              className="group flex items-center gap-4 p-4 cursor-pointer transition-all duration-300"
              style={{
                background: "rgba(10,11,24,0.3)",
                border: "1px solid var(--sl-border)",
                borderLeft: `2px solid ${log.rankColor}`,
              }}
            >
              {/* Rank badge */}
              <div
                className="shrink-0 w-10 h-10 flex items-center justify-center font-bold text-sm"
                style={{
                  fontFamily: OF,
                  color: log.rankColor,
                  border: `1px solid ${log.rankColor}40`,
                  background: `${log.rankColor}08`,
                }}
              >
                {log.rank}
              </div>

              {/* Thumbnail */}
              <div
                className="shrink-0 w-12 h-12 overflow-hidden"
                style={{ border: "1px solid var(--sl-border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={log.image}
                  alt={log.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  style={{ filter: "brightness(0.65) saturate(0.75)" }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm uppercase tracking-[0.05em]"
                  style={{
                    color: "var(--sl-text)",
                    fontFamily: DF,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                  }}
                >
                  {log.title}
                </h3>
                <p
                  className="text-xs truncate hidden sm:block mt-0.5"
                  style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
                >
                  {log.desc}
                </p>
              </div>

              {/* XP earned */}
              <div className="text-right shrink-0 hidden md:block">
                <p
                  className="tabular-nums text-base font-bold"
                  style={{
                    color: log.rankColor,
                    fontFamily: OF,
                    textShadow: `0 0 14px ${log.rankColor}55`,
                  }}
                >
                  {log.xp}
                </p>
                <p
                  className="text-[7px] uppercase tracking-[0.2em] mt-0.5"
                  style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                >
                  XP Gained
                </p>
              </div>

              {/* Day */}
              <p
                className="text-[10px] shrink-0"
                style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
              >
                {log.meta}
              </p>

              <span
                className="text-sm shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ color: log.rankColor }}
              >
                ↗
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─── Quest Board ──────────────────────────────────────────────────────────────

function QuestSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-quest]",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.14,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        }
      );
    },
    { scope: ref }
  );

  const steps = [
    {
      n: "01",
      icon: Zap,
      title: "Receive Quests",
      cmd: "ASSIGN_QUESTS",
      desc: "System assigns daily quests across Fitness, Career, Intellect, Discipline, and Social.",
    },
    {
      n: "02",
      icon: Swords,
      title: "Complete or Suffer",
      cmd: "EXECUTE_OR_PENALIZE",
      desc: "Finish quests for XP. Skip them and lose XP, break your streak, trigger penalty quests.",
    },
    {
      n: "03",
      icon: Trophy,
      title: "Rank Up",
      cmd: "RANK_ASCENSION",
      desc: "Climb from E to S. Higher ranks unlock harder quests with exponentially bigger rewards.",
    },
  ];

  return (
    <section ref={ref} className="py-24 md:py-36">
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* System Protocol */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <span
              className="text-[9px] uppercase tracking-[0.4em]"
              style={{ color: "var(--sl-cyan)", fontFamily: OF }}
            >
              ◈ System Protocol
            </span>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px"
            style={{ background: "var(--sl-border)" }}
          >
            {steps.map(step => (
              <div
                key={step.n}
                className="relative p-8 md:p-10 group"
                style={{ background: "var(--sl-bg)" }}
              >
                {/* Terminal command header */}
                <div className="flex items-center gap-2 mb-7">
                  <span
                    className="text-[8px]"
                    style={{ color: "var(--sl-cyan)", fontFamily: OF, opacity: 0.6 }}
                  >
                    &gt;
                  </span>
                  <span
                    className="text-[8px] uppercase tracking-[0.25em]"
                    style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                  >
                    {step.cmd}
                  </span>
                </div>

                <div
                  className="absolute top-4 right-5 uppercase select-none pointer-events-none"
                  style={{
                    fontFamily: DF,
                    fontSize: "5rem",
                    lineHeight: 1,
                    color: "var(--sl-border)",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                  }}
                >
                  {step.n}
                </div>

                <step.icon
                  size={18}
                  className="mb-5"
                  style={{ color: "var(--sl-text-muted)" }}
                />
                <h3
                  className="uppercase mb-3"
                  style={{
                    fontFamily: DF,
                    fontSize: "clamp(1rem, 2vw, 1.4rem)",
                    color: "var(--sl-text)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
                >
                  {step.desc}
                </p>

                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--sl-cyan), transparent)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quest types heading */}
        <div className="mb-12">
          <h2
            className="uppercase"
            style={{
              fontFamily: DF,
              fontSize: "clamp(2rem, 5vw, 4rem)",
              color: "var(--sl-text)",
              lineHeight: 0.9,
              letterSpacing: "0.03em",
            }}
          >
            Choose your{" "}
            <span style={{ color: "var(--sl-text-muted)" }}>Battles</span>
          </h2>
        </div>

        {/* Quest cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px"
          style={{ background: "var(--sl-border)" }}
        >
          {QUESTS.map(q => (
            <motion.div
              key={q.label}
              data-quest
              whileHover={{ background: "var(--sl-surface)" }}
              className="relative p-8 md:p-10 cursor-pointer group transition-colors duration-300"
              style={{ background: "var(--sl-bg)" }}
            >
              {/* Quest window header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <q.icon size={13} style={{ color: q.color, opacity: 0.85 }} />
                  <span
                    className="text-[8px] uppercase tracking-[0.3em]"
                    style={{ color: q.color, fontFamily: OF }}
                  >
                    {q.label}
                  </span>
                </div>
                <div
                  className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    fontFamily: OF,
                    color: q.diffColor,
                    border: `1px solid ${q.diffColor}40`,
                    background: `${q.diffColor}08`,
                  }}
                >
                  {q.difficulty}-Rank
                </div>
              </div>

              <h3
                className="uppercase mb-3"
                style={{
                  fontFamily: DF,
                  fontSize: "clamp(1.1rem, 2vw, 1.55rem)",
                  color: "var(--sl-text)",
                  letterSpacing: "0.05em",
                }}
              >
                {q.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
              >
                {q.desc}
              </p>

              {/* XP reward */}
              <div
                className="flex items-center gap-3 mb-6 px-4 py-3"
                style={{
                  background: `${q.color}05`,
                  border: `1px solid ${q.color}1a`,
                }}
              >
                <span
                  className="text-[7px] uppercase tracking-[0.35em]"
                  style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                >
                  Reward
                </span>
                <span
                  className="tabular-nums text-xl font-bold"
                  style={{
                    color: q.color,
                    fontFamily: OF,
                    textShadow: `0 0 18px ${q.color}55`,
                  }}
                >
                  +{q.xp} XP
                </span>
              </div>

              <div
                className="space-y-2.5 pt-5 border-t"
                style={{ borderColor: "var(--sl-border)" }}
              >
                <p
                  className="text-[7px] uppercase tracking-[0.35em] mb-3"
                  style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
                >
                  Objectives
                </p>
                {q.examples.map(ex => (
                  <div key={ex} className="flex items-center gap-3">
                    <div
                      className="w-1 h-1 shrink-0"
                      style={{ background: q.color, opacity: 0.6 }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--sl-text-dim)", fontFamily: IF, fontWeight: 300 }}
                    >
                      {ex}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${q.color}55, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── System Status ────────────────────────────────────────────────────────────

function StatsSection() {
  const stats = [
    {
      display: "6",
      label: "Rank Tiers",
      sub: "E · D · C · B · A · S",
      accent: "var(--rank-s)",
    },
    {
      display: "3+",
      label: "Quest Types",
      sub: "Daily · Weekly · Permanent",
      accent: "var(--sl-cyan)",
    },
    {
      display: "100%",
      label: "Growth Return",
      sub: "Every rep counts.",
      accent: "var(--rank-b)",
    },
  ];

  return (
    <section
      style={{ borderTop: "1px solid var(--sl-border)", borderBottom: "1px solid var(--sl-border)" }}
    >
      {/* System status header strip */}
      <div
        className="max-w-6xl mx-auto px-6"
        style={{ borderBottom: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center gap-4 py-3">
          <span
            className="relative flex h-1.5 w-1.5"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <span
            className="text-[8px] uppercase tracking-[0.4em]"
            style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
          >
            System Status · Online · All Nodes Active
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="py-14 px-8 text-center border-b md:border-b-0 md:border-r last:border-0"
              style={{ borderColor: "var(--sl-border)" }}
            >
              <div
                className="uppercase leading-none mb-4 tabular-nums"
                style={{
                  fontFamily: DF,
                  fontSize: "clamp(4rem, 9vw, 7rem)",
                  color: stat.accent,
                  textShadow: `0 0 50px ${stat.accent}28`,
                  letterSpacing: "0.02em",
                }}
              >
                {stat.display}
              </div>
              <p
                className="text-[8px] uppercase tracking-[0.4em] mb-2"
                style={{ fontFamily: OF, color: "var(--sl-text-muted)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--sl-text-dim)", fontFamily: IF, fontWeight: 300 }}
              >
                {stat.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const MARQUEE_TEXT = "ARISE  ·  HUNT  ·  ASCEND  ·   ·  ";

function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = HLS_SRC;
      }
    });
    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, []);

  useGSAP(
    () => {
      const el = marqueeRef.current;
      if (!el) return;
      gsap.to(el, { xPercent: -50, ease: "none", duration: 40, repeat: -1 });
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className="relative overflow-hidden pt-24 pb-10">
      {/* Flipped video bg */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ transform: "scaleY(-1)" }}
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="absolute top-0 left-0 right-0 h-40"
        style={{ background: "linear-gradient(to bottom, var(--sl-bg), transparent)" }}
      />

      {/* Marquee */}
      <div className="overflow-hidden mb-16 relative">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {Array(10)
            .fill(MARQUEE_TEXT)
            .map((t, i) => (
              <span
                key={i}
                className="inline-block px-4 uppercase select-none"
                style={{
                  fontFamily: DF,
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  color: "rgba(255,255,255,0.07)",
                  lineHeight: 1,
                  letterSpacing: "0.08em",
                }}
              >
                {t}
              </span>
            ))}
        </div>
      </div>

      {/* Final CTA panel */}
      <div className="relative max-w-3xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="px-8 py-14"
          style={{
            border: "1px solid var(--sl-border-bright)",
            background: "rgba(0,212,255,0.015)",
          }}
        >
          {/* Corner accents */}
          <div
            className="absolute top-0 left-0 w-6 h-6 pointer-events-none"
            style={{
              borderTop: "1px solid var(--sl-cyan)",
              borderLeft: "1px solid var(--sl-cyan)",
            }}
          />
          <div
            className="absolute top-0 right-0 w-6 h-6 pointer-events-none"
            style={{
              borderTop: "1px solid var(--sl-cyan)",
              borderRight: "1px solid var(--sl-cyan)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none"
            style={{
              borderBottom: "1px solid var(--sl-cyan)",
              borderLeft: "1px solid var(--sl-cyan)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
            style={{
              borderBottom: "1px solid var(--sl-cyan)",
              borderRight: "1px solid var(--sl-cyan)",
            }}
          />

          <p
            className="text-[8px] uppercase tracking-[0.5em] mb-6"
            style={{ color: "var(--sl-cyan)", fontFamily: OF }}
          >
            System · Final Notice
          </p>
          <h2
            className="uppercase mb-6 leading-[0.88]"
            style={{
              fontFamily: DF,
              fontSize: "clamp(2.2rem, 7vw, 5rem)",
              color: "var(--sl-text)",
              letterSpacing: "0.04em",
            }}
          >
            The System
            <br />
            <span style={{ color: "var(--sl-cyan)" }}>Is Waiting.</span>
          </h2>
          <p
            className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
            style={{ color: "var(--sl-text-muted)", fontFamily: IF, fontWeight: 300 }}
          >
            You have been selected. The gates are open. Will you answer the call, or remain at
            E-Rank forever?
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 transition-all hover:opacity-80"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.35)",
              color: "var(--sl-cyan)",
              fontFamily: OF,
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textDecoration: "none",
            }}
          >
            ARISE · ENTER SYSTEM ↗
          </Link>
        </motion.div>
      </div>

      {/* Contact */}
      <div className="relative text-center mb-16 px-6">
        <p
          className="text-[8px] uppercase tracking-[0.45em] mb-4"
          style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
        >
          Direct Contact
        </p>
        <motion.a
          href="mailto:umartriedcoding@gmail.com"
          whileHover={{ opacity: 0.65 }}
          className="group inline-flex items-center gap-3 uppercase"
          style={{
            fontFamily: DF,
            fontSize: "clamp(1rem, 3.5vw, 2.4rem)",
            color: "var(--sl-text)",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          umartriedcoding@gmail.com
          <span
            className="not-italic transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            style={{ color: "var(--sl-cyan)" }}
          >
            ↗
          </span>
        </motion.a>
      </div>

      {/* Footer bar */}
      <div
        className="relative max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row items-center justify-between gap-5 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span
          className="uppercase text-sm tracking-[0.18em]"
          style={{ fontFamily: DF, color: "var(--sl-text)" }}
        >
          System
        </span>

        <div className="flex items-center gap-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <span
            className="text-[8px] uppercase tracking-[0.2em]"
            style={{ color: "var(--sl-text-muted)", fontFamily: OF }}
          >
            Hunters Online
          </span>
        </div>

        <p
          className="text-[8px] uppercase tracking-[0.1em]"
          style={{ color: "var(--sl-text-dim)", fontFamily: OF }}
        >
          <Flame size={10} className="inline mr-1.5" style={{ color: "#fbbf24" }} />
          © {new Date().getFullYear()} Solo Leveling System
        </p>
      </div>
    </footer>
  );
}
