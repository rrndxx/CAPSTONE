-- CreateEnum
CREATE TYPE "public"."DeviceStatus" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "public"."PortStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('LOGIN', 'CONNECTED_DEVICES_RELATED', 'ACTION', 'BANDWIDTH_RELATED');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."NetworkInterface" (
    "interfaceId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "ipv4" TEXT NOT NULL,
    "subnet" TEXT NOT NULL,
    "gateways" TEXT[],
    "routes" TEXT[],
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "NetworkInterface_pkey" PRIMARY KEY ("interfaceId")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "deviceId" SERIAL NOT NULL,
    "deviceIp" TEXT NOT NULL,
    "deviceMac" TEXT NOT NULL,
    "macInfo" TEXT,
    "deviceHostname" TEXT,
    "deviceOS" TEXT,
    "authorized" BOOLEAN DEFAULT false,
    "status" "public"."DeviceStatus" DEFAULT 'UP',
    "interfaceId" INTEGER NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "public"."BandwidthUsage" (
    "id" SERIAL NOT NULL,
    "upload" BIGINT NOT NULL,
    "download" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "BandwidthUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BandwidthHourly" (
    "id" SERIAL NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,
    "upload" BIGINT NOT NULL,
    "download" BIGINT NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "interfaceId" INTEGER NOT NULL,

    CONSTRAINT "BandwidthHourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BandwidthDaily" (
    "id" SERIAL NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "upload" BIGINT NOT NULL,
    "download" BIGINT NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "interfaceId" INTEGER NOT NULL,

    CONSTRAINT "BandwidthDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Port" (
    "portId" SERIAL NOT NULL,
    "portNumber" INTEGER NOT NULL,
    "protocol" TEXT,
    "status" "public"."PortStatus" NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("portId")
);

-- CreateTable
CREATE TABLE "public"."VisitedSite" (
    "siteId" SERIAL NOT NULL,
    "siteIp" TEXT NOT NULL,
    "siteDomain" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "VisitedSite_pkey" PRIMARY KEY ("siteId")
);

-- CreateTable
CREATE TABLE "public"."BlockedSite" (
    "blockedSiteId" SERIAL NOT NULL,
    "siteIp" TEXT NOT NULL,
    "siteDomain" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedSite_pkey" PRIMARY KEY ("blockedSiteId")
);

-- CreateTable
CREATE TABLE "public"."WhitelistedDevice" (
    "whitelistedDeviceId" SERIAL NOT NULL,
    "whitelistedDeviceMac" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interfaceId" INTEGER NOT NULL,

    CONSTRAINT "WhitelistedDevice_pkey" PRIMARY KEY ("whitelistedDeviceId")
);

-- CreateTable
CREATE TABLE "public"."BlacklistedDevice" (
    "blacklistedDeviceId" SERIAL NOT NULL,
    "blacklistedDeviceMac" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interfaceId" INTEGER NOT NULL,

    CONSTRAINT "BlacklistedDevice_pkey" PRIMARY KEY ("blacklistedDeviceId")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "alertId" SERIAL NOT NULL,
    "alertType" "public"."AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interfaceId" INTEGER NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("alertId")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetworkInterface_identifier_key" ON "public"."NetworkInterface"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceMac_interfaceId_key" ON "public"."Device"("deviceMac", "interfaceId");

-- CreateIndex
CREATE UNIQUE INDEX "BandwidthHourly_deviceId_hour_key" ON "public"."BandwidthHourly"("deviceId", "hour");

-- CreateIndex
CREATE UNIQUE INDEX "BandwidthDaily_deviceId_day_key" ON "public"."BandwidthDaily"("deviceId", "day");

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthUsage" ADD CONSTRAINT "BandwidthUsage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthHourly" ADD CONSTRAINT "BandwidthHourly_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthHourly" ADD CONSTRAINT "BandwidthHourly_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthDaily" ADD CONSTRAINT "BandwidthDaily_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthDaily" ADD CONSTRAINT "BandwidthDaily_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Port" ADD CONSTRAINT "Port_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitedSite" ADD CONSTRAINT "VisitedSite_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WhitelistedDevice" ADD CONSTRAINT "WhitelistedDevice_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlacklistedDevice" ADD CONSTRAINT "BlacklistedDevice_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "public"."NetworkInterface"("interfaceId") ON DELETE RESTRICT ON UPDATE CASCADE;
