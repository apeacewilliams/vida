import { describe, expect, it } from "vitest";
import { compareByRisk } from "./risk";

const e = (riskLevel: string) => ({ riskLevel });

describe("compareByRisk", () => {
  it("sorts high before medium", () => {
    expect(compareByRisk(e("high"), e("medium"))).toBeLessThan(0);
  });

  it("sorts medium before low", () => {
    expect(compareByRisk(e("medium"), e("low"))).toBeLessThan(0);
  });

  it("sorts high before low", () => {
    expect(compareByRisk(e("high"), e("low"))).toBeLessThan(0);
  });

  it("treats an unknown risk level as lower than all known levels", () => {
    expect(compareByRisk(e("low"), e("unknown"))).toBeLessThan(0);
  });

  it("correctly sorts a mixed array", () => {
    const employees = [e("low"), e("high"), e("unknown"), e("medium")];
    employees.sort(compareByRisk);
    expect(employees.map((e) => e.riskLevel)).toEqual([
      "high",
      "medium",
      "low",
      "unknown",
    ]);
  });
});
