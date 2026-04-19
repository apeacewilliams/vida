import { describe, expect, it } from "vitest";
import { compareByRisk } from "./risk";

const e = (riskLevel: string) => ({ riskLevel });

describe("compareByRisk", () => {
  it("sorts a mixed array into high → medium → low order", () => {
    const employees = [e("low"), e("high"), e("medium")];
    employees.sort(compareByRisk);
    expect(employees.map((e) => e.riskLevel)).toEqual([
      "high",
      "medium",
      "low",
    ]);
  });

  it("sorts an unknown risk level to the end", () => {
    const employees = [e("unknown"), e("high"), e("low")];
    employees.sort(compareByRisk);
    expect(employees.map((e) => e.riskLevel)).toEqual([
      "high",
      "low",
      "unknown",
    ]);
  });
});
