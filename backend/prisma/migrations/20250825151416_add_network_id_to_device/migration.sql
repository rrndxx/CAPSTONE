/*
  Warnings:

  - You are about to drop the column `networkNetworkId` on the `Device` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_networkNetworkId_fkey";

-- AlterTable
ALTER TABLE "public"."Device" DROP COLUMN "networkNetworkId",
ADD COLUMN     "networkId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("networkId") ON DELETE SET NULL ON UPDATE CASCADE;
