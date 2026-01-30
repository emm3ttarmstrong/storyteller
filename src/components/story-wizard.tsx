"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StorySetupStep } from "./wizard/story-setup-step";
import { CharacterCreationStep } from "./wizard/character-creation-step";
import { ModelParametersStep } from "./wizard/model-parameters-step";
import { ReviewStep } from "./wizard/review-step";

export interface Character {
  name: string;
  appearance: string;
  personality: string;
  background: string;
  traits: string[];
}

export interface StoryWizardData {
  // Story Setup
  title: string;
  premise: string;
  genre: string;
  tags: string[];
  isNsfw: boolean;
  contentLevel: number;
  
  // Character Creation
  characters: Character[];
  
  // Model Parameters
  writingStyle: string;
  narrativeStructure: string;
  characterFocus: string;
  responseLength: string;
  customParams: Record<string, any>;
}

const INITIAL_DATA: StoryWizardData = {
  title: "",
  premise: "",
  genre: "",
  tags: [],
  isNsfw: true,
  contentLevel: 5,
  characters: [],
  writingStyle: "literary",
  narrativeStructure: "branching",
  characterFocus: "balanced",
  responseLength: "medium",
  customParams: {},
};

const STEPS = [
  { id: 1, name: "Story Setup", component: StorySetupStep },
  { id: 2, name: "Characters", component: CharacterCreationStep },
  { id: 3, name: "AI Settings", component: ModelParametersStep },
  { id: 4, name: "Review", component: ReviewStep },
];

interface StoryWizardProps {
  onClose: () => void;
}

export function StoryWizard({ onClose }: StoryWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<StoryWizardData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = (updates: Partial<StoryWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitStory = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          premise: data.premise,
          genre: data.genre,
          tags: data.tags,
          isNsfw: data.isNsfw,
          contentLevel: data.contentLevel,
          tone: {
            writingStyle: data.writingStyle,
            narrativeStructure: data.narrativeStructure,
            characterFocus: data.characterFocus,
          },
          modelParams: {
            responseLength: data.responseLength,
            ...data.customParams,
          },
          initialCharacters: data.characters,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create story");
      }

      const story = await response.json();
      router.push(`/stories/${story.id}`);
    } catch (error) {
      console.error("Error creating story:", error);
      alert("Failed to create story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-charcoal">Create New Story</h2>
              <p className="text-sm text-muted mt-1">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-charcoal transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              {STEPS.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id < currentStep
                        ? "bg-copper text-white"
                        : step.id === currentStep
                        ? "bg-copper-hover text-white"
                        : "bg-muted/20 text-muted"
                    }`}
                  >
                    {step.id < currentStep ? "✓" : step.id}
                  </div>
                  {step.id < STEPS.length && (
                    <div
                      className={`h-0.5 w-12 transition-colors ${
                        step.id < currentStep ? "bg-copper" : "bg-muted/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onPrev={prevStep}
              isFirst={currentStep === 1}
              isLast={currentStep === STEPS.length}
              onSubmit={submitStory}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}