/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `permission_resources` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `permission_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `permission_resources_name_key` ON `permission_resources`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `permission_types_name_key` ON `permission_types`(`name`);
