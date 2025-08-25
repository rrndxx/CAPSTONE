-- CreateEnum
CREATE TYPE "public"."DeviceListType" AS ENUM ('WHITELIST', 'BLACKLIST');

-- CreateTable
CREATE TABLE "public"."Network" (
    "networkId" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("networkId")
);

-- CreateTable
CREATE TABLE "public"."Device" (
    "deviceId" SERIAL NOT NULL,
    "mac" TEXT NOT NULL,
    "ip" TEXT[],
    "state" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "make" TEXT,
    "model" TEXT,
    "first_seen" TEXT NOT NULL,
    "last_seen" TEXT,
    "networkId" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "public"."DeviceList" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "type" "public"."DeviceListType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_mac_key" ON "public"."Device"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceList_deviceId_type_key" ON "public"."DeviceList"("deviceId", "type");

-- AddForeignKey
ALTER TABLE "public"."Device" ADD CONSTRAINT "Device_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "public"."Network"("networkId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeviceList" ADD CONSTRAINT "DeviceList_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
