"use client";

import { useState, useEffect, useRef } from "react";
import { SceneCard } from "./scene-card";
import { ChoicePicker } from "./choice-picker";
import { CanonPanel } from "./canon-panel";
import { CharacterNav } from "./character-nav";
import { type CharacterCanon, type ChangeDiff } from "@/lib/schemas";

interface Scene {
  id: string;
  text: string;
  incomingChoiceText: string | null;
  choices: Array<{ id: string; text: string }>;
}

interface Character {
  id: string;
  name: string;
  canon: CharacterCanon;
}

interface ProposedChange {
  id: string;
  characterId: string;
  characterName: string;
  diff: ChangeDiff;
  rationale: string | null;
  status: "PROPOSED" | "ACCEPTED" | "REJECTED";
}

interface StoryWorkspaceProps {
  storyId: string;
  title: string;
  initialScenes: Scene[];
  initialCharacters: Character[];
  initialChanges: ProposedChange[];
}

export function StoryWorkspace({
  storyId,
  title,
  initialScenes,
  initialCharacters,
  initialChanges,
}: StoryWorkspaceProps) {
  const [scenes, setScenes] = useState(initialScenes);
  const [characters, setCharacters] = useState(initialCharacters);
  const [proposedChanges, setProposedChanges] = useState(initialChanges);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new scenes are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scenes.length]);

  const latestScene = scenes[scenes.length - 1];

  const handleChoiceSelect = async (choiceText: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/stories/${storyId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choiceText,
          parentSceneId: latestScene?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate scene");
      }

      const data = await res.json();

      // Add new scene
      setScenes((prev) => [...prev, data.scene]);

      // Update characters (new ones)
      if (data.newCharacters?.length > 0) {
        setCharacters((prev) => [...prev, ...data.newCharacters]);
      }

      // Add proposed changes
      if (data.proposedChanges?.length > 0) {
        setProposedChanges((prev) => [...prev, ...data.proposedChanges]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDecideChange = async (changeId: string, accept: boolean) => {
    setIsCommitting(true);

    try {
      const res = await fetch(`/api/stories/${storyId}/changes/${changeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });

      if (!res.ok) {
        throw new Error("Failed to update change");
      }

      const data = await res.json();

      // Update the change status
      setProposedChanges((prev) =>
        prev.map((c) =>
          c.id === changeId
            ? { ...c, status: accept ? "ACCEPTED" : "REJECTED" }
            : c
        )
      );

      // If accepted, update the character's canon
      if (accept && data.character) {
        setCharacters((prev) =>
          prev.map((c) =>
            c.id === data.character.id
              ? { ...c, canon: data.character.canon }
              : c
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update change");
    } finally {
      setIsCommitting(false);
    }
  };

  // Get proposed changes with character names attached
  const changesWithNames = proposedChanges.map((change) => {
    const char = characters.find((c) => c.id === change.characterId);
    return {
      ...change,
      characterName: char?.name || "Unknown",
    };
  });

  return (
    <div className="h-screen flex flex-col bg-parchment">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <h1 className="font-serif text-2xl text-charcoal">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">
              {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Character nav */}
        <aside className="w-48 flex-shrink-0 border-r border-border bg-card p-4 hidden lg:block">
          <h3 className="text-xs uppercase tracking-wider text-muted font-medium mb-3">
            Characters
          </h3>
          <CharacterNav
            characters={characters}
            activeId={activeCharacterId}
            onSelect={setActiveCharacterId}
          />
        </aside>

        {/* Center - Story content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-8 lg:px-12"
          >
            <div className="max-w-2xl mx-auto">
              {scenes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-serif text-lg text-muted italic mb-8">
                    Your story awaits...
                  </p>
                  <button
                    onClick={() => handleChoiceSelect("")}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? "Creating..." : "Begin the Story"}
                  </button>
                </div>
              ) : (
                <>
                  {scenes.map((scene, idx) => (
                    <SceneCard
                      key={scene.id}
                      text={scene.text}
                      incomingChoiceText={scene.incomingChoiceText}
                      isLatest={idx === scenes.length - 1}
                    />
                  ))}

                  {latestScene && latestScene.choices.length > 0 && (
                    <ChoicePicker
                      choices={latestScene.choices}
                      onSelect={handleChoiceSelect}
                      isLoading={isGenerating}
                    />
                  )}
                </>
              )}

              {error && (
                <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right sidebar - Canon panel */}
        <aside className="w-80 flex-shrink-0 border-l border-border bg-card hidden md:block">
          <CanonPanel
            characters={characters}
            proposedChanges={changesWithNames}
            onDecideChange={handleDecideChange}
            isCommitting={isCommitting}
          />
        </aside>
      </div>
    </div>
  );
}
