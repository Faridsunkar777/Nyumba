# Nyumba

House hunting for Kenya — **Uber Eats for real estate agencies**.

Browse trusted agencies, open their storefront, and explore sale & rent listings with prices, locations, and amenities. Built as a polished **Expo / React Native** prototype with mock data (Supabase-ready repositories).

## Features

- **Discover agencies** by county (Nairobi, Mombasa, Kisumu, and more)
- **Agency storefronts** with rent / sale / featured tabs
- **Property detail** with gallery, amenities, map-ready coords
- **Search & filters** (transaction type, property type, estate, beds, KES price)
- **Map explore** with property pins
- **Favorites** (persisted with AsyncStorage)
- **Call & WhatsApp** deep links to agencies
- **Onboarding** flow for first launch

## Run (Expo Go on your iPhone)

This project uses **Expo SDK 54**, which matches the **App Store version of Expo Go**.

```bash
cd Nyumba
npm install
npx expo start
```

1. Open **Expo Go** on your iPhone (install from the App Store if needed).
2. Put your phone on the **same Wi‑Fi** as your Mac.
3. Scan the **QR code** in the terminal (Camera app or Expo Go scanner).

If the QR opens but fails to connect, try tunnel mode:

```bash
npx expo start --tunnel
```

Then scan again.

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
