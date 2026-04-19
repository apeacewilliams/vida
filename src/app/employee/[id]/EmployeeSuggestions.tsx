import Link from "next/link";
import { notFound } from "next/navigation";
import { STATUS_LABELS } from "@/components/badges";
import { SuggestionCard } from "@/components/SuggestionCard";
import {
  AVATAR_STYLES,
  getInitials,
  RISK_BADGE_STYLES,
} from "@/lib/employee-ui";
import { prisma } from "@/lib/prisma";
import type {
  SuggestionPriority,
  SuggestionStatus,
  SuggestionWithEmployee,
} from "@/lib/types";
import {
  narrowRiskLevel,
  narrowSuggestionPriority,
  narrowSuggestionSource,
  narrowSuggestionStatus,
  narrowSuggestionType,
} from "@/lib/types";

const SECTION_ORDER: SuggestionStatus[] = [
  "overdue",
  "in_progress",
  "pending",
  "completed",
];

const PRIORITY_ORDER: Record<SuggestionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function EmployeeSuggestions({
  employeeId,
}: {
  employeeId: string;
}) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { suggestions: { orderBy: { dateCreated: "desc" } } },
  });

  if (!employee) notFound();

  const risk = narrowRiskLevel(employee.riskLevel);

  const suggestions = employee.suggestions.map((s) => ({
    ...s,
    type: narrowSuggestionType(s.type),
    status: narrowSuggestionStatus(s.status),
    priority: narrowSuggestionPriority(s.priority),
    source: narrowSuggestionSource(s.source),
    createdBy: s.createdBy ?? undefined,
    dateCreated: s.dateCreated.toISOString(),
    dateUpdated: s.dateUpdated.toISOString(),
    dateCompleted: s.dateCompleted?.toISOString(),
    employee: {
      id: employee.id,
      name: employee.name,
      department: employee.department,
      riskLevel: risk,
    },
  }));

  const byStatus = new Map<SuggestionStatus, SuggestionWithEmployee[]>();
  for (const s of suggestions) {
    const list = byStatus.get(s.status) ?? [];
    list.push(s);
    byStatus.set(s.status, list);
  }
  for (const list of byStatus.values()) {
    list.sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-md text-gray-500 hover:text-gray-700 mb-5 cursor-pointer"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 2L4 7l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        All employees
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold shrink-0 ${AVATAR_STYLES[risk]}`}
          >
            {getInitials(employee.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900">
              {employee.name}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {employee.department}
            </p>
          </div>
          <span
            className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${RISK_BADGE_STYLES[risk]}`}
          >
            {risk.charAt(0).toUpperCase() + risk.slice(1)} risk
          </span>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">
          No suggestions for this employee.
        </p>
      ) : (
        <div className="space-y-6">
          {SECTION_ORDER.map((status) => {
            const items = byStatus.get(status) ?? [];
            return (
              <section key={status}>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  {STATUS_LABELS[status]}
                  <span className="ml-2 text-xs font-normal text-gray-400 tabular-nums">
                    {items.length}
                  </span>
                </h2>
                {items.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-400">
                      No {STATUS_LABELS[status].toLowerCase()} suggestions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
