import { z } from "zod";

/**
 * Schema for AI-generated scene responses
 * The AI must return valid JSON matching this structure
 */
export const LlmResponseSchema = z.object({
  scene_text: z.string().min(1, "Scene text is required"),

  choices: z
    .array(z.string().min(1))
    .min(2, "At least 2 choices required")
    .max(4, "Maximum 4 choices allowed"),

  scene_summary: z.string().optional(),

  // Map of character name -> proposed updates
  character_updates: z
    .record(
      z.string(),
      z.object({
        set: z.record(z.string(), z.string()).default({}),
        unset: z.array(z.string()).default([]),
        rationale: z.string().optional(),
      })
    )
    .default({}),

  // New characters introduced in this scene
  new_characters: z
    .array(
      z.object({
        name: z.string().min(1),
        initial_canon: z.record(z.string(), z.string()).default({}),
      })
    )
    .default([]),
});

export type LlmResponse = z.infer<typeof LlmResponseSchema>;

/**
 * Schema for creating a new story
 */
export const CreateStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  premise: z.string().min(10, "Premise must be at least 10 characters").max(5000),
  genre: z.string().min(1, "Genre is required").max(100),
  tags: z.array(z.string()).default([]),
  isNsfw: z.boolean().default(true),
  contentLevel: z.number().int().min(1).max(10).default(5),
  tone: z.record(z.string(), z.string()).default({}), // e.g., { writingStyle: 'literary', narrativeStructure: 'branching' }
  modelParams: z.record(z.string(), z.any()).default({}), // e.g., { temperature: 0.8, responseLength: 'medium' }
  initialCharacters: z.array(z.object({
    name: z.string().min(1, "Character name is required").max(100),
    appearance: z.string().max(500).optional(),
    personality: z.string().min(1, "Personality is required").max(1000),
    background: z.string().max(1000).optional(),
    traits: z.array(z.string()).default([]),
  })).default([]),
});

export type CreateStoryInput = z.infer<typeof CreateStorySchema>;

/**
 * Schema for generating a new scene
 */
export const GenerateSceneSchema = z.object({
  choiceText: z.string().optional(), // Optional for first scene
  parentSceneId: z.string().optional(),
});

export type GenerateSceneInput = z.infer<typeof GenerateSceneSchema>;

/**
 * Schema for accepting/rejecting a proposed change
 */
export const DecideChangeSchema = z.object({
  accept: z.boolean(),
});

export type DecideChangeInput = z.infer<typeof DecideChangeSchema>;

/**
 * Schema for manually adding a character
 */
export const CreateCharacterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  initialCanon: z.record(z.string(), z.string()).default({}),
});

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;

/**
 * Character canon type (flexible key-value pairs)
 */
export type CharacterCanon = Record<string, string>;

/**
 * Diff structure for proposed changes
 */
export interface ChangeDiff {
  set: Record<string, string>;
  unset: string[];
}

/**
 * Character update from AI response
 */
export type CharacterUpdate = {
  set: Record<string, string>;
  unset: string[];
  rationale?: string;
};
