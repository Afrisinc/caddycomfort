-- CreateTable
CREATE TABLE "HeroBanner" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaLink" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroBanner_isActive_sortOrder_idx" ON "HeroBanner"("isActive", "sortOrder");

-- Seed
INSERT INTO "HeroBanner" ("id", "eyebrow", "title", "ctaText", "ctaLink", "image", "imageAlt", "sortOrder", "isActive", "updatedAt") VALUES
('hero_seed_1', 'Move in comfort', 'Gym wear that moves with your body, not against it', 'Shop gym wear', '/shop', '/new-images/hero-1.jpg', 'Featured pieces from the CaddyComfort collection', 0, true, CURRENT_TIMESTAMP),
('hero_seed_2', 'Train, travel, live', 'From your workout to the rest of your day', 'Shop the collection', '/shop', '/new-images/hero-4.jpg', 'Pieces from the CaddyComfort collection', 1, true, CURRENT_TIMESTAMP),
('hero_seed_3', 'More coverage, your way', 'Options for every body and every reason', 'Find your fit', '/shop', '/new-images/hero-3.jpg', 'Pieces on display at CaddyComfort', 2, true, CURRENT_TIMESTAMP);
