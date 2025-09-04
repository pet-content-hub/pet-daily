-- 允许公开日记关联的猫信息只读访问（用于公开页面展示头像等）
create policy "允许公开日记关联猫信息只读"
on public.cats
for select
using (
  exists (
    select 1
    from public.cat_diaries cd
    where cd.cat_id = cats.id
      and cd.is_private = false
  )
);
