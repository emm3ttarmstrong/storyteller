"use client";

import { useState } from "react";
import { StoryWizardData } from "../story-wizard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Screen1_StoryPromptProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  isFirst: boolean;
}

export function Screen1_StoryPrompt({
  data,
  updateData,
  onNext,
  isFirst,
}: Screen1_StoryPromptProps) {
  const [storyPrompt, setStoryPrompt] = useState(data.storyPrompt || "");

  const handleNext = () => {
    updateData({ storyPrompt });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-charcoal">Your Story's Core Idea</h3>
        <p className="text-muted mt-2">
          This prompt will guide the AI throughout your story. You can edit it later.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storyPrompt">Story Prompt</Label>
        <Textarea
          id="storyPrompt"
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
          placeholder="e.g., 'You are a cyberpunk detective hired to find a missing AI...' or 'A classic fantasy quest to retrieve a powerful artifact...'"
          rows={6}
          className="bg-card-foreground/10 border-border"
        />
        <p className="text-sm text-muted">
          Provide a detailed high-level summary of your story's premise.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          Continue to Tags
        </Button>
      </div>
    </div>
  );
}
