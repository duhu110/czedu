-- Add required property type with a default for existing application records.
ALTER TABLE "Application" ADD COLUMN "propertyType" TEXT NOT NULL DEFAULT 'PURCHASE';
