# FoundIt — Community Lost & Found

A frontend prototype for **FoundIt**, a community Lost and Found web application built with
**React, Vite, Tailwind CSS v4, Lucide React, and Leaflet (OpenStreetMap)**.

This is a **frontend-only prototype**. All data is mocked in `src/services/api.js` and persisted
with `localStorage`. There is no backend, no database, and no real authentication — every
`// TODO:` comment in `src/services/api.js` marks where a future Express + MySQL endpoint
should be wired in.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build check
```

## Project structure

```
src/
├── components/        # Navbar, FilterBar, ItemFeed, ItemCard, ItemDetailModal,
│                      #   ItemMap, ReportModal, AuthModal, Modal
├── data/              # mockItems.js — generic community demo reports
├── hooks/             # useLeafletMap.js — Leaflet init/cleanup
└── services/          # api.js — single source for all data operations
```

## Data contract

Every item object uses these exact snake_case keys (matches the MySQL schema — do not rename):

| Field | Type |
|---|---|
| `id` | `number` |
| `user_id` | `number` |
| `full_name` | `string` |
| `contact_info` | `string` |
| `type` | `'LOST'` or `'FOUND'` |
| `title` | `string` |
| `description` | `string` |
| `category` | `'Wallet / Bag'`, `'ID / Document'`, `'Gadget'`, `'Keys'`, `'Pet'`, or `'Other'` |
| `location_name` | `string` |
| `latitude` | `number` or `null` |
| `longitude` | `number` or `null` |
| `status` | `'OPEN'` or `'RESOLVED'` |
| `matched_item_id` | `number` or `null` |
| `created_at` | ISO timestamp `string` |

## Mock API service (`src/services/api.js`)

All data operations go through this single service. Functions are async and currently backed by
`localStorage`; replace each body with a `fetch(...)` call when the backend is ready:

- `getItems()` — `GET /api/items`
- `createItem(payload)` — `POST /api/items`
- `resolveItem(id)` — `PATCH /api/items/:id/resolve`
- `getPossibleMatches(itemId)` — `GET /api/items/:id/matches`
- `loginUser(email)` — `POST /api/auth/login`
- `registerUser(full_name, email)` — `POST /api/auth/register`
- `logoutUser()` — clears the session
- `analyzeReportText(description, type)` — `POST /api/ai/analyze`

### AI endpoint contracts

**`POST /api/ai/analyze`**
```json
// Request
{ "description": "I lost my black wallet near Roxas Avenue", "type": "LOST" }
// Response
{ "suggested_title": "Lost: I lost my black wallet near", "suggested_category": "Wallet / Bag", "suggested_location": "Roxas Avenue", "is_demo": true }
```

**`GET /api/items/:id/matches`**
```json
// Response
[{ "id": 4, "type": "FOUND", "title": "...", ..., "match_reason": "Matching category and nearby location" }]
```

## Privacy rules

- `contact_info` is hidden on public feed cards.
- It is shown only in `ItemDetailModal` to a signed-in demo user.
- No passwords or secrets are stored in `localStorage`.

## Design notes

Editorial civic-utility style: warm ivory `#F4F3ED` background, pure white surfaces,
crisp `1px` borders (`#E4E2DA`), charcoal text (`#1A1918`), muted slate secondary text
(`#B6B3AB`). Status accents: `LOST` (amber `#B45309` on `#FEF3C7`), `FOUND` (forest green
`#15803D` on `#DCFCE7`), `RESOLVED` (muted gray). No gradients, no hero banners, no
glassmorphism, no cards rounder than `rounded-lg`.
