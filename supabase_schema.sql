-- 听写助手 Supabase 数据库建表脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行

-- 单词数据库表
create table if not exists word_databases (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete cascade not null,
  invite_code varchar(6),
  invite_code_expires timestamptz,
  created_at timestamptz default now() not null
);

-- 数据库成员绑定表
create table if not exists database_members (
  id uuid primary key default gen_random_uuid(),
  database_id uuid references word_databases(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now() not null,
  unique(database_id, user_id)
);

-- 单词/短语表
create table if not exists words (
  id uuid primary key default gen_random_uuid(),
  database_id uuid references word_databases(id) on delete cascade not null,
  content text not null,
  is_phrase boolean default false not null,
  created_at timestamptz default now() not null,
  total_dictation_count integer default 0 not null,
  correct_count integer default 0 not null,
  last_dictation_date date,
  last_dictation_correct boolean,
  deleted_at timestamptz
);

-- 听写会话记录表
create table if not exists dictation_sessions (
  id uuid primary key default gen_random_uuid(),
  database_id uuid references word_databases(id) on delete cascade not null,
  session_date date default current_date not null,
  total_words integer default 0 not null,
  correct_words integer default 0 not null,
  created_at timestamptz default now() not null
);

-- 索引
create index if not exists idx_words_database_id on words(database_id);
create index if not exists idx_words_deleted_at on words(deleted_at);
create index if not exists idx_database_members_user on database_members(user_id);
create index if not exists idx_database_members_db on database_members(database_id);
create index if not exists idx_sessions_database_date on dictation_sessions(database_id, session_date);

-- Row Level Security (RLS)
alter table word_databases enable row level security;
alter table database_members enable row level security;
alter table words enable row level security;
alter table dictation_sessions enable row level security;

-- 辅助函数：获取用户绑定的数据库ID列表
create or replace function get_user_database_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select database_id from database_members where user_id = auth.uid();
$$;

-- word_databases 策略
create policy "Users can view own databases"
  on word_databases for select
  using (id in (select get_user_database_ids()));

create policy "Authenticated users can create databases"
  on word_databases for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Members can update database"
  on word_databases for update
  using (id in (select get_user_database_ids()));

-- database_members 策略
create policy "Members can view co-members"
  on database_members for select
  using (database_id in (select get_user_database_ids()));

create policy "Authenticated users can join databases"
  on database_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- words 策略
create policy "Members can view words"
  on words for select
  using (database_id in (select get_user_database_ids()));

create policy "Members can insert words"
  on words for insert
  to authenticated
  with check (database_id in (select get_user_database_ids()));

create policy "Members can update words"
  on words for update
  using (database_id in (select get_user_database_ids()));

create policy "Members can delete words"
  on words for delete
  using (database_id in (select get_user_database_ids()));

-- dictation_sessions 策略
create policy "Members can view sessions"
  on dictation_sessions for select
  using (database_id in (select get_user_database_ids()));

create policy "Members can insert sessions"
  on dictation_sessions for insert
  to authenticated
  with check (database_id in (select get_user_database_ids()));

-- 定时清理回收站（需要启用 pg_cron 扩展）
-- 在 Supabase Dashboard -> Database -> Extensions 中启用 pg_cron 后执行：
-- select cron.schedule(
--   'cleanup-recycle-bin',
--   '0 3 * * *',
--   $$delete from words where deleted_at is not null and deleted_at < now() - interval '7 days'$$
-- );
