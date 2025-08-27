-- AlterTable
ALTER TABLE "public"."Device" ALTER COLUMN "ip" SET NOT NULL,
ALTER COLUMN "ip" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."DevicePorts" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "DevicePorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Port" (
    "portId" SERIAL NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("portId")
);

-- AddForeignKey
ALTER TABLE "public"."DevicePorts" ADD CONSTRAINT "DevicePorts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
