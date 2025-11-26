-- Create conversations table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  mode text not null check (mode in ('code', 'design', 'review')),
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Conversations policies
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Chat messages policies
create policy "Users can view messages in their conversations"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = chat_messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = chat_messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in their conversations"
  on public.chat_messages for delete
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = chat_messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index conversations_user_id_idx on public.conversations(user_id);
create index conversations_mode_idx on public.conversations(mode);
create index chat_messages_conversation_id_idx on public.chat_messages(conversation_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at);

-- Create trigger for conversations updated_at
create trigger on_conversations_updated
  before update on public.conversations
  for each row
  execute procedure public.handle_updated_at();
