"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { PriorityBadge, SourceBadge, STATUS_LABELS } from "@/components/badges";
import type { SuggestionType, SuggestionWithEmployee } from "@/lib/types";
import { narrowSuggestionStatus, SUGGESTION_STATUSES } from "@/lib/types";

const TYPE_LABELS: Record<SuggestionType, string> = {
  equipment: "Equipment",
  exercise: "Exercise",
  behavioural: "Behavioural",
  lifestyle: "Lifestyle",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  suggestion: SuggestionWithEmployee;
}

export function SuggestionCard({ suggestion }: Props) {
  const selectId = useId();
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const [localStatus, setLocalStatus] = useState(suggestion.status);
  const [updating, setUpdating] = useState(false);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = narrowSuggestionStatus(e.target.value);
    const prevStatus = localStatus;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLocalStatus(newStatus);
    setUpdating(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        signal: controller.signal,
      });
      if (!res.ok) {
        setLocalStatus(prevStatus);
      } else {
        router.refresh();
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setLocalStatus(prevStatus);
      }
    } finally {
      if (abortRef.current === controller) {
        setUpdating(false);
      }
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-900 leading-snug">
          {suggestion.description}
        </p>
        <SourceBadge source={suggestion.source} />
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
        <span>{TYPE_LABELS[suggestion.type]}</span>
        <span>·</span>
        <span>{formatDate(suggestion.dateCreated)}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
        <PriorityBadge priority={suggestion.priority} />
      </div>

      {suggestion.notes && (
        <p className="mt-2.5 text-xs italic text-gray-500 leading-relaxed">
          {suggestion.notes}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
        <label htmlFor={selectId} className="text-xs text-gray-400 shrink-0">
          Status
        </label>
        <select
          id={selectId}
          value={localStatus}
          onChange={handleStatusChange}
          disabled={updating}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          {SUGGESTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
