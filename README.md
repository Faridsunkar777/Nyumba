# Nyumba

House hunting for Kenya — **Uber Eats for real estate agencies**.

Browse trusted agencies, open their storefront, and explore sale & rent listings with prices, locations, and amenities. Built as a polished **Expo / React Native** prototype with mock data (Supabase-ready repositories).

## Features

- **Discover agencies** by county (Nairobi, Mombasa, Kisumu, Machakos, and more)
- **Agency storefronts** with rent / sale / featured tabs
- **Property detail** with gallery, amenities, viewing requests
- **Search & filters** (transaction type, property type, estate, beds, KES price)
- **Map explore** (native pins; web list + coords)
- **Auth** — optional login / signup (Supabase)
- **Favorites** — local + cloud when logged in
- **Call & WhatsApp** deep links
- **Onboarding** on first launch
- **Web** — same app in the browser (`npm run web`)

## Run (phone or web)

**Expo SDK 54** (works with App Store Expo Go).

```bash
cd Nyumba
npm install
npx expo start
```

- **iPhone:** Expo Go → scan QR (same Wi‑Fi). Tunnel: `npx expo start --tunnel`
- **Browser:** press `w` or `npm run web`
- **Export static web:** `npm run web:export`

### Optional: live backend (Supabase free tier)

Without keys, the app uses **demo mock data**.

1. Follow [`docs/SUPABASE-SETUP.md`](docs/SUPABASE-SETUP.md)
2. Copy `.env.example` → `.env` and add your project URL + anon key
3. Restart Expo with cache clear: `npx expo start -c`

## Project structure

```
app/                 # Expo Router screens
src/
  components/        # UI building blocks
  context/           # App state (county, favorites, filters)
  data/
    mock/            # Kenya agencies, properties, locations
    repositories/    # Async APIs (swap for Supabase later)
    types.ts
  theme/             # Colors, spacing, typography
  utils/
```

## Demo pitch

Each real estate company is a “store.” Buyers and renters discover agencies, browse inventory, and contact agents instantly. Phase 2: Supabase multi-tenant backend + agency dashboard for listings and lead analytics.

## Note

Prototype only — listings and contact numbers are fictional demo data.
