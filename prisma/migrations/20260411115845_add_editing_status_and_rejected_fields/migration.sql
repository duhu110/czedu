-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "semesterId" TEXT NOT NULL,
    "residencyType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "ethnicity" TEXT NOT NULL DEFAULT '汉族',
    "idCard" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardian1Name" TEXT NOT NULL,
    "guardian1Relation" TEXT NOT NULL,
    "guardian1Phone" TEXT NOT NULL,
    "guardian2Name" TEXT,
    "guardian2Relation" TEXT,
    "guardian2Phone" TEXT,
    "currentSchool" TEXT NOT NULL,
    "currentGrade" TEXT NOT NULL,
    "targetGrade" TEXT NOT NULL,
    "targetSchool" TEXT,
    "hukouAddress" TEXT NOT NULL,
    "livingAddress" TEXT NOT NULL,
    "fileHukou" TEXT NOT NULL DEFAULT '[]',
    "fileProperty" TEXT NOT NULL DEFAULT '[]',
    "fileStudentCard" TEXT DEFAULT '[]',
    "fileResidencePermit" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminRemark" TEXT,
    "rejectedFields" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("adminRemark", "createdAt", "currentGrade", "currentSchool", "ethnicity", "fileHukou", "fileProperty", "fileResidencePermit", "fileStudentCard", "gender", "guardian1Name", "guardian1Phone", "guardian1Relation", "guardian2Name", "guardian2Phone", "guardian2Relation", "hukouAddress", "id", "idCard", "livingAddress", "name", "residencyType", "semesterId", "status", "studentId", "targetGrade", "targetSchool", "updatedAt") SELECT "adminRemark", "createdAt", "currentGrade", "currentSchool", "ethnicity", "fileHukou", "fileProperty", "fileResidencePermit", "fileStudentCard", "gender", "guardian1Name", "guardian1Phone", "guardian1Relation", "guardian2Name", "guardian2Phone", "guardian2Relation", "hukouAddress", "id", "idCard", "livingAddress", "name", "residencyType", "semesterId", "status", "studentId", "targetGrade", "targetSchool", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE INDEX "Application_semesterId_idx" ON "Application"("semesterId");
CREATE INDEX "Application_idCard_idx" ON "Application"("idCard");
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
