
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

-- Conversations RLS: authenticated users can insert
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
