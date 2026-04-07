PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Application" (
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
    "targetSchool" TEXT,
    "hukouAddress" TEXT NOT NULL,
    "livingAddress" TEXT NOT NULL,
    "fileHukou" TEXT NOT NULL DEFAULT '[]',
    "fileProperty" TEXT NOT NULL DEFAULT '[]',
    "fileStudentCard" TEXT DEFAULT '[]',
    "fileResidencePermit" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminRemark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Application" (
    "id",
    "semesterId",
    "residencyType",
    "name",
    "gender",
    "idCard",
    "studentId",
    "guardian1Name",
    "guardian1Phone",
    "guardian2Name",
    "guardian2Phone",
    "currentSchool",
    "currentGrade",
    "targetGrade",
    "targetSchool",
    "hukouAddress",
    "livingAddress",
    "fileHukou",
    "fileProperty",
    "fileStudentCard",
    "fileResidencePermit",
    "status",
    "adminRemark",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "semesterId",
    "residencyType",
    "name",
    "gender",
    "idCard",
    "studentId",
    "guardian1Name",
    "guardian1Phone",
    "guardian2Name",
    "guardian2Phone",
    "currentSchool",
    "currentGrade",
    "targetGrade",
    "targetSchool",
    "hukouAddress",
    "livingAddress",
    "fileHukou",
    "fileProperty",
    "fileStudentCard",
    "fileResidencePermit",
    "status",
    "adminRemark",
    "createdAt",
    "updatedAt"
FROM "Application";

DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";

CREATE INDEX "Application_semesterId_idx" ON "Application"("semesterId");
CREATE INDEX "Application_idCard_idx" ON "Application"("idCard");
CREATE INDEX "Application_studentId_idx" ON "Application"("studentId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
