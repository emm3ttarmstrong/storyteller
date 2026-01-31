import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// For now, we'll use a single profile (no authentication)
// In a real app, this would be tied to user authentication
const PROFILE_ID = "default-profile";

export async function GET() {
  try {
    let profile = await db.profile.findUnique({
      where: { id: PROFILE_ID },
    });

    // Create default profile if it doesn't exist
    if (!profile) {
      profile = await db.profile.create({
        data: {
          id: PROFILE_ID,
          defaultTags: [],
          defaultNsfw: false,
          defaultContentLevel: 5,
          defaultStoryPrompt: null,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to get profile:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { defaultTags, defaultNsfw, defaultContentLevel, defaultStoryPrompt } = body;

    // Validate input
    if (defaultTags && !Array.isArray(defaultTags)) {
      return NextResponse.json(
        { error: "defaultTags must be an array" },
        { status: 400 }
      );
    }

    if (typeof defaultNsfw !== "undefined" && typeof defaultNsfw !== "boolean") {
      return NextResponse.json(
        { error: "defaultNsfw must be a boolean" },
        { status: 400 }
      );
    }

    if (defaultContentLevel && (typeof defaultContentLevel !== "number" || defaultContentLevel < 1 || defaultContentLevel > 10)) {
      return NextResponse.json(
        { error: "defaultContentLevel must be a number between 1 and 10" },
        { status: 400 }
      );
    }

    // Update or create profile
    const profile = await db.profile.upsert({
      where: { id: PROFILE_ID },
      create: {
        id: PROFILE_ID,
        defaultTags: defaultTags || [],
        defaultNsfw: defaultNsfw || false,
        defaultContentLevel: defaultContentLevel || 5,
        defaultStoryPrompt: defaultStoryPrompt || null,
      },
      update: {
        defaultTags: defaultTags,
        defaultNsfw: defaultNsfw,
        defaultContentLevel: defaultContentLevel,
        defaultStoryPrompt: defaultStoryPrompt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}