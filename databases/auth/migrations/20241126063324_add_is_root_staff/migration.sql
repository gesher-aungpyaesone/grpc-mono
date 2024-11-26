/*
  Warnings:

  - You are about to drop the column `is_root` on the `staff_positions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `staff_positions` DROP COLUMN `is_root`;

-- AlterTable
ALTER TABLE `staffs` ADD COLUMN `is_root` BOOLEAN NOT NULL DEFAULT false;
