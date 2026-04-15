"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, UserQuest, CompleteQuestResponse, QuestType } from "@/lib/api";
import QuestCard from "@/components/quest-card";
import LevelUpModal from "@/components/level-up-modal";
import { Swords, RefreshCw, Clock, Infinity, Calendar } from "lucide-react";

type Tab = "active" | "history";
const QUEST_TYPES: { type: QuestType; label: string; icon: React.ReactNode }[] = [
  { type: "DAILY", label: "Daily", icon: <Calendar size={13} /> },
  { type: "WEEKLY", label: "Weekly", icon: <Clock size={13} /> },
  { type: "PERMANENT", label: "Permanent", icon: <Infinity size={13} /> },
];

export default function QuestsPage() {
  const { updateUser } = useAuth();

  const [tab, setTab] = useState<Tab>("active");
  const [activeQuests, setActiveQuests] = useState<UserQuest[]>([]);
  const [history, setHistory] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);
  const [completionResult, setCompletionResult] = useState<CompleteQuestResponse | null>(null);
  const [error, setError] = useState("");

  const loadActive = useCallback(async () => {
    const { quests } = await api.quests.active();
    setActiveQuests(quests);
  }, []);

  const loadHistory = useCallback(async () => {
    const { quests } = await api.quests.history();
    setHistory(quests);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await loadActive();
      } catch {
        setError("Failed to load quests");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadActive]);

  async function handleAssignDaily() {
    setAssigning(true);
    setError("");
    try {
      const result = await api.quests.assignDaily();
      if (result.assigned.length === 0) {
        setError(result.message);
      } else {
        await loadActive();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign quests");
    } finally {
      setAssigning(false);
    }
  }

  async function handleComplete(userQuestId: number) {
    setCompleting(userQuestId);
    setError("");
    try {
      const result = await api.quests.complete(userQuestId);
      updateUser(result.user);
      setCompletionResult(result);
      setActiveQuests((prev) => prev.filter((q) => q.id !== userQuestId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete quest");
    } finally {
      setCompleting(null);
    }
  }

  async function handleTabChange(newTab: Tab) {
    setTab(newTab);
    if (newTab === "history" && history.length === 0) {
      try {
        await loadHistory();
      } catch {
        setError("Failed to load history");
      }
    }
  }

  function handleRefresh() {
    setError("");
    if (tab === "active") loadActive();
    else loadHistory();
  }

  // Group active quests by type
  const byType = QUEST_TYPES.reduce(
    (acc, { type }) => {
      acc[type] = activeQuests.filter((q) => q.quest.type === type);
      return acc;
    },
    {} as Record<QuestType, UserQuest[]>
  );

  const dailyQuests = byType["DAILY"];
  const hasDailyQuests = dailyQuests.length > 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="system-header mb-1">◈ QUEST BOARD</div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-orbitron), monospace", color: "var(--sl-text)" }}
          >
            Quests
          </h1>
        </div>
        <button
          className="sl-btn sl-btn-ghost"
          onClick={handleRefresh}
          style={{ padding: "0.4rem 0.75rem" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded text-sm font-mono"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded" style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)", width: "fit-content" }}>
        <button
          className={`sl-btn ${tab === "active" ? "sl-btn-primary" : "sl-btn-ghost"}`}
          style={{ padding: "0.35rem 1rem", border: "none" }}
          onClick={() => handleTabChange("active")}
        >
          <Swords size={14} />
          Active
          {activeQuests.length > 0 && (
            <span
              className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "var(--sl-cyan)", color: "#05050e", fontSize: "0.65rem" }}
            >
              {activeQuests.length}
            </span>
          )}
        </button>
        <button
          className={`sl-btn ${tab === "history" ? "sl-btn-primary" : "sl-btn-ghost"}`}
          style={{ padding: "0.35rem 1rem", border: "none" }}
          onClick={() => handleTabChange("history")}
        >
          History
        </button>
      </div>

      {/* Active tab */}
      {tab === "active" && (
        <div>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Daily Quests section with assign button */}
              <QuestSection
                type="DAILY"
                label="Daily Quests"
                icon={<Calendar size={14} />}
                quests={dailyQuests}
                onComplete={handleComplete}
                completing={completing}
                emptyAction={
                  !hasDailyQuests ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-3">📋</div>
                      <p className="text-sm mb-4" style={{ color: "var(--sl-text-muted)" }}>
                        No daily quests assigned today.
                      </p>
                      <button
                        className="sl-btn sl-btn-primary"
                        onClick={handleAssignDaily}
                        disabled={assigning}
                      >
                        <Calendar size={14} />
                        {assigning ? "ASSIGNING..." : "GET DAILY QUESTS"}
                      </button>
                    </div>
                  ) : undefined
                }
              />

              <QuestSection
                type="WEEKLY"
                label="Weekly Quests"
                icon={<Clock size={14} />}
                quests={byType["WEEKLY"]}
                onComplete={handleComplete}
                completing={completing}
              />

              <QuestSection
                type="PERMANENT"
                label="Permanent Quests"
                icon={<Infinity size={14} />}
                quests={byType["PERMANENT"]}
                onComplete={handleComplete}
                completing={completing}
              />

              {activeQuests.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⚔</div>
                  <div className="system-header mb-2">NO ACTIVE QUESTS</div>
                  <p className="text-sm" style={{ color: "var(--sl-text-muted)" }}>
                    You have no active quests. Get your daily quests above to start leveling up.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📜</div>
              <div className="system-header mb-2">NO HISTORY YET</div>
              <p className="text-sm" style={{ color: "var(--sl-text-muted)" }}>
                Complete quests to build your history.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((uq) => (
                <QuestCard key={uq.id} userQuest={uq} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Level-up / completion modal */}
      {completionResult && (
        <LevelUpModal
          result={completionResult}
          onClose={() => setCompletionResult(null)}
        />
      )}
    </div>
  );
}

function QuestSection({
  type,
  label,
  icon,
  quests,
  onComplete,
  completing,
  emptyAction,
}: {
  type: QuestType;
  label: string;
  icon: React.ReactNode;
  quests: UserQuest[];
  onComplete: (id: number) => void;
  completing: number | null;
  emptyAction?: React.ReactNode;
}) {
  if (quests.length === 0 && !emptyAction) return null;

  const TYPE_COLORS: Record<QuestType, string> = {
    DAILY: "var(--sl-cyan)",
    WEEKLY: "#a78bfa",
    PERMANENT: "#fbbf24",
  };
  const color = TYPE_COLORS[type];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color }}>
          {label}
        </h2>
        {quests.length > 0 && (
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ color, background: `${color}14`, border: `1px solid ${color}30` }}
          >
            {quests.length}
          </span>
        )}
      </div>

      {quests.length > 0 ? (
        <div className="space-y-2">
          {quests.map((uq) => (
            <QuestCard
              key={uq.id}
              userQuest={uq}
              onComplete={onComplete}
              completing={completing === uq.id}
            />
          ))}
        </div>
      ) : (
        emptyAction
      )}
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-28 rounded-lg animate-pulse"
          style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)" }}
        />
      ))}
    </div>
  );
}
