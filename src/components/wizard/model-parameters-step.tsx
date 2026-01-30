"use client";

import { type StoryWizardData } from "../story-wizard";

interface ModelParametersStepProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ModelParametersStep({
  data,
  updateData,
  onNext,
  onPrev,
}: ModelParametersStepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-charcoal">Fine-Tune AI Settings</h3>
      <p className="text-muted">Customize how the AI generates your story.</p>

      {/* Writing Style */}
      <div>
        <label htmlFor="writingStyle" className="block text-sm font-medium text-charcoal mb-2">
          Writing Style
        </label>
        <select
          id="writingStyle"
          className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal focus:outline-none focus:border-copper"
          value={data.writingStyle}
          onChange={(e) => updateData({ writingStyle: e.target.value })}
        >
          <option value="literary">Literary (rich, descriptive)</option>
          <option value="pulp">Pulp (fast-paced, action-oriented)</option>
          <option value="experimental">Experimental (unconventional, avant-garde)</option>
          <option value="minimalist">Minimalist (sparse, direct)</option>
        </select>
      </div>

      {/* Narrative Structure */}
      <div>
        <label htmlFor="narrativeStructure" className="block text-sm font-medium text-charcoal mb-2">
          Narrative Structure
        </label>
        <select
          id="narrativeStructure"
          className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal focus:outline-none focus:border-copper"
          value={data.narrativeStructure}
          onChange={(e) => updateData({ narrativeStructure: e.target.value })}
        >
          <option value="linear">Linear (straightforward progression)</option>
          <option value="branching">Branching (multiple choice paths)</option>
          <option value="experimental">Experimental (non-linear, fragmented)</option>
        </select>
      </div>

      {/* Character Focus */}
      <div>
        <label htmlFor="characterFocus" className="block text-sm font-medium text-charcoal mb-2">
          Character Development Focus
        </label>
        <select
          id="characterFocus"
          className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal focus:outline-none focus:border-copper"
          value={data.characterFocus}
          onChange={(e) => updateData({ characterFocus: e.target.value })}
        >
          <option value="plot-driven">Plot-Driven</option>
          <option value="character-driven">Character-Driven</option>
          <option value="balanced">Balanced</option>
        </select>
      </div>

      {/* Response Length */}
      <div>
        <label htmlFor="responseLength" className="block text-sm font-medium text-charcoal mb-2">
          AI Response Length (per scene)
        </label>
        <select
          id="responseLength"
          className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal focus:outline-none focus:border-copper"
          value={data.responseLength}
          onChange={(e) => updateData({ responseLength: e.target.value })}
        >
          <option value="short">Short (1-2 paragraphs)</option>
          <option value="medium">Medium (2-3 paragraphs)</option>
          <option value="long">Long (3-5 paragraphs)</option>
        </select>
      </div>

      {/* Custom Parameters (for power users) */}
      <div>
        <label htmlFor="customParams" className="block text-sm font-medium text-charcoal mb-2">
          Custom AI Parameters (JSON)
        </label>
        <textarea
          id="customParams"
          placeholder="{'temperature': 0.8, 'top_p': 0.9}"
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-lg bg-input font-mono text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
          value={JSON.stringify(data.customParams, null, 2)}
          onChange={(e) => {
            try {
              updateData({ customParams: JSON.parse(e.target.value) });
            } catch (error) {
              // Handle invalid JSON input gracefully
              console.error("Invalid JSON for custom parameters", error);
            }
          }}
        />
        <p className="text-xs text-muted mt-1">Enter valid JSON for advanced AI settings.</p>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 text-charcoal rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover transition-colors"
        >
          Next: Review
        </button>
      </div>
    </div>
  );
}
