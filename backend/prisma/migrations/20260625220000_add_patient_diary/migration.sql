-- CreateTable
CREATE TABLE `PatientDiaryEntry` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `mood` ENUM('HAPPY', 'NEUTRAL', 'SAD', 'ANXIOUS', 'TIRED') NOT NULL,
    `emotionalScale` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `activities` TEXT NULL,
    `therapistNotes` TEXT NULL,
    `tags` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PatientDiaryEntry_patientId_createdAt_idx`(`patientId`, `createdAt`),
    INDEX `PatientDiaryEntry_therapistId_createdAt_idx`(`therapistId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PatientDiaryEntry` ADD CONSTRAINT `PatientDiaryEntry_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientDiaryEntry` ADD CONSTRAINT `PatientDiaryEntry_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `Therapist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
