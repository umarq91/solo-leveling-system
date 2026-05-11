"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  api,
  StatsResponse,
  HeatmapResponse,
  ASPECT_LABELS,
  ASPECT_COLORS,
  RANK_COLORS,
  Aspect,
  QuestType,
  Rank,
} from "@/lib/api";
import dynamic from "next/dynamic";
import XpBar from "@/components/xp-bar";
import RankBadge from "@/components/rank-badge";
const ActivityHeatmap = dynamic(() => import("@/components/activity-heatmap"), { ssr: false });
import {
  Flame,
  Zap,
  Shield,
  CheckCircle,
  Trophy,
  CalendarDays,
  TrendingUp,
  Target,
  Clock,
  Star,
  Activity,
  Infinity as InfinityIcon,
} from "lucide-react";

// ── Rank metadata ────────────────────────────────────────────────────────────

const RANKS: Rank[] = ["E", "D", "C", "B", "A", "S"];
const ASPECTS: Aspect[] = ["FITNESS", "DESCIPLINE", "CAREER", "INTELLECT", "SOCIAL"];
const QUEST_TYPES: { type: QuestType; label: string; color: string; icon: React.ReactNode }[] = [
  { type: "DAILY",     label: "Daily",     color: "var(--sl-cyan)", icon: <CalendarDays size={13} /> },
  { type: "WEEKLY",    label: "Weekly",    color: "#a78bfa",        icon: <Clock size={13} /> },
  { type: "SIDE",      label: "Side",      color: "#f97316",        icon: <Star size={13} /> },
  { type: "PERMANENT", label: "Permanent", color: "#fbbf24",        icon: <InfinityIcon size={13} /> },
];

// level thresholds at which each rank begins
const RANK_FLOOR: Record<Rank, number> = { E: 1, D: 10, C: 20, B: 35, A: 50, S: 75 };
const RANK_CEIL: Record<Rank, number>  = { E: 10, D: 20, C: 35, B: 50, A: 75, S: Infinity };

function rankProgressPct(level: number, rank: Rank): number {
  if (rank === "S") return 100;
  const floor = RANK_FLOOR[rank];
  const ceil  = RANK_CEIL[rank];
  return Math.min(100, Math.floor(((level - floor) / (ceil - floor)) * 100));
}

