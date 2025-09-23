-- DropForeignKey
ALTER TABLE "public"."Alert" DROP CONSTRAINT "Alert_interfaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BandwidthDaily" DROP CONSTRAINT "BandwidthDaily_interfaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BandwidthHourly" DROP CONSTRAINT "BandwidthHourly_interfaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BandwidthUsage" DROP CONSTRAINT "BandwidthUsage_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BlacklistedDevice" DROP CONSTRAINT "BlacklistedDevice_interfaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Device" DROP CONSTRAINT "Device_interfaceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Port" DROP CONSTRAINT "Port_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VisitedSite" DROP CONSTRAINT "VisitedSite_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WhitelistedDevice" DROP CONSTRAINT "WhitelistedDevice_interfaceId_fkey";

-- CreateTable
CREATE TABLE "public"."User" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."PushSubscription" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keysAuth" TEXT NOT NULL,
    "keysP256dh" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "public"."PushSubscription"("endpoint");

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthUsage" ADD CONSTRAINT "BandwidthUsage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthHourly" ADD CONSTRAINT "BandwidthHourly_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthDaily" ADD CONSTRAINT "BandwidthDaily_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Port" ADD CONSTRAINT "Port_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitedSite" ADD CONSTRAINT "VisitedSite_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhitelistedDevice" ADD CONSTRAINT "WhitelistedDevice_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlacklistedDevice" ADD CONSTRAINT "BlacklistedDevice_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
