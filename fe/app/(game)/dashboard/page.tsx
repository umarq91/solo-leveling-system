"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, StatsResponse, HeatmapResponse, ASPECT_LABELS, ASPECT_COLORS, RANK_COLORS, Aspect } from "@/lib/api";
import XpBar from "@/components/xp-bar";
import RankBadge from "@/components/rank-badge";
import ActivityHeatmap from "@/components/activity-heatmap";
import { Flame, Zap, Shield, CheckCircle, TrendingUp, Activity, CalendarDays } from "lucide-react";

const ASPECTS: Aspect[] = ["FITNESS", "DESCIPLINE", "CAREER", "INTELLECT", "SOCIAL"];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
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

  const xpPct = Math.min(100, Math.floor((user.current_xp / user.up_to_next) * 100));
  const rankColor = RANK_COLORS[user.rank];
  const maxAspectCount = stats
    ? Math.max(1, ...ASPECTS.map((a) => stats.completed_by_aspect[a] ?? 0))
    : 1;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="system-header mb-1">◈ HUNTER STATUS</div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-orbitron), monospace", color: "var(--sl-text)" }}
        >
          Dashboard
        </h1>
      </div>

      {/* Top row: Player card + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Player status window */}
        <div
          className="lg:col-span-2 relative p-6 rounded-lg"
          style={{
            background: "var(--sl-surface)",
            border: `1px solid ${rankColor}40`,
            boxShadow: `0 0 30px ${rankColor}12`,
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: rankColor }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: rankColor }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: `${rankColor}60` }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: `${rankColor}60` }} />

          <div className="system-header mb-4">[ PLAYER STATUS ]</div>

          <div className="flex items-center gap-6 mb-6">
            <RankBadge rank={user.rank} size="xl" showLabel />
            <div>
              <div
                className="text-3xl font-black leading-none mb-1"
                style={{
                  fontFamily: "var(--font-orbitron), monospace",
                  color: "var(--sl-text)",
                }}
              >
                {user.username}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-4xl font-black"
                  style={{
                    fontFamily: "var(--font-orbitron), monospace",
                    color: rankColor,
                    textShadow: `0 0 20px ${rankColor}60`,
                  }}
                >
                  LV.{user.level}
                </span>
              </div>
            </div>
          </div>

          {/* XP section */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <Zap size={13} style={{ color: "var(--sl-cyan)" }} />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--sl-text-muted)" }}>
                  Experience Points
                </span>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
                {xpPct}%
              </span>
            </div>
            <XpBar current={user.current_xp} max={user.up_to_next} pct={xpPct} height="lg" showNumbers />
          </div>

          {user.streak_days > 0 && (
            <div
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
            >
              <Flame size={14} style={{ color: "#fbbf24" }} />
              <span className="text-sm font-mono font-bold" style={{ color: "#fbbf24" }}>
                {user.streak_days} Day Streak
              </span>
              <span className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
                {user.streak_days >= 30 ? "×1.5 XP" : user.streak_days >= 14 ? "×1.3 XP" : user.streak_days >= 7 ? "×1.15 XP" : "Keep going!"}
              </span>
            </div>
          )}
        </div>

        {/* Quick stats column */}
        <div className="flex flex-col gap-4">
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Quests Completed"
            value={stats?.completed_total ?? "—"}
            color="#34d399"
            loading={loading}
          />
          <StatCard
            icon={<Activity size={20} />}
            label="Active Quests"
            value={stats?.active_quests ?? "—"}
            color="var(--sl-cyan)"
            loading={loading}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Total XP Earned"
            value={user.total_xp.toLocaleString()}
            color="#fbbf24"
            loading={loading}
          />
        </div>
      </div>

      {/* Activity heatmap */}
      <div
        className="p-6 rounded-lg mb-6"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} style={{ color: "var(--sl-cyan)" }} />
            <div className="system-header">ACTIVITY · LAST 90 DAYS</div>
          </div>
          {heatmap && (
            <div className="flex items-center gap-4 text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
              <span>
                <span style={{ color: "var(--sl-cyan)" }}>{heatmap.totals.active_days}</span> active days
              </span>
              <span>
                <span style={{ color: "#fbbf24" }}>{heatmap.totals.completed}</span> completed
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-24 rounded animate-pulse" style={{ background: "var(--sl-surface-2)" }} />
        ) : heatmap ? (
          <ActivityHeatmap data={heatmap.data} />
        ) : (
          <div className="text-xs font-mono py-4" style={{ color: "var(--sl-text-dim)" }}>
            No activity data yet.
          </div>
        )}
      </div>

      {/* Aspect breakdown */}
      <div
        className="p-6 rounded-lg"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} style={{ color: "var(--sl-cyan)" }} />
          <div className="system-header">ATTRIBUTE BREAKDOWN</div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {ASPECTS.map((a) => (
              <div key={a} className="h-10 rounded" style={{ background: "var(--sl-surface-2)" }} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ASPECTS.map((aspect) => {
              const count = stats?.completed_by_aspect[aspect] ?? 0;
              const pct = Math.floor((count / maxAspectCount) * 100);
              const color = ASPECT_COLORS[aspect];

              return (
                <div key={aspect}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color }}>
                      {ASPECT_LABELS[aspect]}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color }}>
                      {count} quest{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--sl-border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}aa, ${color})`,
                        boxShadow: pct > 0 ? `0 0 8px ${color}60` : undefined,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  loading: boolean;
}) {
  return (
    <div
      className="flex-1 p-4 rounded-lg flex items-center gap-4"
      style={{
        background: "var(--sl-surface)",
        border: "1px solid var(--sl-border)",
      }}
    >
      <div
        className="p-2 rounded"
        style={{ background: `${color}14`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
          {label}
        </div>
        <div
          className="text-xl font-bold font-mono mt-0.5"
          style={{ color: loading ? "var(--sl-text-dim)" : color }}
        >
          {loading ? "..." : value}
        </div>
      </div>
    </div>
  );
}
