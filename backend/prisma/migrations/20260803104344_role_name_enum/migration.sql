/*
  Warnings:

  - You are about to alter the column `name` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Role` MODIFY `name` ENUM('SUPER_ADMIN', 'ADMIN', 'TECHNICIAN', 'ORGANIZATION_USER') NOT NULL;
