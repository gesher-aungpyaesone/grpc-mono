/*
  Warnings:

  - You are about to drop the column `target_id` on the `contents` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `contents` DROP FOREIGN KEY `contents_target_id_fkey`;

-- AlterTable
ALTER TABLE `contents` DROP COLUMN `target_id`;

-- CreateTable
CREATE TABLE `staff_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content_id` INTEGER NOT NULL,
    `target_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staff_groups` ADD CONSTRAINT `staff_groups_content_id_fkey` FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_groups` ADD CONSTRAINT `staff_groups_target_id_fkey` FOREIGN KEY (`target_id`) REFERENCES `targets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
