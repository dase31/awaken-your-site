
# Restructured Onboarding: Goals + Connection Intent

Replace the "what gifts do you bring" section with personal goals and add a "hoping to find" screen for a more natural, self-focused journey.

## New Flow

| Step | Question | Purpose |
|------|----------|---------|
| 0 | What should we call you? | Name (unchanged) |
| 1 | What's been on your heart lately? | Emotional context + struggles |
| 2 | Loading: "I hear you..." | AI processing |
| 3 | Theme confirmation | Validate extracted struggles |
| 4 | What are you hoping to work on? | Personal/mental health goals |
| 5 | Loading: "I see what you're reaching for..." | AI processing |
| 6 | Goals confirmation | Validate extracted goals |
| 7 | What kind of connection are you hoping for? | Connection intent |
| 8 | Loading: "Finding what resonates..." | AI processing |
| 9 | Connection confirmation | Validate connection type |

## Why This Works Better

```text
Before: "What gifts do you bring to others?"
→ Feels like a job interview, hard to answer, pressure to sound impressive

After: "What are you hoping to work on in yourself?"
→ Self-focused, feels safe, actionable
→ "I want to be more present" / "I'm trying to manage my anxiety better"

+ "What kind of connection are you hoping for here?"
→ Clarifies expectations, helps with matching
→ "Someone who's been through something similar" / "A calm presence to talk to"
```

## Data Model Changes

### New Database Table: user_goals

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| goal_type | text | Extracted goal category |
| created_at | timestamp | When added |

### New Database Table: user_connection_intents

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| intent_type | text | Type of connection sought |
| created_at | timestamp | When added |

### Updated Profiles Table

| New Column | Purpose |
|------------|---------|
| raw_goals_text | User's original words about their goals |
| raw_connection_text | User's original words about what they're seeking |

(Remove `raw_offering_text` since we're replacing strengths with goals)

## Edge Function Updates

Add two new extraction types to the `extract-themes` function:

### Goals Extraction
```text
Categories:
- presence: Wanting to be more present/mindful
- anxiety_management: Learning to manage anxiety/stress
- connection: Building deeper connections with others
- self_worth: Working on self-esteem/confidence
- boundaries: Setting healthier boundaries
- healing: Processing past experiences/trauma
- purpose: Finding meaning/direction
```

### Connection Intent Extraction
```text
Categories:
- peer: Someone who's been through something similar
- listener: Someone who will just listen without judgment
- guide: Someone with wisdom/experience to share
- accountability: Someone to check in with regularly
- friend: Just someone to talk to casually
```

## UI Flow Details

### Step 4: Goals Screen
```text
"What are you hoping to work on in yourself?"
[Textarea placeholder: "I'm trying to..."]

Subtext: "There's no wrong answer here"
```

### Step 7: Connection Intent Screen
```text
"What kind of connection are you hoping for here?"
[Textarea placeholder: "I'm looking for someone who..."]

Subtext: "This helps us find the right match for you"
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Add `user_goals` and `user_connection_intents` tables |
| Database migration | Alter | Add `raw_goals_text` and `raw_connection_text` to profiles |
| `supabase/functions/extract-themes/index.ts` | Update | Add goals and connection_intent extraction types |
| `src/pages/Onboarding.tsx` | Update | Replace strengths flow with goals + add connection intent flow |
| `src/hooks/useExtractThemes.ts` | Update | Add new type options |

## Matching Benefits

This new structure gives us richer matching data:

```text
User A:
- Struggles: loneliness, anxiety
- Goals: building deeper connections, being more present
- Seeking: peer support (someone who's been through it)

User B:
- Struggles: anxiety, overwhelm
- Goals: anxiety management, boundaries
- Seeking: peer support

Match score: HIGH
- Shared struggle: anxiety
- Compatible goals: both working on anxiety/presence
- Same connection preference: peer support
```

## Implementation Order

1. Create database migrations (new tables + profile columns)
2. Update the edge function with goals and connection_intent prompts
3. Update Onboarding.tsx with new steps (7-9)
4. Update userData state to track new fields
5. Remove old strengths logic, replace with goals

This shifts the entire onboarding from "what can you offer?" to "what do you need?" - much more welcoming and personal.
