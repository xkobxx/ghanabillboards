-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('advertiser', 'vendor', 'admin', 'investor');

-- CreateEnum
CREATE TYPE "BillboardStatus" AS ENUM ('Available', 'FullyBooked', 'Maintenance');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PendingApproved', 'Live', 'Completed');

-- CreateEnum
CREATE TYPE "TrafficVolume" AS ENUM ('High', 'VeryHigh', 'Mega');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'DELETE');

-- CreateEnum
CREATE TYPE "ApiModule" AS ENUM ('Auth', 'Billboards', 'Bookings', 'Payments', 'Analytics');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "company" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "website" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billboard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "dailyRate" DOUBLE PRECISION NOT NULL,
    "format" TEXT NOT NULL,
    "dimensions" TEXT NOT NULL,
    "monthlyImpressions" TEXT NOT NULL,
    "trafficVolume" "TrafficVolume" NOT NULL,
    "status" "BillboardStatus" NOT NULL DEFAULT 'Available',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "billboardId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "campaignName" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PendingApproved',
    "slogan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GatewayLog" (
    "id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "module" "ApiModule" NOT NULL,
    "status" INTEGER NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GatewayLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Booking_billboardId_startAt_endAt_idx" ON "Booking"("billboardId", "startAt", "endAt");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_billboardId_fkey" FOREIGN KEY ("billboardId") REFERENCES "Billboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
