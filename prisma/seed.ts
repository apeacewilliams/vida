import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import sampleData from "../data/sample-data.json";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

type SampleEmployee = {
  id: string;
  name: string;
  department: string;
  riskLevel: string;
};

type SampleSuggestion = {
  id: string;
  employeeId: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  source: string;
  createdBy?: string;
  dateCreated: string;
  dateUpdated: string;
  dateCompleted?: string;
  notes?: string;
};

async function main() {
  await prisma.suggestion.deleteMany();
  await prisma.employee.deleteMany();

  const employees = sampleData.employees as SampleEmployee[];
  const suggestions = sampleData.suggestions as SampleSuggestion[];

  await prisma.employee.createMany({ data: employees });

  await prisma.suggestion.createMany({
    data: suggestions.map((suggestion) => ({
      ...suggestion,
      dateCreated: new Date(suggestion.dateCreated),
      dateUpdated: new Date(suggestion.dateUpdated),
      dateCompleted: suggestion.dateCompleted
        ? new Date(suggestion.dateCompleted)
        : null,
      notes: suggestion.notes ?? "",
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