function memberSince(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, h] = await Promise.all([api.users.stats(), api.users.heatmap(90)]);
        setStats(s);
        setHeatmap(h);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!user) return null;

  const rankColor     = RANK_COLORS[user.rank];
  const xpPct         = Math.min(100, Math.floor((user.current_xp / user.up_to_next) * 100));
  const rankPct       = rankProgressPct(user.level, user.rank);
  const currentRankIdx = RANKS.indexOf(user.rank);

  const maxAspectXp   = stats
    ? Math.max(1, ...ASPECTS.map((a) => stats.xp_by_aspect[a] ?? 0))
    : 1;
  const maxTypeCount  = stats
    ? Math.max(1, ...QUEST_TYPES.map(({ type }) => stats.completed_by_type[type] ?? 0))
    : 1;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* ── Page header ── */}
      <div>
        <div className="system-header mb-1">◈ HUNTER PROFILE</div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-orbitron), monospace", color: "var(--sl-text)" }}
        >
          Character Sheet
        </h1>
      </div>

      {/* ── Hero card ── */}
      <div
        className="relative p-6 rounded-lg overflow-hidden"
        style={{
          background: "var(--sl-surface)",
          border: `1px solid ${rankColor}50`,
          boxShadow: `0 0 40px ${rankColor}10`,
        }}
      >
        {/* Corner marks */}
        {[["top-0 left-0 border-t-2 border-l-2","rounded-tl"],["top-0 right-0 border-t-2 border-r-2","rounded-tr"],["bottom-0 left-0 border-b-2 border-l-2","rounded-bl"],["bottom-0 right-0 border-b-2 border-r-2","rounded-br"]].map(([pos, r]) => (
          <div key={pos} className={`absolute w-4 h-4 ${pos} ${r}`} style={{ borderColor: rankColor }} />
        ))}

        <div className="flex items-center gap-6">
          <RankBadge rank={user.rank} size="xl" showLabel />

          <div className="flex-1 min-w-0">
            <div className="system-header mb-1">[ PLAYER STATUS ]</div>
            <div
              className="text-3xl font-black leading-none mb-1"
              style={{ fontFamily: "var(--font-orbitron), monospace", color: "var(--sl-text)" }}
            >
              {user.username}
            </div>
            <div
              className="text-4xl font-black mb-3"
              style={{ fontFamily: "var(--font-orbitron), monospace", color: rankColor, textShadow: `0 0 20px ${rankColor}60` }}
            >
              LV.{user.level}
            </div>

            <XpBar current={user.current_xp} max={user.up_to_next} pct={xpPct} height="lg" showNumbers />

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {user.streak_days > 0 && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded"
                  style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
                >
                  <Flame size={13} style={{ color: "#fbbf24" }} />
                  <span className="text-xs font-mono font-bold" style={{ color: "#fbbf24" }}>
                    {user.streak_days}d streak
                  </span>
                </div>
              )}
              <span className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
                Member since {memberSince(user.created_at)} · {daysSince(user.created_at)} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rank progression path ── */}
      <div
        className="p-5 rounded-lg"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={15} style={{ color: "var(--sl-cyan)" }} />
          <div className="system-header">RANK PROGRESSION</div>
        </div>

        {/* Path nodes */}
        <div className="flex items-center mb-4">
          {RANKS.map((rank, i) => {
            const isPast    = i < currentRankIdx;
            const isCurrent = i === currentRankIdx;
            const isFuture  = i > currentRankIdx;
            const color     = RANK_COLORS[rank];

            return (
              <div key={rank} className="flex items-center flex-1 last:flex-none">
                {/* Node */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="rank-badge w-9 h-9 text-sm font-bold relative"
                    style={{
                      color:            isFuture ? "var(--sl-text-dim)" : color,
                      borderColor:      isFuture ? "var(--sl-border)" : color,
                      backgroundColor:  isFuture ? "transparent" : `${color}18`,
                      boxShadow:        isCurrent ? `0 0 16px ${color}55` : undefined,
                      animation:        isCurrent ? "pulse-glow 2.5s ease-in-out infinite" : undefined,
                      opacity:          isFuture ? 0.35 : 1,
                    }}
                  >
                    {isPast ? "✓" : rank}
                  </div>
                  <span
                    className="text-[0.55rem] font-mono uppercase tracking-widest"
                    style={{ color: isFuture ? "var(--sl-text-dim)" : color, opacity: isFuture ? 0.4 : 1 }}
                  >
                    {rank === "S" ? "LV75+" : `LV${RANK_FLOOR[rank]}`}
                  </span>
                </div>

                {/* Connector line */}
                {i < RANKS.length - 1 && (
                  <div
                    className="flex-1 h-px mx-1 mb-5"
                    style={{
                      background: i < currentRankIdx
                        ? `linear-gradient(90deg, ${RANK_COLORS[rank]}, ${RANK_COLORS[RANKS[i + 1]]})`
                        : "var(--sl-border)",
                      opacity: i >= currentRankIdx ? 0.3 : 1,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress within current rank */}
        {user.rank !== "S" && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
                Progress to{" "}
                <span style={{ color: RANK_COLORS[RANKS[currentRankIdx + 1]] }}>
                  {RANKS[currentRankIdx + 1]}-Rank
                </span>
                {" "}(LV{RANK_CEIL[user.rank]})
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: rankColor }}>
                {rankPct}%
              </span>
            </div>
            <div className="xp-bar-track h-2">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${rankPct}%`,
                  background: `linear-gradient(90deg, ${rankColor}aa, ${rankColor})`,
                  boxShadow: rankPct > 0 ? `0 0 8px ${rankColor}60` : undefined,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[0.6rem] font-mono" style={{ color: "var(--sl-text-dim)" }}>
                LV{RANK_FLOOR[user.rank]} ({user.rank}-Rank)
              </span>
              <span className="text-[0.6rem] font-mono" style={{ color: "var(--sl-text-dim)" }}>
                LV{RANK_CEIL[user.rank]} ({RANKS[currentRankIdx + 1]}-Rank)
              </span>
            </div>
          </div>
        )}
        {user.rank === "S" && (
          <div className="text-center py-2">
            <span
              className="text-xs font-mono tracking-widest"
              style={{ color: RANK_COLORS.S, textShadow: `0 0 12px ${RANK_COLORS.S}60` }}
            >
              ◈ MAXIMUM RANK ACHIEVED ◈
            </span>
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          icon={<CheckCircle size={18} />}
          label="Quests Done"
          value={loading ? "..." : stats?.completed_total ?? 0}
          color="#34d399"
        />
        <StatTile
          icon={<Zap size={18} />}
          label="Total XP"
          value={loading ? "..." : user.total_xp.toLocaleString()}
          color="var(--sl-cyan)"
        />
        <StatTile
          icon={<Flame size={18} />}
          label="Best Streak"
          value={loading ? "..." : `${user.best_streak ?? 0}d`}
          color="#fbbf24"
        />
        <StatTile
          icon={<Activity size={18} />}
          label="Active Now"
          value={loading ? "..." : stats?.active_quests ?? 0}
          color="#a78bfa"
        />
        <StatTile
          icon={<Target size={18} />}
          label="Completion"
          value={loading ? "..." : stats?.completion_rate != null ? `${stats.completion_rate}%` : "—"}
          color="#f97316"
        />
        <StatTile
          icon={<CalendarDays size={18} />}
          label="This Week"
          value={loading ? "..." : stats?.quests_this_week ?? 0}
          color="#60a5fa"
        />
        <StatTile
          icon={<TrendingUp size={18} />}
          label="Days Active"
          value={loading ? "..." : heatmap?.totals.active_days ?? 0}
          color="#34d399"
        />
        <StatTile
          icon={<Shield size={18} />}
          label="Current Streak"
          value={loading ? "..." : `${user.streak_days}d`}
          color="#fbbf24"
        />
      </div>

      {/* ── Quest type breakdown ── */}
      <div
        className="p-5 rounded-lg"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={15} style={{ color: "var(--sl-cyan)" }} />
          <div className="system-header">QUEST TYPE BREAKDOWN</div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {QUEST_TYPES.map(({ type }) => (
              <div key={type} className="h-8 rounded animate-pulse" style={{ background: "var(--sl-surface-2)" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {QUEST_TYPES.map(({ type, label, color, icon }) => {
              const count = stats?.completed_by_type[type] ?? 0;
              const pct   = Math.floor((count / maxTypeCount) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-24 shrink-0" style={{ color }}>
                    {icon}
                    <span className="text-xs font-mono uppercase tracking-wide">{label}</span>
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--sl-border)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}88, ${color})`,
                          boxShadow: pct > 0 ? `0 0 6px ${color}50` : undefined,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold w-8 text-right" style={{ color }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Attribute breakdown ── */}
      <div
        className="p-5 rounded-lg"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} style={{ color: "var(--sl-cyan)" }} />
          <div className="system-header">ATTRIBUTE BREAKDOWN</div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {ASPECTS.map((a) => (
              <div key={a} className="h-10 rounded animate-pulse" style={{ background: "var(--sl-surface-2)" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ASPECTS.map((aspect) => {
              const count = stats?.completed_by_aspect[aspect] ?? 0;
              const xp    = stats?.xp_by_aspect[aspect] ?? 0;
              const pct   = Math.floor(((stats?.xp_by_aspect[aspect] ?? 0) / maxAspectXp) * 100);
              const color = ASPECT_COLORS[aspect];

              return (
                <div key={aspect}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color }}>
                      {ASPECT_LABELS[aspect]}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
                        {count} quest{count !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        <Zap size={10} style={{ color }} />
                        <span className="text-xs font-mono font-bold" style={{ color }}>
                          {xp.toLocaleString()} XP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--sl-border)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        boxShadow: pct > 0 ? `0 0 8px ${color}55` : undefined,
                        transition: "width 1.2s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Activity heatmap ── */}
      <div
        className="p-5 rounded-lg"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} style={{ color: "var(--sl-cyan)" }} />
            <div className="system-header">ACTIVITY · LAST 90 DAYS</div>
          </div>
          {heatmap && (
            <div className="flex items-center gap-4 text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
              <span>
                <span style={{ color: "var(--sl-cyan)" }}>{heatmap.totals.active_days}</span> active days
              </span>
              <span>
                <span style={{ color: "#fbbf24" }}>{heatmap.totals.xp.toLocaleString()}</span> XP earned
              </span>
              <span>
                <span style={{ color: "#34d399" }}>{heatmap.totals.completed}</span> completed
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-24 rounded animate-pulse" style={{ background: "var(--sl-surface-2)" }} />
        ) : heatmap ? (
          <ActivityHeatmap data={heatmap.data} />
        ) : (
          <div className="text-xs font-mono py-4 text-center" style={{ color: "var(--sl-text-dim)" }}>
            No activity data yet. Complete quests to build your record.
          </div>
        )}
      </div>

    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="p-4 rounded-lg flex flex-col gap-2"
      style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-[0.6rem] font-mono uppercase tracking-widest" style={{ color: "var(--sl-text-dim)" }}>
          {label}
        </span>
      </div>
      <div className="text-xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
