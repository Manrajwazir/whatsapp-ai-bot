-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userGender" TEXT NOT NULL,
    "partnerPhone" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "sampleMsgs" TEXT[],
    "nicknames" TEXT[],
    "memories" JSONB,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_partnerPhone_key" ON "Profile"("partnerPhone");

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
