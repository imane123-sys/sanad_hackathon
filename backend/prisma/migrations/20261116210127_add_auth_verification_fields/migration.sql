-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailVerificationToken` VARCHAR(255) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `passwordResetExpires` DATETIME(3) NULL,
    ADD COLUMN `passwordResetToken` VARCHAR(255) NULL;
