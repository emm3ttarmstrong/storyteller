import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StoryWorkspace } from "@/components/story-workspace";
import { type CharacterCanon, type ChangeDiff } from "@/lib/schemas";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;

  const story = await db.story.findUnique({
    where: { id },
    include: {
      scenes: {
        orderBy: { createdAt: "asc" },
        include: {
          choices: {
            orderBy: { order: "asc" },
          },
          changes: {
            where: { status: "PROPOSED" },
            include: {
              character: {
                select: { name: true },
              },
            },
          },
        },
      },
      characters: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!story) {
    notFound();
  }

  // Transform data for the workspace component
  const scenes = story.scenes.map((scene) => ({
    id: scene.id,
    text: scene.text,
    incomingChoiceText: scene.incomingChoiceText,
    choices: scene.choices.map((c) => ({
      id: c.id,
      text: c.text,
    })),
  }));

  const characters = story.characters.map((c) => ({
    id: c.id,
    name: c.name,
    canon: c.canon as unknown as CharacterCanon,
  }));

  // Flatten all proposed changes from all scenes
  const proposedChanges = story.scenes.flatMap((scene) =>
    scene.changes.map((change) => ({
      id: change.id,
      characterId: change.characterId,
      characterName: change.character.name,
      diff: change.diff as unknown as ChangeDiff,
      rationale: change.rationale,
      status: change.status as "PROPOSED" | "ACCEPTED" | "REJECTED",
    }))
  );

  return (
    <StoryWorkspace
      storyId={story.id}
      title={story.title}
      initialScenes={scenes}
      initialCharacters={characters}
      initialChanges={proposedChanges}
    />
  );
}
