-- 创建用户配置表
create table public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建猫咪信息表
create table public.cats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  breed text,
  gender text check (gender in ('male', 'female', 'unknown')),
  birth_date date,
  color text,
  weight decimal(4,2), -- 体重(kg)
  avatar_url text,
  microchip_id text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建养猫日记表
create table public.cat_diaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  cat_id uuid references public.cats on delete cascade not null,
  title text not null,
  content text not null,
  mood text check (mood in ('happy', 'normal', 'worried', 'sick')),
  weight decimal(4,2), -- 当日体重
  temperature decimal(4,2), -- 体温
  food_amount text, -- 食物摄入量
  water_amount text, -- 饮水量
  litter_box_times integer, -- 如厕次数
  activity_level text check (activity_level in ('low', 'medium', 'high')),
  is_private boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建日记图片表
create table public.diary_images (
  id uuid default gen_random_uuid() primary key,
  diary_id uuid references public.cat_diaries on delete cascade not null,
  image_url text not null,
  caption text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建疫苗接种记录表
create table public.vaccination_records (
  id uuid default gen_random_uuid() primary key,
  cat_id uuid references public.cats on delete cascade not null,
  vaccine_name text not null,
  vaccination_date date not null,
  next_due_date date,
  veterinarian text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建医疗记录表
create table public.medical_records (
  id uuid default gen_random_uuid() primary key,
  cat_id uuid references public.cats on delete cascade not null,
  visit_date date not null,
  veterinarian text,
  diagnosis text,
  treatment text,
  medications text,
  cost decimal(10,2),
  next_visit_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 RLS (Row Level Security)
alter table public.user_profiles enable row level security;
alter table public.cats enable row level security;
alter table public.cat_diaries enable row level security;
alter table public.diary_images enable row level security;
alter table public.vaccination_records enable row level security;
alter table public.medical_records enable row level security;

-- 创建 RLS 政策
create policy "用户只能查看自己的资料" on public.user_profiles
  for all using (auth.uid() = id);

create policy "用户只能管理自己的猫咪" on public.cats
  for all using (auth.uid() = user_id);

create policy "用户只能管理自己的日记" on public.cat_diaries
  for all using (auth.uid() = user_id);

create policy "允许查看公开日记" on public.cat_diaries
  for select using (not is_private or auth.uid() = user_id);

create policy "用户只能管理自己日记的图片" on public.diary_images
  for all using (
    exists (
      select 1 from public.cat_diaries 
      where cat_diaries.id = diary_images.diary_id 
      and cat_diaries.user_id = auth.uid()
    )
  );

create policy "用户只能管理自己猫咪的疫苗记录" on public.vaccination_records
  for all using (
    exists (
      select 1 from public.cats 
      where cats.id = vaccination_records.cat_id 
      and cats.user_id = auth.uid()
    )
  );

create policy "用户只能管理自己猫咪的医疗记录" on public.medical_records
  for all using (
    exists (
      select 1 from public.cats 
      where cats.id = medical_records.cat_id 
      and cats.user_id = auth.uid()
    )
  );

-- 创建更新时间触发器函数
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- 为需要的表添加更新时间触发器
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger handle_cats_updated_at
  before update on public.cats
  for each row execute function public.handle_updated_at();

create trigger handle_cat_diaries_updated_at
  before update on public.cat_diaries
  for each row execute function public.handle_updated_at();

-- 创建用户资料自动创建函数
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- 为新用户注册创建触发器
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 创建存储桶 (Storage buckets)
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('cat-photos', 'cat-photos', true),
  ('diary-images', 'diary-images', true);

-- 创建存储桶政策
create policy "用户头像公开可见"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "用户可上传自己的头像"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "用户可更新自己的头像"
on storage.objects for update
using (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "用户可删除自己的头像"
on storage.objects for delete
using (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 猫咪照片存储桶政策
create policy "猫咪照片公开可见"
on storage.objects for select
using ( bucket_id = 'cat-photos' );

create policy "用户可上传猫咪照片"
on storage.objects for insert
with check (
  bucket_id = 'cat-photos' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 日记图片存储桶政策  
create policy "日记图片按隐私设置可见"
on storage.objects for select
using ( 
  bucket_id = 'diary-images'
  and (
    -- 公开日记的图片所有人可见
    exists (
      select 1 from public.diary_images di
      join public.cat_diaries cd on di.diary_id = cd.id
      where di.image_url like '%' || name || '%'
      and not cd.is_private
    )
    or
    -- 私密日记的图片只有作者可见
    exists (
      select 1 from public.diary_images di
      join public.cat_diaries cd on di.diary_id = cd.id
      where di.image_url like '%' || name || '%'
      and cd.user_id = auth.uid()
    )
  )
);

create policy "用户可上传日记图片"
on storage.objects for insert
with check (
  bucket_id = 'diary-images' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);