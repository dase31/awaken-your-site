
# Ethereal Input: Typing Into the Sky

Transform the name input from a boxed form field into an immersive, borderless experience where the user's name appears to float in the sky itself.

## The Vision

Instead of:
- White box with border
- Yellow "Continue" button

We get:
- Invisible input field - just white serif text appearing in the sky
- Blinking cursor that feels like a gentle heartbeat
- Subtle "press enter" hint that fades in after a moment
- No button at all - Enter key advances naturally

## Visual Design

```text
+--------------------------------------------------+
|   [cloud]                            [bird]      |
|                                                  |
|                                                  |
|         "What should we call you?"               |
|              (white serif text)                  |
|                                                  |
|                  Sarah|                          |
|           (white text, blinking cursor)          |
|                                                  |
|              press enter ↵                       |
|         (faded hint, appears after 2s)           |
|                                                  |
|  [cloud]                             [cloud]     |
+--------------------------------------------------+
```

## Input Styling Details
- No background, no border, no shadow
- White text with subtle text-shadow for legibility against sky
- Libre Baskerville (serif) font to match the question
- Larger text size (text-2xl or text-3xl)
- Custom blinking cursor via CSS animation
- Placeholder in white with lower opacity

## Enter Hint Details
- Small, subtle text below the input
- Fades in after 2 seconds of the page loading
- Very low opacity (40-50%) so it doesn't distract
- Disappears once user starts typing (optional)

## Technical Changes

### 1. Update `src/pages/Onboarding.tsx`
- Remove the Button import (no longer needed for step 0)
- Replace the styled Input with a transparent one
- Add the "press enter" hint with delayed fade-in
- Keep the existing Enter key handler (already works)

### 2. Update `src/index.css`
- Add a custom blinking cursor animation
- Add a delayed fade-in class for the hint

## CSS Additions

```css
/* Blinking cursor effect */
.ethereal-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.ethereal-input:focus {
  outline: none;
  caret-color: white;
}

/* Delayed hint fade-in */
.hint-fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease-out 2s forwards;
}

@keyframes fadeIn {
  to { opacity: 0.5; }
}
```

## Input Styling

```tsx
<input
  type="text"
  placeholder="Your name"
  value={userData.name}
  onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
  onKeyDown={handleNameKeyDown}
  className="bg-transparent border-none text-foreground text-2xl md:text-3xl 
             font-serif text-center w-full focus:outline-none 
             placeholder:text-foreground/40"
  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
  autoFocus
/>
```

## File Changes Summary

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Replace boxed input with ethereal transparent input, remove Button, add "press enter" hint |
| `src/index.css` | Add hint-fade-in animation for delayed appearance |

## Result
A serene, immersive experience where the user types their name directly into the sky - no boxes, no buttons, just them and the question. The gentle "press enter" hint appears after a moment if they need guidance, but the focus is entirely on the peaceful, open feeling of the interface.
