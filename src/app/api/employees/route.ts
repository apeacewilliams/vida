import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareByRisk } from "@/lib/risk";

export async function GET() {
  const employees = await prisma.employee.findMany();
  employees.sort(compareByRisk);
  return NextResponse.json(employees);
}
