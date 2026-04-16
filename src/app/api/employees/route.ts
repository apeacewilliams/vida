import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RiskLevel } from "@/lib/types";

const riskOrder: Record<RiskLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function GET() {
  const employees = await prisma.employee.findMany();
  employees.sort((a, b) => riskOrder[a.riskLevel as RiskLevel] - riskOrder[b.riskLevel as RiskLevel]);

  return NextResponse.json(employees);
}
