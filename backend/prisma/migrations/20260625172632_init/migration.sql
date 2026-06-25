-- CreateTable
CREATE TABLE `Therapist` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `professionalId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Therapist_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Patient` (
    `id` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `guardian` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `mainCondition` TEXT NULL,
    `initialComplaint` TEXT NULL,
    `clinicalHistory` TEXT NULL,
    `generalNotes` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Patient_therapistId_status_idx`(`therapistId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicalRecord` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `initialAssessment` TEXT NULL,
    `therapeuticGoals` TEXT NULL,
    `therapeuticPlan` TEXT NULL,
    `suggestedFrequency` VARCHAR(191) NULL,
    `clinicalNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MedicalRecord_patientId_key`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionEvolution` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `sessionDate` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `careType` ENUM('CLINICAL', 'HOME', 'SCHOOL', 'ONLINE') NOT NULL,
    `sessionGoal` TEXT NOT NULL,
    `activitiesPerformed` TEXT NOT NULL,
    `patientPerformance` TEXT NOT NULL,
    `observedDifficulties` TEXT NULL,
    `perceivedProgress` TEXT NULL,
    `nextSteps` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SessionEvolution_therapistId_sessionDate_idx`(`therapistId`, `sessionDate`),
    INDEX `SessionEvolution_patientId_sessionDate_idx`(`patientId`, `sessionDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `careType` ENUM('CLINICAL', 'HOME', 'SCHOOL', 'ONLINE') NOT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Appointment_therapistId_date_idx`(`therapistId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientDocument` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PatientDocument_patientId_idx`(`patientId`),
    INDEX `PatientDocument_therapistId_idx`(`therapistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `Therapist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionEvolution` ADD CONSTRAINT `SessionEvolution_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionEvolution` ADD CONSTRAINT `SessionEvolution_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `Therapist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `Therapist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientDocument` ADD CONSTRAINT `PatientDocument_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientDocument` ADD CONSTRAINT `PatientDocument_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `Therapist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
