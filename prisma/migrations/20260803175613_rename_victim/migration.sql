/*
  Warnings:

  - You are about to drop the `Victime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Signalement` DROP FOREIGN KEY `Signalement_victimeId_fkey`;

-- DropIndex
DROP INDEX `Signalement_victimeId_fkey` ON `Signalement`;

-- DropTable
DROP TABLE `Victime`;

-- CreateTable
CREATE TABLE `Victim` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(30) NULL,
    `lastName` VARCHAR(30) NULL,
    `email` VARCHAR(100) NULL,
    `telephone` VARCHAR(20) NULL,
    `sex` ENUM('MALE', 'FEMALE') NOT NULL,
    `ageGroup` ENUM('CHILD_5_12', 'TEEN_13_17', 'YOUNG_ADULT_18_25', 'ADULT_26_PLUS') NOT NULL,
    `city` VARCHAR(30) NULL,
    `isAnonymous` BOOLEAN NOT NULL DEFAULT true,
    `referenceNumber` VARCHAR(30) NOT NULL,
    `hashedPassword` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Victim_referenceNumber_key`(`referenceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Signalement` ADD CONSTRAINT `Signalement_victimeId_fkey` FOREIGN KEY (`victimeId`) REFERENCES `Victim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
