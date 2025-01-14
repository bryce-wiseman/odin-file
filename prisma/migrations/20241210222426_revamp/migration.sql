/*
  Warnings:

  - You are about to drop the column `filetype` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `uploaderId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folderId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `files` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `size` on the `files` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('FOLDER', 'IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_uploaderId_fkey";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "filetype",
DROP COLUMN "uploaderId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "fileType" "FileType" NOT NULL,
ADD COLUMN     "fileUrl" TEXT NOT NULL,
ADD COLUMN     "folderId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "folders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL DEFAULT 'FOLDER',
    "ownerId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
