"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen1_StoryPrompt } from "./wizard/Screen1_StoryPrompt";
import { Screen2_Tags } from "./wizard/Screen2_Tags";
import { Screen3_CharacterSetting } from "./wizard/Screen3_CharacterSetting";
import { Screen4_Plot } from "./wizard/Screen4_Plot";
import { Screen5_OpeningScene } from "./wizard/Screen5_OpeningScene";

export interface Character {
  name: string;
  gender: string;
  personality: string;
  background: string;
}

export interface Setting {
  name: string;
  description: string;
  era: string;
}

export interface StoryWizardData {
  // Screen 1: Story Prompt
  storyPrompt: string;
  
  // Screen 2: Tags & Content
  tags: string[];
  contentLevel: number;
  isNsfw: boolean;
  
  // Screen 3: Character & Setting (from API)
  selectedCharacter: Character | null;
  selectedSetting: Setting | null;
  
  // Screen 4: Plot (from API)
  conflict: string;
  endingDirection: string;
  
  // Screen 5: Final details
  title: string;
}

const INITIAL_DATA: StoryWizardData = {
  storyPrompt: "",
  tags: [],
  contentLevel: 5,
  isNsfw: false,
  selectedCharacter: null,
  selectedSetting: null,
  conflict: "",
  endingDirection: "",
  title: "",
};

const STEPS = [
  { id: 1, name: "Story Prompt", component: Screen1_StoryPrompt },
  { id: 2, name: "Tags & Content", component: Screen2_Tags },
  { id: 3, name: "Character & Setting", component: Screen3_CharacterSetting },
  { id: 4, name: "Plot", component: Screen4_Plot },
  { id: 5, name: "Final Details", component: Screen5_OpeningScene },
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
          premise: data.storyPrompt, // Use storyPrompt as premise for now
          storyPrompt: data.storyPrompt,
          conflict: data.conflict,
          endingDirection: data.endingDirection,
          settingName: data.selectedSetting?.name,
          settingDescription: data.selectedSetting?.description,
          tags: data.tags,
          isNsfw: data.isNsfw,
          contentLevel: data.contentLevel,
          tone: {}, // Default empty tone object
          modelParams: {}, // Default empty model params
          initialCharacters: data.selectedCharacter ? [{
            name: data.selectedCharacter.name,
            appearance: "", // Not used in new wizard
            personality: data.selectedCharacter.personality,
            background: data.selectedCharacter.background,
            traits: [], // Not used in new wizard
            isProtagonist: true, // Mark as protagonist
          }] : [],
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
              {...{
                data,
                updateData,
                onNext: nextStep,
                onPrev: prevStep,
                isFirst: currentStep === 1,
                onSubmit: submitStory,
                isSubmitting,
              } as any}
            />
          )}
        </div>
      </div>
    </div>
  );
}