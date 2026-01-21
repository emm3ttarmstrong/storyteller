"use client";

import { useState } from "react";

interface ChoicePickerProps {
  choices: Array<{ id: string; text: string }>;
  onSelect: (choiceText: string) => void;
  isLoading?: boolean;
}

export function ChoicePicker({ choices, onSelect, isLoading }: ChoicePickerProps) {
  const [customChoice, setCustomChoice] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChoice.trim()) {
      onSelect(customChoice.trim());
      setCustomChoice("");
      setShowCustom(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 p-6 border border-border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-copper border-t-transparent rounded-full animate-spin" />
          <span className="font-serif italic text-muted animate-pulse-soft">
            The story unfolds...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted font-medium">
          What happens next?
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        {choices.map((choice, idx) => (
          <button
            key={choice.id}
            onClick={() => onSelect(choice.text)}
            className="choice-button w-full"
          >
            <span className="text-copper mr-2">{idx + 1}.</span>
            {choice.text}
          </button>
        ))}

        {/* Custom choice option */}
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full text-left px-5 py-3 text-sm text-muted hover:text-charcoal transition-colors"
          >
            + Write your own choice...
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <textarea
              value={customChoice}
              onChange={(e) => setCustomChoice(e.target.value)}
              placeholder="Describe what you want to do..."
              className="w-full px-4 py-3 border border-border rounded-lg bg-card font-serif italic text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!customChoice.trim()}
                className="px-4 py-2 bg-copper text-white rounded-md text-sm font-medium hover:bg-copper-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustom(false);
                  setCustomChoice("");
                }}
                className="px-4 py-2 text-muted text-sm hover:text-charcoal transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
