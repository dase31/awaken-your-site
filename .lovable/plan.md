

# Thymos Backend Setup: Onboarding Data Storage

Set up Supabase backend to store user onboarding data (name, intent, struggles, strengths) for the matching algorithm.

## Overview

We need to store the onboarding selections users make so we can later match people who need support with those who can provide it. For example, someone struggling with loneliness who listens deeply could be matched with someone who feels unheard.

## Database Design

### Tables

**1. profiles** - Core user data
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Links to auth.users |
| display_name | text | What they want to be called |
| intent | text | Why they're here (heard/support/purpose/connect/unsure) |
| created_at | timestamp | When they joined |
| updated_at | timestamp | Last profile update |

**2. user_struggles** - What weighs on them (many-to-many)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Row identifier |
| user_id | uuid (FK) | Links to profiles |
| struggle_type | text | anxiety/loneliness/grief/direction/unheard/doubt |

**3. user_strengths** - What they bring (many-to-many)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Row identifier |
| user_id | uuid (FK) | Links to profiles |
| strength_type | text | listener/calm/experienced/questions/space/share |

### Why Separate Tables?

Users can select multiple struggles and strengths. Storing these in separate tables (rather than arrays) makes matching queries much more efficient:
```text
Find users who have strength "listener" 
AND whose struggles include "loneliness"
→ Simple JOIN query
```

## Security (RLS Policies)

- Users can only read/update their own profile
- Users can only manage their own struggles/strengths
- No public access to any data

## Implementation Steps

### Step 1: Enable Supabase
Connect the project to Supabase (Lovable Cloud preferred for simplicity).

### Step 2: Create Database Schema
Run migration to create the three tables with proper foreign keys and RLS policies.

### Step 3: Create Supabase Client
Add `src/integrations/supabase/client.ts` for database operations.

### Step 4: Add Types
Create TypeScript types for the onboarding data.

### Step 5: Update Onboarding Flow
Modify `handleStrengthsNext` to save data to Supabase before navigating.

## Technical Details

### Migration SQL

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User struggles (multi-select)
CREATE TABLE user_struggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  struggle_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, struggle_type)
);

-- User strengths (multi-select)
CREATE TABLE user_strengths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  strength_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strength_type)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_struggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strengths ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Similar policies for struggles and strengths tables
```

### Onboarding Save Function

```typescript
const saveOnboardingData = async (userData: OnboardingData, userId: string) => {
  // 1. Upsert profile
  await supabase.from('profiles').upsert({
    id: userId,
    display_name: userData.name,
    intent: userData.intent,
  });

  // 2. Insert struggles
  await supabase.from('user_struggles').insert(
    userData.struggles.map(s => ({ user_id: userId, struggle_type: s }))
  );

  // 3. Insert strengths
  await supabase.from('user_strengths').insert(
    userData.strengths.map(s => ({ user_id: userId, strength_type: s }))
  );
};
```

## File Changes Summary

| File | Change |
|------|--------|
| Supabase Migration | Create profiles, user_struggles, user_strengths tables with RLS |
| `src/integrations/supabase/client.ts` | Supabase client setup (auto-generated) |
| `src/integrations/supabase/types.ts` | TypeScript types (auto-generated) |
| `src/pages/Onboarding.tsx` | Add save function, call on completion |

## Auth Consideration

Since we discussed adding email collection after the strengths step, we have two approaches:

**Option A: Anonymous first, convert later**
- Let users complete onboarding without auth
- Store data temporarily (localStorage or anonymous session)
- Convert to full account when they provide email

**Option B: Auth before save**
- Add email step after strengths
- Create account, then save all data
- Cleaner data model, no temporary storage

I recommend **Option B** since you mentioned adding email collection. We can add that step to the onboarding flow and save everything once they're authenticated.

## Next Steps After This

1. Add email collection step (Step 4) to onboarding
2. Implement auth (sign up with email)
3. Build the matching algorithm using the stored data

