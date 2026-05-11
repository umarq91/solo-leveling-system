import { AppError } from "../lib/errors.js";
import prisma from "../lib/prisma.js";
import { xpToNextLevel } from "../lib/xp.js";

export async function getUserStats(userId: number) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const startOfWeek = new Date();
  const dow = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (dow === 0 ? 6 : dow - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const [completedQuests, activeCount, failedCount, expiredCount, questsThisWeek] =
    await Promise.all([
      prisma.user_quests.findMany({
        where: { user_id: userId, status: "COMPLETED" },
        select: { quest: { select: { aspect: true, type: true, xp_reward: true } } },
      }),
      prisma.user_quests.count({ where: { user_id: userId, status: "ACTIVE" } }),
      prisma.user_quests.count({ where: { user_id: userId, status: "FAILED" } }),
      prisma.user_quests.count({ where: { user_id: userId, status: "EXPIRED" } }),
      prisma.user_quests.count({
        where: { user_id: userId, status: "COMPLETED", completed_at: { gte: startOfWeek } },
      }),
    ]);

  const completedByAspect: Record<string, number> = {};
  const xpByAspect: Record<string, number> = {};
  const completedByType: Record<string, number> = {};

  for (const uq of completedQuests) {
    const { aspect, type, xp_reward } = uq.quest;
    completedByAspect[aspect] = (completedByAspect[aspect] ?? 0) + 1;
    xpByAspect[aspect] = (xpByAspect[aspect] ?? 0) + xp_reward;
    completedByType[type] = (completedByType[type] ?? 0) + 1;
  }

  const completedTotal = completedQuests.length;
  const attemptedTotal = completedTotal + failedCount + expiredCount;
  const completionRate = attemptedTotal > 0
    ? Math.round((completedTotal / attemptedTotal) * 100)
    : null;

  const level = user.level ?? 1;
  const currentXp = user.current_xp ?? 0;
  const upToNext = user.up_to_next ?? xpToNextLevel(level);
  const xpProgressPct = Math.floor((currentXp / upToNext) * 100);

  const { password, ...userRest } = user;

  return {
    user: userRest,
    xp_progress_pct: xpProgressPct,
    active_quests: activeCount,
    completed_total: completedTotal,
    completed_by_aspect: completedByAspect,
    xp_by_aspect: xpByAspect,
    completed_by_type: completedByType,
    total_failed: failedCount,
    total_expired: expiredCount,
    completion_rate: completionRate,
    quests_this_week: questsThisWeek,
  };
}

function toLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getActivityHeatmap(userId: number, days = 90) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await prisma.user_quests.findMany({
    where: {
      user_id: userId,
      status: "COMPLETED",
      completed_at: { gte: since },
    },
    select: { completed_at: true, quest: { select: { xp_reward: true } } },
  });

  const byDay = new Map<string, { count: number; xp: number }>();
  for (const row of rows) {
    if (!row.completed_at) continue;
    const key = toLocalDateKey(row.completed_at);
    const cur = byDay.get(key) ?? { count: 0, xp: 0 };
    cur.count += 1;
    cur.xp += row.quest.xp_reward;
    byDay.set(key, cur);
  }

  const data: { date: string; count: number; xp: number }[] = [];
  const cursor = new Date(since);
  for (let i = 0; i < days; i++) {
    const key = toLocalDateKey(cursor);
    const cell = byDay.get(key) ?? { count: 0, xp: 0 };
    data.push({ date: key, count: cell.count, xp: cell.xp });
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalCompleted = data.reduce((s, d) => s + d.count, 0);
  const totalXp = data.reduce((s, d) => s + d.xp, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return { days, data, totals: { completed: totalCompleted, xp: totalXp, active_days: activeDays } };
}
