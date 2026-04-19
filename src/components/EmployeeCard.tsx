import Link from "next/link";
import {
  AVATAR_STYLES,
  getInitials,
  RISK_BADGE_STYLES,
} from "@/lib/employee-ui";
import type { Employee, SuggestionStatus } from "@/lib/types";
import { narrowSuggestionStatus } from "@/lib/types";

interface EmployeeCardProps {
  employee: Employee;
  suggestions: { status: string }[];
}

export function EmployeeCard({ employee, suggestions }: EmployeeCardProps) {
  const risk = employee.riskLevel;

  const counts: Record<SuggestionStatus, number> = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  };
  for (const s of suggestions) {
    const status = narrowSuggestionStatus(s.status);
    counts[status] = counts[status] + 1;
  }

  return (
    <Link
      href={`/employee/${employee.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${AVATAR_STYLES[risk]}`}
        >
          {getInitials(employee.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {employee.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{employee.department}</p>
        </div>
        <span
          className={`shrink-0 inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${RISK_BADGE_STYLES[risk]}`}
        >
          {risk.charAt(0).toUpperCase() + risk.slice(1)} risk
        </span>
      </div>

      <hr className="my-3 border-gray-100" />

      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
        <StatusRow label="Pending" count={counts.pending} alert={false} />
        <StatusRow
          label="In Progress"
          count={counts.in_progress}
          alert={false}
        />
        <StatusRow label="Completed" count={counts.completed} alert={false} />
        <StatusRow
          label="Overdue"
          count={counts.overdue}
          alert={counts.overdue > 0}
        />
      </div>
    </Link>
  );
}

function StatusRow({
  label,
  count,
  alert,
}: {
  label: string;
  count: number;
  alert: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span
        className={`text-xs font-medium tabular-nums ${
          alert ? "text-red-600" : "text-gray-500"
        }`}
      >
        {count}
      </span>
    </div>
  );
}
