import { AppError } from "../lib/errors.js";
import prisma from "../lib/prisma.js";
import { xpToNextLevel } from "../lib/xp.js";

export async function getUserStats(userId: number) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const [completedQuests, activeCount] = await Promise.all([
    prisma.user_quests.findMany({
      where: { user_id: userId, status: "COMPLETED" },
      select: { quest: { select: { aspect: true } } },
    }),
    prisma.user_quests.count({
      where: { user_id: userId, status: "ACTIVE" },
    }),
  ]);

  const completedByAspect = completedQuests.reduce(
    (acc, uq) => {
      const aspect = uq.quest.aspect;
      acc[aspect] = (acc[aspect] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const level = user.level ?? 1;
  const currentXp = user.current_xp ?? 0;
  const upToNext = user.up_to_next ?? xpToNextLevel(level);
  const xpProgressPct = Math.floor((currentXp / upToNext) * 100);

  const { password, ...userRest } = user;

  return {
    user: userRest,
    xp_progress_pct: xpProgressPct,
    active_quests: activeCount,
    completed_total: completedQuests.length,
    completed_by_aspect: completedByAspect,
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
