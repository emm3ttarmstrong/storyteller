"use client";

interface SceneCardProps {
  text: string;
  incomingChoiceText?: string | null;
  isLatest?: boolean;
}

export function SceneCard({ text, incomingChoiceText, isLatest }: SceneCardProps) {
  // Split text into paragraphs for proper rendering
  const paragraphs = text.split("\n\n").filter(Boolean);

  return (
    <div className={`relative ${isLatest ? "" : "opacity-80"}`}>
      {/* Choice badge showing what led to this scene */}
      {incomingChoiceText && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted font-medium">
            You chose:
          </span>
          <span className="text-sm italic text-copper font-serif">
            &ldquo;{incomingChoiceText}&rdquo;
          </span>
        </div>
      )}

      {/* Scene text */}
      <div className="scene-text">
        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

      {/* Separator between scenes */}
      {!isLatest && (
        <div className="mt-8 mb-8 flex items-center justify-center">
          <span className="text-border text-lg">* * *</span>
        </div>
      )}
    </div>
  );
}
