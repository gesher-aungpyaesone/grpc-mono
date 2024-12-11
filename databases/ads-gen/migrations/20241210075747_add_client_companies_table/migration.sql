-- CreateTable
CREATE TABLE `client_companies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `website_url` VARCHAR(255) NULL,
    `strength` VARCHAR(255) NULL,
    `others` TEXT NULL,
    `industry_id` INTEGER NOT NULL,
    `type_id` INTEGER NOT NULL,
    `size_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by_id` INTEGER NOT NULL,
    `updated_by_id` INTEGER NOT NULL,
    `deleted_by_id` INTEGER NULL,

    UNIQUE INDEX `client_companies_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `client_companies` ADD CONSTRAINT `client_companies_industry_id_fkey` FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client_companies` ADD CONSTRAINT `client_companies_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `company_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `client_companies` ADD CONSTRAINT `client_companies_size_id_fkey` FOREIGN KEY (`size_id`) REFERENCES `company_sizes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
