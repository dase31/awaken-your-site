

# Simple 1-on-1 Matching Flow

A focused, personal matching experience that introduces users to one compatible peer at a time.

## User Experience

After email verification, users see a simple introduction:

```text
┌─────────────────────────────────────┐
│              THYMOS                 │
│                                     │
│     [Name], meet [Match Name]       │
│                                     │
│  "You both are carrying anxiety,    │
│   reaching for inner peace, and     │
│   looking for someone to listen."   │
│                                     │
│        ┌───────────────┐            │
│        │    Connect    │            │
│        └───────────────┘            │
│                                     │
│      Find another connection        │
│                                     │
└─────────────────────────────────────┘
```

## Flow After Auth

| Step | Screen | Description |
|------|--------|-------------|
| AuthCallback | Loading | "Finding someone who gets it..." |
| /match | Match Found | "X, meet Y" with connection sentence |
| /match | Empty State | "You're among the first" (if no matches) |

## Matching Algorithm (Simple v1)

Scores potential matches based on shared tags:

```text
Score = (shared_struggles × 3) + (shared_goals × 2) + (complementary_intents × 2)
```

Returns the top match, and user can request another if they want.

## Connection Sentence Templates

Based on what's shared between users:

| Shared Tags | Sentence Fragment |
|-------------|-------------------|
| Struggles only | "You both are carrying [struggles]" |
| Goals only | "You both are reaching toward [goals]" |
| Intents match | "You're both looking for [intent]" |
| Multiple | Combined: "You both are carrying [struggles], reaching toward [goals], and looking for [intents]" |

## New Files

| File | Purpose |
|------|---------|
| `src/pages/Match.tsx` | Match display page with Connect/Find Another |
| `src/components/matches/MatchIntro.tsx` | "X, meet Y" introduction UI |
| `src/hooks/useFindMatch.ts` | Hook to call matching edge function |
| `supabase/functions/find-match/index.ts` | Server-side matching algorithm |

## Edge Function: `find-match`

```text
Input: { user_id, exclude_ids?: string[] }
Process:
  1. Get current user's struggles, goals, intents
  2. Query other users with overlapping tags
  3. Calculate match scores
  4. Exclude any previously shown matches
  5. Return top match with shared tags
Output: {
  match_user_id: string,
  display_name: string,
  shared_struggles: string[],
  shared_goals: string[],
  shared_intents: string[],
  score: number
} | null
```

## UI Components

### Match Found State
- Heading: "{Name}, meet {MatchName}"
- Subtext: Connection sentence built from shared tags
- Primary button: "Connect" (ghost pill style, matching ThemeTag)
- Secondary link: "Find another connection" (subtle text link)

### Empty State (No Matches)
- Heading: "You're among the first"
- Subtext: "We're building your network. We'll let you know when someone resonates."
- Optional: "Notify me" button for future

### Loading State
- Uses existing `LoadingState` component
- Message: "Finding someone who gets it..."

## Button Styling

Matches the ethereal aesthetic:
- Connect button: `bg-white/20 border border-white/50 text-primary px-8 py-3 rounded-full font-serif text-lg`
- Find another: `text-foreground/50 hover:text-foreground/80 font-serif`

## Updated AuthCallback Flow

After saving onboarding data:
1. Show "Finding someone who gets it..." loading
2. Call `find-match` edge function
3. Navigate to `/match` with match data in state

## Route Changes

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/match` route |
| `src/pages/AuthCallback.tsx` | Navigate to `/match` instead of `/` |

## Security

- RLS policies already protect user data
- Edge function only returns display_name and shared tag labels (no raw text)
- Match scores calculated server-side

## Connect Button Action (Future)

For now, "Connect" could:
- Show a success message ("We'll let {name} know you're interested")
- Store the connection request in a new `connection_requests` table
- Or simply open a chat/messaging flow (Phase 2)

