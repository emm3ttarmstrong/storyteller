import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateStorySchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const stories = await db.story.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            scenes: true,
            characters: true,
          },
        },
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateStorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { 
      title, 
      storyPrompt, 
      conflict, 
      endingDirection, 
      settingName, 
      settingDescription, 
      tags, 
      isNsfw, 
      contentLevel, 
      initialCharacters 
    } = parsed.data;

    // Build premise from wizard data for backwards compatibility
    const premise = conflict || `A story set in ${settingName || 'an unknown world'}`;

    const story = await db.story.create({
      data: {
        title,
        premise,
        storyPrompt,
        conflict,
        endingDirection,
        settingName,
        settingDescription,
        tags,
        isNsfw,
        contentLevel,
        tone: {} as Prisma.InputJsonValue, // Default empty for now, will be populated by AI generation
        modelParams: {} as Prisma.InputJsonValue, // Default empty for now, will be populated by AI generation
        characters: {
          create: initialCharacters.map(char => ({
            name: char.name,
            isProtagonist: char.isProtagonist,
            canon: {
              personality: char.personality,
              background: char.background || "",
             } as Prisma.InputJsonValue,
          })),
        },
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create story" },
      { status: 500 }
    );
  }
}
