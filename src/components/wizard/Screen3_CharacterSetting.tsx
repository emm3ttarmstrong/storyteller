"use client";

import { useState, useEffect } from "react";
import { StoryWizardData } from "../story-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface Character {
  name: string;
  gender: string;
  personality: string;
  background: string;
}

interface Setting {
  name: string;
  description: string;
  era: string;
}

interface GeneratedOptions {
  characters: Character[];
  settings: Setting[];
}

interface Screen3_CharacterSettingProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Screen3_CharacterSetting({
  data,
  updateData,
  onNext,
  onPrev,
}: Screen3_CharacterSettingProps) {
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedOptions | null>(null);
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<string>("0");
  const [selectedSettingIndex, setSelectedSettingIndex] = useState<string>("0");
  const [customCharacter, setCustomCharacter] = useState("");
  const [customSetting, setCustomSetting] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate options on component mount
  useEffect(() => {
    generateOptions();
  }, []);

  const generateOptions = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/wizard/generate-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "characters-settings",
          storyPrompt: data.storyPrompt || "",
          tags: data.tags || [],
          contentLevel: data.contentLevel || 5,
          isNsfw: data.isNsfw || false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate options");
      }

      const options: GeneratedOptions = await response.json();
      setGeneratedOptions(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate options");
    } finally {
      setIsGenerating(false);
    }
  };

  const getSelectedCharacter = (): Character | null => {
    if (selectedCharacterIndex === "custom") return null;
    const index = parseInt(selectedCharacterIndex);
    return generatedOptions?.characters[index] || null;
  };

  const getSelectedSetting = (): Setting | null => {
    if (selectedSettingIndex === "custom") return null;
    const index = parseInt(selectedSettingIndex);
    return generatedOptions?.settings[index] || null;
  };

  const handleNext = () => {
    const character = getSelectedCharacter();
    const setting = getSelectedSetting();
    
    updateData({
      selectedCharacter: selectedCharacterIndex === "custom" 
        ? { name: "Custom", gender: "", personality: customCharacter, background: "" }
        : character,
      selectedSetting: selectedSettingIndex === "custom"
        ? { name: "Custom", description: customSetting, era: "" }
        : setting,
    });
    onNext();
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-copper" />
          <p className="text-muted">Generating characters and settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={generateOptions} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-charcoal">Choose Your Character & Setting</h3>
        <p className="text-muted mt-2">
          Select from AI-generated options or describe your own.
        </p>
      </div>

      {/* Character Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Main Character</Label>
        <RadioGroup value={selectedCharacterIndex} onValueChange={setSelectedCharacterIndex}>
          {generatedOptions?.characters.map((character, index) => (
            <div key={index} className="flex items-start space-x-2">
              <RadioGroupItem value={index.toString()} id={`character-${index}`} className="mt-1" />
              <Card className="flex-1 cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{character.name} ({character.gender})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm"><strong>Personality:</strong> {character.personality}</p>
                  <p className="text-sm"><strong>Background:</strong> {character.background}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Custom Character Option */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="custom" id="character-custom" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom-character">Or describe your own character...</Label>
              <Textarea
                id="custom-character"
                value={customCharacter}
                onChange={(e) => setCustomCharacter(e.target.value)}
                placeholder="Describe your main character's personality, background, and key traits..."
                rows={3}
                className="bg-card-foreground/10 border-border"
              />
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Setting Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Setting</Label>
        <RadioGroup value={selectedSettingIndex} onValueChange={setSelectedSettingIndex}>
          {generatedOptions?.settings.map((setting, index) => (
            <div key={index} className="flex items-start space-x-2">
              <RadioGroupItem value={index.toString()} id={`setting-${index}`} className="mt-1" />
              <Card className="flex-1 cursor-pointer hover:bg-accent transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">{setting.name}</CardTitle>
                  <CardDescription className="text-xs">{setting.era}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{setting.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Custom Setting Option */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="custom" id="setting-custom" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom-setting">Or describe your own setting...</Label>
              <Textarea
                id="custom-setting"
                value={customSetting}
                onChange={(e) => setCustomSetting(e.target.value)}
                placeholder="Describe the world, location, time period, and atmosphere of your story..."
                rows={3}
                className="bg-card-foreground/10 border-border"
              />
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={handleNext}>Continue</Button>
      </div>
    </div>
  );
}