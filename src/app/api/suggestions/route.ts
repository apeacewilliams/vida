import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");

  const suggestions = await prisma.suggestion.findMany({
    where: employeeId ? { employeeId } : undefined,
    include: { employee: true },
    orderBy: { dateCreated: "desc" },
  });

  return NextResponse.json(suggestions);
}
