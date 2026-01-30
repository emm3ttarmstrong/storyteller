"use client";

import { type StoryWizardData } from "../story-wizard";
import { useState } from "react";

interface StorySetupStepProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  isFirst: boolean;
}

export function StorySetupStep({ data, updateData, onNext, isFirst }: StorySetupStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndProceed = () => {
    const newErrors: Record<string, string> = {};
    if (!data.title.trim()) newErrors.title = "Title is required.";
    if (!data.premise.trim()) newErrors.premise = "Premise is required.";
    if (!data.genre.trim()) newErrors.genre = "Genre is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      onNext();
    }
  };

  // For simplicity, genre and tags are text inputs for now. Will be enhanced later.
  // NSFW toggle and content level slider will be implemented here.
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-charcoal mb-2">
          Story Title
        </label>
        <input
          type="text"
          id="title"
          placeholder="The Chronicles of..."
          className="w-full px-4 py-3 border border-border rounded-lg bg-card font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          required
          maxLength={200}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="premise" className="block text-sm font-medium text-charcoal mb-2">
          Story Premise
        </label>
        <textarea
          id="premise"
          placeholder="In a world where magic flows through ancient bloodlines..."
          className="w-full px-4 py-3 border border-border rounded-lg bg-card font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
          rows={5}
          value={data.premise}
          onChange={(e) => updateData({ premise: e.target.value })}
          required
          minLength={10}
          maxLength={5000}
        />
        {errors.premise && <p className="text-red-500 text-xs mt-1">{errors.premise}</p>}
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-charcoal mb-2">
          Genre (e.g., Fantasy, Sci-Fi, Horror)
        </label>
        <input
          type="text"
          id="genre"
          placeholder="Fantasy"
          className="w-full px-4 py-3 border border-border rounded-lg bg-card font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper"
          value={data.genre}
          onChange={(e) => updateData({ genre: e.target.value })}
          required
          maxLength={100}
        />
        {errors.genre && <p className="text-red-500 text-xs mt-1">{errors.genre}</p>}
      </div>

      {/* NSFW Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="isNsfw" className="text-sm font-medium text-charcoal">
          Allow NSFW Content
        </label>
        <input
          type="checkbox"
          id="isNsfw"
          className="h-5 w-5 rounded border-gray-300 text-copper focus:ring-copper"
          checked={data.isNsfw}
          onChange={(e) => updateData({ isNsfw: e.target.checked })}
        />
      </div>

      {/* Content Level Slider */}
      <div>
        <label htmlFor="contentLevel" className="block text-sm font-medium text-charcoal mb-2">
          Content Intensity: {data.contentLevel}
        </label>
        <input
          type="range"
          id="contentLevel"
          min="1"
          max="10"
          value={data.contentLevel}
          onChange={(e) => updateData({ contentLevel: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-copper [&::-moz-range-thumb]:bg-copper"
        />
        <p className="text-xs text-muted mt-1">1 = Mild, 10 = Explicit</p>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={validateAndProceed}
          className="px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover transition-colors"
        >
          Next: Characters
        </button>
      </div>
    </div>
  );
}
