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
