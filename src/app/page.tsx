import { EmployeeCard } from "@/components/EmployeeCard";
import { prisma } from "@/lib/prisma";
import { compareByRisk } from "@/lib/risk";
import { narrowRiskLevel } from "@/lib/types";

export default async function Home() {
  const employees = await prisma.employee.findMany({
    include: { suggestions: { select: { status: true } } },
  });
  employees.sort(compareByRisk);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Suggestions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {employees.length} employee{employees.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={{
              id: emp.id,
              name: emp.name,
              department: emp.department,
              riskLevel: narrowRiskLevel(emp.riskLevel),
            }}
            suggestions={emp.suggestions}
          />
        ))}
      </div>
    </div>
  );
}
