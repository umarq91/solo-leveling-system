"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Flame } from "lucide-react";

type Tone = "calm" | "warn" | "urgent" | "expired";

const TONE_COLORS: Record<Tone, string> = {
  calm: "#fbbf24",
  warn: "#fb923c",
  urgent: "#f87171",
  expired: "#6b7280",
};

export interface CountdownState {
  d: number;
  h: number;
  m: number;
  s: number;
  totalMs: number;
  tone: Tone;
  color: string;
  text: string;
}

const IDLE: CountdownState = {
  d: 0, h: 0, m: 0, s: 0,
  totalMs: Number.POSITIVE_INFINITY,
  tone: "calm",
  color: TONE_COLORS.calm,
  text: "",
};

function compute(target: number): CountdownState {
  const totalMs = Math.max(0, target - Date.now());
  const d = Math.floor(totalMs / 86_400_000);
  const h = Math.floor((totalMs % 86_400_000) / 3_600_000);
  const m = Math.floor((totalMs % 3_600_000) / 60_000);
  const s = Math.floor((totalMs % 60_000) / 1000);

  let tone: Tone;
  if (totalMs <= 0) tone = "expired";
  else {
    const minutes = totalMs / 60_000;
    if (minutes <= 60) tone = "urgent";
    else if (minutes <= 240) tone = "warn";
    else tone = "calm";
  }

  let text: string;
  if (totalMs <= 0) text = "Expired";
  else if (d > 0) text = `${d}d ${h}h ${m}m`;
  else {
    const pad = (n: number) => n.toString().padStart(2, "0");
    text = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  return { d, h, m, s, totalMs, tone, color: TONE_COLORS[tone], text };
}

export function useCountdown(expiresAt: string | null | undefined): CountdownState {
  const target = expiresAt ? new Date(expiresAt).getTime() : 0;
  const [state, setState] = useState<CountdownState>(() =>
    expiresAt ? compute(target) : IDLE,
  );

  useEffect(() => {
    if (!expiresAt) {
      setState(IDLE);
      return;
    }
    setState(compute(target));
    const id = setInterval(() => setState(compute(target)), 1000);
    return () => clearInterval(id);
  }, [target, expiresAt]);

  return state;
}

interface Props {
  expiresAt: string;
  variant?: "inline" | "banner";
  label?: string;
  /** Total length of the countdown window in ms — enables the day-progress bar in the banner. */
  windowMs?: number;
  /** When > 0 and the timer is warn/urgent, surface a streak-at-risk warning. */
  streakDays?: number;
}

export default function CountdownTimer({
  expiresAt,
  variant = "inline",
  label,
  windowMs,
  streakDays,
}: Props) {
  const { tone, color, text, totalMs } = useCountdown(expiresAt);
  const urgent = tone === "urgent" && totalMs > 0;
  const streakAtRisk =
    !!streakDays && streakDays > 0 && (tone === "urgent" || tone === "warn") && totalMs > 0;

  if (variant === "banner") {
    const elapsedPct =
      windowMs && windowMs > 0
        ? Math.min(100, Math.max(0, ((windowMs - totalMs) / windowMs) * 100))
        : null;

    return (
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: `linear-gradient(90deg, ${color}12, transparent 70%)`,
          border: `1px solid ${color}40`,
          boxShadow: urgent ? `0 0 22px ${color}50` : undefined,
          animation: urgent ? "urgent-pulse 1.4s ease-in-out infinite" : undefined,
        }}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded" style={{ background: `${color}18`, color }}>
              {tone === "urgent" ? <AlertTriangle size={16} /> : <Clock size={16} />}
            </div>
            <div>
              <div
                className="text-[0.6rem] font-mono uppercase tracking-[0.25em]"
                style={{ color: "var(--sl-text-muted)" }}
              >
                {label ?? "Daily Reset"}
              </div>
              <div className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
                {tone === "urgent"
                  ? "Quests expire soon — XP penalty incoming"
                  : tone === "warn"
                    ? "Time is running short, hunter"
                    : "Complete your dailies before reset"}
              </div>
              {streakAtRisk && (
                <div
                  className="mt-1 inline-flex items-center gap-1 text-[0.65rem] font-mono font-bold uppercase tracking-wider"
                  style={{ color: "#fbbf24" }}
                >
                  <Flame size={11} />
                  {streakDays}-day streak at risk
                </div>
              )}
            </div>
          </div>
          <div
            className="font-mono font-black text-2xl tabular-nums"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color,
              textShadow: `0 0 14px ${color}80`,
            }}
          >
            {text}
          </div>
        </div>
        {elapsedPct !== null && (
          <div className="h-[3px] w-full" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div
              className="h-full transition-[width] duration-1000 ease-linear"
              style={{
                width: `${elapsedPct}%`,
                background: `linear-gradient(90deg, ${color}aa, ${color})`,
                boxShadow: `0 0 8px ${color}80`,
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded tabular-nums"
      style={{
        color,
        background: `${color}14`,
        border: `1px solid ${color}33`,
        animation: urgent ? "urgent-pulse 1.4s ease-in-out infinite" : undefined,
      }}
    >
      <Clock size={10} />
      {text}
    </span>
  );
}
