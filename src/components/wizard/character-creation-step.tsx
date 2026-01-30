"use client";

import { useState } from "react";
import { type StoryWizardData, type Character } from "../story-wizard";

interface CharacterCreationStepProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function CharacterCreationStep({
  data,
  updateData,
  onNext,
  onPrev,
}: CharacterCreationStepProps) {
  const [newCharacter, setNewCharacter] = useState<Character>({
    name: "",
    appearance: "",
    personality: "",
    background: "",
    traits: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddCharacter = () => {
    const newErrors: Record<string, string> = {};
    if (!newCharacter.name.trim()) newErrors.name = "Character name is required.";
    if (!newCharacter.personality.trim()) newErrors.personality = "Personality is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData({
      characters: [...data.characters, newCharacter],
    });
    setNewCharacter({
      name: "",
      appearance: "",
      personality: "",
      background: "",
      traits: [],
    });
    setErrors({});
  };

  const handleRemoveCharacter = (index: number) => {
    updateData({
      characters: data.characters.filter((_, i) => i !== index),
    });
  };

  const validateAndProceed = () => {
    if (data.characters.length === 0) {
      alert("Please add at least one character or proceed without any.");
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-charcoal">Define Your Characters</h3>
      <p className="text-muted">Introduce the key players in your story.</p>

      {/* Existing Characters */}
      {data.characters.length > 0 && (
        <div className="space-y-4 rounded-lg border border-border bg-subtle p-4">
          <h4 className="text-lg font-medium text-charcoal">Current Characters</h4>
          {data.characters.map((char, index) => (
            <div key={index} className="flex items-center justify-between bg-card p-3 rounded-md">
              <div>
                <p className="font-medium text-charcoal">{char.name}</p>
                <p className="text-sm text-muted line-clamp-1">{char.personality}</p>
              </div>
              <button
                onClick={() => handleRemoveCharacter(index)}
                className="text-red-500 hover:text-red-700 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Character Form */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h4 className="text-lg font-medium text-charcoal">Add New Character</h4>
        <div>
          <label htmlFor="charName" className="block text-sm font-medium text-charcoal mb-2">
            Name
          </label>
          <input
            type="text"
            id="charName"
            placeholder="Elara, Kaelen, etc."
            className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter((prev) => ({ ...prev, name: e.target.value }))}
            maxLength={100}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="charAppearance" className="block text-sm font-medium text-charcoal mb-2">
            Appearance
          </label>
          <textarea
            id="charAppearance"
            placeholder="Tall with fiery red hair, piercing green eyes..."
            rows={2}
            className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
            value={newCharacter.appearance}
            onChange={(e) => setNewCharacter((prev) => ({ ...prev, appearance: e.target.value }))}
            maxLength={500}
          />
        </div>
        <div>
          <label htmlFor="charPersonality" className="block text-sm font-medium text-charcoal mb-2">
            Personality
          </label>
          <textarea
            id="charPersonality"
            placeholder="Sarcastic, fiercely loyal, secretly insecure..."
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
            value={newCharacter.personality}
            onChange={(e) => setNewCharacter((prev) => ({ ...prev, personality: e.target.value }))}
            maxLength={1000}
          />
          {errors.personality && <p className="text-red-500 text-xs mt-1">{errors.personality}</p>}
        </div>
        <div>
          <label htmlFor="charBackground" className="block text-sm font-medium text-charcoal mb-2">
            Background
          </label>
          <textarea
            id="charBackground"
            placeholder="Raised in the slums, witnessed a tragedy, seeking redemption..."
            rows={3}
            className="w-full px-4 py-3 border border-border rounded-lg bg-input font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
            value={newCharacter.background}
            onChange={(e) => setNewCharacter((prev) => ({ ...prev, background: e.target.value }))}
            maxLength={1000}
          />
        </div>
        <button
          onClick={handleAddCharacter}
          className="w-full px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover transition-colors"
        >
          Add Character
        </button>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 bg-gray-200 text-charcoal rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={validateAndProceed}
          className="px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover transition-colors"
        >
          Next: AI Settings
        </button>
      </div>
    </div>
  );
}
