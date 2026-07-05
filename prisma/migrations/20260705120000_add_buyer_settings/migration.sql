CREATE TYPE "BillingCurrency" AS ENUM ('USD', 'GHS', 'NGN', 'KES', 'ZAR');
CREATE TYPE "ApprovalWorkflow" AS ENUM ('DIRECT', 'MANAGER');
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'PAID', 'OVERDUE', 'VOID');
CREATE TYPE "CreativeStatus" AS ENUM ('UPLOADED', 'APPROVED', 'REJECTED');

ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "BuyerSetting" (
  "userId" TEXT NOT NULL,
  "billingCurrency" "BillingCurrency" NOT NULL DEFAULT 'USD',
  "defaultFlightDays" INTEGER NOT NULL DEFAULT 14,
  "budgetCapMinor" BIGINT,
  "approvalWorkflow" "ApprovalWorkflow" NOT NULL DEFAULT 'DIRECT',
  "bookingStatusAlerts" BOOLEAN NOT NULL DEFAULT true,
  "availabilityAlerts" BOOLEAN NOT NULL DEFAULT true,
  "invoiceAlerts" BOOLEAN NOT NULL DEFAULT true,
  "sessionAlerts" BOOLEAN NOT NULL DEFAULT true,
  "creativeReviewRequired" BOOLEAN NOT NULL DEFAULT false,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BuyerSetting_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "BuyerSetting"
  ADD CONSTRAINT "BuyerSetting_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TYPE "BookingStatus" ADD VALUE 'AwaitingCreative' BEFORE 'PendingApproved';
ALTER TYPE "BookingStatus" ADD VALUE 'AwaitingManager' BEFORE 'PendingApproved';
ALTER TYPE "BookingStatus" ADD VALUE 'Rejected' AFTER 'Completed';

ALTER TABLE "Booking"
  ADD COLUMN "buyerId" TEXT,
  ADD COLUMN "billingCurrency" "BillingCurrency" NOT NULL DEFAULT 'USD',
  ADD COLUMN "displayTotalMinor" BIGINT,
  ADD COLUMN "invoiceCode" TEXT;

CREATE UNIQUE INDEX "Booking_invoiceCode_key" ON "Booking"("invoiceCode");
CREATE INDEX "Booking_buyerId_createdAt_idx" ON "Booking"("buyerId", "createdAt");

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_buyerId_fkey"
  FOREIGN KEY ("buyerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MfaFactor" (
  "userId" TEXT NOT NULL,
  "encryptedSecret" TEXT NOT NULL,
  "confirmedAt" TIMESTAMP(3),
  "lastUsedTimeStep" BIGINT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MfaFactor_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "MfaRecoveryCode" (
  "id" TEXT NOT NULL,
  "factorId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MfaRecoveryCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceHash" TEXT NOT NULL,
  "ipPrefix" TEXT NOT NULL,
  "userAgent" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthSession_userId_deviceHash_key" ON "AuthSession"("userId", "deviceHash");
CREATE INDEX "AuthSession_userId_lastSeenAt_idx" ON "AuthSession"("userId", "lastSeenAt");
CREATE INDEX "MfaRecoveryCode_factorId_usedAt_idx" ON "MfaRecoveryCode"("factorId", "usedAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

ALTER TABLE "MfaFactor" ADD CONSTRAINT "MfaFactor_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MfaRecoveryCode" ADD CONSTRAINT "MfaRecoveryCode_factorId_fkey"
  FOREIGN KEY ("factorId") REFERENCES "MfaFactor"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "currency" "BillingCurrency" NOT NULL,
  "totalMinor" BIGINT NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AvailabilityWatch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "billboardId" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilityWatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_bookingId_key" ON "Invoice"("bookingId");
CREATE UNIQUE INDEX "Invoice_code_key" ON "Invoice"("code");
CREATE UNIQUE INDEX "AvailabilityWatch_userId_billboardId_key" ON "AvailabilityWatch"("userId", "billboardId");
CREATE INDEX "AvailabilityWatch_billboardId_active_idx" ON "AvailabilityWatch"("billboardId", "active");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AvailabilityWatch" ADD CONSTRAINT "AvailabilityWatch_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AvailabilityWatch" ADD CONSTRAINT "AvailabilityWatch_billboardId_fkey"
  FOREIGN KEY ("billboardId") REFERENCES "Billboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CreativeAsset" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storageUrl" TEXT NOT NULL,
  "status" "CreativeStatus" NOT NULL DEFAULT 'UPLOADED',
  "reviewNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CreativeAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreativeAsset_bookingId_createdAt_idx" ON "CreativeAsset"("bookingId", "createdAt");
CREATE INDEX "CreativeAsset_buyerId_status_idx" ON "CreativeAsset"("buyerId", "status");
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreativeAsset" ADD CONSTRAINT "CreativeAsset_buyerId_fkey"
  FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
