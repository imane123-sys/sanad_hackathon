-- AlterTable
ALTER TABLE `users` ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `passwordHash` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE',
    MODIFY `role` ENUM('USER', 'COUNSELOR', 'LAWYER', 'PSYCHOLOGIST', 'ASSOCIATION_REP', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `preferredLanguage` VARCHAR(191) NOT NULL DEFAULT 'ar',
    `preferences` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `deviceInfo` TEXT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_sessions_userId_idx`(`userId`),
    INDEX `user_sessions_tokenHash_idx`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence_folders` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `evidence_folders_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidences` (
    `id` VARCHAR(191) NOT NULL,
    `folderId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(512) NOT NULL,
    `mimeType` VARCHAR(128) NOT NULL,
    `size` BIGINT NOT NULL,
    `sha256` VARCHAR(64) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('STORED', 'ARCHIVED', 'DELETED') NOT NULL DEFAULT 'STORED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `evidences_userId_idx`(`userId`),
    INDEX `evidences_folderId_idx`(`folderId`),
    INDEX `evidences_sha256_idx`(`sha256`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence_access_logs` (
    `id` VARCHAR(191) NOT NULL,
    `evidenceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` ENUM('VIEW', 'DOWNLOAD', 'SHARE', 'DELETE', 'VERIFY_HASH') NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `result` ENUM('SUCCESS', 'DENIED', 'ERROR') NOT NULL DEFAULT 'SUCCESS',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `evidence_access_logs_evidenceId_idx`(`evidenceId`),
    INDEX `evidence_access_logs_userId_idx`(`userId`),
    INDEX `evidence_access_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence_share_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `evidenceId` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `permission` ENUM('READ_ONLY', 'DOWNLOAD') NOT NULL DEFAULT 'READ_ONLY',
    `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `validFrom` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validUntil` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `evidence_share_permissions_evidenceId_idx`(`evidenceId`),
    INDEX `evidence_share_permissions_recipientId_idx`(`recipientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assistance_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `professionalId` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NULL,
    `typeAssistance` ENUM('LEGAL', 'PSYCHOLOGICAL', 'SOCIAL', 'EMERGENCY', 'SHELTER', 'OTHER') NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('EN_ATTENTE', 'EN_COURS', 'ACCEPTEE', 'REFUSEE', 'TERMINEE', 'ANNULEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `assistance_requests_userId_idx`(`userId`),
    INDEX `assistance_requests_professionalId_idx`(`professionalId`),
    INDEX `assistance_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assistance_status_history` (
    `id` VARCHAR(191) NOT NULL,
    `assistanceRequestId` VARCHAR(191) NOT NULL,
    `oldStatus` ENUM('EN_ATTENTE', 'EN_COURS', 'ACCEPTEE', 'REFUSEE', 'TERMINEE', 'ANNULEE') NULL,
    `newStatus` ENUM('EN_ATTENTE', 'EN_COURS', 'ACCEPTEE', 'REFUSEE', 'TERMINEE', 'ANNULEE') NOT NULL,
    `changedById` VARCHAR(191) NOT NULL,
    `comment` TEXT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `assistance_status_history_assistanceRequestId_idx`(`assistanceRequestId`),
    INDEX `assistance_status_history_changedById_idx`(`changedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professionals` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `city` VARCHAR(191) NOT NULL,
    `professionalType` ENUM('LAWYER', 'PSYCHOLOGIST') NOT NULL,
    `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `isVolunteer` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `professionals_userId_key`(`userId`),
    INDEX `professionals_city_idx`(`city`),
    INDEX `professionals_specialty_idx`(`specialty`),
    INDEX `professionals_verificationStatus_idx`(`verificationStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professional_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `professionalId` VARCHAR(191) NOT NULL,
    `documentType` ENUM('BAR_CARD', 'DIPLOMA', 'PROFESSIONAL_LICENSE', 'NATIONAL_ID', 'OTHER') NOT NULL,
    `documentUrl` VARCHAR(512) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `verifiedById` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `professional_verifications_professionalId_idx`(`professionalId`),
    INDEX `professional_verifications_verifiedById_idx`(`verifiedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professional_services` (
    `id` VARCHAR(191) NOT NULL,
    `professionalId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `serviceType` ENUM('CONSULTATION', 'LEGAL_REPRESENTATION', 'PSYCHOLOGICAL_SUPPORT', 'EMERGENCY_SUPPORT', 'WORKSHOP') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'MAD',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `professional_services_professionalId_idx`(`professionalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `associations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(128) NULL,
    `services` JSON NULL,
    `isFree` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `associations_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `help_centers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `phone` VARCHAR(50) NOT NULL,
    `openingHours` VARCHAR(255) NULL,
    `services` JSON NULL,
    `isFree` BOOLEAN NOT NULL DEFAULT true,
    `receptionConditions` TEXT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `help_centers_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_resources` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `serviceType` ENUM('POLICE', 'GENDARMERIE', 'MEDICAL_SAMU', 'NATIONAL_HELPLINE', 'WOMEN_SHELTER', 'LEGAL_AID') NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `availability` VARCHAR(100) NOT NULL DEFAULT '24/7',
    `sourceVerification` VARCHAR(255) NOT NULL,
    `lastVerifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `emergency_resources_serviceType_idx`(`serviceType`),
    INDEX `emergency_resources_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `professionalId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `mode` ENUM('IN_PERSON', 'REMOTE') NOT NULL DEFAULT 'IN_PERSON',
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `appointments_userId_idx`(`userId`),
    INDEX `appointments_professionalId_idx`(`professionalId`),
    INDEX `appointments_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `language` VARCHAR(10) NOT NULL DEFAULT 'ar',
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `conversations_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `senderType` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL DEFAULT 'USER',
    `isDangerAlert` BOOLEAN NOT NULL DEFAULT false,
    `legalReferences` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `messages_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `legal_resources` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `legalReference` VARCHAR(255) NOT NULL,
    `officialSource` VARCHAR(255) NOT NULL,
    `category` ENUM('FAMILY_LAW', 'CRIMINAL_LAW_VIOLENCE', 'LABOR_DISCRIMINATION', 'HUMAN_RIGHTS', 'LEGAL_PROCEDURES', 'CIVIL_PROTECTION') NOT NULL,
    `language` VARCHAR(10) NOT NULL DEFAULT 'ar',
    `publishedAt` DATETIME(3) NULL,
    `lastVerifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `legal_resources_category_idx`(`category`),
    INDEX `legal_resources_language_idx`(`language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `consentType` ENUM('TERMS_OF_SERVICE', 'PRIVACY_POLICY_09_08', 'AI_SITUATION_ANALYSIS', 'AI_RESULT_STORAGE', 'EVIDENCE_VAULT_STORAGE', 'PROFESSIONAL_DATA_SHARING') NOT NULL,
    `isGranted` BOOLEAN NOT NULL DEFAULT true,
    `policyVersion` VARCHAR(20) NOT NULL DEFAULT 'v2.0',
    `ipAddress` VARCHAR(45) NULL,
    `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `consents_userId_idx`(`userId`),
    UNIQUE INDEX `consents_userId_consentType_key`(`userId`, `consentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consent_history` (
    `id` VARCHAR(191) NOT NULL,
    `consentId` VARCHAR(191) NOT NULL,
    `oldStatus` BOOLEAN NULL,
    `newStatus` BOOLEAN NOT NULL,
    `policyVersion` VARCHAR(20) NOT NULL,
    `reason` VARCHAR(255) NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `consent_history_consentId_idx`(`consentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SECURITY', 'SESSION', 'ASSISTANCE_REQUEST', 'APPOINTMENT', 'SYSTEM') NOT NULL,
    `neutralContent` TEXT NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS') NOT NULL DEFAULT 'IN_APP',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(100) NULL,
    `result` ENUM('SUCCESS', 'DENIED', 'ERROR') NOT NULL DEFAULT 'SUCCESS',
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_actorId_idx`(`actorId`),
    INDEX `audit_logs_entityType_idx`(`entityType`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `reportType` ENUM('VIOLENCE', 'HARASSMENT', 'DISCRIMINATION', 'FRAUD', 'TECHNICAL_ISSUE', 'OTHER') NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `reviewedById` VARCHAR(191) NULL,
    `adminNotes` TEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reports_userId_idx`(`userId`),
    INDEX `reports_status_idx`(`status`),
    INDEX `reports_reviewedById_idx`(`reviewedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analysis_results` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `consentId` VARCHAR(191) NOT NULL,
    `analysisContent` JSON NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `analysis_results_userId_idx`(`userId`),
    INDEX `analysis_results_consentId_idx`(`consentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence_folders` ADD CONSTRAINT `evidence_folders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidences` ADD CONSTRAINT `evidences_folderId_fkey` FOREIGN KEY (`folderId`) REFERENCES `evidence_folders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidences` ADD CONSTRAINT `evidences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence_access_logs` ADD CONSTRAINT `evidence_access_logs_evidenceId_fkey` FOREIGN KEY (`evidenceId`) REFERENCES `evidences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence_access_logs` ADD CONSTRAINT `evidence_access_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence_share_permissions` ADD CONSTRAINT `evidence_share_permissions_evidenceId_fkey` FOREIGN KEY (`evidenceId`) REFERENCES `evidences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence_share_permissions` ADD CONSTRAINT `evidence_share_permissions_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assistance_requests` ADD CONSTRAINT `assistance_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assistance_requests` ADD CONSTRAINT `assistance_requests_professionalId_fkey` FOREIGN KEY (`professionalId`) REFERENCES `professionals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assistance_status_history` ADD CONSTRAINT `assistance_status_history_assistanceRequestId_fkey` FOREIGN KEY (`assistanceRequestId`) REFERENCES `assistance_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assistance_status_history` ADD CONSTRAINT `assistance_status_history_changedById_fkey` FOREIGN KEY (`changedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professionals` ADD CONSTRAINT `professionals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professional_verifications` ADD CONSTRAINT `professional_verifications_professionalId_fkey` FOREIGN KEY (`professionalId`) REFERENCES `professionals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professional_verifications` ADD CONSTRAINT `professional_verifications_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `professional_services` ADD CONSTRAINT `professional_services_professionalId_fkey` FOREIGN KEY (`professionalId`) REFERENCES `professionals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_professionalId_fkey` FOREIGN KEY (`professionalId`) REFERENCES `professionals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consents` ADD CONSTRAINT `consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consent_history` ADD CONSTRAINT `consent_history_consentId_fkey` FOREIGN KEY (`consentId`) REFERENCES `consents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_consentId_fkey` FOREIGN KEY (`consentId`) REFERENCES `consents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
