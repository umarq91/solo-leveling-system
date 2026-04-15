"use client";

import { UserQuest, ASPECT_COLORS, RANK_COLORS, timeUntil } from "@/lib/api";
import AspectBadge from "./aspect-badge";
import RankBadge from "./rank-badge";
import { Zap, Clock, CheckCircle, XCircle, Timer } from "lucide-react";

interface Props {
  userQuest: UserQuest;
  onComplete?: (id: number) => void;
  completing?: boolean;
}

const STATUS_CONFIG = {
  ACTIVE: { icon: null, color: "var(--sl-cyan)", label: "ACTIVE" },
  COMPLETED: { icon: CheckCircle, color: "#34d399", label: "COMPLETED" },
  FAILED: { icon: XCircle, color: "#f87171", label: "FAILED" },
  EXPIRED: { icon: Timer, color: "#6b7280", label: "EXPIRED" },
};

export default function QuestCard({ userQuest, onComplete, completing }: Props) {
  const { quest, status, expires_at } = userQuest;
  const accentColor = ASPECT_COLORS[quest.aspect];
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div
      className="quest-card p-4 pl-6"
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight" style={{ color: "var(--sl-text)" }}>
            {quest.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RankBadge rank={quest.rank} size="sm" />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--sl-text-muted)" }}>
        {quest.description}
      </p>

      {/* Tags row */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        <AspectBadge aspect={quest.aspect} />
        <span
          className="text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wide"
          style={{ color: "var(--sl-text-dim)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--sl-border)" }}
        >
          {quest.type}
        </span>
        {expires_at && status === "ACTIVE" && (
          <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded" style={{ color: "#fbbf24", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <Clock size={10} />
            {timeUntil(expires_at)}
          </span>
        )}
      </div>

      {/* Footer: XP + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Zap size={13} style={{ color: "var(--sl-cyan)" }} />
          <span className="font-mono text-sm font-bold" style={{ color: "var(--sl-cyan)" }}>
            +{quest.xp_reward} XP
          </span>
        </div>

        {status === "ACTIVE" && onComplete ? (
          <button
            className="sl-btn sl-btn-primary"
            style={{ padding: "0.3rem 0.875rem", fontSize: "0.7rem" }}
            onClick={() => onComplete(userQuest.id)}
            disabled={completing}
          >
            {completing ? "..." : "COMPLETE"}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            {statusCfg.icon && <statusCfg.icon size={13} style={{ color: statusCfg.color }} />}
            <span className="text-xs font-mono" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
