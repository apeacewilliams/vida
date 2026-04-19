import type {
  SuggestionPriority,
  SuggestionSource,
  SuggestionStatus,
} from "@/lib/types";

const base =
  "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border";

export const STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending: "Pending",
  overdue: "Overdue",
  in_progress: "In Progress",
  completed: "Completed",
};

const PRIORITY_STYLES: Record<SuggestionPriority, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

const SOURCE_STYLES: Record<SuggestionSource, string> = {
  vida: "bg-teal-50 text-teal-700 border-teal-200",
  admin: "bg-gray-100 text-gray-600 border-gray-200",
};

export function PriorityBadge({ priority }: { priority: SuggestionPriority }) {
  return (
    <span className={`${base} ${PRIORITY_STYLES[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export function SourceBadge({ source }: { source: SuggestionSource }) {
  return (
    <span className={`${base} ${SOURCE_STYLES[source]}`}>
      {source === "vida" ? "VIDA" : "Admin"}
    </span>
  );
}
