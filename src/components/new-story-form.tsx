"use client";

import { useState } from "react";
import { StoryWizard } from "./story-wizard";

export function NewStoryForm() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsWizardOpen(true)}
        className="w-full px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover transition-colors"
      >
        Begin a New Tale
      </button>

      {isWizardOpen && <StoryWizard onClose={() => setIsWizardOpen(false)} />}
    </div>
  );
}