/*
  Warnings:

  - You are about to drop the column `victimId` on the `Signalement` table. All the data in the column will be lost.
  - Added the required column `victimId` to the `Signalement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Signalement` DROP FOREIGN KEY `Signalement_victimId_fkey`;

-- DropIndex
DROP INDEX `Signalement_victimId_fkey` ON `Signalement`;

-- AlterTable
ALTER TABLE `AssignedTo` MODIFY `reason` TEXT NULL;

-- AlterTable
ALTER TABLE `Signalement` DROP COLUMN `victimId`,
    ADD COLUMN `victimId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Signalement` ADD CONSTRAINT `Signalement_victimId_fkey` FOREIGN KEY (`victimId`) REFERENCES `Victim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
