-- AlterTable
ALTER TABLE `group_permissions` ADD COLUMN `allow_ids` JSON NULL,
    ADD COLUMN `is_allowed_all` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `staff_permissions` ADD COLUMN `allow_ids` JSON NULL,
    ADD COLUMN `is_allowed_all` BOOLEAN NOT NULL DEFAULT true;
