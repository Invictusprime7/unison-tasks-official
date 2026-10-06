-- Durable AI Builder chat history, scoped to the owning builder draft.
-- The browser only needs its own messages; snapshots stay in the lightweight
-- builder_drafts metadata mirror so full before/after VFS maps are never sent
-- through the REST table.
CREATE TABLE IF NOT EXISTS public.builder_chat_history (
  draft_id uuid PRIMARY KEY REFERENCES public.builder_drafts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT builder_chat_history_messages_array CHECK (jsonb_typeof(messages) = 'array')
);

ALTER TABLE public.builder_chat_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.builder_chat_history FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.builder_chat_history TO authenticated;

DROP POLICY IF EXISTS "Users manage their own builder chat history" ON public.builder_chat_history;
CREATE POLICY "Users manage their own builder chat history"
  ON public.builder_chat_history
  FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (
    user_id = (select auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.builder_drafts AS draft
      WHERE draft.id = draft_id
        AND draft.user_id = (select auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_builder_chat_history_user_updated
  ON public.builder_chat_history (user_id, updated_at DESC);
