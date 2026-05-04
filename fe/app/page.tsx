"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  ChevronDown,
  ArrowRight,
  Skull,
  Crown,
  Activity,
  Calendar,
  Infinity as InfinityIcon,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

import { getToken } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const RANKS = [
  { letter: "E", color: "#9ca3af", title: "The Weakest", desc: "You start here. Trash mob, dungeon fodder." },
  { letter: "D", color: "#34d399", title: "Awakening", desc: "First taste of growth. Habits are forming." },
  { letter: "C", color: "#60a5fa", title: "Hunter", desc: "Consistent. Disciplined. Outpacing your past self." },
  { letter: "B", color: "#c084fc", title: "Veteran", desc: "Most never reach this. You operate on autopilot." },
  { letter: "A", color: "#fbbf24", title: "Elite", desc: "Top fraction of a percent. Mastery is the floor." },
  { letter: "S", color: "#f87171", title: "Monarch", desc: "The system answers to you now. Final form." },
];

const QUESTS = [
  {
    type: "Daily",
    icon: Calendar,
    color: "#00d4ff",
    title: "Daily Quests",
    desc: "5 system-assigned tasks every dawn. Complete or face the penalty.",
    examples: ["Run 5km", "Read 30 pages", "Meditate 10 min"],
  },
  {
    type: "Weekly",
    icon: Activity,
    color: "#a78bfa",
    title: "Weekly Raids",
    desc: "Multi-stage challenges with tiered XP. The grind that builds rank.",
    examples: ["Train 5x this week", "Ship a project", "100 push-ups daily"],
  },
  {
    type: "Permanent",
    icon: InfinityIcon,
    color: "#fbbf24",
    title: "Permanent Quests",
    desc: "Your boss fights. Massive XP, no time limit, life-altering.",
    examples: ["Read 24 books", "Run a marathon", "Launch your business"],
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   SHARED — Rank dot cluster (6 ranks arranged like Gamify's colored grid)
   ────────────────────────────────────────────────────────────────────────── */

function RankDotsGlyph({ size = 56, delay = 0 }: { size?: number; delay?: number }) {
  const cell = size / 3;
  const dots = [
    { x: 1, y: 0, color: "#34d399" },
    { x: 2, y: 0, color: "#fbbf24" },
    { x: 0, y: 1, color: "#f87171" },
    { x: 1, y: 1, color: "#c084fc" },
    { x: 2, y: 1, color: "#60a5fa" },
    { x: 0, y: 2, color: "#00d4ff" },
    { x: 1, y: 2, color: "#7b2fff" },
  ];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ delay: delay + i * 0.05, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute rounded-full"
          style={{
            width: cell,
            height: cell,
            left: d.x * cell,
            top: d.y * cell,
            background: d.color,
            boxShadow: `0 0 ${cell * 0.5}px ${d.color}80`,
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SHARED — Phone mockup showing a sample System dashboard
   ────────────────────────────────────────────────────────────────────────── */

function PhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 300,
        height: 620,
        borderRadius: 44,
        padding: 10,
        background: "linear-gradient(145deg, #1a1f3a, #05050e)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,212,255,0.15), inset 0 0 0 2px rgba(255,255,255,0.03)",
      }}
    >
      {/* Screen */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius: 36,
          background: "radial-gradient(circle at top, #0f1022 0%, #05050e 70%)",
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full z-10"
          style={{ width: 100, height: 22, background: "#000" }}
        />

        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-6 text-[10px] font-mono z-20" style={{ color: "var(--sl-text-muted)" }}>
          <span>9:41</span>
          <span>◈ SYSTEM</span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 pt-12 px-5 pb-6 flex flex-col gap-4">
          {/* Rank card */}
          <div
            className="p-4 rounded-xl relative overflow-hidden"
            style={{
              background: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.3)",
            }}
          >
            <div className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: "var(--sl-cyan)" }}>
              ◈ Current Rank
            </div>
            <div className="flex items-end justify-between mt-1">
              <div
                className="text-5xl font-black leading-none"
                style={{
                  fontFamily: "var(--font-orbitron), monospace",
                  color: "#c084fc",
                  textShadow: "0 0 20px rgba(192,132,252,0.5)",
                }}
              >
                B
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase" style={{ color: "var(--sl-text-muted)" }}>
                  Level
                </div>
                <div className="text-2xl font-black" style={{ fontFamily: "var(--font-orbitron), monospace", color: "var(--sl-text)" }}>
                  42
                </div>
              </div>
            </div>
            {/* XP bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[9px] font-mono mb-1" style={{ color: "var(--sl-text-muted)" }}>
                <span>XP</span>
                <span>8,420 / 12,000</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "70%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                  className="h-full"
                  style={{
                    background: "linear-gradient(90deg, #0ea5e9, #00d4ff, #67e8f9)",
                    boxShadow: "0 0 8px rgba(0,212,255,0.6)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Today's quests label */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em]" style={{ color: "var(--sl-text-muted)" }}>
              ◈ Today's Quests
            </div>
            <div className="text-[10px] font-mono" style={{ color: "var(--sl-cyan)" }}>
              3/5
            </div>
          </div>

          {/* Quest list */}
          <div className="flex flex-col gap-2">
            {[
              { name: "Run 5km", xp: 150, done: true, color: "#f87171" },
              { name: "Read 30 pages", xp: 80, done: true, color: "#60a5fa" },
              { name: "Meditate 10 min", xp: 50, done: true, color: "#a78bfa" },
              { name: "100 push-ups", xp: 120, done: false, color: "#f87171" },
              { name: "Cold shower", xp: 40, done: false, color: "#60a5fa" },
            ].map((q, i) => (
              <motion.div
                key={q.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{
                  background: q.done ? "rgba(0,212,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${q.done ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.05)"}`,
                  opacity: q.done ? 0.6 : 1,
                }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: q.done ? "var(--sl-cyan)" : "transparent",
                    border: `1.5px solid ${q.done ? "var(--sl-cyan)" : q.color}`,
                  }}
                >
                  {q.done && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#05050e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[11px] font-semibold"
                    style={{
                      color: q.done ? "var(--sl-text-muted)" : "var(--sl-text)",
                      textDecoration: q.done ? "line-through" : "none",
                    }}
                  >
                    {q.name}
                  </div>
                </div>
                <div
                  className="text-[9px] font-mono font-bold"
                  style={{ color: q.color }}
                >
                  +{q.xp} XP
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle scanline */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          borderRadius: 44,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,212,255,0.5) 2px, rgba(0,212,255,0.5) 3px)",
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(!!getToken()), []);

  return (
    <div className="relative overflow-x-hidden" style={{ background: "var(--sl-bg)", color: "var(--sl-text)" }}>
      <Nav loggedIn={loggedIn} />
      <Hero />
      <PullQuoteSection />
      <PhoneMockupSection />
      <SystemSection />
      <RankProgressionSection />
      <QuestSection />
      <LiveBuildSection />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   NAV
   ────────────────────────────────────────────────────────────────────────── */

function Nav({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,5,14,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : undefined,
        borderBottom: scrolled ? "1px solid var(--sl-border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown size={20} style={{ color: "var(--sl-cyan)" }} />
          <span className="font-black text-lg tracking-widest" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
            SYSTEM
          </span>
        </div>
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard" className="sl-btn sl-btn-primary">
              Dashboard
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="sl-btn sl-btn-ghost">
                Login
              </Link>
              <Link href="/register" className="sl-btn sl-btn-primary">
                Awaken
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   HERO — multi-layer parallax (bg, grid, glyph, content)
   ────────────────────────────────────────────────────────────────────────── */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { scrollY } = useScroll();
  // 4 parallax layers at different rates for depth
  const bgY = useTransform(scrollY, [0, 1000], [0, 380]);
  const gridY = useTransform(scrollY, [0, 1000], [0, 220]);
  const glyphY = useTransform(scrollY, [0, 1000], [0, 140]);
  const contentY = useTransform(scrollY, [0, 1000], [0, 60]);
  const overlayOpacity = useTransform(scrollY, [0, 600], [0.4, 0.95]);
  const heroOpacity = useTransform(scrollY, [0, 700], [1, 0]);

  useGSAP(
    () => {
      const title = titleRef.current;
      if (!title) return;
      const letters = title.querySelectorAll<HTMLElement>("[data-letter]");
      gsap.fromTo(
        letters,
        { y: 80, opacity: 0, filter: "blur(16px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.06,
          delay: 0.4,
          ease: "power3.out",
        }
      );
    },
    { scope: ref }
  );

  return (
    <motion.section
      ref={ref}
      style={{ opacity: heroOpacity }}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Layer 1 — background image, slowest */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -top-32 -bottom-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/sl/hero.jpg'), radial-gradient(ellipse at center, #1a1f3a 0%, #05050e 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(5,5,14,0.45) 55%, rgba(5,5,14,0.95) 100%)",
          }}
        />
      </motion.div>

      {/* Layer 2 — scan grid, medium parallax */}
      <motion.div style={{ y: gridY, opacity: overlayOpacity }} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.09) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Horizontal scanline sweep */}
        <motion.div
          animate={{ y: ["0vh", "100vh", "0vh"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.08) 50%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* Layer 3 — floating rank-dot glyph, subtle parallax */}
      <motion.div
        style={{ y: glyphY }}
        className="absolute top-28 right-[8%] hidden md:block z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <RankDotsGlyph size={72} delay={0.8} />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: glyphY }}
        className="absolute bottom-28 left-[6%] hidden md:block z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <RankDotsGlyph size={48} delay={1.1} />
        </motion.div>
      </motion.div>

      {/* Layer 4 — content, slightly parallaxed */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-20 max-w-5xl px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.4em] mb-8 px-4 py-2 rounded-full"
          style={{
            color: "var(--sl-cyan)",
            background: "rgba(0,212,255,0.06)",
            border: "1px solid rgba(0,212,255,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--sl-cyan)" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--sl-cyan)" }} />
          </span>
          SYSTEM NOTIFICATION · INCOMING
        </motion.div>

        <h1
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-[10rem] font-black mb-8 leading-none"
          style={{
            fontFamily: "var(--font-orbitron), monospace",
            textShadow: "0 0 40px rgba(0,212,255,0.5), 0 0 80px rgba(0,212,255,0.2)",
          }}
        >
          {"ARISE".split("").map((c, i) => (
            <span key={i} data-letter className="inline-block">
              {c}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-lg md:text-2xl mb-12 max-w-3xl mx-auto font-light leading-snug"
          style={{ color: "var(--sl-text-muted)" }}
        >
          Every habit is a quest. Every day is a gate.{" "}
          <span style={{ color: "var(--sl-text)", fontWeight: 600 }}>
            Every level-up is permanent.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex justify-center"
        >
          <p className="font-mono text-sm uppercase tracking-widest" style={{ color: "var(--sl-cyan)" }}>◈ Early access coming soon</p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[0.6rem] font-mono uppercase tracking-[0.3em]" style={{ color: "var(--sl-text-dim)" }}>
          Enter the Gate
        </span>
        <ChevronDown size={20} style={{ color: "var(--sl-cyan)" }} />
      </motion.div>
    </motion.section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PULL QUOTE — the manifesto. Parallax bg, massive type.
   ────────────────────────────────────────────────────────────────────────── */

function PullQuoteSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glyphY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const headingY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="relative py-32 md:py-48 overflow-hidden">
      {/* Parallax glyph backdrop */}
      <motion.div
        style={{ y: glyphY }}
        className="absolute -top-20 -right-20 md:-right-10 opacity-30 pointer-events-none"
      >
        <div
          className="text-[32rem] font-black leading-none"
          style={{
            fontFamily: "var(--font-orbitron), monospace",
            color: "transparent",
            WebkitTextStroke: "2px rgba(0,212,255,0.15)",
          }}
        >
          S
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10"
        >
          <RankDotsGlyph size={52} />
          <div className="text-xs font-mono uppercase tracking-[0.4em]" style={{ color: "var(--sl-cyan)" }}>
            ◈ THE SYSTEM MANIFESTO
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tight mb-12"
          style={{
            y: headingY,
            fontFamily: "var(--font-orbitron), monospace",
            color: "var(--sl-cyan)",
            textShadow: "0 0 60px rgba(0,212,255,0.25)",
          }}
        >
          TURNING WEAK HUNTERS
          <br />
          <span style={{ color: "#c084fc", textShadow: "0 0 60px rgba(192,132,252,0.3)" }}>INTO MONARCHS</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-3xl font-light leading-[1.2]"
            style={{ color: "var(--sl-text)" }}
          >
            Most people live at E-Rank their whole life. They scroll, they survive, they stay weak by default.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--sl-text-muted)" }}
          >
            The System changes that. It assigns your quests, tracks your XP, and ranks you against the only opponent who matters — the weaker version of yourself from yesterday. Real discipline. Real growth. Real transformation, gamified.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PHONE MOCKUP — "This isn't an app. It's a system."
   ────────────────────────────────────────────────────────────────────────── */

function PhoneMockupSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "var(--sl-surface)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,212,255,0.12) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(192,132,252,0.1) 0%, transparent 40%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-16 lg:gap-24 items-center">
        {/* Phone */}
        <motion.div style={{ y: phoneY }} className="relative mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          >
            <PhoneMockup />
          </motion.div>

          {/* Floating dots beside phone */}
          <div className="absolute -top-8 -right-8 hidden lg:block">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <RankDotsGlyph size={48} delay={0.3} />
            </motion.div>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div style={{ y: textY }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-xs font-mono uppercase tracking-[0.4em] mb-6"
            style={{ color: "var(--sl-cyan)" }}
          >
            ◈ WHAT YOU GET
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "var(--font-orbitron), monospace" }}
          >
            THIS ISN'T AN APP.
            <br />
            <span style={{ color: "var(--sl-cyan)", textShadow: "0 0 50px rgba(0,212,255,0.3)" }}>
              IT'S A SYSTEM.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-5 text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: "var(--sl-text-muted)" }}
          >
            <p>
              A real-time System panel for your life. Quests that update at dawn. An XP bar that fills as you train.
              A rank that climbs from E to S as you prove the work.
            </p>
            <p style={{ color: "var(--sl-text)" }}>
              No dashboards to decorate. No streaks to manipulate. Just you vs. the System — and a permanent record of every level-up.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { icon: Target, label: "Daily quests" },
              { icon: TrendingUp, label: "Real XP" },
              { icon: Shield, label: "Penalty system" },
              { icon: Crown, label: "Rank E → S" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono"
                style={{
                  background: "rgba(0,212,255,0.05)",
                  border: "1px solid var(--sl-border-bright)",
                  color: "var(--sl-text)",
                }}
              >
                <f.icon size={14} style={{ color: "var(--sl-cyan)" }} />
                {f.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SYSTEM — 3-step "how it works"
   ────────────────────────────────────────────────────────────────────────── */

function SystemSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-step]",
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.4)",
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
      desc: "The System assigns daily quests across Fitness, Career, Intellect, Discipline, and Social.",
    },
    {
      n: "02",
      icon: Swords,
      title: "Complete or Suffer",
      desc: "Finish quests for XP. Skip them and lose XP, break your streak, and trigger penalty quests.",
    },
    {
      n: "03",
      icon: Trophy,
      title: "Rank Up",
      desc: "Climb from E-Rank to S-Rank. Higher ranks unlock harder quests with bigger rewards.",
    },
  ];

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.4) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <RankDotsGlyph size={42} />
            <div className="text-xs font-mono uppercase tracking-[0.4em]" style={{ color: "var(--sl-cyan)" }}>
              ◈ HOW IT WORKS
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
            THE SYSTEM AWAKENS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.n}
              data-step
              className="relative p-8 rounded-lg overflow-hidden group"
              style={{
                background: "var(--sl-surface)",
                border: "1px solid var(--sl-border)",
                transition: "all 0.3s",
              }}
            >
              <div
                className="absolute top-0 right-0 text-8xl font-black opacity-5 leading-none p-4"
                style={{ fontFamily: "var(--font-orbitron), monospace", color: "var(--sl-cyan)" }}
              >
                {step.n}
              </div>
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 relative"
                style={{
                  background: "rgba(0,212,255,0.1)",
                  border: "1px solid var(--sl-cyan)",
                  color: "var(--sl-cyan)",
                }}
              >
                <step.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 relative" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
                {step.title}
              </h3>
              <p className="text-sm relative" style={{ color: "var(--sl-text-muted)" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   RANK PROGRESSION — pinned horizontal scroll E → S
   ────────────────────────────────────────────────────────────────────────── */

function RankProgressionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const totalScroll = track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalScroll}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cards = section.querySelectorAll<HTMLElement>("[data-rank-card]");
      cards.forEach((card) => {
        const letter = card.querySelector<HTMLElement>("[data-rank-letter]");
        if (!letter) return;
        gsap.fromTo(
          letter,
          { scale: 0.6, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left center",
              end: "right center",
              scrub: true,
            },
          }
        );
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 opacity-25 bg-cover bg-center"
        style={{ backgroundImage: "url('/sl/rank-up.png')" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--sl-bg) 0%, transparent 20%, transparent 80%, var(--sl-bg) 100%)" }} />

      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 text-center">
        <div className="text-xs font-mono uppercase tracking-[0.4em] mb-2" style={{ color: "var(--sl-cyan)" }}>
          ◈ RANK PROGRESSION
        </div>
        <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
          E TO S
        </h2>
      </div>

      <div
        ref={trackRef}
        className="absolute top-1/2 -translate-y-1/2 flex items-center"
        style={{ width: "max-content", paddingLeft: "20vw", paddingRight: "20vw", gap: "8vw" }}
      >
        {RANKS.map((r) => (
          <div
            key={r.letter}
            data-rank-card
            className="flex flex-col items-center text-center"
            style={{ width: "60vw", maxWidth: 480 }}
          >
            <div
              data-rank-letter
              className="text-[14rem] md:text-[20rem] font-black leading-none mb-4"
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                color: r.color,
                textShadow: `0 0 80px ${r.color}80, 0 0 160px ${r.color}40`,
              }}
            >
              {r.letter}
            </div>
            <div
              className="text-xs font-mono uppercase tracking-[0.3em] mb-2"
              style={{ color: r.color }}
            >
              {r.title}
            </div>
            <p className="text-sm md:text-base" style={{ color: "var(--sl-text-muted)" }}>
              {r.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   QUESTS — three quest types with hover lift
   ────────────────────────────────────────────────────────────────────────── */

function QuestSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-quest-card]",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="relative py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-[0.4em] mb-4" style={{ color: "var(--sl-cyan)" }}>
            ◈ QUEST TYPES
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
            CHOOSE YOUR BATTLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUESTS.map((q) => (
            <motion.div
              key={q.type}
              data-quest-card
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="relative p-6 rounded-lg overflow-hidden cursor-pointer group"
              style={{
                background: "var(--sl-surface)",
                border: `1px solid ${q.color}30`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${q.color}, transparent)` }}
              />
              <div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: q.color, filter: "blur(40px)" }}
              />
              <q.icon size={28} style={{ color: q.color }} className="mb-4 relative" />
              <h3 className="text-xl font-bold mb-2 relative" style={{ fontFamily: "var(--font-orbitron), monospace", color: q.color }}>
                {q.title}
              </h3>
              <p className="text-sm mb-4 relative" style={{ color: "var(--sl-text-muted)" }}>
                {q.desc}
              </p>
              <div className="space-y-1.5 pt-3 border-t relative" style={{ borderColor: "var(--sl-border)" }}>
                {q.examples.map((ex) => (
                  <div key={ex} className="text-xs font-mono flex items-center gap-2" style={{ color: "var(--sl-text-dim)" }}>
                    <span style={{ color: q.color }}>›</span>
                    {ex}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   LIVE BUILD — IG counter
   ────────────────────────────────────────────────────────────────────────── */

function LiveBuildSection() {
  const ref = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const counter = counterRef.current;
      if (!counter) return;
      const target = { val: 0 };
      gsap.to(target, {
        val: 7000,
        duration: 2,
        ease: "power3.out",
        scrollTrigger: { trigger: counter, start: "top 80%" },
        onUpdate: () => {
          counter.textContent = Math.floor(target.val).toLocaleString();
        },
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{ backgroundImage: "url('/sl/shadow-army.jpg')" }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--sl-bg) 0%, transparent 30%, transparent 70%, var(--sl-bg) 100%)" }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="text-xs font-mono uppercase tracking-[0.4em] mb-4" style={{ color: "var(--sl-cyan)" }}>
          ◈ BUILT IN PUBLIC
        </div>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight mb-6" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
          THE SHADOW ARMY GROWS
        </h2>
        <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto" style={{ color: "var(--sl-text-muted)" }}>
          Every line of code, every quest design, every level-up — shipped live on Instagram.
          Join the hunters watching this System come to life.
        </p>

        <div className="flex items-center justify-center gap-8 mb-12">
          <div>
            <div
              ref={counterRef}
              className="text-5xl md:text-7xl font-black tabular-nums"
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                color: "var(--sl-cyan)",
                textShadow: "0 0 30px rgba(0,212,255,0.4)",
              }}
            >
              0
            </div>
            <div className="text-xs font-mono uppercase tracking-widest mt-2" style={{ color: "var(--sl-text-muted)" }}>
              Hunters following
            </div>
          </div>
        </div>

        <motion.a
          href="https://instagram.com/umartriedcoding"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 px-6 py-4 rounded-lg font-mono font-bold uppercase tracking-widest text-sm"
          style={{
            background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
            color: "#fff",
            boxShadow: "0 0 30px rgba(253,29,29,0.3)",
          }}
        >
          <InstagramIcon size={18} />
          Follow the Build
        </motion.a>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   FINAL CTA — full-color block with embedded waitlist
   ────────────────────────────────────────────────────────────────────────── */

function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const headlineY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glyphY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-final-headline]",
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        }
      );
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden px-4 md:px-8">
      <div
        className="relative max-w-7xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a0b3a 0%, #3a1a5a 40%, #0a2a4a 100%)",
          border: "1px solid rgba(0,212,255,0.25)",
          boxShadow: "0 40px 100px rgba(123,47,255,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Parallax gate image */}
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: "url('/sl/gate.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(26,11,58,0.6) 70%, rgba(26,11,58,0.95) 100%)",
          }}
        />

        {/* Floating glyphs */}
        <motion.div style={{ y: glyphY }} className="absolute top-10 right-10 hidden md:block opacity-60">
          <RankDotsGlyph size={64} delay={0.2} />
        </motion.div>
        <motion.div style={{ y: glyphY }} className="absolute bottom-10 left-10 hidden md:block opacity-40">
          <RankDotsGlyph size={44} delay={0.4} />
        </motion.div>

        <div className="relative py-24 md:py-36 px-6 md:px-12 text-center">
          <Skull size={48} style={{ color: "var(--sl-cyan)", margin: "0 auto 1.5rem" }} />

          <motion.h2
            data-final-headline
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.85] tracking-tight"
            style={{
              y: headlineY,
              fontFamily: "var(--font-orbitron), monospace",
              textShadow: "0 0 60px rgba(0,212,255,0.4)",
            }}
          >
            YOUR NEXT
            <br />
            <span style={{ color: "var(--sl-cyan)" }}>LEVEL-UP</span>
            <br />
            STARTS NOW
          </motion.h2>

          <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto" style={{ color: "var(--sl-text)" }}>
            Be among the first hunters to receive a System. Early access coming soon.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest" style={{ color: "#fbbf24" }}>
            <Flame size={12} />
            Founding member pricing · First 100 hunters only
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   FOOTER
   ────────────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="relative py-10 border-t" style={{ borderColor: "var(--sl-border)" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Crown size={16} style={{ color: "var(--sl-cyan)" }} />
          <span className="font-bold tracking-widest text-sm" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
            SYSTEM
          </span>
          <span className="text-xs font-mono ml-2" style={{ color: "var(--sl-text-dim)" }}>
            · Built in public
          </span>
        </div>
        <div className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
          © {new Date().getFullYear()} Solo Leveling System · Inspired by the manhwa
        </div>
      </div>
    </footer>
  );
}
