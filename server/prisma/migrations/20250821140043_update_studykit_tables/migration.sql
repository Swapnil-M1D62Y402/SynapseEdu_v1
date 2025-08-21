/*
  Warnings:

  - You are about to drop the column `answer` on the `FlashCard` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `FlashCard` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `Smart_Study_MCQ` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Smart_Study_MCQ` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `StudyKit` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `StudyKit` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Test` table. All the data in the column will be lost.
  - Added the required column `back` to the `FlashCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `front` to the `FlashCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `choices` to the `Smart_Study_MCQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctOption` to the `Smart_Study_MCQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `Smart_Study_MCQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Smart_Study_MCQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `explanation` to the `Smart_Study_MCQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StudyKit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyGuideSummary` to the `StudyKit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StudyKit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `choices` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctOption` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `explanation` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- AlterTable
ALTER TABLE "public"."FlashCard" DROP COLUMN "answer",
DROP COLUMN "question",
ADD COLUMN     "back" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "front" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Smart_Study_MCQ" DROP COLUMN "answer",
DROP COLUMN "options",
ADD COLUMN     "choices" JSONB NOT NULL,
ADD COLUMN     "correctOption" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "difficulty" "public"."Difficulty" NOT NULL,
ADD COLUMN     "questionId" INTEGER NOT NULL,
DROP COLUMN "explanation",
ADD COLUMN     "explanation" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "public"."StudyKit" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "attentionSpan" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "kpiScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "masteryPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "studyGuideSummary" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Test" DROP COLUMN "title",
ADD COLUMN     "choices" JSONB NOT NULL,
ADD COLUMN     "correctOption" TEXT NOT NULL,
ADD COLUMN     "difficulty" "public"."Difficulty" NOT NULL,
ADD COLUMN     "explanation" JSONB NOT NULL,
ADD COLUMN     "question" TEXT NOT NULL,
ADD COLUMN     "questionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."ToDo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "studyKitId" TEXT NOT NULL,

    CONSTRAINT "ToDo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ToDo" ADD CONSTRAINT "ToDo_studyKitId_fkey" FOREIGN KEY ("studyKitId") REFERENCES "public"."StudyKit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
