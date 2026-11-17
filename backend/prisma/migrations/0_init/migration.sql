-- SANAD Platform Initial Migration
-- Baseline Tables: users, ai_interactions

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('USER', 'COUNSELOR', 'ADMIN') NOT NULL DEFAULT 'USER',
    `preferredLanguage` VARCHAR(191) NOT NULL DEFAULT 'ar',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_interactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'gemini',
    `model` VARCHAR(191) NOT NULL,
    `prompt` TEXT NOT NULL,
    `response` TEXT NULL,
    `status` ENUM('SUCCESS', 'ERROR', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `errorMessage` TEXT NULL,
    `tokensUsed` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_interactions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_interactions` ADD CONSTRAINT `ai_interactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
