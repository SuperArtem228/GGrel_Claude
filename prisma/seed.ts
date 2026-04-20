import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "bond2026";

async function main() {
  console.log("🌱  Seeding BondGame…");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ── Users ──────────────────────────────────────────
  const artem = await prisma.user.upsert({
    where: { email: "artem@bondgame.dev" },
    update: {},
    create: {
      email: "artem@bondgame.dev",
      passwordHash,
      displayName: "Артём",
      avatarUrl: null,
    },
  });

  const masha = await prisma.user.upsert({
    where: { email: "masha@bondgame.dev" },
    update: {},
    create: {
      email: "masha@bondgame.dev",
      passwordHash,
      displayName: "Маша",
      avatarUrl: null,
    },
  });

  // ── Pair ───────────────────────────────────────────
  let pair = await prisma.pair.findFirst({ where: { createdById: artem.id } });
  if (!pair) {
    pair = await prisma.pair.create({
      data: {
        name: "Артём & Маша",
        createdById: artem.id,
        status: "ACTIVE",
        commonWalletBalance: 200,
        coupleStreak: 5,
        lastStreakDate: new Date(),
      },
    });
    await prisma.pairMember.createMany({
      data: [
        { pairId: pair.id, userId: artem.id, role: "A", personalWalletBalance: 520, personalStreak: 5 },
        { pairId: pair.id, userId: masha.id, role: "B", personalWalletBalance: 480, personalStreak: 5 },
      ],
    });
    await prisma.walletTransaction.createMany({
      data: [
        { pairId: pair.id, userId: artem.id, walletType: "PERSONAL", amountLc: 520, reason: "SEED" },
        { pairId: pair.id, userId: masha.id, walletType: "PERSONAL", amountLc: 480, reason: "SEED" },
        { pairId: pair.id, walletType: "COMMON", amountLc: 200, reason: "SEED" },
      ],
    });
  }

  // ── Challenges (templates) ─────────────────────────
  const challengeTemplates = [
    // Daily
    { kind: "SOLO", period: "DAILY", title: "Доброе утро", description: "Напиши партнёру тёплое сообщение до 10:00.", category: "care", difficulty: 1, rewardLc: 20, requiresBoth: false, totalSteps: 1, packKey: "morning" },
    { kind: "SOLO", period: "DAILY", title: "Кофе дома", description: "Свари кофе и отнеси его партнёру.", category: "care", difficulty: 1, rewardLc: 25, requiresBoth: false, totalSteps: 1, packKey: "morning" },
    { kind: "COUPLE", period: "DAILY", title: "Прогулка 20 минут", description: "Пройтись вместе на свежем воздухе.", category: "time", difficulty: 1, rewardLc: 40, requiresBoth: true, totalSteps: 1, packKey: "movement" },
    { kind: "COUPLE", period: "DAILY", title: "Ужин без телефонов", description: "Поужинайте без гаджетов.", category: "time", difficulty: 2, rewardLc: 60, requiresBoth: true, totalSteps: 1, packKey: "attention" },
    { kind: "SOLO", period: "DAILY", title: "Комплимент дня", description: "Скажи партнёру искренний комплимент.", category: "care", difficulty: 1, rewardLc: 20, requiresBoth: false, totalSteps: 1, packKey: "words" },
    { kind: "SOLO", period: "DAILY", title: "Маленькое дело по дому", description: "Выполни одну мелочь по дому без просьбы.", category: "home", difficulty: 2, rewardLc: 35, requiresBoth: false, totalSteps: 1, packKey: "home" },
    { kind: "ASYNC", period: "DAILY", title: "Фото дня", description: "Пришлите друг другу по одному фото из дня.", category: "time", difficulty: 1, rewardLc: 30, requiresBoth: true, totalSteps: 1, packKey: "moments" },
    { kind: "SOLO", period: "DAILY", title: "Чай вечером", description: "Завари вечерний чай партнёру.", category: "care", difficulty: 1, rewardLc: 20, requiresBoth: false, totalSteps: 1, packKey: "evening" },
    { kind: "COUPLE", period: "DAILY", title: "5 минут объятий", description: "Обнимитесь без спешки.", category: "care", difficulty: 1, rewardLc: 30, requiresBoth: true, totalSteps: 1, packKey: "touch" },
    { kind: "SOLO", period: "DAILY", title: "Убрал стол", description: "Оставь после себя чистое место.", category: "home", difficulty: 1, rewardLc: 15, requiresBoth: false, totalSteps: 1, packKey: "home" },
    { kind: "ASYNC", period: "DAILY", title: "Три благодарности", description: "Напишите друг другу по три пункта, за что вы сегодня благодарны.", category: "words", difficulty: 2, rewardLc: 50, requiresBoth: true, totalSteps: 1, packKey: "gratitude" },
    { kind: "SOLO", period: "DAILY", title: "План вечера", description: "Предложи, чем займёмся сегодня вечером.", category: "time", difficulty: 1, rewardLc: 25, requiresBoth: false, totalSteps: 1, packKey: "planning" },
    { kind: "COUPLE", period: "DAILY", title: "Танец на кухне", description: "Включите трек и потанцуйте 3 минуты.", category: "time", difficulty: 1, rewardLc: 35, requiresBoth: true, totalSteps: 1, packKey: "play" },
    { kind: "SOLO", period: "DAILY", title: "Принеси завтрак", description: "Подай партнёру завтрак в постель.", category: "care", difficulty: 2, rewardLc: 45, requiresBoth: false, totalSteps: 1, packKey: "morning" },
    { kind: "SOLO", period: "DAILY", title: "Сделай фото", description: "Сфотографируй что-то красивое и поделись.", category: "words", difficulty: 1, rewardLc: 20, requiresBoth: false, totalSteps: 1, packKey: "moments" },

    // Weekly
    { kind: "COUPLE", period: "WEEKLY", title: "Свидание на неделе", description: "Сходите куда-то вместе — кино, ужин, прогулка.", category: "time", difficulty: 3, rewardLc: 180, requiresBoth: true, totalSteps: 1, packKey: "weekly" },
    { kind: "COUPLE", period: "WEEKLY", title: "Новое вместе", description: "Попробуйте что-то, чего не делали раньше.", category: "time", difficulty: 3, rewardLc: 220, requiresBoth: true, totalSteps: 1, packKey: "weekly" },
    { kind: "COUPLE", period: "WEEKLY", title: "Вечер без гаджетов", description: "Проведите полный вечер без телефонов.", category: "attention", difficulty: 3, rewardLc: 200, requiresBoth: true, totalSteps: 1, packKey: "weekly" },
    { kind: "COUPLE", period: "WEEKLY", title: "Готовка ужина вдвоём", description: "Приготовьте ужин вместе от начала и до конца.", category: "food", difficulty: 2, rewardLc: 160, requiresBoth: true, totalSteps: 1, packKey: "weekly" },
    { kind: "SOLO", period: "WEEKLY", title: "5 комплиментов", description: "Сделай 5 искренних комплиментов за неделю.", category: "words", difficulty: 2, rewardLc: 140, requiresBoth: false, totalSteps: 5, packKey: "weekly" },
    { kind: "COUPLE", period: "WEEKLY", title: "Письмо друг другу", description: "Напишите друг другу короткие письма — что цените.", category: "words", difficulty: 3, rewardLc: 220, requiresBoth: true, totalSteps: 1, packKey: "weekly" },

    // Spicy daily/weekly
    { kind: "COUPLE", period: "DAILY", title: "Долгий поцелуй", description: "Приватный момент близости.", category: "intimacy", difficulty: 2, rewardLc: 50, requiresBoth: true, totalSteps: 1, packKey: "spicy", isSpicy: true },
    { kind: "COUPLE", period: "WEEKLY", title: "Вечер без одежды", description: "Приватный вечер для двоих.", category: "intimacy", difficulty: 3, rewardLc: 220, requiresBoth: true, totalSteps: 1, packKey: "spicy", isSpicy: true },
    { kind: "SOLO", period: "DAILY", title: "Скрытый комплимент", description: "Приватный комплимент, только для партнёра.", category: "intimacy", difficulty: 1, rewardLc: 40, requiresBoth: false, totalSteps: 1, packKey: "spicy", isSpicy: true },
  ] as const;

  for (const tpl of challengeTemplates) {
    // Use packKey+title hash as stable ASCII id
    const key = tpl.packKey + "-" + tpl.period.toLowerCase() + "-" + challengeTemplates.indexOf(tpl);
    await prisma.challengeTemplate.upsert({
      where: { id: key },
      update: {},
      create: { id: key, ...tpl } as any,
    });
  }

  // ── Rewards (system) ───────────────────────────────
  // IDs must be URL-safe ASCII — no Cyrillic, no spaces
  const rewards = [
    { id: "rw-massage",      title: "Массаж 15 минут",       description: "Партнёр делает тебе 15-минутный массаж.",          category: "ACTION",  priceLc: 80,  emoji: "💆" },
    { id: "rw-breakfast",    title: "Завтрак в постель",      description: "Полноценный завтрак в постель.",                   category: "ACTION",  priceLc: 120, emoji: "🍳" },
    { id: "rw-film",         title: "Выбираешь фильм",        description: "Следующий фильм выбираешь ты.",                    category: "INSTANT", priceLc: 40,  emoji: "🎬" },
    { id: "rw-home-date",    title: "Домашнее свидание",      description: "Партнёр готовит и организует вечер.",              category: "ACTION",  priceLc: 160, emoji: "🕯️" },
    { id: "rw-restaurant",   title: "Ресторан",               description: "Партнёр ведёт тебя в ресторан.",                   category: "ACTION",  priceLc: 300, emoji: "🍽️" },
    { id: "rw-cleaning",     title: "Уборка на тебе",         description: "Партнёр берёт уборку на себя на неделю.",          category: "ACTION",  priceLc: 200, emoji: "🧹" },
    { id: "rw-lazy-day",     title: "Право на лень",          description: "Один день без домашних дел.",                      category: "INSTANT", priceLc: 100, emoji: "🛋️" },
    { id: "rw-choose-place", title: "Выбираешь место",        description: "Право выбрать, куда идти.",                        category: "INSTANT", priceLc: 60,  emoji: "🧭" },
    { id: "rw-playlist",     title: "Плейлист дня",           description: "Сегодня музыку выбираешь ты.",                     category: "INSTANT", priceLc: 40,  emoji: "🎧" },
    { id: "rw-compliment",   title: "Комплимент-бомба",       description: "Партнёр говорит 5 комплиментов подряд.",           category: "ACTION",  priceLc: 60,  emoji: "💬" },
    { id: "rw-walk",         title: "Прогулка мечты",         description: "Партнёр организует прогулку по твоему сценарию.", category: "ACTION",  priceLc: 140, emoji: "🌳" },
    { id: "rw-movie-night",  title: "Вечер кино",             description: "Партнёр готовит вечер кино дома.",                 category: "ACTION",  priceLc: 100, emoji: "🍿" },
    { id: "rw-fav-food",     title: "Любимая еда",            description: "Партнёр готовит твоё любимое блюдо.",              category: "ACTION",  priceLc: 120, emoji: "🥘" },
    { id: "rw-sleep-in",     title: "Утро без будильника",    description: "Утро без забот и ранних дел.",                     category: "INSTANT", priceLc: 80,  emoji: "🌅" },
    { id: "rw-surprise",     title: "Сюрприз-подарок",        description: "Партнёр готовит маленький сюрприз.",               category: "ACTION",  priceLc: 200, emoji: "🎁" },
    { id: "rw-tea",          title: "Чайная церемония",       description: "Расслабляющая чайная церемония вдвоём.",           category: "ACTION",  priceLc: 100, emoji: "🍵" },
    { id: "rw-photoshoot",   title: "Фото-сессия",            description: "Домашняя фото-сессия друг друга.",                 category: "ACTION",  priceLc: 180, emoji: "📸" },
    { id: "rw-book",         title: "Книга вслух",            description: "Партнёр читает тебе вслух 20 минут.",              category: "ACTION",  priceLc: 80,  emoji: "📖" },
    { id: "rw-your-rules",   title: "День твоих правил",      description: "Один день — твои правила.",                        category: "INSTANT", priceLc: 240, emoji: "👑" },
    { id: "rw-slow-dance",   title: "Танец медленный",        description: "Медленный танец на кухне под любимый трек.",       category: "ACTION",  priceLc: 60,  emoji: "💃" },
  ] as const;

  for (const r of rewards) {
    await prisma.rewardTemplate.upsert({
      where: { id: r.id },
      update: {},
      create: { isSystem: true, ...r } as any,
    });
  }

  // Spicy rewards — also ASCII IDs
  const spicyRewards = [
    { id: "sp-massage",      title: "Приватный массаж",          description: "Массаж без слов, только ощущения.",                   category: "PRIVATE", priceLc: 140, emoji: "🌙" },
    { id: "sp-your-night",   title: "Ночь по твоим правилам",    description: "Вечер вдвоём по твоему сценарию.",                    category: "PRIVATE", priceLc: 280, emoji: "🔮" },
    { id: "sp-dance",        title: "Приватный танец",           description: "Один медленный танец только для тебя.",               category: "PRIVATE", priceLc: 120, emoji: "🎭" },
    { id: "sp-secret-date",  title: "Секретное свидание",        description: "Неожиданная встреча в неожиданном месте.",            category: "PRIVATE", priceLc: 220, emoji: "🗝️" },
    { id: "sp-long-morning", title: "Долгое утро",               description: "Утро без планов, только вдвоём.",                     category: "PRIVATE", priceLc: 160, emoji: "☁️" },
  ] as const;

  for (const r of spicyRewards) {
    await prisma.rewardTemplate.upsert({
      where: { id: r.id },
      update: {},
      create: { isSystem: true, isSpicy: true, ...r } as any,
    });
  }

  // ── Cases (system) ─────────────────────────────────
  const systemCases = [
    {
      id: "case-starter",
      title: "Стартовый кейс",
      description: "Начни с малого — гарантированно получишь полезную награду.",
      openPriceLc: 80,
      emoji: "🎁",
      accent: "lime",
      items: [
        { title: "Выбираешь фильм", probability: 45 },
        { title: "Массаж 15 минут", probability: 28 },
        { title: "Домашнее свидание", probability: 18 },
        { title: "Ресторан", probability: 9 },
      ],
    },
    {
      id: "case-date",
      title: "Кейс свидания",
      description: "Для тех, кто хочет провести вечер вместе иначе.",
      openPriceLc: 140,
      emoji: "🕯️",
      accent: "lime",
      items: [
        { title: "Вечер кино", probability: 40 },
        { title: "Домашнее свидание", probability: 26 },
        { title: "Прогулка мечты", probability: 20 },
        { title: "Ресторан", probability: 14 },
      ],
    },
    {
      id: "case-cozy",
      title: "Уютный кейс",
      description: "Тёплое и домашнее — для тихих вечеров.",
      openPriceLc: 60,
      emoji: "🫖",
      accent: "lime",
      items: [
        { title: "Чайная церемония", probability: 42 },
        { title: "Книга вслух", probability: 30 },
        { title: "Завтрак в постель", probability: 20 },
        { title: "Любимая еда", probability: 8 },
      ],
    },
  ];

  for (const c of systemCases) {
    const caseTpl = await prisma.caseTemplate.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        title: c.title,
        description: c.description,
        openPriceLc: c.openPriceLc,
        isSystem: true,
        isSpicy: false,
        emoji: c.emoji,
        accent: c.accent,
      },
    });
    await prisma.caseItem.deleteMany({ where: { caseTemplateId: caseTpl.id } });
    for (let i = 0; i < c.items.length; i++) {
      const item = c.items[i];
      const reward = await prisma.rewardTemplate.findFirst({ where: { title: item.title } });
      if (!reward) continue;
      await prisma.caseItem.create({
        data: {
          caseTemplateId: caseTpl.id,
          rewardTemplateId: reward.id,
          probabilityPercent: item.probability,
          sortOrder: i,
        },
      });
    }
  }

  // Spicy case
  const spicyCase = await prisma.caseTemplate.upsert({
    where: { id: "case-spicy-velvet" },
    update: {},
    create: {
      id: "case-spicy-velvet",
      title: "Бархатный вечер",
      description: "Для тех, кто включил приватный режим.",
      openPriceLc: 180,
      isSystem: true,
      isSpicy: true,
      emoji: "🌙",
      accent: "magenta",
    },
  });
  await prisma.caseItem.deleteMany({ where: { caseTemplateId: spicyCase.id } });
  const spicyItems = [
    { title: "Приватный массаж", probability: 45 },
    { title: "Приватный танец", probability: 28 },
    { title: "Долгое утро", probability: 18 },
    { title: "Ночь по твоим правилам", probability: 9 },
  ];
  for (let i = 0; i < spicyItems.length; i++) {
    const reward = await prisma.rewardTemplate.findFirst({ where: { title: spicyItems[i].title } });
    if (!reward) continue;
    await prisma.caseItem.create({
      data: {
        caseTemplateId: spicyCase.id,
        rewardTemplateId: reward.id,
        probabilityPercent: spicyItems[i].probability,
        sortOrder: i,
      },
    });
  }

  // ── Example tasks ──────────────────────────────────
  const existingTasks = await prisma.task.count({ where: { pairId: pair.id } });
  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          pairId: pair.id,
          createdByUserId: masha.id,
          assignedToUserId: artem.id,
          title: "Прогулка перед ужином",
          description: "Давай пройдёмся минут 20 до ужина.",
          category: "TIME",
          priceLc: 60,
          bonusSpeedLc: 20,
          bonusQualityLc: 0,
          deadlineAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          urgent: false,
          bargainAllowed: true,
          status: "PROPOSED",
          frozenAmountLc: 60,
        },
        {
          pairId: pair.id,
          createdByUserId: artem.id,
          assignedToUserId: masha.id,
          title: "Утренний кофе",
          description: "Свари мне капучино, пожалуйста.",
          category: "CARE",
          priceLc: 40,
          deadlineAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
          bargainAllowed: true,
          status: "ACCEPTED",
          frozenAmountLc: 40,
          acceptedAt: new Date(),
        },
        {
          pairId: pair.id,
          createdByUserId: masha.id,
          assignedToUserId: artem.id,
          title: "Купить цветы",
          description: "Розовые пионы, если найдёшь.",
          category: "SURPRISE",
          priceLc: 180,
          bonusQualityLc: 40,
          deadlineAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
          bargainAllowed: true,
          status: "PENDING_CONFIRM",
          frozenAmountLc: 180,
          acceptedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          completedAt: new Date(),
        },
      ],
    });
  }

  // ── Today's daily challenges ───────────────────────
  const today = new Date();
  const periodKey = today.toISOString().slice(0, 10);
  const todays = await prisma.challengeTemplate.findMany({
    where: { period: "DAILY", isSpicy: false, active: true },
    take: 3,
    orderBy: { createdAt: "asc" },
  });
  for (const t of todays) {
    const existing = await prisma.pairChallenge.findUnique({
      where: { pairId_templateId_periodKey: { pairId: pair.id, templateId: t.id, periodKey } },
    });
    if (!existing) {
      await prisma.pairChallenge.create({
        data: {
          pairId: pair.id,
          templateId: t.id,
          periodKey,
          status: "SELECTED",
          progressUserA: 0,
          progressUserB: 0,
          startedAt: today,
        },
      });
    }
  }

  // Weekly challenge too
  const weekKey = weeklyPeriodKey(today);
  const weekly = await prisma.challengeTemplate.findFirst({
    where: { period: "WEEKLY", isSpicy: false, active: true },
  });
  if (weekly) {
    const existing = await prisma.pairChallenge.findUnique({
      where: { pairId_templateId_periodKey: { pairId: pair.id, templateId: weekly.id, periodKey: weekKey } },
    });
    if (!existing) {
      await prisma.pairChallenge.create({
        data: {
          pairId: pair.id,
          templateId: weekly.id,
          periodKey: weekKey,
          status: "IN_PROGRESS",
          progressUserA: 1,
          progressUserB: 0,
          startedAt: today,
        },
      });
    }
  }

  console.log("✓ Seeded.");
  console.log(`  Артём:  artem@bondgame.dev  / ${DEMO_PASSWORD}`);
  console.log(`  Маша:   masha@bondgame.dev  / ${DEMO_PASSWORD}`);
}

function weeklyPeriodKey(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((+date - +yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
