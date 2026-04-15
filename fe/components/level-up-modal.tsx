"use client";

import { CompleteQuestResponse, RANK_COLORS } from "@/lib/api";
import { Zap, TrendingUp, Award } from "lucide-react";

interface Props {
  result: CompleteQuestResponse;
  onClose: () => void;
}

export default function LevelUpModal({ result, onClose }: Props) {
  const { leveled_up, xp_gained, streak_multiplier, streak_days, user } = result;
  const rankColor = RANK_COLORS[user.rank];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative max-w-sm w-full mx-4 p-8 rounded-lg text-center"
        style={{
          background: "linear-gradient(135deg, #0a0b18 0%, #0f1028 100%)",
          border: `1px solid ${leveled_up ? rankColor : "var(--sl-border-bright)"}`,
          boxShadow: leveled_up
            ? `0 0 60px ${rankColor}40, 0 0 120px ${rankColor}20, 0 20px 60px rgba(0,0,0,0.8)`
            : "0 0 40px rgba(0,212,255,0.2), 0 20px 60px rgba(0,0,0,0.8)",
          animation: "level-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: leveled_up ? rankColor : "var(--sl-cyan)" }} />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: leveled_up ? rankColor : "var(--sl-cyan)" }} />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: leveled_up ? rankColor : "var(--sl-cyan)" }} />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: leveled_up ? rankColor : "var(--sl-cyan)" }} />

        <div className="system-header mb-4">
          {leveled_up ? "⬆ LEVEL UP" : "✓ QUEST COMPLETE"}
        </div>

        {leveled_up ? (
          <>
            <div
              className="text-7xl font-black mb-2"
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                color: rankColor,
                textShadow: `0 0 30px ${rankColor}80`,
              }}
            >
              {user.level}
            </div>
            <div className="text-sm mb-1" style={{ color: "var(--sl-text-muted)" }}>NEW LEVEL</div>
            <div
              className="text-2xl font-bold mb-6"
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                color: rankColor,
              }}
            >
              {user.rank}-RANK
            </div>
          </>
        ) : (
          <div className="mb-6">
            <Zap size={40} className="mx-auto mb-2" style={{ color: "var(--sl-cyan)" }} />
          </div>
        )}

        <div className="space-y-2 mb-6">
          <div
            className="flex items-center justify-between px-4 py-2 rounded"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}
          >
            <span className="flex items-center gap-2 text-sm" style={{ color: "var(--sl-text-muted)" }}>
              <Zap size={14} />
              XP Gained
            </span>
            <span className="font-mono font-bold" style={{ color: "var(--sl-cyan)" }}>
              +{xp_gained} XP
            </span>
          </div>

          {streak_multiplier > 1 && (
            <div
              className="flex items-center justify-between px-4 py-2 rounded"
              style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}
            >
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--sl-text-muted)" }}>
                <TrendingUp size={14} />
                Streak Bonus
              </span>
              <span className="font-mono font-bold" style={{ color: "#fbbf24" }}>
                ×{streak_multiplier} ({streak_days}d streak)
              </span>
            </div>
          )}

          {leveled_up && (
            <div
              className="flex items-center justify-between px-4 py-2 rounded"
              style={{ background: `${rankColor}0f`, border: `1px solid ${rankColor}25` }}
            >
              <span className="flex items-center gap-2 text-sm" style={{ color: "var(--sl-text-muted)" }}>
                <Award size={14} />
                Rank
              </span>
              <span className="font-mono font-bold" style={{ color: rankColor }}>
                {user.rank}-RANK
              </span>
            </div>
          )}
        </div>

        <button className="sl-btn sl-btn-primary w-full" onClick={onClose}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
