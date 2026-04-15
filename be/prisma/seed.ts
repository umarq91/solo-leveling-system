import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const quests = [
  // ── FITNESS ──────────────────────────────────────────────
  {
    title: "Morning Stretch",
    description: "Complete a 10-minute morning stretching routine.",
    type: "DAILY" as const,
    aspect: "FITNESS" as const,
    rank: "E",
    xp_reward: 50,
  },
  {
    title: "Hydration Goal",
    description: "Drink at least 8 glasses of water today.",
    type: "DAILY" as const,
    aspect: "FITNESS" as const,
    rank: "E",
    xp_reward: 40,
  },
  {
    title: "30-Minute Walk",
    description: "Take a 30-minute walk outside.",
    type: "DAILY" as const,
    aspect: "FITNESS" as const,
    rank: "E",
    xp_reward: 70,
  },
  {
    title: "Weekly Workout Streak",
    description: "Complete at least 4 workouts this week.",
    type: "WEEKLY" as const,
    aspect: "FITNESS" as const,
    rank: "E",
    xp_reward: 300,
  },
  {
    title: "Run 5km",
    description: "Run a total of 5km this week.",
    type: "WEEKLY" as const,
    aspect: "FITNESS" as const,
    rank: "E",
    xp_reward: 400,
  },
  {
    title: "First 5K",
    description: "Complete your first 5K run in one session.",
    type: "PERMANENT" as const,
    aspect: "FITNESS" as const,
    rank: "E",
    xp_reward: 1000,
  },

  // ── DISCIPLINE ───────────────────────────────────────────
  {
    title: "Early Riser",
    description: "Wake up before 7:00 AM.",
    type: "DAILY" as const,
    aspect: "DESCIPLINE" as const,
    rank: "E",
    xp_reward: 60,
  },
  {
    title: "Morning Routine",
    description: "Complete your full morning routine without skipping steps.",
    type: "DAILY" as const,
    aspect: "DESCIPLINE" as const,
    rank: "E",
    xp_reward: 80,
  },
  {
    title: "No Distractions",
    description: "Avoid social media until after noon.",
    type: "DAILY" as const,
    aspect: "DESCIPLINE" as const,
    rank: "E",
    xp_reward: 70,
  },
  {
    title: "Weekly Planning",
    description: "Plan your upcoming week every Sunday.",
    type: "WEEKLY" as const,
    aspect: "DESCIPLINE" as const,
    rank: "E",
    xp_reward: 250,
  },
  {
    title: "Goal Review",
    description: "Review and update your short-term goals this week.",
    type: "WEEKLY" as const,
    aspect: "DESCIPLINE" as const,
    rank: "E",
    xp_reward: 200,
  },
  {
    title: "30-Day Streak",
    description: "Maintain a daily quest streak for 30 consecutive days.",
    type: "PERMANENT" as const,
    aspect: "DESCIPLINE" as const,
    rank: "E",
    xp_reward: 2000,
  },

  // ── CAREER ───────────────────────────────────────────────
  {
    title: "Deep Work Session",
    description: "Work on your most important task for at least 1 focused hour.",
    type: "DAILY" as const,
    aspect: "CAREER" as const,
    rank: "E",
    xp_reward: 100,
  },
  {
    title: "Learn Something New",
    description: "Learn one new thing relevant to your field today.",
    type: "DAILY" as const,
    aspect: "CAREER" as const,
    rank: "E",
    xp_reward: 60,
  },
  {
    title: "Ship It",
    description: "Ship at least one feature, PR, or deliverable this week.",
    type: "WEEKLY" as const,
    aspect: "CAREER" as const,
    rank: "E",
    xp_reward: 500,
  },
  {
    title: "Write & Document",
    description: "Write a blog post, README, or internal doc this week.",
    type: "WEEKLY" as const,
    aspect: "CAREER" as const,
    rank: "E",
    xp_reward: 350,
  },
  {
    title: "Open Source Contribution",
    description: "Make a meaningful contribution to an open source project.",
    type: "PERMANENT" as const,
    aspect: "CAREER" as const,
    rank: "E",
    xp_reward: 1500,
  },

  // ── INTELLECT ────────────────────────────────────────────
  {
    title: "Daily Reading",
    description: "Read a book or long-form article for at least 30 minutes.",
    type: "DAILY" as const,
    aspect: "INTELLECT" as const,
    rank: "E",
    xp_reward: 80,
  },
  {
    title: "Problem Solving",
    description: "Solve one coding, math, or logic problem today.",
    type: "DAILY" as const,
    aspect: "INTELLECT" as const,
    rank: "E",
    xp_reward: 90,
  },
  {
    title: "Vocabulary Builder",
    description: "Learn and use 5 new words today.",
    type: "DAILY" as const,
    aspect: "INTELLECT" as const,
    rank: "E",
    xp_reward: 40,
  },
  {
    title: "Course Progress",
    description: "Complete at least one module of an online course this week.",
    type: "WEEKLY" as const,
    aspect: "INTELLECT" as const,
    rank: "E",
    xp_reward: 400,
  },
  {
    title: "Book a Month",
    description: "Finish reading one full book this month.",
    type: "WEEKLY" as const,
    aspect: "INTELLECT" as const,
    rank: "E",
    xp_reward: 600,
  },
  {
    title: "Complete a Course",
    description: "Finish an entire online course from start to finish.",
    type: "PERMANENT" as const,
    aspect: "INTELLECT" as const,
    rank: "E",
    xp_reward: 2000,
  },

  // ── SOCIAL ───────────────────────────────────────────────
  {
    title: "Reach Out",
    description: "Send a meaningful message or call a friend or family member.",
    type: "DAILY" as const,
    aspect: "SOCIAL" as const,
    rank: "E",
    xp_reward: 50,
  },
  {
    title: "Gratitude Practice",
    description: "Write down 3 things you are grateful for today.",
    type: "DAILY" as const,
    aspect: "SOCIAL" as const,
    rank: "E",
    xp_reward: 40,
  },
  {
    title: "Meaningful Conversation",
    description: "Have one deep, meaningful conversation with someone this week.",
    type: "WEEKLY" as const,
    aspect: "SOCIAL" as const,
    rank: "E",
    xp_reward: 250,
  },
  {
    title: "Social Event",
    description: "Attend a social gathering, meetup, or community event this week.",
    type: "WEEKLY" as const,
    aspect: "SOCIAL" as const,
    rank: "E",
    xp_reward: 300,
  },
  {
    title: "Mentor Someone",
    description: "Spend time actively mentoring or helping another person grow.",
    type: "PERMANENT" as const,
    aspect: "SOCIAL" as const,
    rank: "E",
    xp_reward: 1500,
  },
];

async function main() {
  console.log("Seeding quests...");

  for (const quest of quests) {
    await prisma.quests.upsert({
      where: {
        title_aspect: { title: quest.title, aspect: quest.aspect },
      },
      update: {},
      create: quest,
    });
  }

  console.log(`Seeded ${quests.length} quests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
