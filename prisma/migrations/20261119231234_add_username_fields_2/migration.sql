/*
  Warnings:

  - You are about to drop the column `displayedUsername` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "displayedUsername",
ADD COLUMN     "displayUsername" TEXT;
