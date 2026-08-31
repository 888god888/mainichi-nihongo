-- 每日日本語：Supabase 初始資料庫結構
-- 在 Supabase Dashboard > SQL Editor 中整段執行一次即可。

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  username_key text not null unique,
  current_level text not null default 'N5'
    check (current_level in ('N5', 'N4', 'N3', 'N2', 'N1')),
  created_at timestamptz not null default now()
);

create table if not exists public.daily_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_date date not null,
  lesson_number integer not null,
  completed_words integer[] not null default '{}',
  completed_grammar integer[] not null default '{}',
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_date)
);

alter table public.profiles enable row level security;
alter table public.daily_progress enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "progress_select_own" on public.daily_progress;
create policy "progress_select_own"
on public.daily_progress for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "progress_insert_own" on public.daily_progress;
create policy "progress_insert_own"
on public.daily_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "progress_update_own" on public.daily_progress;
create policy "progress_update_own"
on public.daily_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- 註冊前只回傳「可用／不可用」，不公開其他人的帳號資料。
create or replace function public.is_username_available(p_username_key text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where username_key = p_username_key
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

-- Supabase Auth 建立使用者後，自動產生個人資料；唯一索引會再次防止同名競爭。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, username_key)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'username_key'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant select, update on public.profiles to authenticated;
grant select, insert, update on public.daily_progress to authenticated;

