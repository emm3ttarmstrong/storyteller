"use client";

interface Character {
  id: string;
  name: string;
}

interface CharacterNavProps {
  characters: Character[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function CharacterNav({ characters, activeId, onSelect }: CharacterNavProps) {
  if (characters.length === 0) {
    return (
      <div className="text-sm text-muted italic p-2">
        No characters yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {characters.map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          className={`
            w-full text-left px-3 py-2 rounded-md text-sm transition-colors
            ${activeId === char.id
              ? "bg-copper/10 text-copper font-medium"
              : "text-charcoal hover:bg-parchment"
            }
          `}
        >
          {char.name}
        </button>
      ))}
    </div>
  );
}
