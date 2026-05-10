import { AppError } from "../lib/errors.js";
import prisma from "../lib/prisma.js";
import { rankfromLevel, streakMultipler, xpToNextLevel } from "../lib/xp.js";

const RANK_ORDER = ["E", "D", "C", "B", "A", "S"];

const MAX_SLOTS_SIDE_QUESTS = 2;
const DAILY_TRIGGER_THRESHOLD = 3;

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
  if (type === "SIDE") {
    const end = new Date(now);
    end.setHours(end.getHours() + 48);
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
      }),
    ),
  );

  return { assigned, message: `${assigned.length} daily quests assigned` };
}

export async function assignWeeklyQuests(userId: number) {
  await expireOverdueQuests(userId);

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const userRankIndex = RANK_ORDER.indexOf(user.rank ?? "E");
  const accessibleRanks = RANK_ORDER.slice(0, userRankIndex + 1);

  // start of the current week (Monday 00:00:00)
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const alreadyAssigned = await prisma.user_quests.findMany({
    where: {
      user_id: userId,
      assigned_at: { gte: startOfWeek },
      quest: { type: "WEEKLY" },
    },
    select: { quest_id: true },
  });
  const assignedIds = new Set(alreadyAssigned.map((uq) => uq.quest_id));

  const available = await prisma.quests.findMany({
    where: {
      type: "WEEKLY",
      is_active: true,
      rank: { in: accessibleRanks },
      id: { notIn: assignedIds.size > 0 ? [...assignedIds] : undefined },
    },
  });

  if (available.length === 0) {
    return { assigned: [], message: "No new weekly quests available" };
  }

  const toAssign = available.slice(0, 3);
  const expiresAt = getExpiresAt("WEEKLY");

  const assigned = await prisma.$transaction(
    toAssign.map((q) =>
      prisma.user_quests.create({
        data: { user_id: userId, quest_id: q.id, expires_at: expiresAt },
        include: { quest: true },
      }),
    ),
  );

  return { assigned, message: `${assigned.length} weekly quests assigned` };
}

export async function assignSideQuests(userId: number) {
  await expireOverdueQuests(userId);

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User Not Found");

  // checking slots and coutning active quests
  const activeSlots = await prisma.user_quests.count({
    where: { user_id: userId, status: "ACTIVE", quest: { type: "SIDE" } },
  });

  const openSlots = MAX_SLOTS_SIDE_QUESTS - activeSlots;
  if (openSlots <= 0) {
    return {
      assigned: [],
      message: "Side Quest Slots are full",
      slots: { active: activeSlots, max: MAX_SLOTS_SIDE_QUESTS },
    };
  }

  const userRankIndex = RANK_ORDER.indexOf(user.rank ?? "E");
  const accessbleRanks = RANK_ORDER.slice(0, userRankIndex + 1);

  // exclude quests assigned in the last 7 days to avoid repeats
  const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentlyAssigned = await prisma.user_quests.findMany({
    where: {
      user_id: userId,
      quest: { type: "SIDE" },
      assigned_at: { gte: since7Days },
    },
  });

  const excludeIds = recentlyAssigned.map((uq) => uq.quest_id);

  const available = await prisma.quests.findMany({
    where: {
      type: "SIDE",
      is_active: true,
      rank: { in: accessbleRanks },
      ...(excludeIds.length > 0 && { id: { notIn: excludeIds } }),
    },
  });

  if (available.length === 0) {
    return {
      assigned: [],
      message: "No Side Quests available",
      slots: { active: activeSlots, max: MAX_SLOTS_SIDE_QUESTS },
    };
  }

  // shuffle

  const shuffled = available
    .sort(() => Math.random() - 0.5)
    .slice(0, openSlots);
  const expiresAt = getExpiresAt("SIDE");

  const assigned = await prisma.$transaction(
    shuffled.map((q) =>
      prisma.user_quests.create({
        data: { user_id: userId, quest_id: q.id, expires_at: expiresAt },
        include: { quest: true },
      }),
    ),
  );

  return {
    assigned,
    message: `${assigned.length} side quests assigned`,
    slots: {
      active: activeSlots + assigned.length,
      max: MAX_SLOTS_SIDE_QUESTS,
    },
  };
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
    throw new AppError(
      400,
      `Quest is already ${userQuest.status.toLowerCase()}`,
    );
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

  let triggered_side_quest = null;
  if (userQuest.quest.type === "DAILY") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyCompletedToday = await prisma.user_quests.count({
      where: {
        user_id: userId,
        status: "COMPLETED",
        completed_at: { gte: startOfDay },
        quest: { type: "DAILY" },
      },
    });
    if (dailyCompletedToday === DAILY_TRIGGER_THRESHOLD) {
      const sideResult = await assignSideQuests(userId);
      if (sideResult.assigned.length > 0) {
        triggered_side_quest = sideResult.assigned[0];
      }
    }
  }

  return {
    xp_gained: xpGained,
    streak_multiplier: multiplier,
    leveled_up: leveledUp,
    streak_days: newStreak,
    user: rest,
    triggered_side_quest,
  };
}
