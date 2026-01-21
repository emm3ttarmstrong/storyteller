import Link from "next/link";
import { db } from "@/lib/db";
import { StoryList } from "@/components/story-list";
import { NewStoryForm } from "@/components/new-story-form";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stories = await db.story.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          scenes: true,
          characters: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl text-charcoal">Storyteller</h1>
              <p className="text-sm text-muted mt-1">
                Interactive narratives with character continuity
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story list */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-charcoal mb-4">
              Your Stories
            </h2>
            <StoryList stories={stories} />
          </div>

          {/* New story form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-charcoal mb-4">
                Begin a New Tale
              </h2>
              <NewStoryForm />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-xs text-muted text-center">
            Powered by xAI &middot;{" "}
            <Link href="https://emmett.wtf" className="hover:text-copper transition-colors">
              emmett.wtf
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
