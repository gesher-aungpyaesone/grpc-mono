/*
  Warnings:

  - Added the required column `resource_id` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `permissions` ADD COLUMN `resource_id` INTEGER NOT NULL,
    ADD COLUMN `type_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `permission_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `permission_resources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
