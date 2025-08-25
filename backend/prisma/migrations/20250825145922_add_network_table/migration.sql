-- AlterTable
ALTER TABLE "public"."Device" ADD COLUMN     "networkNetworkId" TEXT;

-- CreateTable
CREATE TABLE "public"."Network" (
    "networkId" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("networkId")
);

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_networkNetworkId_fkey" FOREIGN KEY ("networkNetworkId") REFERENCES "public"."Network"("networkId") ON DELETE SET NULL ON UPDATE CASCADE;
