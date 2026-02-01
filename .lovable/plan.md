

# Step 2: Conversational Reveal - "What brings you to Thymos?"

## Concept
After entering their name, the user transitions to Step 2 where they see the question "What brings you to Thymos?" followed by options that fade in one by one with staggered timing. This creates an intimate, contemplative feel - as if the app is gently presenting each possibility for the user to consider.

## Visual Flow

```text
[0.0s] Question fades in: "What brings you to Thymos?"

[0.3s] First option appears:  "To be heard"
[0.5s] Second option appears: "To support others"
[0.7s] Third option appears:  "To find purpose"
[0.9s] Fourth option appears: "To connect"
[1.1s] Fifth option appears:  "I'm not sure yet"
```

## Option Styling
- Frosted glass pills (similar to existing input field style)
- White/translucent background with backdrop blur
- Rounded-full shape (pill-like, not rectangular cards)
- Centered text, generous padding
- Hover: subtle scale + gold border glow
- Selected: gold border, slight inward shadow
- Tapping an option auto-advances to next step (no continue button needed)

## Technical Changes

### 1. Update `src/index.css`
Add a new staggered fade-in animation:
```css
@keyframes fadeInUpStagger {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-fade-in {
  opacity: 0;
  animation: fadeInUpStagger 0.5s ease-out forwards;
}
```

### 2. Update `src/pages/Onboarding.tsx`
- Add `currentStep` state (0 = name, 1 = intent)
- Add `userData` state object to store responses
- When name is submitted, transition to step 1
- Step 1 renders the question + staggered options
- Each option is a button with `animation-delay` based on index
- On option click, store selection and (for now) navigate home or log

### State Structure
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [userData, setUserData] = useState({
  name: "",
  intent: ""
});
```

### Step 2 Options
```typescript
const intentOptions = [
  { id: "heard", label: "To be heard" },
  { id: "support", label: "To support others" },
  { id: "purpose", label: "To find purpose" },
  { id: "connect", label: "To connect" },
  { id: "unsure", label: "I'm not sure yet" }
];
```

### Step Transition
- Current content fades out (0.3s)
- New content fades in with the staggered reveal
- Clouds and birds remain static (no re-animation)

## File Changes Summary

| File | Change |
|------|--------|
| `src/index.css` | Add staggered fade-in animation keyframes and utility class |
| `src/pages/Onboarding.tsx` | Add multi-step logic, step 2 with staggered option rendering |

## Result
A peaceful, flowing transition from "What should we call you?" to "What brings you to Thymos?" with options appearing gently one after another - creating an intimate, thoughtful onboarding moment.

