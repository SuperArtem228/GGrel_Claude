-- CreateEnum
CREATE TYPE "PairStatus" AS ENUM ('PENDING', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PairRole" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'PROPOSED', 'BARGAINING', 'ACCEPTED', 'IN_PROGRESS', 'PENDING_CONFIRM', 'DISPUTED', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('HOME', 'CARE', 'FOOD', 'TIME', 'SURPRISE', 'OTHER', 'SPICY');

-- CreateEnum
CREATE TYPE "ChallengeKind" AS ENUM ('SOLO', 'COUPLE', 'ASYNC');

-- CreateEnum
CREATE TYPE "ChallengePeriod" AS ENUM ('DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('OFFERED', 'SELECTED', 'IN_PROGRESS', 'DONE', 'CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RewardCategory" AS ENUM ('ACTION', 'INSTANT', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PURCHASED', 'OWNED', 'ACTIVATED', 'FULFILLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('STORE', 'CASE', 'GIFT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('PERSONAL', 'COMMON');

-- CreateEnum
CREATE TYPE "TxReason" AS ENUM ('TASK_RESERVE', 'TASK_RELEASE', 'TASK_PAYOUT', 'TASK_BONUS', 'CHALLENGE_REWARD', 'STREAK_BONUS', 'CASE_OPEN', 'REWARD_PURCHASE', 'SEED', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('TASK_SENT', 'TASK_REPLY', 'TASK_CONFIRMED', 'STREAK_RISK', 'REWARD_ACTIVATED', 'CASE_RESULT', 'SPICY_NEUTRAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pair" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "PairStatus" NOT NULL DEFAULT 'PENDING',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Moscow',
    "commonWalletBalance" INTEGER NOT NULL DEFAULT 0,
    "coupleStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDate" TIMESTAMP(3),
    "graceTokens" INTEGER NOT NULL DEFAULT 1,
    "spicyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairMember" (
    "pairId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PairRole" NOT NULL,
    "personalWalletBalance" INTEGER NOT NULL DEFAULT 0,
    "personalStreak" INTEGER NOT NULL DEFAULT 0,
    "spicyOptIn" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairMember_pkey" PRIMARY KEY ("pairId","userId")
);

-- CreateTable
CREATE TABLE "PairInvite" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "assignedToUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TaskCategory" NOT NULL DEFAULT 'OTHER',
    "priceLc" INTEGER NOT NULL,
    "bonusSpeedLc" INTEGER NOT NULL DEFAULT 0,
    "bonusQualityLc" INTEGER NOT NULL DEFAULT 0,
    "deadlineAt" TIMESTAMP(3),
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "bargainAllowed" BOOLEAN NOT NULL DEFAULT true,
    "onExchange" BOOLEAN NOT NULL DEFAULT false,
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "frozenAmountLc" INTEGER NOT NULL DEFAULT 0,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "disputeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskBargainRound" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "offeredPriceLc" INTEGER NOT NULL,
    "offeredDeadlineAt" TIMESTAMP(3),
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskBargainRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTemplate" (
    "id" TEXT NOT NULL,
    "kind" "ChallengeKind" NOT NULL,
    "period" "ChallengePeriod" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "rewardLc" INTEGER NOT NULL,
    "requiresBoth" BOOLEAN NOT NULL DEFAULT false,
    "totalSteps" INTEGER NOT NULL DEFAULT 1,
    "packKey" TEXT,
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairChallenge" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'OFFERED',
    "progressUserA" INTEGER NOT NULL DEFAULT 0,
    "progressUserB" INTEGER NOT NULL DEFAULT 0,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PairChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardTemplate" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "pairId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "RewardCategory" NOT NULL DEFAULT 'ACTION',
    "priceLc" INTEGER NOT NULL,
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emoji" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedReward" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "rewardTemplateId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "purchasedByUserId" TEXT NOT NULL,
    "status" "RewardStatus" NOT NULL DEFAULT 'OWNED',
    "sourceType" "SourceType" NOT NULL DEFAULT 'STORE',
    "sourceId" TEXT,
    "activatedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "privateFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseTemplate" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "pairId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "openPriceLc" INTEGER NOT NULL,
    "isSpicy" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emoji" TEXT,
    "accent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseItem" (
    "id" TEXT NOT NULL,
    "caseTemplateId" TEXT NOT NULL,
    "rewardTemplateId" TEXT NOT NULL,
    "probabilityPercent" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseOpen" (
    "id" TEXT NOT NULL,
    "caseTemplateId" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "openedByUserId" TEXT NOT NULL,
    "receivedRewardTemplateId" TEXT NOT NULL,
    "openPriceLc" INTEGER NOT NULL,
    "resultProbabilityPercent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "userId" TEXT,
    "walletType" "WalletType" NOT NULL,
    "amountLc" INTEGER NOT NULL,
    "reason" "TxReason" NOT NULL,
    "relatedType" TEXT,
    "relatedId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pairId" TEXT,
    "kind" "NotificationKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payloadJson" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpicyConsent" (
    "pairId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpicyConsent_pkey" PRIMARY KEY ("pairId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "PairMember_userId_idx" ON "PairMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PairMember_pairId_role_key" ON "PairMember"("pairId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "PairInvite_code_key" ON "PairInvite"("code");

-- CreateIndex
CREATE INDEX "PairInvite_pairId_idx" ON "PairInvite"("pairId");

-- CreateIndex
CREATE INDEX "Task_pairId_status_idx" ON "Task"("pairId", "status");

-- CreateIndex
CREATE INDEX "Task_assignedToUserId_idx" ON "Task"("assignedToUserId");

-- CreateIndex
CREATE INDEX "TaskBargainRound_taskId_idx" ON "TaskBargainRound"("taskId");

-- CreateIndex
CREATE INDEX "ChallengeTemplate_period_isSpicy_active_idx" ON "ChallengeTemplate"("period", "isSpicy", "active");

-- CreateIndex
CREATE INDEX "PairChallenge_pairId_status_idx" ON "PairChallenge"("pairId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PairChallenge_pairId_templateId_periodKey_key" ON "PairChallenge"("pairId", "templateId", "periodKey");

-- CreateIndex
CREATE INDEX "RewardTemplate_isSpicy_active_idx" ON "RewardTemplate"("isSpicy", "active");

-- CreateIndex
CREATE INDEX "OwnedReward_pairId_status_idx" ON "OwnedReward"("pairId", "status");

-- CreateIndex
CREATE INDEX "OwnedReward_ownerUserId_idx" ON "OwnedReward"("ownerUserId");

-- CreateIndex
CREATE INDEX "CaseTemplate_isSpicy_active_idx" ON "CaseTemplate"("isSpicy", "active");

-- CreateIndex
CREATE INDEX "CaseItem_caseTemplateId_idx" ON "CaseItem"("caseTemplateId");

-- CreateIndex
CREATE INDEX "CaseOpen_pairId_idx" ON "CaseOpen"("pairId");

-- CreateIndex
CREATE INDEX "WalletTransaction_pairId_createdAt_idx" ON "WalletTransaction"("pairId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_createdAt_idx" ON "WalletTransaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_createdAt_idx" ON "NotificationLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pair" ADD CONSTRAINT "Pair_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairMember" ADD CONSTRAINT "PairMember_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairMember" ADD CONSTRAINT "PairMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairInvite" ADD CONSTRAINT "PairInvite_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskBargainRound" ADD CONSTRAINT "TaskBargainRound_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskBargainRound" ADD CONSTRAINT "TaskBargainRound_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairChallenge" ADD CONSTRAINT "PairChallenge_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairChallenge" ADD CONSTRAINT "PairChallenge_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChallengeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardTemplate" ADD CONSTRAINT "RewardTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedReward" ADD CONSTRAINT "OwnedReward_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedReward" ADD CONSTRAINT "OwnedReward_rewardTemplateId_fkey" FOREIGN KEY ("rewardTemplateId") REFERENCES "RewardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedReward" ADD CONSTRAINT "OwnedReward_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedReward" ADD CONSTRAINT "OwnedReward_purchasedByUserId_fkey" FOREIGN KEY ("purchasedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTemplate" ADD CONSTRAINT "CaseTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseTemplate" ADD CONSTRAINT "CaseTemplate_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseItem" ADD CONSTRAINT "CaseItem_caseTemplateId_fkey" FOREIGN KEY ("caseTemplateId") REFERENCES "CaseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseItem" ADD CONSTRAINT "CaseItem_rewardTemplateId_fkey" FOREIGN KEY ("rewardTemplateId") REFERENCES "RewardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseOpen" ADD CONSTRAINT "CaseOpen_caseTemplateId_fkey" FOREIGN KEY ("caseTemplateId") REFERENCES "CaseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseOpen" ADD CONSTRAINT "CaseOpen_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseOpen" ADD CONSTRAINT "CaseOpen_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseOpen" ADD CONSTRAINT "CaseOpen_receivedRewardTemplateId_fkey" FOREIGN KEY ("receivedRewardTemplateId") REFERENCES "RewardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpicyConsent" ADD CONSTRAINT "SpicyConsent_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "Pair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpicyConsent" ADD CONSTRAINT "SpicyConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
