-- CreateTable
CREATE TABLE "public"."Network" (
    "networkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("networkId")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "mac" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "hostname" TEXT,
    "state" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "make" TEXT,
    "model" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "authorized" BOOLEAN NOT NULL DEFAULT false,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("mac")
);

-- CreateTable
CREATE TABLE "public"."OpenPort" (
    "id" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "deviceMac" TEXT NOT NULL,

    CONSTRAINT "OpenPort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VisitedSite" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceMac" TEXT NOT NULL,

    CONSTRAINT "VisitedSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlockedDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceMac" TEXT,

    CONSTRAINT "BlockedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BandwidthLog" (
    "id" TEXT NOT NULL,
    "deviceMac" TEXT,
    "networkId" TEXT NOT NULL,
    "uploadMB" DOUBLE PRECISION NOT NULL,
    "downloadMB" DOUBLE PRECISION NOT NULL,
    "totalMB" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BandwidthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ISPHealth" (
    "id" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "download" DOUBLE PRECISION,
    "upload" DOUBLE PRECISION,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ISPHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeviceLog" (
    "id" TEXT NOT NULL,
    "deviceMac" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT,

    CONSTRAINT "DeviceLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("networkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OpenPort" ADD CONSTRAINT "OpenPort_deviceMac_fkey" FOREIGN KEY ("deviceMac") REFERENCES "public"."Device"("mac") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VisitedSite" ADD CONSTRAINT "VisitedSite_deviceMac_fkey" FOREIGN KEY ("deviceMac") REFERENCES "public"."Device"("mac") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockedDomain" ADD CONSTRAINT "BlockedDomain_deviceMac_fkey" FOREIGN KEY ("deviceMac") REFERENCES "public"."Device"("mac") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthLog" ADD CONSTRAINT "BandwidthLog_deviceMac_fkey" FOREIGN KEY ("deviceMac") REFERENCES "public"."Device"("mac") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BandwidthLog" ADD CONSTRAINT "BandwidthLog_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("networkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ISPHealth" ADD CONSTRAINT "ISPHealth_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("networkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("networkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeviceLog" ADD CONSTRAINT "DeviceLog_deviceMac_fkey" FOREIGN KEY ("deviceMac") REFERENCES "public"."Device"("mac") ON DELETE RESTRICT ON UPDATE CASCADE;
