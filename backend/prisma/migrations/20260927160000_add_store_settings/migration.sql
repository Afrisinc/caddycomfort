-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'CaddyComfort',
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "openingHours" TEXT NOT NULL,
    "standardShippingFee" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "codDepositPercent" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- Seed
INSERT INTO "StoreSettings" ("id", "storeName", "description", "email", "phone", "address", "openingHours", "updatedAt")
VALUES ('default', 'CaddyComfort', 'Premium fashion and lifestyle products', 'caddyumutoniwase@gmail.com', '+250 786 763 654', 'KN 4 Ave, Kigali, Rwanda', 'Mon–Sat: 9AM–8PM', CURRENT_TIMESTAMP);
