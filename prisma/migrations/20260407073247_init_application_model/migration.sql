-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "semesterId" TEXT NOT NULL,
    "residencyType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardian1Name" TEXT NOT NULL,
    "guardian1Phone" TEXT NOT NULL,
    "guardian2Name" TEXT,
    "guardian2Phone" TEXT,
    "currentSchool" TEXT NOT NULL,
    "currentGrade" TEXT NOT NULL,
    "targetGrade" TEXT NOT NULL,
    "hukouAddress" TEXT NOT NULL,
    "livingAddress" TEXT NOT NULL,
    "fileHukou" TEXT NOT NULL DEFAULT '[]',
    "fileProperty" TEXT NOT NULL DEFAULT '[]',
    "fileStudentCard" TEXT NOT NULL DEFAULT '[]',
    "fileResidencePermit" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminRemark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Application_semesterId_idx" ON "Application"("semesterId");

-- CreateIndex
CREATE INDEX "Application_idCard_idx" ON "Application"("idCard");

-- CreateIndex
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");
