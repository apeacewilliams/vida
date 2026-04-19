export const SUGGESTION_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "overdue",
] as const;

export const SUGGESTION_TYPES = [
  "equipment",
  "exercise",
  "behavioural",
  "lifestyle",
] as const;

export const SUGGESTION_PRIORITIES = ["high", "medium", "low"] as const;
export const SUGGESTION_SOURCES = ["vida", "admin"] as const;
export const RISK_LEVELS = ["high", "medium", "low"] as const;

export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];
export type SuggestionType = (typeof SUGGESTION_TYPES)[number];
export type SuggestionPriority = (typeof SUGGESTION_PRIORITIES)[number];
export type SuggestionSource = (typeof SUGGESTION_SOURCES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];

export interface Employee {
  id: string;
  name: string;
  department: string;
  riskLevel: RiskLevel;
}

export interface Suggestion {
  id: string;
  employeeId: string;
  type: SuggestionType;
  description: string;
  status: SuggestionStatus;
  priority: SuggestionPriority;
  source: SuggestionSource;
  createdBy?: string;
  dateCreated: string;
  dateUpdated: string;
  dateCompleted?: string;
  notes: string;
}

export interface SuggestionWithEmployee extends Suggestion {
  employee: Employee;
}

export interface UpdateSuggestionBody {
  status: SuggestionStatus;
  notes?: string;
}

function createNarrower<T extends readonly string[]>(values: T) {
  const set = new Set(values);
  return (v: string): T[number] => {
    if (!set.has(v)) throw new Error(`Invalid value: "${v}"`);
    return v as T[number];
  };
}

export const narrowRiskLevel = createNarrower(RISK_LEVELS);
export const narrowSuggestionStatus = createNarrower(SUGGESTION_STATUSES);
export const narrowSuggestionType = createNarrower(SUGGESTION_TYPES);
export const narrowSuggestionPriority = createNarrower(SUGGESTION_PRIORITIES);
export const narrowSuggestionSource = createNarrower(SUGGESTION_SOURCES);
