-- CreateTable
CREATE TABLE "ApproverPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "approvalOrder" INTEGER NOT NULL,
    "approverUserId" INTEGER NOT NULL,

    CONSTRAINT "ApproverPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApproverPreference_userId_typeId_approvalOrder_key" ON "ApproverPreference"("userId", "typeId", "approvalOrder");

-- CreateIndex
CREATE INDEX "ApproverPreference_userId_idx" ON "ApproverPreference"("userId");

-- AddForeignKey
ALTER TABLE "ApproverPreference" ADD CONSTRAINT "ApproverPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
