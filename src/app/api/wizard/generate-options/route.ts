import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

// xAI client — lazy init to avoid build-time errors
let _xai: OpenAI | null = null;
function getXai(): OpenAI {
  if (!_xai) {
    _xai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }
  return _xai;
}

// Request schema validation
const GenerateOptionsSchema = z.object({
  step: z.enum(["characters-settings", "plot"]),
  storyPrompt: z.string().min(1, "Story prompt is required"),
  tags: z.array(z.string()).default([]),
  contentLevel: z.number().min(1).max(10).default(5),
  isNsfw: z.boolean().default(false),
  character: z.object({
    name: z.string(),
    gender: z.string(),
    personality: z.string(),
    background: z.string(),
  }).optional(),
  setting: z.object({
    name: z.string(),
    description: z.string(),
    era: z.string(),
  }).optional(),
});

// Response schemas for validation
const CharactersSettingsResponseSchema = z.object({
  characters: z.array(z.object({
    name: z.string(),
    gender: z.string(),
    personality: z.string(),
    background: z.string(),
  })),
  settings: z.array(z.object({
    name: z.string(),
    description: z.string(),
    era: z.string(),
  })),
});

const PlotResponseSchema = z.object({
  conflicts: z.array(z.object({
    summary: z.string(),
    tension: z.string(),
  })),
  storyTags: z.array(z.string()),
  endings: z.array(z.object({
    type: z.string(),
    hint: z.string(),
  })),
});

function buildCharactersSettingsPrompt(data: { storyPrompt: string; tags: string[]; contentLevel: number; isNsfw: boolean }) {
  const contentGuidance = data.isNsfw 
    ? data.contentLevel > 6 
      ? "Include mature themes, complex moral ambiguity, and adult situations as appropriate."
      : "Include moderate mature themes but keep content tasteful."
    : "Keep content appropriate for general audiences.";

  return `${data.storyPrompt}

GENERATE CHARACTER AND SETTING OPTIONS for an interactive story.

Tags/Themes: ${data.tags.join(", ") || "None specified"}
Content Level: ${data.contentLevel}/10
Content Guidance: ${contentGuidance}

Generate EXACTLY this JSON format with NO markdown, NO explanations:

{
  "characters": [
    {
      "name": "Character Name",
      "gender": "she/her, he/him, they/them, or other",
      "personality": "Key personality traits, flaws, and quirks",
      "background": "Brief background, profession, and current situation"
    }
    // Generate 3-4 character options
  ],
  "settings": [
    {
      "name": "Setting Name",
      "description": "Vivid description of the location, atmosphere, and key details",
      "era": "Time period or technological level"
    }
    // Generate exactly 3 setting options
  ]
}

Make characters diverse, compelling, and well-suited to the story prompt and tags. Settings should be atmospheric and provide rich storytelling opportunities.`;
}

function buildPlotPrompt(data: { 
  storyPrompt: string; 
  tags: string[]; 
  contentLevel: number; 
  isNsfw: boolean; 
  character: any; 
  setting: any; 
}) {
  const contentGuidance = data.isNsfw 
    ? data.contentLevel > 6 
      ? "Include mature themes, complex moral ambiguity, and adult situations as appropriate."
      : "Include moderate mature themes but keep content tasteful."
    : "Keep content appropriate for general audiences.";

  return `${data.storyPrompt}

GENERATE PLOT OPTIONS for an interactive story.

Character: ${data.character.name} (${data.character.gender}) - ${data.character.personality}
Background: ${data.character.background}

Setting: ${data.setting.name} - ${data.setting.description} (${data.setting.era})

Tags/Themes: ${data.tags.join(", ") || "None specified"}
Content Level: ${data.contentLevel}/10
Content Guidance: ${contentGuidance}

Generate EXACTLY this JSON format with NO markdown, NO explanations:

{
  "conflicts": [
    {
      "summary": "Brief description of the central conflict or challenge",
      "tension": "What makes this conflict compelling (power vs. integrity, etc.)"
    }
    // Generate exactly 3 conflict options
  ],
  "storyTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "endings": [
    {
      "type": "tragedy",
      "hint": "Brief hint about how this ending direction might unfold"
    },
    {
      "type": "bittersweet", 
      "hint": "Brief hint about how this ending direction might unfold"
    },
    {
      "type": "triumphant",
      "hint": "Brief hint about how this ending direction might unfold"
    },
    {
      "type": "open",
      "hint": "Brief hint about how this ending direction might unfold"
    }
  ]
}

Generate story tags that fit the chosen character, setting, and potential conflicts. Make conflicts specific to the character and setting provided.`;
}

async function generateCharactersSettings(data: any) {
  const response = await getXai().chat.completions.create({
    model: "grok-3-latest",
    messages: [
      {
        role: "system",
        content: "You are a creative writing assistant that generates character and setting options for interactive stories. Output ONLY valid JSON with no additional formatting or explanation.",
      },
      {
        role: "user",
        content: buildCharactersSettingsPrompt(data),
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in AI response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", content);
    throw new Error("AI response was not valid JSON");
  }

  const result = CharactersSettingsResponseSchema.safeParse(parsed);
  if (!result.success) {
    console.error("AI response failed validation:", result.error.issues);
    throw new Error(`AI response validation failed: ${result.error.issues[0]?.message}`);
  }

  return result.data;
}

async function generatePlotOptions(data: any) {
  const response = await getXai().chat.completions.create({
    model: "grok-3-latest",
    messages: [
      {
        role: "system",
        content: "You are a creative writing assistant that generates plot elements for interactive stories. Output ONLY valid JSON with no additional formatting or explanation.",
      },
      {
        role: "user",
        content: buildPlotPrompt(data),
      },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in AI response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", content);
    throw new Error("AI response was not valid JSON");
  }

  const result = PlotResponseSchema.safeParse(parsed);
  if (!result.success) {
    console.error("AI response failed validation:", result.error.issues);
    throw new Error(`AI response validation failed: ${result.error.issues[0]?.message}`);
  }

  return result.data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = GenerateOptionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.step === "characters-settings") {
      const result = await generateCharactersSettings(data);
      return NextResponse.json(result);
    } else if (data.step === "plot") {
      if (!data.character || !data.setting) {
        return NextResponse.json(
          { error: "Character and setting are required for plot generation" },
          { status: 400 }
        );
      }
      const result = await generatePlotOptions(data);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid step" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to generate wizard options:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate options" },
      { status: 500 }
    );
  }
}