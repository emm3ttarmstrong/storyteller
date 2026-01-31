"use client";

import { useState } from "react";
import { StoryWizardData } from "../story-wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Screen2_TagsProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const predefinedTags = {
  Genre: ["fantasy", "sci-fi", "horror", "mystery", "thriller", "romance", "comedy", "historical", "cyberpunk", "steampunk"],
  Mood: ["dark", "gritty", "hopeful", "epic", "whimsical", "suspenseful", "melancholy", "action-packed"],
  Theme: ["redemption", "betrayal", "identity", "power", "survival", "love", "friendship", "revenge", "discovery"],
};

export function Screen2_Tags({
  data,
  updateData,
  onNext,
  onPrev,
}: Screen2_TagsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(data.tags || []);
  const [contentLevel, setContentLevel] = useState<number[]>([
    data.contentLevel || 5,
  ]);
  const [isNsfw, setIsNsfw] = useState(data.isNsfw || false);
  const [customTagInput, setCustomTagInput] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags((prev) => [...prev, customTagInput.trim()]);
      setCustomTagInput("");
    }
  };

  const handleNext = () => {
    updateData({
      tags: selectedTags,
      contentLevel: contentLevel[0],
      isNsfw,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-charcoal">Define Your Story's Mood & Scope</h3>
        <p className="text-muted mt-2">
          Choose tags that best describe your story. Adjust content level and NSFW setting.
        </p>
      </div>

      {Object.entries(predefinedTags).map(([category, tags]) => (
        <div key={category} className="space-y-2">
          <Label className="text-md font-medium">{category}</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                onClick={() => toggleTag(tag)}
                className="cursor-pointer px-3 py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <Label className="text-md font-medium">Custom Tags</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
            placeholder="Add a custom tag (e.g., 'space opera')"
            className="flex-grow bg-card-foreground/10 border-border"
          />
          <Button onClick={addCustomTag} variant="outline">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.filter(tag => !Object.values(predefinedTags).flat().includes(tag)).map((tag) => (
            <Badge
              key={tag}
              variant="default"
              onClick={() => toggleTag(tag)}
              className="cursor-pointer px-3 py-1"
            >
              {tag} ✕
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="content-level" className="text-md font-medium">Content Level: {contentLevel[0]}/10</Label>
          <Slider
            id="content-level"
            min={1}
            max={10}
            step={1}
            value={contentLevel}
            onValueChange={setContentLevel}
            className="w-[60%]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="nsfw-mode"
            checked={isNsfw}
            onCheckedChange={setIsNsfw}
          />
          <Label htmlFor="nsfw-mode" className="text-md font-medium">NSFW Content (Mature themes enabled)</Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={handleNext}>Continue</Button>
      </div>
    </div>
  );
}
