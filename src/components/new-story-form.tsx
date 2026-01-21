"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewStoryFormProps {
  onClose?: () => void;
}

export function NewStoryForm({ onClose }: NewStoryFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [premise, setPremise] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, premise }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create story");
      }

      const data = await res.json();
      router.push(`/stories/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-charcoal mb-2">
          Story Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The Chronicles of..."
          className="w-full px-4 py-3 border border-border rounded-lg bg-card font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper"
          required
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="premise" className="block text-sm font-medium text-charcoal mb-2">
          Story Premise
        </label>
        <textarea
          id="premise"
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
          placeholder="In a world where magic flows through ancient bloodlines, a young blacksmith discovers they are the last heir to a forbidden power..."
          className="w-full px-4 py-3 border border-border rounded-lg bg-card font-serif text-charcoal placeholder:text-muted/50 focus:outline-none focus:border-copper resize-none"
          rows={5}
          required
          minLength={10}
          maxLength={5000}
        />
        <p className="text-xs text-muted mt-1">
          Describe the setting, main character, and initial conflict.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-muted hover:text-charcoal transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isCreating || !title.trim() || premise.length < 10}
          className="flex-1 px-4 py-3 bg-copper text-white rounded-lg font-medium hover:bg-copper-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? "Creating..." : "Begin Your Story"}
        </button>
      </div>
    </form>
  );
}
