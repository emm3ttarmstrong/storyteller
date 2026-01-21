import OpenAI from "openai";
import { LlmResponseSchema, type LlmResponse, type CharacterCanon } from "./schemas";

// xAI uses OpenAI-compatible SDK
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

interface GenerationContext {
  premise: string;
  rollingSummary: string | null;
  characters: Array<{
    name: string;
    canon: CharacterCanon;
  }>;
  lastSceneText: string | null;
  choiceText: string | null;
}

/**
 * Build the system prompt that enforces output format and continuity rules
 */
function buildSystemPrompt(): string {
  return `You are a masterful storyteller crafting an interactive narrative. You must respond with ONLY valid JSON matching this exact schema:

{
  "scene_text": "2-5 paragraphs of vivid, immersive narrative prose",
  "choices": ["2-4 compelling choices for what happens next"],
  "scene_summary": "Optional 1-2 sentence summary of key events",
  "character_updates": {
    "CharacterName": {
      "set": { "attribute": "new_value" },
      "unset": ["attribute_to_remove"],
      "rationale": "Brief explanation of why this change occurred in the scene"
    }
  },
  "new_characters": [
    {
      "name": "NewCharacterName",
      "initial_canon": { "attribute": "value" }
    }
  ]
}

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no code blocks.
2. CANON IS GROUND TRUTH: Character attributes in canon are established facts. Never contradict them unless proposing a change.
3. PROPOSE CHANGES EXPLICITLY: Only propose character_updates for changes that are DIRECTLY depicted in the scene text.
4. CONTINUITY: The rolling summary and last scene are your context. Build on them naturally.
5. CHOICES: Make choices meaningful and distinct. Each should lead the story in a different direction.
6. PROSE STYLE: Write vivid, sensory prose. Show, don't tell. Use dialogue naturally.
7. NEW CHARACTERS: Only introduce characters when narratively necessary. Give them meaningful initial attributes.`;
}

/**
 * Build the user prompt with full context
 */
function buildUserPrompt(context: GenerationContext): string {
  const parts: string[] = [];

  // Story premise
  parts.push(`STORY PREMISE:\n${context.premise}`);

  // Character canon
  if (context.characters.length > 0) {
    parts.push("\nESTABLISHED CHARACTER CANON:");
    for (const char of context.characters) {
      const canonEntries = Object.entries(char.canon);
      if (canonEntries.length > 0) {
        const attrs = canonEntries.map(([k, v]) => `  - ${k}: ${v}`).join("\n");
        parts.push(`\n${char.name}:\n${attrs}`);
      } else {
        parts.push(`\n${char.name}: (no established attributes yet)`);
      }
    }
  }

  // Rolling summary for context
  if (context.rollingSummary) {
    parts.push(`\nSTORY SO FAR:\n${context.rollingSummary}`);
  }

  // Last scene for immediate context
  if (context.lastSceneText) {
    parts.push(`\nPREVIOUS SCENE:\n${context.lastSceneText}`);
  }

  // The choice that led here
  if (context.choiceText) {
    parts.push(`\nTHE PROTAGONIST CHOSE:\n"${context.choiceText}"`);
    parts.push("\nWrite what happens next as a direct consequence of this choice.");
  } else {
    parts.push("\nWrite the opening scene of this story.");
  }

  return parts.join("\n");
}

/**
 * Generate a new scene using xAI
 */
export async function generateScene(context: GenerationContext): Promise<LlmResponse> {
  const response = await xai.chat.completions.create({
    model: "grok-3-latest",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(context) },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content in AI response");
  }

  // Parse and validate JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", content);
    throw new Error("AI response was not valid JSON");
  }

  const result = LlmResponseSchema.safeParse(parsed);

  if (!result.success) {
    console.error("AI response failed validation:", result.error.issues);
    throw new Error(`AI response validation failed: ${result.error.issues[0]?.message}`);
  }

  return result.data;
}

/**
 * Update rolling summary with new scene information
 */
export async function updateRollingSummary(
  currentSummary: string | null,
  newSceneSummary: string
): Promise<string> {
  const response = await xai.chat.completions.create({
    model: "grok-3-latest",
    messages: [
      {
        role: "system",
        content:
          "You are a concise summarizer. Combine the existing story summary with the new scene summary into a cohesive rolling summary. Keep it under 500 words. Focus on key plot points, character developments, and important decisions. Output ONLY the summary text, no formatting.",
      },
      {
        role: "user",
        content: currentSummary
          ? `EXISTING SUMMARY:\n${currentSummary}\n\nNEW SCENE:\n${newSceneSummary}\n\nCreate an updated rolling summary.`
          : `First scene summary:\n${newSceneSummary}\n\nCreate an initial story summary.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  return response.choices[0]?.message?.content || newSceneSummary;
}
