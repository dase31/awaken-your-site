

# Phase 2A: Real-Time Chat/Messaging System

## Overview

Build a complete messaging system — database tables, real-time subscriptions, conversation list, and chat thread UI — all matching the existing sky-gradient glass-card aesthetic.

## Database Changes (2 migrations)

### Migration 1: Tables

```sql
-- Conversations table (links two users)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_two uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_one, user_two)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id
    AND (user_one = _user_id OR user_two = _user_id)
  )
$$;

-- Conversations RLS: participants can read
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_one OR auth.uid() = user_two);

-- Conversations RLS: authenticated users can insert (to start a conversation)
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_one OR auth.uid() = user_two);

-- Messages RLS: only participants can read
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(auth.uid(), conversation_id));

-- Messages RLS: participants can send
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND public.is_conversation_participant(auth.uid(), conversation_id)
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Trigger to update conversation.updated_at on new message
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();
```

## Frontend Components

### 1. Update `src/pages/Chat.tsx` — Conversation List

- Fetch conversations for the current user (join with profiles to get other user's name)
- Show list of conversations as glass cards with:
  - Avatar initial circle + display name
  - Last message preview (truncated)
  - Timestamp (relative: "2m ago", "Yesterday")
- Keep the empty state when no conversations exist
- Tap a conversation → navigate to `/chat/:conversationId`

### 2. New `src/pages/ChatThread.tsx` — Message Thread

- Full-screen chat view within AppShell (hide BottomNav on this page)
- Top bar: back arrow + other user's name
- Scrollable message area with:
  - Sent messages (right-aligned, slightly brighter glass `bg-white/25`)
  - Received messages (left-aligned, standard glass `bg-white/15`)
  - Timestamps between message groups
- Bottom input bar: glass-style input + send button
- Real-time subscription on messages for this conversation
- Auto-scroll to bottom on new messages

### 3. Update `src/App.tsx` — Add route

```
<Route path="/chat/:conversationId" element={<ChatThread />} />
```

### 4. Update `src/components/layout/AppShell.tsx`

- Accept optional `hideNav` prop to hide BottomNav in chat thread view

### 5. New `src/hooks/useConversations.ts`

- Fetch user's conversations with other user's profile info and last message
- Return sorted by `updated_at` descending

### 6. New `src/hooks/useChatMessages.ts`

- Fetch messages for a conversation
- Set up Supabase Realtime subscription for new messages
- Provide `sendMessage` function

## UI Design (matching existing aesthetic)

- All text uses `text-white` / `text-white/70` / `text-white/60` hierarchy
- Glass cards: `bg-white/20 border-white/30 backdrop-blur-sm rounded-2xl`
- Message bubbles: rounded-2xl with tail direction indicating sender
- Input: glass-style `bg-white/15 border-white/20` with white placeholder text
- Send button: `bg-white/25 hover:bg-white/35` with white arrow icon
- Serif font for names, sans-serif for message content

## File Summary

| File | Action |
|------|--------|
| Database migration | Create conversations + messages tables with RLS |
| `src/pages/Chat.tsx` | Rewrite: conversation list with real data |
| `src/pages/ChatThread.tsx` | New: message thread UI |
| `src/hooks/useConversations.ts` | New: fetch & subscribe conversations |
| `src/hooks/useChatMessages.ts` | New: fetch, subscribe, send messages |
| `src/App.tsx` | Add `/chat/:conversationId` route |
| `src/components/layout/AppShell.tsx` | Add `hideNav` prop |

## Estimated Credits: 3-5

