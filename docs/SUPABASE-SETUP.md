# Supabase setup (Nyumba)

The app works **without** Supabase (mock data). When you add keys, it switches to live data automatically.

## 1. Create a free project

1. Go to [supabase.com](https://supabase.com) → New project  
2. Region: pick one close to Kenya/EU if preferred  
3. Save the database password  

## 2. Run schema

In Supabase Dashboard → **SQL Editor**:

1. Paste and run `supabase/migrations/001_init.sql`  
2. Paste and run `supabase/seed.sql` (agencies + properties from the app mock data)

## 3. Auth settings

**Authentication → Providers → Email**: enable email/password.  
For local demos you can disable “Confirm email” under Auth settings so sign-up works immediately.

## 4. App env

```bash
cd /Users/faridali/Nyumba
cp .env.example .env
```

Fill from **Project Settings → API**:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Restart Expo (`npx expo start -c`).

## 5. Verify

- Profile shows **Live data** (not Demo data)  
- Sign up creates a row in `auth.users` + `profiles`  
- Favorites appear in `favorites` when logged in  
- Request viewing inserts into `leads`  

## RLS summary

| Table | Public |
|-------|--------|
| agencies | read all |
| properties | read `status = active` |
| favorites | own user only |
| leads | insert anyone; select own |
| profiles | own only |
