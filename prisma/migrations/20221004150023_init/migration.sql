/*
  Warnings:

  - Added the required column `recievedAt` to the `Emails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Emails" ADD COLUMN     "recievedAt" TIMESTAMP(3) NOT NULL;
