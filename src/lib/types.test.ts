import { describe, expect, it } from "vitest";
import {
  narrowRiskLevel,
  narrowSuggestionPriority,
  narrowSuggestionStatus,
} from "./types";

describe("createNarrower", () => {
  it("returns the value unchanged when valid", () => {
    expect(narrowSuggestionStatus("pending")).toBe("pending");
    expect(narrowRiskLevel("high")).toBe("high");
  });

  it("throws with a descriptive message when invalid", () => {
    expect(() => narrowSuggestionStatus("unknown")).toThrow(
      'Invalid value: "unknown"',
    );
  });

  it("each narrower only accepts its own domain", () => {
    expect(() => narrowRiskLevel("critical")).toThrow();
    expect(() => narrowSuggestionPriority("urgent")).toThrow();
    expect(narrowSuggestionPriority("high")).toBe("high");
  });
});
