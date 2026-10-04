CREATE TABLE public.builder_chat_history (
  draft_id uuid PRIMARY KEY REFERENCES public.builder_drafts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_chat_history TO authenticated;
GRANT ALL ON public.builder_chat_history TO service_role;
ALTER TABLE public.builder_chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat select" ON public.builder_chat_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own chat insert" ON public.builder_chat_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.builder_drafts d WHERE d.id = draft_id AND d.user_id = auth.uid()));
CREATE POLICY "own chat update" ON public.builder_chat_history FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own chat delete" ON public.builder_chat_history FOR DELETE TO authenticated USING (user_id = auth.uid());