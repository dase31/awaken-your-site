

# Home Page UI/UX Improvements

Address contrast, hierarchy, and legibility issues across the Home page and bottom navigation.

## Problem Summary

| Issue | Current | Impact |
|-------|---------|--------|
| Yellow heading | `text-primary` (gold) on sky blue | Unreadable, low contrast |
| Grey text | `text-foreground/50-70` | Too faded, hard to read |
| Bottom nav | White at 50% on light glass | Nearly invisible |
| Cards | 10% white opacity | Don't stand out enough |
| CTAs | Same style as regular text | No visual hierarchy |

## Solution Overview

```text
Before:                          After:
+------------------------+       +------------------------+
| Good evening, (YELLOW) |       | Good evening, (WHITE)  |
| ┌──────────────────┐   |       | ┌──────────────────┐   |
| │ (faded text)     │   |       | │ (crisp white)    │   |
| │ (grey subtext)   │   |       | │ (soft cream)     │   |
| └──────────────────┘   |       | └──────────────────┘   |
| (invisible nav)        |       | (solid visible nav)    |
+------------------------+       +------------------------+
```

## Color Token Changes

### New CSS Variables (index.css)

Add dedicated text colors for the app shell context:

| Token | Value | Purpose |
|-------|-------|---------|
| `--text-on-sky` | Pure white `0 0% 100%` | Primary text on sky gradient |
| `--text-on-sky-muted` | Cream `45 20% 90%` | Secondary text, warm not grey |
| `--text-on-sky-subtle` | `200 30% 85%` | Tertiary info, soft blue-white |
| `--nav-bg` | `200 50% 35%` | Darker, more solid nav background |

## Component Changes

### 1. Home.tsx - Greeting Header

| Before | After |
|--------|-------|
| `text-foreground` (gold on white variable) | `text-white` with proper shadow |

```text
"Good evening, Name"
- Color: Pure white
- Text shadow: 0 2px 8px rgba(0,0,0,0.25) for depth
- Font size: Keep 2xl/3xl
```

### 2. Home.tsx - Card Updates

#### Card Container (GlassCard)
| Before | After |
|--------|-------|
| `bg-white/10` | `bg-white/20` |
| `border-white/20` | `border-white/30` |
| No shadow | Add `shadow-lg shadow-black/5` |

#### Card Headers ("TODAY'S REFLECTION")
| Before | After |
|--------|-------|
| `text-foreground/90` (white at 90%) | `text-white/80` with font-medium |

#### Card Body Text (quotes, descriptions)
| Before | After |
|--------|-------|
| `text-foreground` | `text-white` |
| `text-foreground/70` | `text-white/70` |

#### Card Secondary Text (hints, helper text)
| Before | After |
|--------|-------|
| `text-foreground/50` (barely visible) | `text-white/60` |

#### Card CTAs ("Tap to reflect →", "Find a match →")
| Before | After |
|--------|-------|
| `text-foreground/60` and `text-primary` | Both use `text-white font-medium` with hover effect |

### 3. BottomNav.tsx - Navigation Bar

#### Nav Container
| Before | After |
|--------|-------|
| `bg-white/10` | `bg-sky-end/80` or `bg-[hsl(200,75%,35%)]/90` |
| `border-white/20` | `border-white/10` |
| `backdrop-blur-md` | Keep blur for softness |

This uses a darker shade of the sky gradient bottom color, creating visual grounding.

#### Nav Items - Active State
| Before | After |
|--------|-------|
| `text-primary` (gold) | `text-white` (crisp white) |

#### Nav Items - Inactive State
| Before | After |
|--------|-------|
| `text-foreground/50` (invisible) | `text-white/60` (visible but muted) |

#### Nav Items - Disabled State
| Before | After |
|--------|-------|
| `opacity-30` | `text-white/30` (slightly more visible) |

## Visual Hierarchy After Changes

```text
+----------------------------------+
|            THYMOS                |  <- White, subtle glow
|                                  |
|    Good evening, Sarah           |  <- Pure white, bold, shadowed
|                                  |
|  +----------------------------+  |
|  | TODAY'S REFLECTION         |  |  <- White/80, uppercase, medium
|  | "What are you grateful     |  |  <- White, italic, shadowed  
|  |  for?"                     |  |
|  | Tap to reflect →           |  |  <- White/70, medium weight
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |  <- Cards: 20% white, visible border
|  | YOUR CONNECTIONS           |  |
|  | No pending connections     |  |  <- White/70
|  | When someone wants...      |  |  <- White/60
|  +----------------------------+  |
|                                  |
|  +----------------------------+  |
|  | FIND SUPPORT               |  |
|  | Connect with someone...    |  |
|  | Find a match →             |  |  <- White, medium, underline on hover
|  +----------------------------+  |
|                                  |
+----------------------------------+
| ⌂ Home  💬 Chat  👥 Connect  🎯 |  <- Darker bg, white icons
+----------------------------------+
     ↑ active        ↑ inactive/disabled
   (white)          (white/60 or /30)
```

## File Changes Summary

| File | Changes |
|------|---------|
| `src/pages/Home.tsx` | Update all color classes for cards and text |
| `src/components/navigation/BottomNav.tsx` | Darker background, better icon contrast |
| `src/index.css` | (Optional) Add helper classes for text-on-sky |

## Technical Implementation

### Home.tsx Updates

```text
GlassCard changes:
- className: "bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-lg shadow-black/5"

Greeting:
- className: "font-serif text-white text-2xl md:text-3xl"

Card headers:
- className: "text-white/80 text-sm uppercase tracking-wide mb-3 font-medium"

Card body:
- className: "text-white text-lg" (primary)
- className: "text-white/70 text-base" (secondary)
- className: "text-white/60 text-sm" (tertiary)

CTAs:
- className: "text-white/80 hover:text-white font-medium text-sm transition-colors"
```

### BottomNav.tsx Updates

```text
Nav container:
- className: "fixed bottom-0 left-0 right-0 z-50 bg-[hsl(200,60%,35%)]/90 backdrop-blur-md border-t border-white/10 pb-safe"

Active item:
- className: "text-white"

Inactive item:
- className: "text-white/60 hover:text-white/80"

Disabled item:
- className: "text-white/30 cursor-not-allowed"
```

## Accessibility Considerations

| Element | Contrast Ratio Target |
|---------|----------------------|
| Primary text (white on cards) | 4.5:1 or higher |
| Secondary text (white/70) | 3:1 minimum |
| Interactive elements | 4.5:1 with focus states |

## Result

After these changes:
- All text will be legible against the sky gradient and glass cards
- Bottom navigation will be clearly visible and usable
- Visual hierarchy will guide users to primary actions
- Gold color reserved only for special emphasis (if needed later)
- Consistent warm/neutral palette instead of cold greys

