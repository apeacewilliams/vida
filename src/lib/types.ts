export const SUGGESTION_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "overdue",
] as const;

export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type SuggestionPriority = "high" | "medium" | "low";

export type SuggestionType =
  | "equipment"
  | "exercise"
  | "behavioural"
  | "lifestyle";

export type SuggestionSource = "vida" | "admin";

export type RiskLevel = "high" | "medium" | "low";

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
