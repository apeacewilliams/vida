import type { RiskLevel } from "@/lib/types";

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };

export function compareByRisk(
  a: { riskLevel: string },
  b: { riskLevel: string },
): number {
  return (
    (RISK_ORDER[a.riskLevel as RiskLevel] ?? 3) -
    (RISK_ORDER[b.riskLevel as RiskLevel] ?? 3)
  );
}
