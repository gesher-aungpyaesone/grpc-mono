/*
  Warnings:

  - You are about to drop the column `update_by_id` on the `staff_positions` table. All the data in the column will be lost.
  - You are about to drop the column `update_by_id` on the `staffs` table. All the data in the column will be lost.
  - Added the required column `updated_by_id` to the `staff_positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by_id` to the `staffs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `staff_positions` DROP COLUMN `update_by_id`,
    ADD COLUMN `updated_by_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `staffs` DROP COLUMN `update_by_id`,
    ADD COLUMN `updated_by_id` INTEGER NOT NULL;
