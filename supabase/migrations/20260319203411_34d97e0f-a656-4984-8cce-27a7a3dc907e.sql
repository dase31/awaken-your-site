
-- Connection requests table
CREATE TABLE public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

-- Sender and receiver can view their requests
CREATE POLICY "Users can view own connection requests"
  ON public.connection_requests FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Authenticated users can send requests
CREATE POLICY "Users can send connection requests"
  ON public.connection_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Receiver can update status (accept/reject)
CREATE POLICY "Receiver can update request status"
  ON public.connection_requests FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Reflections table
CREATE TABLE public.reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON public.reflections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reflections"
  ON public.reflections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON public.reflections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
