"use client";

import { useState } from "react";
import { StoryWizardData } from "../story-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Screen5_OpeningSceneProps {
  data: StoryWizardData;
  updateData: (updates: Partial<StoryWizardData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function Screen5_OpeningScene({
  data,
  updateData,
  onPrev,
  onSubmit,
  isSubmitting,
}: Screen5_OpeningSceneProps) {
  const [title, setTitle] = useState(data.title || "");

  const handleSubmit = () => {
    updateData({ title });
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-charcoal">Ready to Begin Your Tale</h3>
        <p className="text-muted mt-2">
          Review your story setup and provide a title. We'll generate the opening scene and your first choices.
        </p>
      </div>

      {/* Story Title */}
      <div className="space-y-2">
        <Label htmlFor="story-title">Story Title</Label>
        <Input
          id="story-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your story..."
          className="bg-card-foreground/10 border-border"
        />
      </div>

      {/* Story Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Character Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Main Character</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {data.selectedCharacter?.name || "Custom"}</p>
            {data.selectedCharacter?.gender && (
              <p><strong>Gender:</strong> {data.selectedCharacter.gender}</p>
            )}
            <p><strong>Personality:</strong> {data.selectedCharacter?.personality || "Custom character description"}</p>
          </CardContent>
        </Card>

        {/* Setting Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Setting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Location:</strong> {data.selectedSetting?.name || "Custom"}</p>
            {data.selectedSetting?.era && (
              <p><strong>Era:</strong> {data.selectedSetting.era}</p>
            )}
            <p className="text-sm">{data.selectedSetting?.description || "Custom setting description"}</p>
          </CardContent>
        </Card>

        {/* Plot Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Central Conflict</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{data.conflict || "Custom conflict description"}</p>
          </CardContent>
        </Card>

        {/* Story Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Story Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p><strong>Tags:</strong> {data.tags?.join(", ") || "None"}</p>
            <p><strong>Content Level:</strong> {data.contentLevel}/10</p>
            <p><strong>NSFW:</strong> {data.isNsfw ? "Yes" : "No"}</p>
            <p><strong>Ending Direction:</strong> {data.endingDirection || "Custom"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Story Prompt Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Story Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm bg-muted/20 p-3 rounded border italic">
            {data.storyPrompt || "No story prompt provided"}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Story...
            </>
          ) : (
            "Create Story & Begin"
          )}
        </Button>
      </div>
    </div>
  );
}