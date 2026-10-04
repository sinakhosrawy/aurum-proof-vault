create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id,'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.gold_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null default '',
  result text not null,
  weight text,
  notes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.gold_items to authenticated;
grant all on public.gold_items to service_role;
alter table public.gold_items enable row level security;
create policy "admin all items" on public.gold_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.lookup_gold(_code text) returns table(code text, title text, result text, weight text, notes text, created_at timestamptz)
language sql stable security definer set search_path=public as $$
  select code, title, result, weight, notes, created_at from public.gold_items where code = trim(_code) limit 1
$$;
grant execute on function public.lookup_gold(text) to anon, authenticated;

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'طلاسازی سقز',
  tagline text not null default 'بهترین طلاساز شهرستان سقز',
  about text not null default 'در دل سقز کردستان، هر قطعه طلا پیش از تحویل عیارسنجی می‌شود و کد آن برای استعلام ثبت می‌گردد.',
  phone text not null default '',
  phone2 text not null default '',
  address text not null default 'سقز، کردستان',
  socials jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings(id) values (1);
insert into public.gold_items(code,title,result,weight) values ('10042','طلای آب‌شده','775','—');