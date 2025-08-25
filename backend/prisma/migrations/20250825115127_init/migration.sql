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

    CONSTRAINT "Device_pkey" PRIMARY KEY ("deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_mac_key" ON "public"."Device"("mac");
