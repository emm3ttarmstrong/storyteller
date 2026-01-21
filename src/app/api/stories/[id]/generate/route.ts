import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { generateScene, updateRollingSummary } from "@/lib/xai";
import { GenerateSceneSchema, type CharacterCanon, type CharacterUpdate } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const body = await request.json();
    const parsed = GenerateSceneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { choiceText, parentSceneId } = parsed.data;

    // Load story with context
    const story = await db.story.findUnique({
      where: { id: storyId },
      include: {
        characters: true,
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Get parent scene if exists
    let lastSceneText: string | null = null;
    if (parentSceneId) {
      const parentScene = await db.scene.findUnique({
        where: { id: parentSceneId },
      });
      lastSceneText = parentScene?.text || null;
    }

    // Build context for AI
    const characters = story.characters.map((c) => ({
      name: c.name,
      canon: c.canon as unknown as CharacterCanon,
    }));

    // Generate scene with xAI
    const llmResponse = await generateScene({
      premise: story.premise,
      rollingSummary: story.rollingSummary,
      characters,
      lastSceneText,
      choiceText: choiceText || null,
    });

    // Create new characters first
    const newCharacters = [];
    for (const newChar of llmResponse.new_characters) {
      const character = await db.character.create({
        data: {
          storyId,
          name: newChar.name,
          canon: newChar.initial_canon as Prisma.InputJsonValue,
        },
      });
      newCharacters.push({
        id: character.id,
        name: character.name,
        canon: character.canon as unknown as CharacterCanon,
      });
    }

    // Create scene
    const scene = await db.scene.create({
      data: {
        storyId,
        parentSceneId: parentSceneId || null,
        incomingChoiceText: choiceText || null,
        text: llmResponse.scene_text,
        sceneSummary: llmResponse.scene_summary || null,
        choices: {
          create: llmResponse.choices.map((text, idx) => ({
            text,
            order: idx,
          })),
        },
      },
      include: {
        choices: true,
      },
    });

    // Create proposed changes for existing characters
    const proposedChanges = [];
    for (const [charName, rawUpdates] of Object.entries(llmResponse.character_updates)) {
      const updates = rawUpdates as CharacterUpdate;
      // Find character by name
      const character = await db.character.findFirst({
        where: { storyId, name: charName },
      });

      if (character) {
        const change = await db.proposedChange.create({
          data: {
            sceneId: scene.id,
            characterId: character.id,
            diff: {
              set: updates.set,
              unset: updates.unset,
            } as Prisma.InputJsonValue,
            rationale: updates.rationale || null,
          },
        });

        proposedChanges.push({
          id: change.id,
          characterId: character.id,
          characterName: charName,
          diff: change.diff,
          rationale: change.rationale,
          status: change.status,
        });
      }
    }

    // Update rolling summary if we have a scene summary
    if (llmResponse.scene_summary) {
      const newSummary = await updateRollingSummary(
        story.rollingSummary,
        llmResponse.scene_summary
      );

      await db.story.update({
        where: { id: storyId },
        data: { rollingSummary: newSummary },
      });
    }

    return NextResponse.json({
      scene: {
        id: scene.id,
        text: scene.text,
        incomingChoiceText: scene.incomingChoiceText,
        choices: scene.choices.map((c) => ({
          id: c.id,
          text: c.text,
        })),
      },
      newCharacters,
      proposedChanges,
    });
  } catch (error) {
    console.error("Failed to generate scene:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate scene" },
      { status: 500 }
    );
  }
}
