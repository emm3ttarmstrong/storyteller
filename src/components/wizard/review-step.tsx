"use client";

import { type StoryWizardData } from "../story-wizard";

interface ReviewStepProps {
  data: StoryWizardData;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLast: boolean;
}

export function ReviewStep({
  data,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting,
  isLast,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-charcoal">Review Your Story</h3>
      <p className="text-muted">Please review the details before creating your story.</p>

      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h4 className="text-lg font-medium text-charcoal">Story Details</h4>
        <div>
          <p className="text-sm text-muted">Title:</p>
          <p className="font-medium text-charcoal">{data.title}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Premise:</p>
          <p className="font-medium text-charcoal">{data.premise}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Genre:</p>
          <p className="font-medium text-charcoal">{data.genre}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Tags:</p>
          <p className="font-medium text-charcoal">{data.tags.join(", ") || "None"}</p>
        </div>
        <div>
          <p className="text-sm text-muted">NSFW Content:</p>
          <p className="font-medium text-charcoal">{data.isNsfw ? "Allowed" : "Not Allowed"}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Content Intensity:</p>
          <p className="font-medium text-charcoal">{data.contentLevel} / 10</p>
        </div>
      </div>

      {data.characters.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h4 className="text-lg font-medium text-charcoal">Characters ({data.characters.length})</h4>
          {data.characters.map((char, index) => (
            <div key={index} className="border-b border-border/50 pb-4 last:border-b-0">
              <p className="font-medium text-charcoal">{char.name}</p>
              <p className="text-sm text-muted line-clamp-1">{char.personality}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h4 className="text-lg font-medium text-charcoal">AI Model Settings</h4>
        <div>
          <p className="text-sm text-muted">Writing Style:</p>
          <p className="font-medium text-charcoal">{data.writingStyle}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Narrative Structure:</p>
          <p className="font-medium text-charcoal">{data.narrativeStructure}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Character Focus:</p>
          <p className="font-medium text-charcoal">{data.characterFocus}</p>
        </div>
        <div>
          <p className="text-sm text-muted">AI Response Length:</p>
          <p className="font-medium text-charcoal">{data.responseLength}</p>
        </div>
        {Object.keys(data.customParams).length > 0 && (
          <div>
            <p className="text-sm text-muted">Custom Parameters:</p>
            <pre className="bg-subtle p-2 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(data.customParams, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 text-charcoal rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creating Story..." : "Create Story"}
        </button>
      </div>
    </div>
  );
}
