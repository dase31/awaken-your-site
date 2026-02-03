

# Mobile App Navigation and Home Page Design

Add "I'll connect later" option to the match flow, create a mobile-first app shell with bottom navigation, and design the Home and Chat pages.

## Part 1: Match Page Updates

Add "I'll connect later" option that navigates to the authenticated home experience.

| Current State | New State |
|---------------|-----------|
| Connect button | Connect button |
| Find another connection | Find another connection |
| (none) | "I'll connect later" link |

The "I'll connect later" and empty state will both navigate to `/home` (the authenticated app experience).

## Part 2: Mobile App Shell Architecture

Create a dedicated app shell for authenticated users with bottom navigation.

```text
+----------------------------------+
|            THYMOS                |  <- ThymosLogo (top)
|                                  |
|                                  |
|         [Page Content]           |  <- Scrollable content area
|                                  |
|                                  |
|                                  |
+----------------------------------+
|  Home   Chat   Connect   Telos   |  <- Bottom nav (fixed)
+----------------------------------+
```

### Navigation Tabs

| Tab | Icon | Route | Status |
|-----|------|-------|--------|
| Home | Home icon | /home | To build now |
| Chat | MessageCircle icon | /chat | To build now (placeholder) |
| Connect | Users icon | /connect | Future |
| Telos | Target/Compass icon | /telos | Future |

### Component Structure

```text
src/
  components/
    navigation/
      BottomNav.tsx        <- Fixed bottom navigation bar
      NavItem.tsx          <- Individual nav item with icon + label
    layout/
      AppShell.tsx         <- Wrapper with logo + bottom nav
  pages/
    Home.tsx               <- Authenticated home dashboard
    Chat.tsx               <- Conversations list
    Connect.tsx            <- Future: connections page
    Telos.tsx              <- Future: purpose/goals page
```

## Part 3: Home Page Design

The home page for authenticated users - a calm, personalized dashboard.

```text
+----------------------------------+
|            THYMOS                |
+----------------------------------+
|                                  |
|     Welcome back, [Name]         |
|                                  |
|  +----------------------------+  |
|  |  Today's Reflection        |  |  <- Daily prompt card
|  |  "What's weighing on you?" |  |
|  |  [Tap to reflect]          |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |  Your Connections          |  |  <- Pending matches card
|  |  [Avatar] Sarah wants to   |  |
|  |  connect with you          |  |
|  |  [View] [Later]            |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |  Find Support              |  |  <- Quick action card
|  |  Connect with someone who  |  |
|  |  understands               |  |
|  |  [Find a match]            |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
| Home   Chat   Connect   Telos    |
+----------------------------------+
```

### Home Page Cards

| Card | Purpose | Content |
|------|---------|---------|
| Welcome Header | Personalized greeting | "Welcome back, [Name]" with time-based greeting |
| Daily Reflection | Encourage engagement | Rotating prompts, tap to journal (future) |
| Pending Connections | Show match requests | List of users who want to connect |
| Find Support | Quick match action | Navigate to /match page |

Card styling: Frosted glass aesthetic (`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl`)

## Part 4: Chat Page Design (Placeholder)

Initial chat page showing conversations list (functional messaging comes later).

```text
+----------------------------------+
|            THYMOS                |
+----------------------------------+
|  Messages                        |
|                                  |
|  +----------------------------+  |
|  |  [Avatar] Sarah            |  |
|  |  Last message preview...   |  |
|  |  2 min ago                 |  |
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  |  [Avatar] Marcus           |  |
|  |  Last message preview...   |  |
|  |  Yesterday                 |  |
|  +----------------------------+  |
|                                  |
|  - - - - - - - - - - - - - - -  |
|  No conversations yet?          |
|  [Find a connection]            |
|  - - - - - - - - - - - - - - -  |
|                                  |
+----------------------------------+
| Home   Chat   Connect   Telos    |
+----------------------------------+
```

For now, this will show an empty state encouraging users to find connections.

## Part 5: Bottom Navigation Styling

Matches the ethereal aesthetic while being functional for mobile.

```text
Styling:
- Fixed to bottom: fixed bottom-0 left-0 right-0
- Background: bg-white/10 backdrop-blur-md border-t border-white/20
- Safe area padding: pb-safe (for iPhone notch)
- Height: h-16 (64px) plus safe area
- Icons: 24px, subtle opacity until active
- Active state: text-primary (gold), icon filled
- Inactive state: text-foreground/50
```

## Technical Implementation

### New Files

| File | Purpose |
|------|---------|
| `src/components/navigation/BottomNav.tsx` | Bottom navigation component |
| `src/components/layout/AppShell.tsx` | App wrapper with nav |
| `src/pages/Home.tsx` | Authenticated home dashboard |
| `src/pages/Chat.tsx` | Chat/messages list |

### Updated Files

| File | Change |
|------|--------|
| `src/components/matches/MatchIntro.tsx` | Add "I'll connect later" option |
| `src/components/matches/EmptyMatchState.tsx` | Add button to go to Home |
| `src/pages/Match.tsx` | Handle "connect later" navigation |
| `src/App.tsx` | Add /home and /chat routes |

### Route Structure After Changes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Index | Public landing page (marketing) |
| `/onboarding` | Onboarding | User registration flow |
| `/auth/callback` | AuthCallback | Email verification handler |
| `/match` | Match | Post-onboarding match introduction |
| `/home` | Home | Authenticated dashboard (new) |
| `/chat` | Chat | Messages/conversations (new) |
| `/connect` | Connect | Future: connections management |
| `/telos` | Telos | Future: purpose/goals tracking |

## Safe Area Handling for Mobile

Add CSS for iPhone safe areas:

```css
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

## Authentication Guard

Pages under the authenticated shell (/home, /chat, etc.) should check for session and redirect to /onboarding if not authenticated.

