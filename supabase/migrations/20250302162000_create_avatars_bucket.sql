-- Создаем бакет для аватаров
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Разрешаем всем пользователям просматривать аватары
create policy "Avatars are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Разрешаем аутентифицированным пользователям загружать аватары
create policy "Users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

-- Разрешаем пользователям удалять свои старые аватары
create policy "Users can delete their avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  ); 