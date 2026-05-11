"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { api, UserQuest, CompleteQuestResponse, QuestType } from "@/lib/api";
import QuestCard from "@/components/quest-card";
import LevelUpModal from "@/components/level-up-modal";
import SideQuestTriggeredModal from "@/components/side-quest-triggered-modal";
import CountdownTimer from "@/components/countdown-timer";
import { Swords, RefreshCw, Clock, Infinity, Calendar, Zap } from "lucide-react";

const SIDE_MAX_SLOTS = 2;
const DAILY_TRIGGER_THRESHOLD = 3;

function endOfTodayIso(): string {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

type Tab = "active" | "history";
const QUEST_TYPES: { type: QuestType; label: string; icon: React.ReactNode }[] = [
  { type: "DAILY", label: "Daily", icon: <Calendar size={13} /> },
  { type: "WEEKLY", label: "Weekly", icon: <Clock size={13} /> },
  { type: "PERMANENT", label: "Permanent", icon: <Infinity size={13} /> },
  { type: "SIDE", label: "Side", icon: <Zap size={13} /> },
];

export default function QuestsPage() {
  const { user, updateUser } = useAuth();

  const [tab, setTab] = useState<Tab>("active");
  const [activeQuests, setActiveQuests] = useState<UserQuest[]>([]);
  const [history, setHistory] = useState<UserQuest[]>([]);
  const [dailyCompletedToday, setDailyCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);
  const [fadingIds, setFadingIds] = useState<Set<number>>(new Set());
  const [completionResult, setCompletionResult] = useState<CompleteQuestResponse | null>(null);
  const [triggeredSideQuest, setTriggeredSideQuest] = useState<UserQuest | null>(null);
  const [error, setError] = useState("");

  const loadActive = useCallback(async () => {
    const result = await api.quests.active();
    setActiveQuests(result.quests);
    setDailyCompletedToday(result.daily_completed_today);
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

  async function handleComplete(userQuestId: number) {
    const completedQuest = activeQuests.find((q) => q.id === userQuestId);
    setCompleting(userQuestId);
    setError("");
    try {
      const result = await api.quests.complete(userQuestId);
      updateUser(result.user);
      setCompletionResult(result);

      if (completedQuest?.quest.type === "DAILY") {
        setDailyCompletedToday((prev) => prev + 1);
      }

      setFadingIds((prev) => new Set([...prev, userQuestId]));
      const sideQuest = result.triggered_side_quest ?? null;

      setTimeout(() => {
        setActiveQuests((prev) => prev.filter((q) => q.id !== userQuestId));
        setFadingIds((prev) => {
          const next = new Set(prev);
          next.delete(userQuestId);
          return next;
        });
        if (sideQuest) {
          setActiveQuests((prev) => [...prev, sideQuest]);
        } else if (completedQuest?.quest.type === "SIDE") {
          // Reload so server can auto-refill open slot if daily threshold already met
          loadActive();
        }
      }, 420);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete quest");
    } finally {
      setCompleting(null);
    }
  }

  function handleCompletionClose() {
    const triggered = completionResult?.triggered_side_quest ?? null;
    setCompletionResult(null);
    if (triggered) setTriggeredSideQuest(triggered);
  }

  async function handleTabChange(newTab: Tab) {
    setTab(newTab);
    if (newTab === "history" && history.length === 0) {
      setHistoryLoading(true);
      try {
        await loadHistory();
      } catch {
        setError("Failed to load history");
      } finally {
        setHistoryLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setError("");
    if (tab === "active") {
      loadActive();
    } else {
      setHistoryLoading(true);
      try {
        await loadHistory();
      } catch {
        setError("Failed to load history");
      } finally {
        setHistoryLoading(false);
      }
    }
  }

  const byType = QUEST_TYPES.reduce(
    (acc, { type }) => {
      acc[type] = activeQuests.filter((q) => q.quest.type === type);
      return acc;
    },
    {} as Record<QuestType, UserQuest[]>
  );

  const dailyQuests = byType["DAILY"];
  const hasDailyQuests = dailyQuests.length > 0;
  const sideQuests = byType["SIDE"];
  const activeSideSlots = sideQuests.length;

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

      {hasDailyQuests && (
        <div className="mb-4">
          <CountdownTimer
            expiresAt={endOfTodayIso()}
            variant="banner"
            label="Daily Reset"
            windowMs={24 * 60 * 60 * 1000}
            streakDays={user?.streak_days ?? 0}
          />
        </div>
      )}

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded text-sm font-mono"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded"
        style={{ background: "var(--sl-surface)", border: "1px solid var(--sl-border)", width: "fit-content" }}
      >
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
              <QuestSection
                type="DAILY"
                label="Daily Quests"
                icon={<Calendar size={14} />}
                quests={dailyQuests}
                onComplete={handleComplete}
                completing={completing}
                fadingIds={fadingIds}
              />

              <QuestSection
                type="WEEKLY"
                label="Weekly Quests"
                icon={<Clock size={14} />}
                quests={byType["WEEKLY"]}
                onComplete={handleComplete}
                completing={completing}
                fadingIds={fadingIds}
              />

              <QuestSection
                type="PERMANENT"
                label="Permanent Quests"
                icon={<Infinity size={13} />}
                quests={byType["PERMANENT"]}
                onComplete={handleComplete}
                completing={completing}
                fadingIds={fadingIds}
              />

              <SideQuestSection
                quests={sideQuests}
                activeSlots={activeSideSlots}
                maxSlots={SIDE_MAX_SLOTS}
                dailyCompletedToday={dailyCompletedToday}
                onComplete={handleComplete}
                completing={completing}
                fadingIds={fadingIds}
              />

              {activeQuests.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⚔</div>
                  <div className="system-header mb-2">NO ACTIVE QUESTS</div>
                  <p className="text-sm" style={{ color: "var(--sl-text-muted)" }}>
                    The system is preparing your quests. Check back soon.
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
          {historyLoading ? (
            <HistoryLoadingSkeleton />
          ) : history.length === 0 ? (
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

      <AnimatePresence>
        {completionResult && !triggeredSideQuest && (
          <LevelUpModal key="level-up" result={completionResult} onClose={handleCompletionClose} />
        )}
        {triggeredSideQuest && (
          <SideQuestTriggeredModal
            key="side-quest"
            quest={triggeredSideQuest}
            onClose={() => setTriggeredSideQuest(null)}
          />
        )}
      </AnimatePresence>
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
  fadingIds,
}: {
  type: QuestType;
  label: string;
  icon: React.ReactNode;
  quests: UserQuest[];
  onComplete: (id: number) => void;
  completing: number | null;
  fadingIds: Set<number>;
}) {
  if (quests.length === 0) return null;

  const TYPE_COLORS: Record<QuestType, string> = {
    DAILY: "var(--sl-cyan)",
    WEEKLY: "#a78bfa",
    PERMANENT: "#fbbf24",
    SIDE: "#f97316",
  };
  const color = TYPE_COLORS[type];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <h2 className="text-xs font-mono uppercase tracking-widest font-semibold" style={{ color }}>
          {label}
        </h2>
        <span
          className="text-xs font-mono px-1.5 py-0.5 rounded"
          style={{ color, background: `${color}14`, border: `1px solid ${color}30` }}
        >
          {quests.length}
        </span>
      </div>
      <div className="space-y-2">
        {quests.map((uq) => (
          <QuestCard
            key={uq.id}
            userQuest={uq}
            onComplete={onComplete}
            completing={completing === uq.id}
            fadingOut={fadingIds.has(uq.id)}
          />
        ))}
      </div>
    </section>
  );
}

function SideQuestSection({
  quests,
  activeSlots,
  maxSlots,
  dailyCompletedToday,
  onComplete,
  completing,
  fadingIds,
}: {
  quests: UserQuest[];
  activeSlots: number;
  maxSlots: number;
  dailyCompletedToday: number;
  onComplete: (id: number) => void;
  completing: number | null;
  fadingIds: Set<number>;
}) {
  const SIDE_COLOR = "#f97316";
  const unlocked = dailyCompletedToday >= DAILY_TRIGGER_THRESHOLD;
  const slotsFull = activeSlots >= maxSlots;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: SIDE_COLOR }}>
            <Zap size={14} />
          </span>
          <h2
            className="text-xs font-mono uppercase tracking-widest font-semibold"
            style={{ color: SIDE_COLOR }}
          >
            Side Missions
          </h2>
          {quests.length > 0 && (
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                color: SIDE_COLOR,
                background: `${SIDE_COLOR}14`,
                border: `1px solid ${SIDE_COLOR}30`,
              }}
            >
              {quests.length}
            </span>
          )}
        </div>

        {/* Slot pip indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono" style={{ color: "var(--sl-text-dim)" }}>
            SLOTS
          </span>
          <div className="flex gap-1">
            {Array.from({ length: maxSlots }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i < activeSlots ? SIDE_COLOR : "var(--sl-border-bright)",
                  boxShadow: i < activeSlots ? `0 0 6px ${SIDE_COLOR}88` : undefined,
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <span
            className="text-xs font-mono"
            style={{ color: slotsFull ? "#f87171" : "var(--sl-text-muted)" }}
          >
            {activeSlots}/{maxSlots}
          </span>
        </div>
      </div>

      {/* Quest list or empty state */}
      {quests.length > 0 ? (
        <div className="space-y-2">
          {quests.map((uq) => (
            <QuestCard
              key={uq.id}
              userQuest={uq}
              onComplete={onComplete}
              completing={completing === uq.id}
              fadingOut={fadingIds.has(uq.id)}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-lg p-6 text-center"
          style={{
            background: `${SIDE_COLOR}08`,
            border: `1px dashed ${SIDE_COLOR}${unlocked ? "55" : "30"}`,
          }}
        >
          {unlocked ? (
            <>
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-xs font-mono" style={{ color: "var(--sl-text-muted)" }}>
                System scanning for side missions...
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl mb-3">🔒</div>
              <p className="text-xs font-mono mb-4" style={{ color: "var(--sl-text-muted)" }}>
                Complete {DAILY_TRIGGER_THRESHOLD} daily quests to unlock side missions
              </p>
              <div className="flex justify-center gap-3 mb-2">
                {Array.from({ length: DAILY_TRIGGER_THRESHOLD }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background: i < dailyCompletedToday ? SIDE_COLOR : "var(--sl-border-bright)",
                      boxShadow: i < dailyCompletedToday ? `0 0 8px ${SIDE_COLOR}` : undefined,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-mono" style={{ color: SIDE_COLOR }}>
                {dailyCompletedToday}/{DAILY_TRIGGER_THRESHOLD} completed
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <QuestCardSkeleton key={i} delay={i * 0.07} />
      ))}
    </div>
  );
}

function QuestCardSkeleton({ delay = 0 }: { delay?: number }) {
  const d = (extra = 0): React.CSSProperties => ({ animationDelay: `${delay + extra}s` });
  return (
    <div className="quest-card quest-card-skeleton p-4 pl-6" style={{ minHeight: "110px" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="skeleton-shimmer h-4 rounded w-2/3" style={d()} />
        <div className="skeleton-shimmer h-5 w-8 rounded" style={d(0.06)} />
      </div>
      <div className="skeleton-shimmer h-3 rounded w-full mb-1.5" style={d(0.1)} />
      <div className="skeleton-shimmer h-3 rounded w-4/5 mb-3" style={d(0.13)} />
      <div className="flex gap-2 mb-3">
        <div className="skeleton-shimmer h-5 w-16 rounded-full" style={d(0.16)} />
        <div className="skeleton-shimmer h-5 w-14 rounded" style={d(0.19)} />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton-shimmer h-4 w-14 rounded" style={d(0.22)} />
        <div className="skeleton-shimmer h-7 w-20 rounded" style={d(0.25)} />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  const sections = [
    { labelW: "w-20", count: 3 },
    { labelW: "w-24", count: 2 },
    { labelW: "w-28", count: 1 },
  ];
  let cardIndex = 0;
  return (
    <div className="space-y-6">
      {sections.map((section, si) => (
        <div key={si}>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="skeleton-shimmer w-3 h-3 rounded-full"
              style={{ animationDelay: `${si * 0.12}s` }}
            />
            <div
              className={`skeleton-shimmer h-2.5 ${section.labelW} rounded`}
              style={{ animationDelay: `${si * 0.12 + 0.06}s` }}
            />
          </div>
          <div className="space-y-2">
            {Array.from({ length: section.count }).map((_, i) => {
              const delay = cardIndex++ * 0.08;
              return <QuestCardSkeleton key={i} delay={delay} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
