import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    suggestion: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { prisma } from "@/lib/prisma";
import { PATCH } from "./route";

const mockFindUnique = vi.mocked(prisma.suggestion.findUnique);
const mockUpdate = vi.mocked(prisma.suggestion.update);

function makeRequest(body: object) {
  return new Request("http://localhost/api/suggestions/s1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: "s1" });

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdate.mockResolvedValue({ id: "s1", employeeId: "emp-1" } as never);
});

describe("PATCH /api/suggestions/[id]", () => {
  it("returns 400 when body has no valid status", async () => {
    const res = await PATCH(makeRequest({ notes: "hello" }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the suggestion does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ status: "pending" }), { params });
    expect(res.status).toBe(404);
  });

  describe("dateCompleted handling", () => {
    it("sets dateCompleted to now on first transition to completed", async () => {
      mockFindUnique.mockResolvedValue({
        status: "pending",
        dateCompleted: null,
      } as never);
      await PATCH(makeRequest({ status: "completed" }), { params });
      expect(mockUpdate.mock.calls[0][0].data.dateCompleted).toBeInstanceOf(
        Date,
      );
    });

    it("preserves existing dateCompleted when already completed", async () => {
      const original = new Date("2024-01-01T10:00:00Z");
      mockFindUnique.mockResolvedValue({
        status: "completed",
        dateCompleted: original,
      } as never);
      await PATCH(makeRequest({ status: "completed" }), { params });
      expect(mockUpdate.mock.calls[0][0].data.dateCompleted).toBe(original);
    });

    it("clears dateCompleted when transitioning away from completed", async () => {
      mockFindUnique.mockResolvedValue({
        status: "completed",
        dateCompleted: new Date(),
      } as never);
      await PATCH(makeRequest({ status: "in_progress" }), { params });
      expect(mockUpdate.mock.calls[0][0].data.dateCompleted).toBeNull();
    });
  });

  describe("notes handling", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue({
        status: "pending",
        dateCompleted: null,
      } as never);
    });

    it("includes notes in the update when provided", async () => {
      await PATCH(makeRequest({ status: "pending", notes: "reviewed" }), {
        params,
      });
      expect(mockUpdate.mock.calls[0][0].data.notes).toBe("reviewed");
    });

    it("omits notes from the update when absent", async () => {
      await PATCH(makeRequest({ status: "pending" }), { params });
      expect(mockUpdate.mock.calls[0][0].data).not.toHaveProperty("notes");
    });
  });
});
