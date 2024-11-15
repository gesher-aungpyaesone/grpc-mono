/*
  Warnings:

  - The values [Customer,Staff] on the enum `users_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `type` ENUM('CUSTOMER', 'STAFF') NOT NULL;
