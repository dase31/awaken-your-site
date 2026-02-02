
# Conversational LLM-Powered Onboarding

Transform the structured checkbox onboarding into a warm, conversational experience where users write freely and the AI extracts meaningful themes for matching - all while keeping the dreamy sky aesthetic.

## What We're Building

Instead of clicking pre-set options, users will have a genuine conversation:

```text
Current Flow:
"What weighs on you?" → [Checkbox] [Checkbox] [Checkbox]

New Flow:
"What's been on your mind lately?" → [Open text area]
→ User writes: "I just moved to a new city and feel so disconnected..."
→ AI responds: "It sounds like you're experiencing loneliness and seeking connection. Is that right?"
→ [Yes, that's it] [Let me add more]
```

## New Onboarding Steps

| Step | Question | Input Type | What AI Does |
|------|----------|------------|--------------|
| 0 | What should we call you? | Text input | (Same as before) |
| 1 | What brings you here? | Free text | Extracts intent + context |
| 2 | AI reflects back | Confirmation | Shows extracted themes as gentle tags |
| 3 | What do you offer others? | Free text | Extracts strengths |
| 4 | AI confirms strengths | Confirmation | Shows strength tags for approval |

## Technical Architecture

### Backend: Edge Function for Theme Extraction

Create `supabase/functions/extract-themes/index.ts` that:
- Takes user's free-text input
- Uses Lovable AI (Gemini) to extract themes
- Returns structured data for the database

```text
Input: "I feel like nobody really listens to me. I've been struggling with anxiety since losing my job."

Output: {
  themes: ["unheard", "anxiety", "life_transition"],
  context: "Job loss leading to anxiety and feeling disconnected",
  suggested_tags: [
    { id: "unheard", label: "Feeling unheard", confidence: 0.95 },
    { id: "anxiety", label: "Anxiety", confidence: 0.90 },
    { id: "direction", label: "Finding direction", confidence: 0.75 }
  ]
}
```

### Database Changes

Add new columns to store the raw text for richer matching:

| Table | New Column | Purpose |
|-------|------------|---------|
| profiles | raw_intent_text | User's original words about why they're here |
| profiles | raw_offering_text | User's original words about what they bring |

This lets us do semantic matching later, not just tag matching.

### Frontend Flow

```text
Step 0: Name (unchanged)
    ↓
Step 1: "What's been on your heart lately?"
        [Large textarea with ethereal styling]
        [Continue →]
    ↓
Step 2: AI Processing (brief loading with gentle animation)
        "I hear you..."
    ↓
Step 3: Theme Confirmation
        "It sounds like you're carrying..."
        [Tag: Loneliness] [Tag: Seeking purpose] [Tag: Life transition]
        "Does this feel right?"
        [Yes, continue] [Let me add more]
    ↓
Step 4: "What gifts do you bring to others?"
        [Large textarea]
        [Continue →]
    ↓
Step 5: Strength Confirmation (same pattern)
    ↓
Step 6: Email/Auth (future step)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/OnboardingStructured.tsx` | Create | Backup of current structured version |
| `src/pages/Onboarding.tsx` | Replace | New conversational flow |
| `supabase/functions/extract-themes/index.ts` | Create | LLM theme extraction |
| Database migration | Add | `raw_intent_text` and `raw_offering_text` columns |

## Visual Design

Keeping the exact same aesthetic:
- Sky gradient background with floating clouds and birds
- Libre Baskerville serif for questions
- Ethereal input styling (no borders, centered)
- Fade-in animations between steps
- Ghost pill buttons for tag confirmations

New elements:
- Larger textarea for free-form input (same ethereal style)
- Gentle loading state ("I hear you..." with subtle pulse)
- Tag pills that match the ghost button style

## Edge Function Details

```typescript
// supabase/functions/extract-themes/index.ts
// Uses Lovable AI gateway (LOVABLE_API_KEY auto-configured)

const systemPrompt = `You are a compassionate listener helping understand what someone is experiencing.
Extract themes from their words. Map to these categories when applicable:
- Struggles: anxiety, loneliness, grief, direction, unheard, doubt
- Strengths: listener, calm, experienced, questions, space, share

Also capture any unique context that doesn't fit categories.
Respond with JSON only.`;
```

## Why This Approach?

1. **More Personal**: Users express themselves naturally instead of checking boxes
2. **Richer Data**: We capture context ("just moved to new city") not just labels ("loneliness")
3. **Better Matching**: "Both of you recently moved cities" vs "Both selected loneliness"
4. **Validation**: Users confirm the AI understood them correctly
5. **Hybrid Structure**: Still stores structured tags for efficient database queries

## Implementation Order

1. Save current Onboarding.tsx as OnboardingStructured.tsx (backup)
2. Add database columns for raw text
3. Create extract-themes edge function
4. Build new conversational Onboarding component
5. Wire up the API calls and state management

This keeps your beautiful ethereal design while making the experience feel like a warm conversation rather than a form.
