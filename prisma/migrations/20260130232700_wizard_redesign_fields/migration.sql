-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "defaultTags" TEXT[],
    "defaultNsfw" BOOLEAN NOT NULL DEFAULT false,
    "defaultContentLevel" INTEGER NOT NULL DEFAULT 5,
    "defaultStoryPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "storyPrompt" TEXT,
ADD COLUMN     "conflict" TEXT,
ADD COLUMN     "endingDirection" TEXT,
ADD COLUMN     "settingName" TEXT,
ADD COLUMN     "settingDescription" TEXT;

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "isProtagonist" BOOLEAN NOT NULL DEFAULT false;