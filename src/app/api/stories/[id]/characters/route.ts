import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CreateCharacterSchema, type CharacterCanon } from "@/lib/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;

    const characters = await db.character.findMany({
      where: { storyId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      characters.map((c) => ({
        id: c.id,
        name: c.name,
        canon: c.canon as CharacterCanon,
      }))
    );
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const body = await request.json();
    const parsed = CreateCharacterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    // Check story exists
    const story = await db.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const { name, initialCanon } = parsed.data;

    const character = await db.character.create({
      data: {
        storyId,
        name,
        canon: initialCanon as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      id: character.id,
      name: character.name,
      canon: character.canon as CharacterCanon,
    });
  } catch (error) {
    console.error("Failed to create character:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
