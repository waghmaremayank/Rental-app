-- ============================================================
-- GoRental Supabase Database Setup  (safe to re-run)
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. ITEMS TABLE
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  description text not null,
  price_per_day numeric not null check (price_per_day > 0),
  category text not null,
  images text[] default '{}',
  location text not null,
  latitude float,
  longitude float,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_available boolean default true,
  specs jsonb
);

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  full_name text,
  avatar_url text,
  bio text,
  location text,
  phone text
);

-- 3. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  item_id uuid not null references public.items(id) on delete cascade,
  renter_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'active', 'completed', 'cancelled'))
);

-- 4. ENABLE ROW LEVEL SECURITY
alter table public.items enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;

-- 5. DROP EXISTING POLICIES (safe even if they don't exist)
drop policy if exists "Anyone can view available items" on public.items;
drop policy if exists "Users can insert their own items" on public.items;
drop policy if exists "Users can update their own items" on public.items;
drop policy if exists "Users can delete their own items" on public.items;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;

drop policy if exists "Users can view own bookings" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;

-- 6. CREATE POLICIES

create policy "Anyone can view available items"
  on public.items for select using (true);

create policy "Users can insert their own items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on public.items for delete
  using (auth.uid() = user_id);

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = renter_id or auth.uid() = owner_id);

create policy "Users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = renter_id);

-- 7. AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view item images" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

create policy "Public can view item images"
  on storage.objects for select
  using (bucket_id = 'item-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (bucket_id = 'item-images' and auth.role() = 'authenticated');

create policy "Users can delete own images"
  on storage.objects for delete
  using (bucket_id = 'item-images' and auth.uid()::text = (storage.foldername(name))[1]);
