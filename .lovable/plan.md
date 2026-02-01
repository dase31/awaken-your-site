
# Ghost Pill Outlines for Step 2 Options

Add barely-visible pill-shaped outlines around the floating text options to provide touch target clarity while maintaining the ethereal aesthetic.

## The Vision

The options will have:
- Very faint white border (10% opacity) that's almost invisible
- Rounded pill shape to define the clickable area
- Border brightens to ~30% opacity on hover
- Keeps the floating text aesthetic but signals "this is tappable"
- Better mobile UX with clear touch targets

## Visual Design

```text
Default state:
┌─────────────────────────────────┐  <- barely visible border (10% white)
│         To be heard             │
└─────────────────────────────────┘

Hover state:
┌─────────────────────────────────┐  <- slightly brighter (30% white)
│         To be heard             │  <- text turns gold
└─────────────────────────────────┘
```

## Styling Details

- Border: `border border-white/10` (nearly invisible)
- Hover border: `hover:border-white/30` (subtle brightening)
- Padding: `py-4 px-8` for comfortable touch targets
- Border radius: `rounded-full` for pill shape
- Keep existing: text shadow, gold hover, scale effect

## Technical Changes

### Update `src/pages/Onboarding.tsx`

Modify the button className to add:
- `border border-white/10` - faint outline at rest
- `hover:border-white/30` - slightly brighter on hover  
- `py-4 px-8` - padding for touch targets
- `rounded-full` - pill shape

## Updated Button Code

```tsx
<button
  key={option.id}
  onClick={() => handleIntentSelect(option.id)}
  className="stagger-fade-in block w-full text-foreground font-serif text-xl md:text-2xl 
             py-4 px-8 rounded-full
             border border-white/10 hover:border-white/30
             transition-all duration-300 
             hover:text-primary hover:scale-[1.02] 
             focus:outline-none focus:text-primary"
  style={{ 
    animationDelay: `${0.3 + index * 0.15}s`,
    textShadow: '0 2px 10px rgba(0,0,0,0.15)'
  }}
>
  {option.label}
</button>
```

## File Changes Summary

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Add ghost pill border styling to intent option buttons |

## Result

The options will have the subtlest possible visual container - just enough to hint "this is clickable" without breaking the serene, floating-in-the-sky aesthetic. On mobile, users will have clear touch targets. On desktop, the border gently brightens on hover alongside the gold text effect.
