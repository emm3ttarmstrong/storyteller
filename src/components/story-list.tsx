"use client";

import Link from "next/link";

interface Story {
  id: string;
  title: string;
  premise: string;
  createdAt: Date;
  _count?: {
    scenes: number;
    characters: number;
  };
}

interface StoryListProps {
  stories: Story[];
}

export function StoryList({ stories }: StoryListProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📖</div>
        <h2 className="text-xl font-serif text-charcoal mb-2">No stories yet</h2>
        <p className="text-muted mb-6">
          Create your first story to begin your adventure.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.id}`}
          className="group block p-6 bg-card rounded-lg border border-border hover:border-copper hover:shadow-md transition-all"
        >
          <h3 className="font-serif text-xl text-charcoal group-hover:text-copper transition-colors mb-2">
            {story.title}
          </h3>
          <p className="text-sm text-muted line-clamp-3 mb-4">
            {story.premise}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            {story._count && (
              <>
                <span>{story._count.scenes} scenes</span>
                <span>{story._count.characters} characters</span>
              </>
            )}
            <span>
              {new Date(story.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
