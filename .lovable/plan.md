

# Add Email Auth Step After Onboarding

Add email authentication as the final step of onboarding, allowing users to create an account and save all their collected data to the database.

## New Flow

| Step | Screen | Current/New |
|------|--------|-------------|
| 0-9 | Existing onboarding flow | Current |
| 10 | Email input screen | **New** |
| 11 | Loading: "Creating your space..." | **New** |
| 12 | Check your email / Success | **New** |

## User Experience

```text
Step 10 - Email Input:
"Last step - let's save your journey"
[Email input field]
"We'll send you a magic link to confirm"

Step 11 - Loading:
"Creating your space..."

Step 12 - Success/Verify:
"Check your email"
"We sent a link to [email] - tap it to complete your profile"
```

## Technical Implementation

### 1. Authentication Flow
- Use Supabase magic link (passwordless) for frictionless signup
- After email submission, call `supabase.auth.signUp()` with the email
- On successful signup, create profile and related records in the database
- Show "check your email" screen while waiting for verification

### 2. Database Operations on Signup
After user signs up, save all collected onboarding data:

```text
1. Create profile record with:
   - id = user.id
   - display_name = userData.name
   - raw_intent_text = userData.intentText
   - raw_goals_text = userData.goalsText
   - raw_connection_text = userData.connectionText

2. Insert user_struggles records for each selectedStruggle

3. Insert user_goals records for each selectedGoal

4. Insert user_connection_intents records for each selectedIntent
```

### 3. New State & Handlers

```text
userData additions:
- email: string

New steps:
- Step 10: Email input
- Step 11: Loading (auth processing)
- Step 12: Success/check email screen

New handlers:
- handleEmailSubmit(): Call supabase.auth.signUp with magic link
- handleSignupSuccess(): Save all onboarding data to database
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Onboarding.tsx` | Update | Add steps 10-12, email state, auth logic, database saving |
| `src/hooks/useOnboardingSubmit.ts` | Create | Hook to handle saving all onboarding data to database |

## UI Design for Step 10

Matches existing ethereal style:
- Same serif font, fade animations
- Simple email input centered on screen
- Subtle subtext explaining the magic link approach
- Same "press enter" hint pattern

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Email already exists | Show "Already have an account? Check your email for a login link" |
| Auth error | Toast error, stay on email step |
| Network failure | Toast error with retry option |
| User closes before verifying | Data not saved - they can re-onboard |

## Security Notes

- RLS policies already exist on all tables requiring `auth.uid() = user_id`
- Profile ID must match the authenticated user's ID
- Data only saved after successful authentication

