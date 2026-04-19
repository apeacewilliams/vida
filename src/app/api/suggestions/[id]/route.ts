import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SuggestionStatus, UpdateSuggestionBody } from "@/lib/types";
import { SUGGESTION_STATUSES } from "@/lib/types";

const validStatuses = new Set<SuggestionStatus>(SUGGESTION_STATUSES);

function isValidBody(body: unknown): body is UpdateSuggestionBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  if (!validStatuses.has(candidate.status as SuggestionStatus)) {
    return false;
  }

  if (candidate.notes !== undefined && typeof candidate.notes !== "string") {
    return false;
  }

  return true;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const existing = await prisma.suggestion.findUnique({
    where: { id },
    select: { status: true, dateCompleted: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Suggestion not found" },
      { status: 404 },
    );
  }

  const now = new Date();
  const isCompleted = body.status === "completed";
  const dateCompleted = isCompleted ? (existing.dateCompleted ?? now) : null;

  const updatedSuggestion = await prisma.suggestion.update({
    where: { id },
    data: {
      status: body.status,
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      dateUpdated: now,
      dateCompleted,
    },
    include: { employee: true },
  });

  revalidatePath("/");
  revalidatePath(`/employee/${updatedSuggestion.employeeId}`);

  return NextResponse.json(updatedSuggestion);
}
