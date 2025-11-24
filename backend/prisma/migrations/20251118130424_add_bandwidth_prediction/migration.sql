-- AlterTable
ALTER TABLE "public"."Alert" ALTER COLUMN "interfaceId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."BandwidthPrediction" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "predicted" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BandwidthPrediction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BandwidthPrediction" ADD CONSTRAINT "BandwidthPrediction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
