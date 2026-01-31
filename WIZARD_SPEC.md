# Wizard Redesign Spec

## Core Principle
AI presents 3-4 options at every step. User picks one or types custom. Same interaction pattern as in-story choices.

## Story Prompt
- Editable textarea shown FIRST, before any steps
- Default generated from account tags: "You are a [genre] storyteller..."
- Saved as `Story.storyPrompt` — injected as first line of system prompt in ALL AI calls for this story
- Editable mid-story from a settings panel
- No API call needed for this step

## Flow: 5 Screens, 3 API Calls

### Screen 1: Story Prompt (no API call)
- Textarea with auto-generated default from account tags
- User edits freely or accepts default
- Button: "Continue to Tags"

### Screen 2: Tags (no API call)
- Pick from tag chips organized by category (Genre, Mood, Theme)
- Account-level defaults pre-selected
- Content level slider (1-10) + NSFW toggle
- "+ Add custom tag" input
- As user picks tags, suggest related ones (client-side logic, no API)
- Button: "Continue" → triggers API Call 1

### Screen 3: Character + Setting (API Call 1)
**One API call returns BOTH character options and setting options.**

Request sends: storyPrompt + selected tags + content preferences

Response shape:
```json
{
  "characters": [
    {
      "name": "Maren Voss",
      "gender": "she/her",
      "personality": "Calculating, guilt-ridden, dry humor as defense",
      "background": "Disgraced alchemist, exiled 5 years ago. Brilliant but distrusted."
    }
    // ...3 more
  ],
  "settings": [
    {
      "name": "Ashenmere",
      "description": "A walled port city choking on plague fog...",
      "era": "Late industrial fantasy"
    }
    // ...2 more
  ]
}
```

UI: Show characters as radio cards, settings as radio cards. Each section has "Or describe your own..." textarea at bottom.
Button: "Continue" → triggers API Call 2

### Screen 4: Plot (API Call 2)
**One API call returns conflicts, story tags, and ending options.**

Request sends: everything from prior steps (storyPrompt, tags, chosen character, chosen setting)

Response shape:
```json
{
  "conflicts": [
    {
      "summary": "The cure requires an ingredient only the Magistrate controls...",
      "tension": "Power vs. integrity"
    }
    // ...2 more
  ],
  "storyTags": ["betrayal", "ticking clock", "moral dilemma", "unlikely alliance", "secrets"],
  "endings": [
    { "type": "tragedy", "hint": "The cost of the cure is higher than the plague itself" },
    { "type": "bittersweet", "hint": "She saves the city but loses her place in it" },
    { "type": "triumphant", "hint": "Redemption, but it looks nothing like expected" },
    { "type": "open", "hint": "Let the choices decide" }
  ]
}
```

UI:
- Conflict: radio cards + custom textarea
- Story Tags: toggle chips (on/off)
- Ending Direction: radio cards + custom textarea
- Button: "Begin the Tale" → triggers API Call 3

### Screen 5: Opening Scene (API Call 3)
This is the existing `generateScene` flow. Creates the story, characters, and first scene in one go.
Redirects to the story workspace with the opening scene + first set of choices.

## Database Changes

### New fields on Story:
```
storyPrompt        String?   @db.Text    // "You are a dark fantasy storyteller..."
conflict           String?   @db.Text    // Chosen conflict premise
endingDirection    String?               // "tragedy" | "bittersweet" | "triumphant" | "open"
settingName        String?               // "Ashenmere"
settingDescription String?   @db.Text    // Full setting description
```

### New field on Character:
```
isProtagonist      Boolean   @default(false)
```

### New table: Profile (account-level preferences)
```
Profile {
  id                  String    @id @default(cuid())
  defaultTags         String[]
  defaultNsfw         Boolean   @default(false)
  defaultContentLevel Int       @default(5)
  defaultStoryPrompt  String?   @db.Text
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

## API Routes Needed

### POST /api/wizard/generate-options
Called twice during wizard (Call 1 and Call 2).
- Request body: `{ step: "characters-settings" | "plot", storyPrompt, tags, character?, setting? }`
- Returns the appropriate response shape above

### POST /api/stories (modified)
Now accepts all wizard data including storyPrompt, conflict, endingDirection, settingName, settingDescription, protagonist flag on character.

### GET/PUT /api/profile
Read and update account-level tag preferences.

## Prompt Integration
- `Story.storyPrompt` becomes the FIRST section of the system prompt in xai.ts
- All new fields (conflict, endingDirection, settingName, settingDescription) included in scene generation context
- Ending direction biases choices/tone but doesn't force outcomes

## Implementation Order
1. Database migration (add fields + Profile table)
2. Profile API + simple settings UI
3. Wizard API route (`/api/wizard/generate-options`)
4. Wizard UI components (replace current 4-step form)
5. Update xai.ts prompt building to use new fields
6. Update story creation API to accept new fields
