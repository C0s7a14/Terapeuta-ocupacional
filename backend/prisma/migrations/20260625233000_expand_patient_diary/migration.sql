-- Add new weekly monitoring fields without invalidating existing diary records.
ALTER TABLE `PatientDiaryEntry`
    ADD COLUMN `stressLevel` INTEGER NULL,
    ADD COLUMN `sleepQuality` INTEGER NULL,
    ADD COLUMN `patientOrCaregiverNotes` TEXT NULL;

UPDATE `PatientDiaryEntry`
SET `stressLevel` = 5
WHERE `stressLevel` IS NULL;

ALTER TABLE `PatientDiaryEntry`
    MODIFY `stressLevel` INTEGER NOT NULL;
