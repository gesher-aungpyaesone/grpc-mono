/*
  Warnings:

  - You are about to drop the column `department` on the `staffs` table. All the data in the column will be lost.
  - Added the required column `department_id` to the `staffs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staffs` DROP COLUMN `department`,
    ADD COLUMN `department_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `staff_departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by_id` INTEGER NOT NULL,
    `updated_by_id` INTEGER NOT NULL,
    `deleted_by_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staffs` ADD CONSTRAINT `staffs_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `staff_departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
