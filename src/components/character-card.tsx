"use client";

import { type CharacterCanon } from "@/lib/schemas";

interface CharacterCardProps {
  name: string;
  canon: CharacterCanon;
  isActive?: boolean;
  onClick?: () => void;
}

export function CharacterCard({ name, canon, isActive, onClick }: CharacterCardProps) {
  const entries = Object.entries(canon);

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border transition-all cursor-pointer
        ${isActive
          ? "border-copper bg-white shadow-sm"
          : "border-border bg-card hover:border-copper/50"
        }
      `}
    >
      <h4 className="font-semibold text-charcoal mb-2">{name}</h4>

      {entries.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {entries.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-parchment text-muted"
              title={`${key}: ${value}`}
            >
              <span className="font-medium text-charcoal">{key}:</span>
              <span className="ml-1 truncate max-w-[100px]">{value}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted italic">No attributes yet</p>
      )}
    </div>
  );
}
