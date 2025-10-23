-- Secure ai_learning_sessions with user scoping and proper RLS
-- 1) Add user_id column if missing
ALTER TABLE public.ai_learning_sessions
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2) Enable RLS
ALTER TABLE public.ai_learning_sessions ENABLE ROW LEVEL SECURITY;

-- 3) Drop overly-permissive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ai_learning_sessions' 
      AND policyname = 'Anyone can view learning sessions'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view learning sessions" ON public.ai_learning_sessions';
  END IF;
END $$;

-- 4) Create owner-based policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ai_learning_sessions' AND policyname = 'Users can view own sessions'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own sessions" ON public.ai_learning_sessions FOR SELECT USING (auth.uid() = user_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'ai_learning_sessions' AND policyname = 'Users can insert own sessions'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own sessions" ON public.ai_learning_sessions FOR INSERT WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- 5) Helpful index
CREATE INDEX IF NOT EXISTS ai_learning_sessions_user_id_idx ON public.ai_learning_sessions(user_id);
