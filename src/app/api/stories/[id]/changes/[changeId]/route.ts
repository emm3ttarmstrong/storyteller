import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DecideChangeSchema, type CharacterCanon, type ChangeDiff } from "@/lib/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; changeId: string }> }
) {
  try {
    const { changeId } = await params;
    const body = await request.json();
    const parsed = DecideChangeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { accept } = parsed.data;

    // Get the proposed change
    const change = await db.proposedChange.findUnique({
      where: { id: changeId },
      include: { character: true },
    });

    if (!change) {
      return NextResponse.json({ error: "Change not found" }, { status: 404 });
    }

    if (change.status !== "PROPOSED") {
      return NextResponse.json(
        { error: "Change has already been decided" },
        { status: 400 }
      );
    }

    // Update the change status
    await db.proposedChange.update({
      where: { id: changeId },
      data: {
        status: accept ? "ACCEPTED" : "REJECTED",
        decidedAt: new Date(),
      },
    });

    let updatedCharacter = null;

    // If accepted, apply the diff to the character's canon
    if (accept) {
      const diff = change.diff as unknown as ChangeDiff;
      const currentCanon = change.character.canon as unknown as CharacterCanon;

      // Apply set operations
      const newCanon = { ...currentCanon, ...diff.set };

      // Apply unset operations
      for (const key of diff.unset || []) {
        delete newCanon[key];
      }

      const character = await db.character.update({
        where: { id: change.characterId },
        data: { canon: newCanon },
      });

      updatedCharacter = {
        id: character.id,
        name: character.name,
        canon: character.canon as unknown as CharacterCanon,
      };
    }

    return NextResponse.json({
      success: true,
      status: accept ? "ACCEPTED" : "REJECTED",
      character: updatedCharacter,
    });
  } catch (error) {
    console.error("Failed to decide change:", error);
    return NextResponse.json(
      { error: "Failed to update change" },
      { status: 500 }
    );
  }
}
