import { AppError } from "../lib/errors.js";
import prisma from "../lib/prisma.js";
import { rankfromLevel, streakMultipler, xpToNextLevel } from "../lib/xp.js";

const RANK_ORDER = ["E", "D", "C", "B", "A", "S"];

function getExpiresAt(type: string): Date | null {
  const now = new Date();
  if (type === "DAILY") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  if (type === "WEEKLY") {
    const end = new Date(now);
    const daysUntilSunday = 7 - end.getDay();
    end.setDate(end.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 999);
    return end;
  }
  return null; // PERMANENT
}

async function expireOverdueQuests(userId: number) {
  await prisma.user_quests.updateMany({
    where: {
      user_id: userId,
      status: "ACTIVE",
      expires_at: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
}

export async function getActiveQuests(userId: number) {
  await expireOverdueQuests(userId);
  return prisma.user_quests.findMany({
    where: { user_id: userId, status: "ACTIVE" },
    include: { quest: true },
    orderBy: { assigned_at: "desc" },
  });
}

export async function getQuestsHistory(userId: number) {
  return prisma.user_quests.findMany({
    where: {
      user_id: userId,
      status: { in: ["COMPLETED", "FAILED", "EXPIRED"] },
    },
    include: { quest: true },
    orderBy: { assigned_at: "desc" },
    take: 50,
  });
}

export async function assignQuest(userId: number, questId: number) {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const quest = await prisma.quests.findUnique({ where: { id: questId } });
  if (!quest || !quest.is_active) throw new AppError(404, "Quest not found");

  const userRankIndex = RANK_ORDER.indexOf(user.rank ?? "E");
  const questRankIndex = RANK_ORDER.indexOf(quest.rank);
  if (questRankIndex > userRankIndex) {
    throw new AppError(403, `Your rank is too low for this quest`);
  }

  const alreadyActive = await prisma.user_quests.findFirst({
    where: { user_id: userId, quest_id: questId, status: "ACTIVE" },
  });
  if (alreadyActive) throw new AppError(409, "Quest is already active");

  const userQuest = await prisma.user_quests.create({
    data: {
      user_id: userId,
      quest_id: questId,
      expires_at: getExpiresAt(quest.type),
    },
    include: { quest: true },
  });

  return userQuest;
}

export async function assignDailyQuests(userId: number) {
  await expireOverdueQuests(userId);

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const userRankIndex = RANK_ORDER.indexOf(user.rank ?? "E");
  const accessibleRanks = RANK_ORDER.slice(0, userRankIndex + 1);

  // find quest IDs the user already has active today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const alreadyAssigned = await prisma.user_quests.findMany({
    where: {
      user_id: userId,
      assigned_at: { gte: startOfDay },
      quest: { type: "DAILY" },
    },
    select: { quest_id: true },
  });
  const assignedIds = new Set(alreadyAssigned.map((uq) => uq.quest_id));

  const available = await prisma.quests.findMany({
    where: {
      type: "DAILY",
      is_active: true,
      rank: { in: accessibleRanks },
      id: { notIn: assignedIds.size > 0 ? [...assignedIds] : undefined },
    },
  });

  if (available.length === 0) {
    return { assigned: [], message: "No new daily quests available" };
  }

  const toAssign = available.slice(0, 5);
  const expiresAt = getExpiresAt("DAILY");

  const assigned = await prisma.$transaction(
    toAssign.map((q) =>
      prisma.user_quests.create({
        data: { user_id: userId, quest_id: q.id, expires_at: expiresAt },
        include: { quest: true },
      })
    )
  );

  return { assigned, message: `${assigned.length} daily quests assigned` };
}

export async function completeQuest(userId: number, userQuestId: number) {
  const userQuest = await prisma.user_quests.findUnique({
    where: { id: userQuestId },
    include: { quest: true },
  });

  if (!userQuest || userQuest.user_id !== userId) {
    throw new AppError(403, "Quest not found");
  }

  if (userQuest.status !== "ACTIVE") {
    throw new AppError(400, `Quest is already ${userQuest.status.toLowerCase()}`);
  }

  await prisma.user_quests.update({
    where: { id: userQuestId },
    data: { status: "COMPLETED", completed_at: new Date() },
  });

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const streakDays = user.streak_days ?? 0;
  const multiplier = streakMultipler(streakDays);
  const xpGained = Math.floor(userQuest.quest.xp_reward * multiplier);

  let currentXp = (user.current_xp ?? 0) + xpGained;
  let totalXp = (user.total_xp ?? 0) + xpGained;
  let level = user.level ?? 1;
  let upToNext = user.up_to_next ?? xpToNextLevel(level);
  let leveledUp = false;

  while (currentXp >= upToNext) {
    currentXp -= upToNext;
    level++;
    upToNext = xpToNextLevel(level);
    leveledUp = true;
  }

  const rank = rankfromLevel(level);

  const now = new Date();
  const lastActive = user.last_active_at;
  const daysSinceLastActive = lastActive
    ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const newStreak =
    daysSinceLastActive === null || daysSinceLastActive > 1
      ? 1
      : daysSinceLastActive === 1
        ? streakDays + 1
        : streakDays; // same day, don't increment again

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: {
      current_xp: currentXp,
      total_xp: totalXp,
      rank,
      level,
      up_to_next: upToNext,
      streak_days: newStreak,
      last_active_at: now,
    },
  });

  const { password, ...rest } = updatedUser;
  return {
    xp_gained: xpGained,
    streak_multiplier: multiplier,
    leveled_up: leveledUp,
    streak_days: newStreak,
    user: rest,
  };
}
