import OpenAI from "openai";
import { LlmResponseSchema, type LlmResponse, type CharacterCanon } from "./schemas";

// xAI uses OpenAI-compatible SDK
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

interface GenerationContext {
  storyPrompt: string; // New: from wizard
  conflict: string; // New: from wizard
  endingDirection: string; // New: from wizard
  settingName: string; // New: from wizard
  settingDescription: string; // New: from wizard
  
  premise: string;
  rollingSummary: string | null;
  characters: Array<{
    name: string;
    canon: CharacterCanon;
  }>;
  lastSceneText: string | null;
  choiceText: string | null;
  
  // Old wizard settings (kept for compatibility if used elsewhere)
  genre?: string;
  tags: string[];
  isNsfw: boolean;
  contentLevel: number;
  tone: {
    writingStyle?: string;
    narrativeStructure?: string;
    characterFocus?: string;
  };
  modelParams: {
    responseLength?: string;
    [key: string]: any;
  };
}

/**
 * Build the system prompt that enforces output format and continuity rules
 */
function buildSystemPrompt(context: GenerationContext): string {
  const responseLength = getResponseLengthGuidance(context.modelParams.responseLength);
  const writingStyle = getWritingStyleGuidance(context.tone.writingStyle);
  const contentGuidance = getContentGuidance(context.isNsfw, context.contentLevel);
  const narrativeStructure = getNarrativeStructureGuidance(context.tone.narrativeStructure);
  const characterFocus = getCharacterFocusGuidance(context.tone.characterFocus);
  
  return `${context.storyPrompt}

You are a masterful storyteller crafting an interactive narrative. You must respond with ONLY valid JSON matching this exact schema:

{
  "scene_text": "${responseLength} of vivid, immersive narrative prose",
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

STORY REQUIREMENTS:
${context.conflict ? `- Central Conflict: ${context.conflict}` : ''}
${context.endingDirection ? `- Desired Ending: ${context.endingDirection}` : ''}
${context.settingName ? `- Setting: ${context.settingName} - ${context.settingDescription}` : ''}
${context.tags.length > 0 ? `- Themes/Tags: ${context.tags.join(', ')}` : ''}
${contentGuidance}

WRITING STYLE: ${writingStyle}

NARRATIVE APPROACH: ${narrativeStructure}

CHARACTER DEVELOPMENT: ${characterFocus}

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no code blocks.
2. CANON IS GROUND TRUTH: Character attributes in canon are established facts. Never contradict them unless proposing a change.
3. PROPOSE CHANGES EXPLICITLY: Only propose character_updates for changes that are DIRECTLY depicted in the scene text.
4. CONTINUITY: The rolling summary and last scene are your context. Build on them naturally.
5. CHOICES: Make choices meaningful and distinct. Each should lead the story in a different direction.
6. PROSE STYLE: Write vivid, sensory prose. Show, don't tell. Use dialogue naturally.
7. NEW CHARACTERS: Only introduce characters when narratively necessary. Give them meaningful initial attributes.
8. RESPECT ALL STORY REQUIREMENTS: Ensure your output matches the specified genre, themes, content level, and writing style.`;
}

function getResponseLengthGuidance(responseLength?: string): string {
  switch (responseLength) {
    case 'short': return '1-2 paragraphs';
    case 'long': return '3-5 paragraphs';
    default: return '2-3 paragraphs';
  }
}

function getWritingStyleGuidance(writingStyle?: string): string {
  switch (writingStyle) {
    case 'literary': return 'Rich, descriptive prose with sophisticated vocabulary and deep introspection';
    case 'pulp': return 'Fast-paced, action-oriented with punchy dialogue and vivid action sequences';
    case 'experimental': return 'Unconventional, avant-garde style that challenges traditional narrative forms';
    case 'minimalist': return 'Sparse, direct prose that conveys meaning through what is left unsaid';
    default: return 'Engaging, immersive storytelling with balanced pacing and vivid descriptions';
  }
}

function getContentGuidance(isNsfw: boolean, contentLevel: number): string {
  if (!isNsfw) {
    return '- Content: Safe for work, avoid explicit sexual content, graphic violence, or disturbing themes';
  }
  
  if (contentLevel <= 3) {
    return '- Content: Mild mature themes allowed, but keep explicit content minimal';
  } else if (contentLevel <= 6) {
    return '- Content: Moderate mature content allowed including some sexual themes and violence';
  } else {
    return '- Content: Explicit mature content allowed including graphic sexuality, violence, and disturbing themes';
  }
}

function getNarrativeStructureGuidance(narrativeStructure?: string): string {
  switch (narrativeStructure) {
    case 'linear': return 'Follow a straightforward chronological progression with clear cause-and-effect relationships';
    case 'experimental': return 'Use non-linear storytelling, fragmented scenes, or unconventional narrative techniques';
    default: return 'Create meaningful branching paths where choices significantly impact the story direction';
  }
}

function getCharacterFocusGuidance(characterFocus?: string): string {
  switch (characterFocus) {
    case 'plot-driven': return 'Prioritize advancing the plot over deep character exploration. Characters serve the story\'s progression';
    case 'character-driven': return 'Focus heavily on character psychology, motivations, and development. Plot emerges from character actions';
    default: return 'Balance character development with plot progression. Both should feel important and interconnected';
  }
}

/**
 * Build the user prompt with full context
 */
function buildUserPrompt(context: GenerationContext): string {
  const parts: string[] = [];

  // Story context from wizard
  parts.push(`CORE STORY CONTEXT:\n`);
  parts.push(`- Story Prompt: ${context.storyPrompt}`);
  parts.push(`- Central Conflict: ${context.conflict}`);
  parts.push(`- Desired Ending: ${context.endingDirection}`);
  parts.push(`- Setting: ${context.settingName} - ${context.settingDescription}`);

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
  // Build API parameters with custom model params
  const apiParams: any = {
    model: "grok-3-latest",
    messages: [
      { role: "system", content: buildSystemPrompt(context) },
      { role: "user", content: buildUserPrompt(context) },
    ],
    temperature: context.modelParams.temperature ?? 0.8,
    max_tokens: getMaxTokens(context.modelParams.responseLength),
  };

  // Apply any custom model parameters
  if (context.modelParams.top_p !== undefined) {
    apiParams.top_p = context.modelParams.top_p;
  }
  if (context.modelParams.frequency_penalty !== undefined) {
    apiParams.frequency_penalty = context.modelParams.frequency_penalty;
  }
  if (context.modelParams.presence_penalty !== undefined) {
    apiParams.presence_penalty = context.modelParams.presence_penalty;
  }

  const response = await xai.chat.completions.create(apiParams);

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

function getMaxTokens(responseLength?: string): number {
  switch (responseLength) {
    case 'short': return 1000;
    case 'long': return 3000;
    default: return 2000;
  }
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
