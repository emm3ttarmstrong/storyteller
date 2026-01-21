import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateStorySchema } from "@/lib/schemas";

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

    const { title, premise } = parsed.data;

    const story = await db.story.create({
      data: {
        title,
        premise,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
