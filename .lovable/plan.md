

# Onboarding Steps 2 & 3: Struggles and Strengths

Build two new multi-select screens that gather meaningful data for matching users as supporters and seekers.

## The Flow

```text
Step 0: Name         → "What should we call you?"
Step 1: Intent       → "What brings you to Thymos?" (single select)
Step 2: Struggles    → "What weighs on you?" (multi-select)
Step 3: Strengths    → "What do you bring?" (multi-select)
→ Navigate home (profile tailoring happens later in-app)
```

## Screen Designs

### Step 2: Struggles
**Question:** "What weighs on you?"

Options (multi-select with ghost pills):
- Anxiety or worry
- Loneliness
- Loss or grief  
- Finding direction
- Feeling unheard
- Self-doubt

### Step 3: Strengths  
**Question:** "What do you bring?"

Options (multi-select with ghost pills):
- I listen deeply
- I stay calm in storms
- I've walked through darkness
- I ask good questions
- I hold space without judgment
- I share from experience

## Multi-Select UX

- Pills toggle on/off when tapped
- Selected state: `bg-white/10 border-white/40` (subtle fill + brighter border)
- Unselected state: `border-white/10` (current ghost pill style)
- Continue button appears after at least 1 selection
- Smooth transition between steps

## Technical Changes

### 1. Add option arrays

```tsx
const struggleOptions = [
  { id: "anxiety", label: "Anxiety or worry" },
  { id: "loneliness", label: "Loneliness" },
  { id: "grief", label: "Loss or grief" },
  { id: "direction", label: "Finding direction" },
  { id: "unheard", label: "Feeling unheard" },
  { id: "doubt", label: "Self-doubt" },
];

const strengthOptions = [
  { id: "listener", label: "I listen deeply" },
  { id: "calm", label: "I stay calm in storms" },
  { id: "experienced", label: "I've walked through darkness" },
  { id: "questions", label: "I ask good questions" },
  { id: "space", label: "I hold space without judgment" },
  { id: "share", label: "I share from experience" },
];
```

### 2. Update userData state

```tsx
const [userData, setUserData] = useState({
  name: "",
  intent: "",
  struggles: [] as string[],
  strengths: [] as string[],
});
```

### 3. Add handler functions

```tsx
const handleIntentSelect = (intentId: string) => {
  setUserData((prev) => ({ ...prev, intent: intentId }));
  setIsTransitioning(true);
  setTimeout(() => {
    setCurrentStep(2);
    setIsTransitioning(false);
  }, 300);
};

const toggleStruggle = (id: string) => {
  setUserData((prev) => ({
    ...prev,
    struggles: prev.struggles.includes(id)
      ? prev.struggles.filter((s) => s !== id)
      : [...prev.struggles, id],
  }));
};

const toggleStrength = (id: string) => {
  setUserData((prev) => ({
    ...prev,
    strengths: prev.strengths.includes(id)
      ? prev.strengths.filter((s) => s !== id)
      : [...prev.strengths, id],
  }));
};

const handleStrugglesNext = () => {
  if (userData.struggles.length > 0) {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(3);
      setIsTransitioning(false);
    }, 300);
  }
};

const handleStrengthsNext = () => {
  if (userData.strengths.length > 0) {
    console.log("User data:", userData);
    navigate("/");
  }
};
```

### 4. Add Step 2 UI (Struggles)

Multi-select pills with toggle behavior and a continue button that appears when at least one option is selected.

### 5. Add Step 3 UI (Strengths)

Same pattern as Step 2, but with strength options. On completion, logs user data and navigates home.

## Styling for Multi-Select Pills

```tsx
// Toggle pill styling
className={`stagger-fade-in block w-full text-foreground font-serif text-xl md:text-2xl 
  py-4 px-8 rounded-full border transition-all duration-300 
  hover:scale-[1.02] focus:outline-none
  ${isSelected 
    ? "bg-white/10 border-white/40 text-primary" 
    : "border-white/10 hover:border-white/30"
  }`}
```

## Continue Button

```tsx
{userData.struggles.length > 0 && (
  <button
    onClick={handleStrugglesNext}
    className="stagger-fade-in mt-8 text-foreground/70 font-serif text-lg 
               hover:text-primary transition-all duration-300"
    style={{ animationDelay: "0.8s" }}
  >
    Continue →
  </button>
)}
```

## File Changes Summary

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Add struggleOptions and strengthOptions arrays, update userData state to include struggles[] and strengths[], add toggle handlers and navigation functions, add Step 2 and Step 3 UI components with multi-select ghost pills |

## Result

Users will:
1. Enter name → Enter
2. Select intent → Tap one option → Advances automatically
3. Select struggles → Tap multiple → Continue button → Advances
4. Select strengths → Tap multiple → Continue → Navigates home

This gives us rich data for matching: someone struggling with loneliness who listens deeply can be matched with someone who feels unheard. Profile refinement happens later in the app as you mentioned.

