-- Supabase 初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中运行。
-- 当前站点使用轻量口令做访问入口；下面策略为了前端可直接读取和保存，允许 anon 读写。
-- 如果以后要更强安全性，建议改为 Supabase Auth 或 Edge Function 校验后写入。

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id text primary key,
  slug text not null unique,
  date text not null,
  city text,
  time text,
  place text not null,
  weather text,
  music text,
  meta text not null,
  title text not null,
  image text not null,
  text text not null,
  detail_text text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.albums (
  id text primary key,
  src text not null,
  title text not null,
  date text not null,
  place text not null,
  note text not null,
  ratio text not null default '3/4',
  live boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.diary (
  id text primary key,
  by text not null,
  text text not null,
  date text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id text primary key,
  city text not null,
  x numeric not null default 50,
  y numeric not null default 50,
  caption text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.anniversaries (
  id text primary key,
  title text not null,
  date text not null,
  note text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 生活片段独立表，后台新增/编辑后所有设备同步。
create table if not exists public.life_fragments (
  id text primary key,
  time text not null,
  place text not null,
  text text not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 愿望清单独立表，包含完成状态。
create table if not exists public.wishes (
  id text primary key,
  text text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.stories enable row level security;
alter table public.albums enable row level security;
alter table public.diary enable row level security;
alter table public.cities enable row level security;
alter table public.anniversaries enable row level security;
alter table public.life_fragments enable row level security;
alter table public.wishes enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings',
    'stories',
    'albums',
    'diary',
    'cities',
    'anniversaries',
    'life_fragments',
    'wishes'
  ]
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "public write %1$s" on public.%1$I', table_name);
    execute format('create policy "public read %1$s" on public.%1$I for select using (true)', table_name);
    execute format('create policy "public write %1$s" on public.%1$I for all using (true) with check (true)', table_name);
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read site media" on storage.objects;
drop policy if exists "public write site media" on storage.objects;

create policy "public read site media"
on storage.objects for select
using (bucket_id = 'site-media');

create policy "public write site media"
on storage.objects for all
using (bucket_id = 'site-media')
with check (bucket_id = 'site-media');
