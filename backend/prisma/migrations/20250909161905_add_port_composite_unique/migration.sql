/*
  Warnings:

  - A unique constraint covering the columns `[deviceId,portNumber]` on the table `Port` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Port_deviceId_portNumber_key" ON "public"."Port"("deviceId", "portNumber");
