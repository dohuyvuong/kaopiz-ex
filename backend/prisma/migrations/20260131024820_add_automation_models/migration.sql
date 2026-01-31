-- CreateTable
CREATE TABLE "UserAutomationSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "jobType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "params" TEXT,
    "notificationChannel" TEXT,
    "notificationTarget" TEXT,
    "autoApproveAfterMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserAutomationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PendingAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "jobType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "approvedAt" DATETIME,
    "executedAt" DATETIME,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PendingAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobName" TEXT NOT NULL,
    "userId" INTEGER,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER
);

-- CreateIndex
CREATE INDEX "UserAutomationSetting_jobType_enabled_idx" ON "UserAutomationSetting"("jobType", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "UserAutomationSetting_userId_jobType_key" ON "UserAutomationSetting"("userId", "jobType");

-- CreateIndex
CREATE INDEX "PendingAction_userId_status_idx" ON "PendingAction"("userId", "status");

-- CreateIndex
CREATE INDEX "PendingAction_status_expiresAt_idx" ON "PendingAction"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "JobLog_jobName_startedAt_idx" ON "JobLog"("jobName", "startedAt");
