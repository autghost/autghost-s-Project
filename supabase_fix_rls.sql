-- ============================================
-- 修复 RLS 策略（解决无限递归问题）
-- 在 Supabase Dashboard -> SQL Editor 中执行
-- ============================================

-- 1. 重建辅助函数（security definer 绕过 RLS，避免递归）
drop function if exists get_user_database_ids() cascade;

create or replace function get_user_database_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select database_id from database_members where user_id = auth.uid();
$$;

-- 2. 清除所有旧策略
drop policy if exists "Users can view own databases" on word_databases;
drop policy if exists "Authenticated users can create databases" on word_databases;
drop policy if exists "Members can update database" on word_databases;
drop policy if exists "Members can view co-members" on database_members;
drop policy if exists "Authenticated users can join databases" on database_members;
drop policy if exists "Members can view words" on words;
drop policy if exists "Members can insert words" on words;
drop policy if exists "Members can update words" on words;
drop policy if exists "Members can delete words" on words;
drop policy if exists "Members can view sessions" on dictation_sessions;
drop policy if exists "Members can insert sessions" on dictation_sessions;

-- 3. word_databases 策略
create policy "Users can view own databases"
  on word_databases for select to authenticated
  using (created_by = auth.uid() or id in (select get_user_database_ids()));

create policy "Authenticated users can create databases"
  on word_databases for insert to authenticated
  with check (created_by = auth.uid());

create policy "Members can update database"
  on word_databases for update to authenticated
  using (created_by = auth.uid() or id in (select get_user_database_ids()));

-- 4. database_members 策略（不自引用，用 security definer 函数）
create policy "Members can view co-members"
  on database_members for select to authenticated
  using (user_id = auth.uid() or database_id in (select get_user_database_ids()));

create policy "Authenticated users can join databases"
  on database_members for insert to authenticated
  with check (user_id = auth.uid());

-- 5. words 策略
create policy "Members can view words"
  on words for select to authenticated
  using (database_id in (select get_user_database_ids()));

create policy "Members can insert words"
  on words for insert to authenticated
  with check (database_id in (select get_user_database_ids()));

create policy "Members can update words"
  on words for update to authenticated
  using (database_id in (select get_user_database_ids()));

create policy "Members can delete words"
  on words for delete to authenticated
  using (database_id in (select get_user_database_ids()));

-- 6. dictation_sessions 策略
create policy "Members can view sessions"
  on dictation_sessions for select to authenticated
  using (database_id in (select get_user_database_ids()));

create policy "Members can insert sessions"
  on dictation_sessions for insert to authenticated
  with check (database_id in (select get_user_database_ids()));
