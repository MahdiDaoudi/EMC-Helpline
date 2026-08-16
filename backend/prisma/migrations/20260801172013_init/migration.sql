-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(20) NOT NULL,
    `lastName` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `profileImageUrl` VARCHAR(255) NULL,
    `hashedPassword` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `roleId` INTEGER NOT NULL,
    `organizationId` INTEGER NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `victim` (
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

    UNIQUE INDEX `victim_referenceNumber_key`(`referenceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Signalement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'VALIDATED', 'REJECTED', 'IN_PROGRESS', 'CLOSED') NOT NULL,
    `priority` ENUM('NORMAL', 'HIGH', 'URGENT') NOT NULL,
    `issuer` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `otherCyberViolence` VARCHAR(100) NULL,
    `victimId` INTEGER NOT NULL,
    `cyberViolenceId` INTEGER NOT NULL,

    INDEX `Signalement_status_idx`(`status`),
    INDEX `Signalement_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Platform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Platform_name_key`(`name`),
    UNIQUE INDEX `Platform_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlatformReport` (
    `status` ENUM('PENDING', 'SENT', 'PROCESSING', 'CLOSED', 'REJECTED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `emailSubject` VARCHAR(150) NOT NULL,
    `emailBody` TEXT NOT NULL,
    `signalementId` INTEGER NOT NULL,
    `platformId` INTEGER NOT NULL,

    INDEX `PlatformReport_platformId_idx`(`platformId`),
    INDEX `PlatformReport_signalementId_idx`(`signalementId`),
    PRIMARY KEY (`signalementId`, `platformId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CyberViolence` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `CyberViolence_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `website` VARCHAR(255) NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_name_key`(`name`),
    UNIQUE INDEX `Organization_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Validate` (
    `type` ENUM('TECHNICIAN', 'ADMIN') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `signalementId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `Validate_signalementId_idx`(`signalementId`),
    INDEX `Validate_userId_idx`(`userId`),
    UNIQUE INDEX `Validate_type_signalementId_key`(`type`, `signalementId`),
    PRIMARY KEY (`signalementId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssignedTo` (
    `status` ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED') NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `signalementId` INTEGER NOT NULL,
    `organizationId` INTEGER NOT NULL,

    INDEX `AssignedTo_signalementId_idx`(`signalementId`),
    INDEX `AssignedTo_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`signalementId`, `organizationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReportedItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NULL,
    `contentUrl` VARCHAR(255) NOT NULL,
    `type` ENUM('VIDEO', 'IMAGE', 'PROFILE', 'POST', 'COMMENT', 'PAGE') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `signalementId` INTEGER NOT NULL,
    `platformId` INTEGER NOT NULL,

    INDEX `ReportedItem_signalementId_idx`(`signalementId`),
    INDEX `ReportedItem_platformId_idx`(`platformId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Screenshot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reportedItemId` INTEGER NOT NULL,

    INDEX `Screenshot_reportedItemId_idx`(`reportedItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Signalement` ADD CONSTRAINT `Signalement_victimId_fkey` FOREIGN KEY (`victimId`) REFERENCES `victim`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Signalement` ADD CONSTRAINT `Signalement_cyberViolenceId_fkey` FOREIGN KEY (`cyberViolenceId`) REFERENCES `CyberViolence`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlatformReport` ADD CONSTRAINT `PlatformReport_signalementId_fkey` FOREIGN KEY (`signalementId`) REFERENCES `Signalement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlatformReport` ADD CONSTRAINT `PlatformReport_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Validate` ADD CONSTRAINT `Validate_signalementId_fkey` FOREIGN KEY (`signalementId`) REFERENCES `Signalement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Validate` ADD CONSTRAINT `Validate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignedTo` ADD CONSTRAINT `AssignedTo_signalementId_fkey` FOREIGN KEY (`signalementId`) REFERENCES `Signalement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssignedTo` ADD CONSTRAINT `AssignedTo_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportedItem` ADD CONSTRAINT `ReportedItem_signalementId_fkey` FOREIGN KEY (`signalementId`) REFERENCES `Signalement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReportedItem` ADD CONSTRAINT `ReportedItem_platformId_fkey` FOREIGN KEY (`platformId`) REFERENCES `Platform`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Screenshot` ADD CONSTRAINT `Screenshot_reportedItemId_fkey` FOREIGN KEY (`reportedItemId`) REFERENCES `ReportedItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
