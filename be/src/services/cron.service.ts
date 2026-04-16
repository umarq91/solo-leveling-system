import prisma from "../lib/prisma.js";
import { assignDailyQuests } from "./quest.service.js";

export async function processUser(userId: number) {
  const now = new Date();
  // Find active daily quests that missed their deadline
  const expiredDailyQuests = await prisma.user_quests.findMany({
    where: {
      user_id: userId,
      status: "ACTIVE",
      expires_at: { lt: now },
      quest: { type: "DAILY" },
    },
    include: { quest: { select: { xp_reward: true } } },
  });

  // MARK ALL QUEST AS EXPIRED;
  await prisma.user_quests.updateMany({
    where: {
      user_id: userId,
      status: "ACTIVE",
      expires_at: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  let penaltyXp = 0;
  let streakReset = false;

  if (expiredDailyQuests.length > 0) {
    penaltyXp = expiredDailyQuests.reduce(
      (sum, uq) => sum + uq.quest.xp_reward,
      0,
    );

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { current_xp: true, streak_days: true },
    });

    if (user) {
      const newXp = Math.max(0, (user?.current_xp ?? 0) - penaltyXp);
      const hadStreak = (user.streak_days ?? 0) > 0;

      await prisma.users.update({
        where: { id: userId },
        data: {
          current_xp: newXp,
          streak_days: 0,
        },
      });

      streakReset = hadStreak;
    }
  }

  /// assign fresh daily quests for the new Day

  const { assigned } = await assignDailyQuests(userId);

  return {
    expired: expiredDailyQuests.length,
    penaltyXp,
    streakReset,
    assigned: assigned.length,
  };
}

export async function runNightlyCron() {
  const cutOff = new Date(Date.now() - 7 * (1000 * 60 * 60 * 24));
  const users = await prisma.users.findMany({
    where: {
      last_active_at: { gte: cutOff },
    },
    select: {
      id: true,
    },
  });

  if (users.length == 0) {
    console.log("NIGHTLY CRON RESET,no active users");
    return;
  }

  let totalExpired = 0;
  let totalPenalized = 0;
  let totalAssigned = 0;
  for (const { id } of users) {
    try {
      const result = await processUser(id);

      totalExpired += result.expired;
      totalAssigned += result.assigned;
      if (result.expired > 0) totalPenalized++;
    } catch (error) {
      console.error(`Nightly cron failed for user ${id}`, error);
    }
  }

  console.log(`CRON JOB NIGHTLY RESET COMPLETE,
    ${users.length} users processed,
    ${totalExpired} users Expired,
    ${totalPenalized} users penalized,
    ${totalAssigned} new Daily quest assigned
    
    
    `);
}
