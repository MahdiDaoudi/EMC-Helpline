-- Backfill the missing required fields on existing rows before enforcing NOT NULL.
ALTER TABLE `PlatformReport`
  ADD COLUMN `emailTo` VARCHAR(150) NULL,
  ADD COLUMN `selectedScreenshotUrls` TEXT NULL;

UPDATE `PlatformReport` pr
LEFT JOIN `Platform` p ON p.id = pr.platformId
SET pr.emailTo = COALESCE(p.email, 'support@emc-helpline.org')
WHERE pr.emailTo IS NULL;

ALTER TABLE `PlatformReport`
  MODIFY `emailTo` VARCHAR(150) NOT NULL;

-- Safe default for existing Signalement rows: current behavior treats the signalement as concerning the victim unless it is explicitly marked as another person.
ALTER TABLE `Signalement`
  ADD COLUMN `titulaire` ENUM('MOI_MEME', 'AUTRE_PERSONNE') NOT NULL DEFAULT 'MOI_MEME';

-- CreateTable
CREATE TABLE `SignalementAccompaniment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('SUP', 'PSY', 'JUR') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `signalementId` INTEGER NOT NULL,

    INDEX `SignalementAccompaniment_signalementId_idx`(`signalementId`),
    UNIQUE INDEX `SignalementAccompaniment_signalementId_type_key`(`signalementId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SignalementAccompaniment` ADD CONSTRAINT `SignalementAccompaniment_signalementId_fkey` FOREIGN KEY (`signalementId`) REFERENCES `Signalement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
