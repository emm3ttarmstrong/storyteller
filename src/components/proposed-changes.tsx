"use client";

import { type ChangeDiff } from "@/lib/schemas";

interface ProposedChange {
  id: string;
  characterName: string;
  diff: ChangeDiff;
  rationale?: string | null;
  status: "PROPOSED" | "ACCEPTED" | "REJECTED";
}

interface ProposedChangesProps {
  changes: ProposedChange[];
  onDecide: (changeId: string, accept: boolean) => void;
  isCommitting?: boolean;
}

export function ProposedChanges({ changes, onDecide, isCommitting }: ProposedChangesProps) {
  const pendingChanges = changes.filter((c) => c.status === "PROPOSED");

  if (pendingChanges.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border pt-4 mt-4">
      <h4 className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
        Proposed Canon Updates
      </h4>

      <div className="space-y-3">
        {pendingChanges.map((change) => (
          <div
            key={change.id}
            className="p-3 bg-parchment rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-charcoal">
                {change.characterName}
              </span>
              {isCommitting ? (
                <div className="w-4 h-4 border-2 border-copper border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => onDecide(change.id, false)}
                    className="p-1.5 rounded text-danger hover:bg-danger/10 transition-colors"
                    title="Reject change"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDecide(change.id, true)}
                    className="p-1.5 rounded text-success hover:bg-success/10 transition-colors"
                    title="Accept change"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Diff display */}
            <div className="text-sm space-y-1">
              {Object.entries(change.diff.set || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-muted">{key}:</span>
                  <span className="diff-new">{value}</span>
                </div>
              ))}
              {(change.diff.unset || []).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-muted">{key}:</span>
                  <span className="diff-old">removed</span>
                </div>
              ))}
            </div>

            {change.rationale && (
              <p className="text-xs text-muted mt-2 italic">
                {change.rationale}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
