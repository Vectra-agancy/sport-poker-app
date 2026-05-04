import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("→ Cleaning existing data...");
  // Order matters due to FKs
  await prisma.tournamentResult.deleteMany();
  await prisma.ratingSnapshot.deleteMany();
  await prisma.referralProgress.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.tournamentLevel.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.season.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  // ─── Seasons ──────────────────────────────────────────
  console.log("→ Seeding seasons...");
  const maySeason = await prisma.season.create({
    data: {
      name: "Майский сезон",
      slug: "may-2026",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-31"),
      isActive: true,
    },
  });

  // ─── Achievements ─────────────────────────────────────
  console.log("→ Seeding achievements catalog...");
  const achievements = await Promise.all(
    [
      {
        code: "royal_flush",
        icon: "🃏",
        title: "Royal Flush",
        description: "Собрал роял-флеш",
        category: "rare",
        isManual: true,
      },
      {
        code: "iron_man",
        icon: "📅",
        title: "Iron Man",
        description: "10 турниров подряд",
        category: "rare",
        isManual: false,
      },
      {
        code: "first_win",
        icon: "🥇",
        title: "First Win",
        description: "Первая победа",
        category: "result",
        isManual: false,
      },
      {
        code: "champion_5",
        icon: "🏆",
        title: "Champion ×5",
        description: "5 побед в турнирах",
        category: "result",
        isManual: false,
      },
      {
        code: "regular",
        icon: "🎲",
        title: "Regular",
        description: "10 турниров",
        category: "participation",
        isManual: false,
      },
      {
        code: "veteran",
        icon: "🎲",
        title: "Veteran",
        description: "50 турниров",
        category: "participation",
        isManual: false,
      },
      {
        code: "season_sweep",
        icon: "🏆",
        title: "Season Sweep",
        description: "Все турниры сезона",
        category: "rare",
        isManual: false,
      },
      {
        code: "lightning",
        icon: "⚡",
        title: "Lightning",
        description: "5+ выбитых в одной раздаче",
        category: "rare",
        isManual: true,
      },
    ].map((a) => prisma.achievement.create({ data: a }))
  );
  const byCode = Object.fromEntries(achievements.map((a) => [a.code, a]));

  // ─── Users ────────────────────────────────────────────
  console.log("→ Seeding users...");
  const adminUser = await prisma.user.create({
    data: {
      nickname: "admin",
      email: "admin@reraise.club",
      tier: "platinum",
      isAdmin: true,
      referralCode: "ADMIN0",
    },
  });

  const me = await prisma.user.create({
    data: {
      nickname: "LuckNear",
      tier: "silver",
      referralCode: "LUCK01",
      freeTickets: 2,
    },
  });

  const ratingPlayers = [
    { nickname: "V", points: 31045, bounties: 61 },
    { nickname: "ИзЯ", points: 30414, bounties: 112 },
    { nickname: "VagabOnd", points: 28445, bounties: 72 },
    { nickname: "s1eepz", points: 26200, bounties: 88 },
    { nickname: "Олег Вла", points: 23981, bounties: 110 },
    { nickname: "SkyDiver", points: 22100, bounties: 45 },
    { nickname: "Baber", points: 21500, bounties: 67 },
  ];

  const ratingUsers: { id: number; nickname: string }[] = [];
  for (let i = 0; i < ratingPlayers.length; i++) {
    const p = ratingPlayers[i];
    const user = await prisma.user.create({
      data: {
        nickname: p.nickname,
        tier: i < 3 ? "gold" : "silver",
        referralCode: `REF${String(i + 100).padStart(4, "0")}`,
      },
    });
    ratingUsers.push({ id: user.id, nickname: user.nickname });
  }

  // Доп. участники для турниров
  const extraNames = ["€$ LP", "Dmitry_archmeb", "Omarello57", "Feeleemon"];
  const extraUsers: { id: number; nickname: string }[] = [];
  for (let i = 0; i < extraNames.length; i++) {
    const u = await prisma.user.create({
      data: {
        nickname: extraNames[i],
        tier: "bronze",
        referralCode: `EXT${String(i + 200).padStart(4, "0")}`,
      },
    });
    extraUsers.push({ id: u.id, nickname: u.nickname });
  }

  // ─── Snapshots для рейтинга ──────────────────────────
  console.log("→ Seeding rating snapshots...");
  const today = new Date();
  for (let i = 0; i < ratingPlayers.length; i++) {
    const p = ratingPlayers[i];
    const userId = ratingUsers[i].id;
    await prisma.ratingSnapshot.create({
      data: {
        userId,
        scope: "global",
        position: i + 1,
        points: p.points,
        bounties: p.bounties,
        takenAt: today,
      },
    });
  }
  await prisma.ratingSnapshot.create({
    data: {
      userId: me.id,
      scope: "global",
      position: 45,
      points: 8240,
      bounties: 34,
      takenAt: today,
    },
  });

  // ─── Tournaments ─────────────────────────────────────
  console.log("→ Seeding tournaments...");
  const tournamentSeed = [
    {
      name: "Ultra Bounty",
      type: "bounty",
      startsAt: new Date("2026-05-03T17:00:00"),
      maxSeats: 60,
      startStack: 30000,
      ticketPrice: 1500,
      guarantee: 90000,
      format:
        "Баунти турнир, где каждый нокаут приносит ULTRA-баунти. ULTRA баунти = 150 очкам",
      seats: 56,
    },
    {
      name: "No raise",
      type: "no_raise",
      startsAt: new Date("2026-05-04T19:00:00"),
      maxSeats: 60,
      startStack: 25000,
      ticketPrice: 1000,
      guarantee: null,
      format: null,
      seats: 27,
    },
    {
      name: "Amateur tournament",
      type: "amateur",
      startsAt: new Date("2026-05-05T19:00:00"),
      maxSeats: 40,
      startStack: 20000,
      ticketPrice: 800,
      guarantee: null,
      format: null,
      seats: 6,
    },
    {
      name: "Freezeout Classic",
      type: "freezeout",
      startsAt: new Date("2026-05-06T20:00:00"),
      maxSeats: 50,
      startStack: 35000,
      ticketPrice: 1200,
      guarantee: null,
      format: null,
      seats: 22,
    },
  ];

  const blindStructure = [
    { level: 1, smallBlind: 100, bigBlind: 200, ante: 0, durationMin: 20 },
    { level: 2, smallBlind: 200, bigBlind: 400, ante: 50, durationMin: 20 },
    { level: 3, smallBlind: 300, bigBlind: 600, ante: 75, durationMin: 20 },
    { level: 4, smallBlind: 500, bigBlind: 1000, ante: 100, durationMin: 20 },
    {
      level: 5,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      durationMin: 10,
      isBreak: true,
    },
    { level: 6, smallBlind: 800, bigBlind: 1600, ante: 200, durationMin: 20 },
    {
      level: 7,
      smallBlind: 1200,
      bigBlind: 2400,
      ante: 300,
      durationMin: 20,
    },
  ];

  const allParticipants = [...ratingUsers, ...extraUsers];

  for (const t of tournamentSeed) {
    const tournament = await prisma.tournament.create({
      data: {
        name: t.name,
        type: t.type,
        startsAt: t.startsAt,
        maxSeats: t.maxSeats,
        startStack: t.startStack,
        ticketPrice: t.ticketPrice,
        guarantee: t.guarantee,
        format: t.format,
        seasonId: maySeason.id,
        createdById: adminUser.id,
        levels: {
          create: blindStructure,
        },
      },
    });

    // Регистрации — наполняем до t.seats участников из общего пула
    const seatCount = Math.min(t.seats, allParticipants.length);
    for (let i = 0; i < seatCount; i++) {
      await prisma.registration.create({
        data: {
          userId: allParticipants[i].id,
          tournamentId: tournament.id,
          status: "registered",
        },
      });
    }
  }

  // Запись текущего пользователя на Ultra Bounty
  const ultraBounty = await prisma.tournament.findFirstOrThrow({
    where: { name: "Ultra Bounty" },
  });
  await prisma.registration.create({
    data: {
      userId: me.id,
      tournamentId: ultraBounty.id,
      status: "registered",
    },
  });

  // ─── UserAchievements для LuckNear ───────────────────
  console.log("→ Seeding user achievements...");
  const unlockedCodes = [
    "royal_flush",
    "iron_man",
    "first_win",
    "champion_5",
    "regular",
  ];
  for (const code of unlockedCodes) {
    await prisma.userAchievement.create({
      data: {
        userId: me.id,
        achievementId: byCode[code].id,
        shownToUser: true,
      },
    });
  }

  // ─── Follows и лента друзей ──────────────────────────
  console.log("→ Seeding follows...");
  for (const u of ratingUsers.slice(0, 3)) {
    await prisma.follow.create({
      data: { followerId: me.id, followingId: u.id },
    });
  }

  // ─── Referral progress ───────────────────────────────
  console.log("→ Seeding referral progress...");
  // 7 рефералов, всего 23 attended-игры (по моку)
  // Создадим 7 реферальных юзеров и распределим игры.
  for (let i = 0; i < 7; i++) {
    const referee = await prisma.user.create({
      data: {
        nickname: `friend_${i + 1}`,
        tier: "bronze",
        referralCode: `FR${String(i).padStart(4, "0")}`,
        referredById: me.id,
      },
    });
    const games = i < 3 ? 5 : i < 6 ? 2 : 0; // суммарно ~21
    await prisma.referralProgress.create({
      data: {
        referrerId: me.id,
        refereeId: referee.id,
        attendedTournaments: games,
        ticketsAwarded: 0,
      },
    });
  }

  console.log("✔ Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
