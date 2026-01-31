"use client";

import { useState, useEffect } from "react";
import { StoryWizardData } from "../story-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Conflict {
  summary: string;
  tension: string;
}

interface Ending {
  type: string;
  hint: string;
}

interface GeneratedPlotOptions {
  conflicts: Conflict[];
  storyTags: string[];
  endings: Ending[];
}

interface Screen4_PlotProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Screen4_Plot({
  data,
  updateData,
  onNext,
  onPrev,
}: Screen4_PlotProps) {
  const [generatedPlotOptions, setGeneratedPlotOptions] = useState<GeneratedPlotOptions | null>(null);
  const [selectedConflictIndex, setSelectedConflictIndex] = useState<string>("0");
  const [selectedEndingIndex, setSelectedEndingIndex] = useState<string>("0");
  const [customConflict, setCustomConflict] = useState("");
  const [customEnding, setCustomEnding] = useState("");
  const [selectedStoryTags, setSelectedStoryTags] = useState<string[]>(data.tags || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePlotOptions();
  }, []);

  const generatePlotOptions = async () => {
    setIsGenerating(true);
    setError(null);

    if (!data.selectedCharacter || !data.selectedSetting) {
      setError("Character and setting must be selected in the previous step.");
      setIsGenerating(false);
      return;
    }
    
    try {
      const response = await fetch("/api/wizard/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "plot",
          storyPrompt: data.storyPrompt || "",
          tags: data.tags || [],
          contentLevel: data.contentLevel || 5,
          isNsfw: data.isNsfw || false,
          character: data.selectedCharacter,
          setting: data.selectedSetting,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plot options");
      }

      const options: GeneratedPlotOptions = await response.json();
      setGeneratedPlotOptions(options);
      // Pre-select AI generated story tags alongside existing data tags
      setSelectedStoryTags(Array.from(new Set([...data.tags, ...options.storyTags])));

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plot options");
    } finally {
      setIsGenerating(false);
    }
  };

  const getSelectedConflict = (): Conflict | null => {
    if (selectedConflictIndex === "custom") return null;
    const index = parseInt(selectedConflictIndex);
    return generatedPlotOptions?.conflicts[index] || null;
  };

  const getSelectedEnding = (): Ending | null => {
    if (selectedEndingIndex === "custom") return null;
    const index = parseInt(selectedEndingIndex);
    return generatedPlotOptions?.endings[index] || null;
  };

  const toggleTag = (tag: string) => {
    setSelectedStoryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = () => {
    const conflict = getSelectedConflict();
    const ending = getSelectedEnding();

    updateData({
      conflict: selectedConflictIndex === "custom" ? customConflict : conflict?.summary,
      endingDirection: selectedEndingIndex === "custom" ? customEnding : ending?.type,
      tags: selectedStoryTags, // Update tags with selected story tags
    });
    onNext();
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-copper" />
          <p className="text-muted">Generating plot options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={generatePlotOptions} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-charcoal">Define Your Story's Plot</h3>
        <p className="text-muted mt-2">
          Select a central conflict, refine story tags, and choose an ending direction.
        </p>
      </div>

      {/* Conflict Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Central Conflict</Label>
        <RadioGroup value={selectedConflictIndex} onValueChange={setSelectedConflictIndex}>
          {generatedPlotOptions?.conflicts.map((conflict, index) => (
            <div key={index} className="flex items-start space-x-2">
              <RadioGroupItem value={index.toString()} id={`conflict-${index}`} className="mt-1" />
              <Card className="flex-1 cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{conflict.summary}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm"><strong>Tension:</strong> {conflict.tension}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Custom Conflict Option */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="custom" id="conflict-custom" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom-conflict">Or describe your own conflict...</Label>
              <Textarea
                id="custom-conflict"
                value={customConflict}
                onChange={(e) => setCustomConflict(e.target.value)}
                placeholder="Briefly describe the core challenge or problem in your story..."
                rows={3}
                className="bg-card-foreground/10 border-border"
              />
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Story Tags (AI-generated + existing) */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Story Tags</Label>
        <div className="flex flex-wrap gap-2">
          {generatedPlotOptions?.storyTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedStoryTags.includes(tag) ? "default" : "outline"}
              onClick={() => toggleTag(tag)}
              className="cursor-pointer px-3 py-1"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted">Click to add/remove suggested tags. Existing tags are included.</p>
      </div>

      {/* Ending Direction Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Ending Direction</Label>
        <RadioGroup value={selectedEndingIndex} onValueChange={setSelectedEndingIndex}>
          {generatedPlotOptions?.endings.map((ending, index) => (
            <div key={index} className="flex items-start space-x-2">
              <RadioGroupItem value={index.toString()} id={`ending-${index}`} className="mt-1" />
              <Card className="flex-1 cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{ending.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{ending.hint}</p>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Custom Ending Option */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="custom" id="ending-custom" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom-ending">Or describe your own ending direction...</Label>
              <Textarea
                id="custom-ending"
                value={customEnding}
                onChange={(e) => setCustomEnding(e.target.value)}
                placeholder="Describe the general outcome or tone you'd like for the story's conclusion..."
                rows={3}
                className="bg-card-foreground/10 border-border"
              />
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={handleNext}>Begin the Tale</Button>
      </div>
    </div>
  );
}
