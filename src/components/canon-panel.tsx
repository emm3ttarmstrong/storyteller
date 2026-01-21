"use client";

import { CharacterCard } from "./character-card";
import { ProposedChanges } from "./proposed-changes";
import { type CharacterCanon, type ChangeDiff } from "@/lib/schemas";

interface Character {
  id: string;
  name: string;
  canon: CharacterCanon;
}

interface ProposedChange {
  id: string;
  characterName: string;
  diff: ChangeDiff;
  rationale?: string | null;
  status: "PROPOSED" | "ACCEPTED" | "REJECTED";
}

interface CanonPanelProps {
  characters: Character[];
  proposedChanges: ProposedChange[];
  onDecideChange: (changeId: string, accept: boolean) => void;
  isCommitting?: boolean;
}

export function CanonPanel({
  characters,
  proposedChanges,
  onDecideChange,
  isCommitting,
}: CanonPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-xs uppercase tracking-wider text-muted font-medium">
          Canon & Changes
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {characters.length === 0 ? (
          <p className="text-sm text-muted italic">
            Characters will appear here as they&apos;re introduced in the story.
          </p>
        ) : (
          <div className="space-y-3">
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                name={char.name}
                canon={char.canon}
              />
            ))}
          </div>
        )}

        <ProposedChanges
          changes={proposedChanges}
          onDecide={onDecideChange}
          isCommitting={isCommitting}
        />
      </div>
    </div>
  );
}
