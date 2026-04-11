-- CreateTable
CREATE TABLE "SystemText" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "semesterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SystemText_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SystemText_semesterId_idx" ON "SystemText"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemText_semesterId_type_key" ON "SystemText"("semesterId", "type");
