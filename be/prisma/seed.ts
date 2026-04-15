import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const quests = [
  // ════════════════════════════════════════════════════════
  //  FITNESS
  // ════════════════════════════════════════════════════════

  // E-Rank
  { title: "Morning Stretch", description: "Complete a 10-minute morning stretching routine to wake the body.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "E", xp_reward: 50 },
  { title: "Hydration Goal", description: "Drink at least 8 glasses of water today.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "E", xp_reward: 40 },
  { title: "30-Minute Walk", description: "Take a 30-minute walk — outside if possible.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "E", xp_reward: 70 },
  { title: "Weekly Workout Streak", description: "Complete at least 4 workouts this week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "E", xp_reward: 300 },
  { title: "Run 5km", description: "Run a total of 5km across any sessions this week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "E", xp_reward: 400 },
  { title: "First 5K", description: "Complete your first continuous 5K run in a single session.", type: "PERMANENT" as const, aspect: "FITNESS" as const, rank: "E", xp_reward: 1000 },

  // D-Rank
  { title: "Bodyweight Circuit", description: "Complete 3 rounds of push-ups, squats, and lunges.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "D", xp_reward: 150 },
  { title: "10,000 Steps", description: "Hit 10,000 steps today tracked by any method.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "D", xp_reward: 130 },
  { title: "Sleep Discipline", description: "Sleep before midnight and get at least 7 hours.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "D", xp_reward: 120 },
  { title: "Run 15km Weekly", description: "Accumulate 15km of running this week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "D", xp_reward: 900 },
  { title: "5 Workouts in a Week", description: "Complete 5 dedicated workout sessions this week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "D", xp_reward: 800 },
  { title: "First 10K", description: "Complete a 10km run in one session.", type: "PERMANENT" as const, aspect: "FITNESS" as const, rank: "D", xp_reward: 3000 },

  // C-Rank
  { title: "Strength Training", description: "Complete a structured weight or resistance training session.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "C", xp_reward: 300 },
  { title: "Nutrition Log", description: "Track all meals and hit your calorie and protein targets today.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "C", xp_reward: 250 },
  { title: "Run 30km Weekly", description: "Accumulate 30km of running across the week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "C", xp_reward: 2000 },
  { title: "6 Workouts in a Week", description: "Train 6 days out of 7 this week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "C", xp_reward: 1800 },
  { title: "First Half Marathon", description: "Complete a 21.1km run in a single session.", type: "PERMANENT" as const, aspect: "FITNESS" as const, rank: "C", xp_reward: 7000 },

  // B-Rank
  { title: "Advanced Strength Session", description: "Complete a full compound lifting session — squat, deadlift, bench, or equivalent.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "B", xp_reward: 600 },
  { title: "Active Recovery", description: "Do 30 minutes of deliberate active recovery — mobility, yoga, or light swim.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "B", xp_reward: 500 },
  { title: "50km Week", description: "Run or cycle 50km total this week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "B", xp_reward: 4000 },
  { title: "First Marathon", description: "Complete a full 42.2km marathon.", type: "PERMANENT" as const, aspect: "FITNESS" as const, rank: "B", xp_reward: 15000 },

  // A-Rank
  { title: "Two-a-Day Training", description: "Complete two distinct training sessions in a single day.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "A", xp_reward: 1200 },
  { title: "Peak Performance Week", description: "Train at high intensity every single day this week — no rest days.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "A", xp_reward: 8000 },
  { title: "Competition Entry", description: "Enter and complete a sanctioned athletic competition — race, powerlifting, etc.", type: "PERMANENT" as const, aspect: "FITNESS" as const, rank: "A", xp_reward: 25000 },

  // S-Rank
  { title: "Elite Daily Protocol", description: "Complete your full elite training, nutrition, and recovery protocol without deviation.", type: "DAILY" as const, aspect: "FITNESS" as const, rank: "S", xp_reward: 3000 },
  { title: "Iron Week", description: "Complete a triathlon-equivalent volume of training in one week.", type: "WEEKLY" as const, aspect: "FITNESS" as const, rank: "S", xp_reward: 20000 },
  { title: "Podium Finish", description: "Place in the top 3 of a competitive athletic event.", type: "PERMANENT" as const, aspect: "FITNESS" as const, rank: "S", xp_reward: 60000 },

  // ════════════════════════════════════════════════════════
  //  DISCIPLINE
  // ════════════════════════════════════════════════════════

  // E-Rank
  { title: "Early Riser", description: "Wake up before 7:00 AM.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "E", xp_reward: 60 },
  { title: "No Social Media Before Noon", description: "Avoid all social media until after 12:00 PM.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "E", xp_reward: 70 },
  { title: "Make Your Bed", description: "Make your bed immediately after waking up.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "E", xp_reward: 30 },
  { title: "Weekly Planning Session", description: "Set aside time on Sunday to plan the week ahead.", type: "WEEKLY" as const, aspect: "DESCIPLINE" as const, rank: "E", xp_reward: 250 },
  { title: "Goal Review", description: "Review and update your short-term goals this week.", type: "WEEKLY" as const, aspect: "DESCIPLINE" as const, rank: "E", xp_reward: 200 },
  { title: "30-Day Streak", description: "Complete daily quests for 30 consecutive days without breaking the chain.", type: "PERMANENT" as const, aspect: "DESCIPLINE" as const, rank: "E", xp_reward: 2000 },

  // D-Rank
  { title: "Morning Journaling", description: "Write at least 200 words in your journal before starting work.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "D", xp_reward: 140 },
  { title: "10-Minute Meditation", description: "Complete a focused 10-minute meditation session.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "D", xp_reward: 120 },
  { title: "No-Phone Morning", description: "Do not check your phone for the first 60 minutes after waking.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "D", xp_reward: 150 },
  { title: "Weekly Reflection", description: "Write a structured weekly review covering wins, losses, and lessons.", type: "WEEKLY" as const, aspect: "DESCIPLINE" as const, rank: "D", xp_reward: 700 },
  { title: "60-Day Streak", description: "Complete daily quests for 60 consecutive days.", type: "PERMANENT" as const, aspect: "DESCIPLINE" as const, rank: "D", xp_reward: 5000 },

  // C-Rank
  { title: "90-Minute Deep Work Block", description: "Complete a single 90-minute uninterrupted deep work session.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "C", xp_reward: 300 },
  { title: "20-Minute Meditation", description: "Complete a focused 20-minute meditation session.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "C", xp_reward: 250 },
  { title: "System Audit", description: "Review and refine your personal productivity system this week.", type: "WEEKLY" as const, aspect: "DESCIPLINE" as const, rank: "C", xp_reward: 1500 },
  { title: "90-Day Streak", description: "Complete daily quests for 90 consecutive days.", type: "PERMANENT" as const, aspect: "DESCIPLINE" as const, rank: "C", xp_reward: 10000 },

  // B-Rank
  { title: "Triple Deep Work", description: "Complete three 90-minute deep work blocks in a single day.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "B", xp_reward: 700 },
  { title: "No-Junk Week", description: "Zero junk food, zero excessive social media, zero late nights — a full clean week.", type: "WEEKLY" as const, aspect: "DESCIPLINE" as const, rank: "B", xp_reward: 4500 },
  { title: "180-Day Streak", description: "Complete daily quests for 180 consecutive days.", type: "PERMANENT" as const, aspect: "DESCIPLINE" as const, rank: "B", xp_reward: 20000 },

  // A-Rank
  { title: "Monk Mode Day", description: "Zero distractions, zero social, maximum output — a full monk-mode day.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "A", xp_reward: 1500 },
  { title: "Monk Mode Week", description: "Execute a full week of monk mode — isolated, focused, relentlessly productive.", type: "WEEKLY" as const, aspect: "DESCIPLINE" as const, rank: "A", xp_reward: 9000 },
  { title: "365-Day Streak", description: "Complete daily quests for an entire year without breaking the chain.", type: "PERMANENT" as const, aspect: "DESCIPLINE" as const, rank: "A", xp_reward: 40000 },

  // S-Rank
  { title: "Shadow Monarch Protocol", description: "Execute your complete, optimised daily system flawlessly — no deviations.", type: "DAILY" as const, aspect: "DESCIPLINE" as const, rank: "S", xp_reward: 4000 },
  { title: "The Immortal Streak", description: "Maintain daily quests for 500 consecutive days.", type: "PERMANENT" as const, aspect: "DESCIPLINE" as const, rank: "S", xp_reward: 80000 },

  // ════════════════════════════════════════════════════════
  //  CAREER
  // ════════════════════════════════════════════════════════

  // E-Rank
  { title: "Deep Work Session", description: "Work on your most important task for at least 1 focused hour.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "E", xp_reward: 100 },
  { title: "Learn Something New", description: "Spend 20 minutes deliberately learning something relevant to your field.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "E", xp_reward: 60 },
  { title: "Ship It", description: "Ship at least one feature, PR, or deliverable this week.", type: "WEEKLY" as const, aspect: "CAREER" as const, rank: "E", xp_reward: 500 },
  { title: "Write & Document", description: "Write a blog post, README, or internal doc this week.", type: "WEEKLY" as const, aspect: "CAREER" as const, rank: "E", xp_reward: 350 },
  { title: "First Open Source Contribution", description: "Make a meaningful commit to an open source project.", type: "PERMANENT" as const, aspect: "CAREER" as const, rank: "E", xp_reward: 1500 },

  // D-Rank
  { title: "Build in Public", description: "Share your progress on a project publicly today.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "D", xp_reward: 160 },
  { title: "Code Review", description: "Thoroughly review at least one peer's code or work output today.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "D", xp_reward: 150 },
  { title: "Side Project Sprint", description: "Put in at least 5 hours on a personal project this week.", type: "WEEKLY" as const, aspect: "CAREER" as const, rank: "D", xp_reward: 900 },
  { title: "First Portfolio Project", description: "Complete and publish a portfolio-worthy project from scratch.", type: "PERMANENT" as const, aspect: "CAREER" as const, rank: "D", xp_reward: 4000 },

  // C-Rank
  { title: "Feature Shipped", description: "Design, build, and ship a meaningful feature or deliverable today.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "C", xp_reward: 350 },
  { title: "Network Touchpoint", description: "Have a productive conversation with someone in or adjacent to your industry.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "C", xp_reward: 280 },
  { title: "Lead a Project", description: "Take ownership and lead a project from brief to delivery this week.", type: "WEEKLY" as const, aspect: "CAREER" as const, rank: "C", xp_reward: 2500 },
  { title: "First Product Launch", description: "Launch a product — no matter how small — to real users.", type: "PERMANENT" as const, aspect: "CAREER" as const, rank: "C", xp_reward: 8000 },

  // B-Rank
  { title: "Strategic Work Block", description: "Spend a full day on your most leveraged, highest-value work — zero busywork.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "B", xp_reward: 700 },
  { title: "Thought Leadership", description: "Publish a high-quality article, video, or talk this week.", type: "WEEKLY" as const, aspect: "CAREER" as const, rank: "B", xp_reward: 4000 },
  { title: "Speak at an Event", description: "Deliver a talk at a meetup, conference, or public event.", type: "PERMANENT" as const, aspect: "CAREER" as const, rank: "B", xp_reward: 15000 },

  // A-Rank
  { title: "High-Leverage Output", description: "Produce something today that will have impact beyond just today.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "A", xp_reward: 1500 },
  { title: "Revenue Milestone", description: "Hit a meaningful revenue or impact milestone this week.", type: "WEEKLY" as const, aspect: "CAREER" as const, rank: "A", xp_reward: 10000 },
  { title: "Reach 1,000 Users", description: "Build something that reaches 1,000 real users or customers.", type: "PERMANENT" as const, aspect: "CAREER" as const, rank: "A", xp_reward: 30000 },

  // S-Rank
  { title: "Category-Defining Work", description: "Produce work today that sets a new standard in your field.", type: "DAILY" as const, aspect: "CAREER" as const, rank: "S", xp_reward: 4000 },
  { title: "Reach 100,000 Users", description: "Build something used by 100,000 people.", type: "PERMANENT" as const, aspect: "CAREER" as const, rank: "S", xp_reward: 100000 },

  // ════════════════════════════════════════════════════════
  //  INTELLECT
  // ════════════════════════════════════════════════════════

  // E-Rank
  { title: "Daily Reading", description: "Read a book or long-form article for at least 30 minutes.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "E", xp_reward: 80 },
  { title: "Problem Solving", description: "Solve one coding, math, or logic problem today.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "E", xp_reward: 90 },
  { title: "Vocabulary Builder", description: "Learn and actively use 5 new words today.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "E", xp_reward: 40 },
  { title: "Course Module", description: "Complete at least one module of an online course this week.", type: "WEEKLY" as const, aspect: "INTELLECT" as const, rank: "E", xp_reward: 400 },
  { title: "Finish a Book", description: "Complete reading one non-fiction book.", type: "PERMANENT" as const, aspect: "INTELLECT" as const, rank: "E", xp_reward: 1500 },

  // D-Rank
  { title: "Deep Reading", description: "Read a dense technical or philosophical text for 45 minutes with full comprehension.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "D", xp_reward: 160 },
  { title: "Anki / Spaced Repetition", description: "Complete your full spaced repetition review deck today — zero cards skipped.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "D", xp_reward: 140 },
  { title: "Language Practice", description: "Complete 30 minutes of deliberate foreign language study today.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "D", xp_reward: 150 },
  { title: "Complete a Course", description: "Finish an entire online course from start to finish.", type: "PERMANENT" as const, aspect: "INTELLECT" as const, rank: "D", xp_reward: 4000 },

  // C-Rank
  { title: "Technical Deep Dive", description: "Spend 60 minutes studying a technical topic at depth — with notes.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "C", xp_reward: 320 },
  { title: "Teach to Learn", description: "Explain a complex concept to someone else — in writing, video, or conversation.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "C", xp_reward: 280 },
  { title: "Research Sprint", description: "Conduct focused research on a topic and produce a structured summary this week.", type: "WEEKLY" as const, aspect: "INTELLECT" as const, rank: "C", xp_reward: 2000 },
  { title: "Second Language Milestone", description: "Reach conversational ability in a second language.", type: "PERMANENT" as const, aspect: "INTELLECT" as const, rank: "C", xp_reward: 9000 },

  // B-Rank
  { title: "Master a Concept", description: "Dedicate the day to fully mastering one hard concept — from confusion to clarity.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "B", xp_reward: 700 },
  { title: "Publish Original Insight", description: "Write and publish an original insight or analysis this week.", type: "WEEKLY" as const, aspect: "INTELLECT" as const, rank: "B", xp_reward: 4500 },
  { title: "Build a Second Brain", description: "Set up and populate a complete personal knowledge management system.", type: "PERMANENT" as const, aspect: "INTELLECT" as const, rank: "B", xp_reward: 18000 },

  // A-Rank
  { title: "Expert-Level Study", description: "Engage in expert-level study — primary sources, papers, or direct mentorship.", type: "DAILY" as const, aspect: "INTELLECT" as const, rank: "A", xp_reward: 1600 },
  { title: "Certify Your Mastery", description: "Earn a recognised certification or credential in a difficult discipline.", type: "PERMANENT" as const, aspect: "INTELLECT" as const, rank: "A", xp_reward: 35000 },

  // S-Rank
  { title: "Original Research", description: "Conduct and document original research that contributes new knowledge to a field.", type: "PERMANENT" as const, aspect: "INTELLECT" as const, rank: "S", xp_reward: 90000 },

  // ════════════════════════════════════════════════════════
  //  SOCIAL
  // ════════════════════════════════════════════════════════

  // E-Rank
  { title: "Reach Out", description: "Send a genuine, meaningful message to a friend or family member today.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "E", xp_reward: 50 },
  { title: "Gratitude Practice", description: "Write down 3 things you are grateful for today.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "E", xp_reward: 40 },
  { title: "Meaningful Conversation", description: "Have one deep, meaningful conversation with someone this week.", type: "WEEKLY" as const, aspect: "SOCIAL" as const, rank: "E", xp_reward: 250 },
  { title: "Attend a Social Event", description: "Attend a social gathering, meetup, or community event.", type: "WEEKLY" as const, aspect: "SOCIAL" as const, rank: "E", xp_reward: 300 },
  { title: "First Mentor Moment", description: "Actively help someone solve a problem or learn something new.", type: "PERMANENT" as const, aspect: "SOCIAL" as const, rank: "E", xp_reward: 1200 },

  // D-Rank
  { title: "Active Listening", description: "Have a conversation today where you focus entirely on listening and understanding.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "D", xp_reward: 130 },
  { title: "Introduce Two People", description: "Make a valuable introduction connecting two people who should know each other.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "D", xp_reward: 150 },
  { title: "Community Participation", description: "Make a meaningful contribution to an online or local community this week.", type: "WEEKLY" as const, aspect: "SOCIAL" as const, rank: "D", xp_reward: 700 },
  { title: "First Public Talk", description: "Speak publicly in front of a group — no matter how small.", type: "PERMANENT" as const, aspect: "SOCIAL" as const, rank: "D", xp_reward: 3500 },

  // C-Rank
  { title: "Network With Intent", description: "Reach out to a new or dormant professional contact with genuine purpose.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "C", xp_reward: 280 },
  { title: "Give Feedback", description: "Provide detailed, constructive feedback to someone on their work today.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "C", xp_reward: 250 },
  { title: "Host an Event", description: "Organise and host a gathering, study group, or community event this week.", type: "WEEKLY" as const, aspect: "SOCIAL" as const, rank: "C", xp_reward: 2000 },
  { title: "Build a Mentorship", description: "Establish an ongoing mentorship relationship — as mentor or mentee.", type: "PERMANENT" as const, aspect: "SOCIAL" as const, rank: "C", xp_reward: 7000 },

  // B-Rank
  { title: "Lead a Meeting", description: "Lead a productive meeting or discussion that moves a group forward.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "B", xp_reward: 600 },
  { title: "Build Your Network", description: "Add 3+ meaningful connections to your network this week through real interaction.", type: "WEEKLY" as const, aspect: "SOCIAL" as const, rank: "B", xp_reward: 3500 },
  { title: "Build a Community", description: "Found or significantly grow a community of 100+ active members.", type: "PERMANENT" as const, aspect: "SOCIAL" as const, rank: "B", xp_reward: 18000 },

  // A-Rank
  { title: "Inspire Someone", description: "Have a conversation today that genuinely changes someone's trajectory or mindset.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "A", xp_reward: 1400 },
  { title: "Speak at a Conference", description: "Deliver a talk at a large-scale industry conference.", type: "PERMANENT" as const, aspect: "SOCIAL" as const, rank: "A", xp_reward: 28000 },

  // S-Rank
  { title: "Move the Room", description: "Lead or speak to an audience and demonstrably shift how they think or act.", type: "DAILY" as const, aspect: "SOCIAL" as const, rank: "S", xp_reward: 3500 },
  { title: "1,000 People Impacted", description: "Create something — a talk, a community, a project — that measurably improves 1,000 lives.", type: "PERMANENT" as const, aspect: "SOCIAL" as const, rank: "S", xp_reward: 75000 },
];

async function main() {
  console.log(`Seeding ${quests.length} quests across all ranks...`);

  let created = 0;
  let skipped = 0;

  for (const quest of quests) {
    const result = await prisma.quests.upsert({
      where: { title_aspect: { title: quest.title, aspect: quest.aspect } },
      update: {
        description: quest.description,
        type: quest.type,
        rank: quest.rank,
        xp_reward: quest.xp_reward,
        is_active: true,
      },
      create: quest,
    });
    if (result) created++;
  }

  const byRank = quests.reduce((acc, q) => {
    acc[q.rank] = (acc[q.rank] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\n✓ Seed complete");
  console.log(`  Total: ${quests.length} quests`);
  console.log(`  By rank: ${Object.entries(byRank).map(([r, n]) => `${r}(${n})`).join("  ")}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
