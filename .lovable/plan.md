

# Connect Page — Design and Build Plan

## Purpose

The Connect page is the social hub of Thymos — where users see their existing connections, pending requests, and can find new matches. It should feel like a calm, intentional space (not a social feed), consistent with the sky-gradient glass aesthetic used across Home, Chat, and Reflections.

## Page Structure

```text
┌─────────────────────────────┐
│  "Your Circle"  (serif h1)  │
├─────────────────────────────┤
│                             │
│  ┌─ Pending Requests ─────┐ │
│  │  (collapsible section) │ │
│  │  ConnectionRequestCard  │ │
│  │  ConnectionRequestCard  │ │
│  └────────────────────────┘ │
│                             │
│  ┌─ Your Connections ─────┐ │
│  │  Glass card per person  │ │
│  │  Avatar · Name · Chat → │ │
│  │  Shared tags (subtle)   │ │
│  └────────────────────────┘ │
│                             │
│  ┌─ Find Someone New ─────┐ │
│  │  "Find a match →"       │ │
│  └────────────────────────┘ │
│                             │
│  (empty state if no         │
│   connections at all)       │
└─────────────────────────────┘
```

## Sections

### 1. Pending Requests
- Reuse existing `ConnectionRequestCard` component (accept/reject)
- Only shown when there are pending incoming requests
- Badge count next to section header

### 2. Active Connections
- List of accepted connections as glass cards
- Each card: avatar initial circle, display name (serif), and a "Chat →" action that navigates to the conversation
- Query: fetch accepted connection_requests, join profiles for names, join conversations for quick navigation

### 3. Find Someone New
- Bottom glass card with "Find a match →" — navigates to `/match`
- Provides a gentle call-to-action without being pushy

### 4. Empty State
- When zero connections and zero pending requests
- Gentle serif message: "Your circle is empty" with prompt to find a match

## Technical Details

### New file: `src/pages/Connect.tsx`
- Uses `AppShell` wrapper
- Fetches data via `useConnectionRequests` hook (already has `incoming` and `outgoing`)
- New query for accepted connections: fetch `connection_requests` where status = 'accepted' and current user is sender or receiver, join `profiles` for display names, join `conversations` for conversation IDs
- Extend the existing `useConnectionRequests` hook to also return `accepted` connections with profile info and conversation ID

### Hook update: `src/hooks/useConnectionRequests.ts`
- Add an `accepted` array to the return value containing `{ id, userId, displayName, conversationId }`
- Query accepted requests and match them to conversations

### Route + Nav updates
- `src/App.tsx`: add `<Route path="/connect" element={<Connect />} />`
- `src/components/navigation/BottomNav.tsx`: enable the Connect nav item (set `disabled: false`)

### Files changed
| File | Action |
|------|--------|
| `src/pages/Connect.tsx` | New page |
| `src/hooks/useConnectionRequests.ts` | Add accepted connections with conversation IDs |
| `src/App.tsx` | Add `/connect` route |
| `src/components/navigation/BottomNav.tsx` | Enable Connect tab |

### Estimated credits: 2-3

