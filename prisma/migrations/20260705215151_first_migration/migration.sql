-- CreateTable
CREATE TABLE "ImpressionLog" (
    "id" TEXT NOT NULL,
    "billboardId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpressionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaystackTransaction" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "BillingCurrency" NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "authorizationUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaystackTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpressionLog_billboardId_date_idx" ON "ImpressionLog"("billboardId", "date");

-- CreateIndex
CREATE INDEX "ImpressionLog_date_idx" ON "ImpressionLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PaystackTransaction_bookingId_key" ON "PaystackTransaction"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "PaystackTransaction_reference_key" ON "PaystackTransaction"("reference");

-- CreateIndex
CREATE INDEX "PaystackTransaction_reference_idx" ON "PaystackTransaction"("reference");
