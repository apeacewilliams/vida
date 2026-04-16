-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdBy" TEXT,
    "dateCreated" DATETIME NOT NULL,
    "dateUpdated" DATETIME NOT NULL,
    "dateCompleted" DATETIME,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Suggestion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
