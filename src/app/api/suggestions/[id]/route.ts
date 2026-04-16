import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SUGGESTION_STATUSES } from "@/lib/types";
import type { SuggestionStatus, UpdateSuggestionBody } from "@/lib/types";

const validStatuses = new Set<SuggestionStatus>(SUGGESTION_STATUSES);

function isValidBody(body: unknown): body is UpdateSuggestionBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  if (!validStatuses.has(candidate.status as SuggestionStatus)) {
    return false;
  }

  if (
    candidate.notes !== undefined &&
    candidate.notes !== null &&
    typeof candidate.notes !== "string"
  ) {
    return false;
  }

  return true;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const now = new Date();

  try {
    const updatedSuggestion = await prisma.suggestion.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        dateUpdated: now,
        dateCompleted: body.status === "completed" ? now : null,
      },
      include: { employee: true },
    });

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
    }

    throw error;
  }
}
