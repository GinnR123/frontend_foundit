// Demo-only mock API backed by localStorage. Simulates the future Express + MySQL backend.
// TODO: replace each function body with fetch(...) calls to the Express API.
import { MOCK_ITEMS, MOCK_USERS } from '../data/mockItems.js'

const ITEMS_KEY = 'foundit.items'
const USERS_KEY = 'foundit.users'
const SESSION_KEY = 'foundit.session'

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Seed starter data once; keeps mock initialization separate from normal updates.
function seed() {
  if (!localStorage.getItem(ITEMS_KEY)) {
    writeJSON(ITEMS_KEY, MOCK_ITEMS)
  } else {
    // Refresh the built-in demo reports while preserving user-created reports
    // and any demo resolution state from an earlier session.
    const items = readJSON(ITEMS_KEY, MOCK_ITEMS)
    const seedsById = new Map(MOCK_ITEMS.map((item) => [item.id, item]))
    let changed = false
    const refreshed = items.map((item) => {
      const seedItem = seedsById.get(item.id)
      if (!seedItem) return item
      changed = true
      return { ...seedItem, status: item.status, matched_item_id: item.matched_item_id }
    })
    if (changed) writeJSON(ITEMS_KEY, refreshed)
  }
  if (!localStorage.getItem(USERS_KEY)) writeJSON(USERS_KEY, MOCK_USERS)
}

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const isValidItem = (item) =>
  item &&
  typeof item.id === 'number' &&
  typeof item.title === 'string' &&
  (item.type === 'LOST' || item.type === 'FOUND') &&
  (item.status === 'OPEN' || item.status === 'RESOLVED')

export async function getItems() {
  seed()
  await delay(150)
  const items = readJSON(ITEMS_KEY, MOCK_ITEMS)
  return items.filter(isValidItem)
}

export async function createItem(payload) {
  // TODO: replace with POST /api/items
  seed()
  await delay(400)
  const items = readJSON(ITEMS_KEY, [])
  const session = getSession()
  const id = items.reduce((max, item) => Math.max(max, item.id), 0) + 1
  const item = {
    id,
    user_id: session ? session.id : 0,
    full_name: session ? session.full_name : 'Anonymous',
    contact_info: payload.contact_info || '',
    type: payload.type,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    location_name: payload.location_name,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    status: 'OPEN',
    matched_item_id: null,
    created_at: new Date().toISOString(),
  }
  if (!isValidItem(item)) throw new Error('Invalid item data')
  if (item.latitude != null && (typeof item.latitude !== 'number' || !isFinite(item.latitude) || item.latitude < -90 || item.latitude > 90)) throw new Error('Invalid latitude')
  if (item.longitude != null && (typeof item.longitude !== 'number' || !isFinite(item.longitude) || item.longitude < -180 || item.longitude > 180)) throw new Error('Invalid longitude')
  if (!writeJSON(ITEMS_KEY, [...items, item])) throw new Error('Could not save item')
  return item
}

export async function resolveItem(id) {
  // TODO: replace with PATCH /api/items/:id/resolve
  seed()
  await delay(200)
  const items = readJSON(ITEMS_KEY, [])
  const item = items.find((it) => it.id === id)
  if (!item) throw new Error('Item not found')
  if (item.status === 'RESOLVED') throw new Error('Item already resolved')
  const updated = items.map((it) => (it.id === id ? { ...it, status: 'RESOLVED' } : it))
  if (!writeJSON(ITEMS_KEY, updated)) throw new Error('Could not update item')
  return { ...item, status: 'RESOLVED' }
}

export async function getPossibleMatches(itemId) {
  // TODO: replace with GET /api/items/:id/matches
  // Expected response shape: [{ ...item, match_reason: string }]
  seed()
  await delay(200)
  const items = readJSON(ITEMS_KEY, []).filter(isValidItem)
  const item = items.find((it) => it.id === itemId)
  if (!item || item.matched_item_id == null) return []
  const matched = items.filter((it) => it.id === item.matched_item_id)
  return matched.map((m) => ({
    ...m,
    match_reason: buildMatchReason(item, m),
  }))
}

function buildMatchReason(a, b) {
  const parts = []
  if (a.category === b.category) parts.push(`matching category (${a.category})`)
  if (a.location_name && b.location_name && a.location_name !== b.location_name) {
    parts.push(`related location (${b.location_name})`)
  }
  if (a.type !== b.type) parts.push(`opposite report type (${b.type})`)
  return parts.length ? parts.join(' and ') : 'similar report details'
}

export async function loginUser(email) {
  // Demo-only: email lookup, no password. TODO: replace with POST /api/auth/login
  seed()
  await delay(400)
  const users = readJSON(USERS_KEY, [])
  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
  if (!user) throw new Error('No demo user found with that email')
  const session = { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
  writeJSON(SESSION_KEY, session)
  return session
}

export async function registerUser(full_name, email) {
  // Demo-only: creates a profile with no password. TODO: replace with POST /api/auth/register
  seed()
  await delay(400)
  const users = readJSON(USERS_KEY, [])
  if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase())) {
    throw new Error('A demo user with that email already exists')
  }
  const id = users.reduce((max, u) => Math.max(max, u.id), 0) + 1
  const user = { id, full_name, email, role: 'user' }
  if (!writeJSON(USERS_KEY, [...users, user])) throw new Error('Could not register')
  const session = { id, full_name, email, role: 'user' }
  writeJSON(SESSION_KEY, session)
  return session
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed.id === 'number' ? parsed : null
  } catch {
    return null
  }
}

// --- Finder search (mock) ---
// TODO: Member 3 — replace body with fetch('/api/ai/search', { method: 'POST', ... }).
// Contract stays: searchFinder(query, dateRange) -> { item_ids: number[], summary: string }

// Parses natural-language date phrases; returns [startMs, endMs] or null.
// shortcut: handles today/yesterday/this week/past N days only, upgrade to a real date parser when the backend lands.
const dayMs = 86400000
function parseDatePhrase(text) {
  const t = text.toLowerCase()
  const now = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (/\btoday\b/.test(t)) return [startOfDay(now), Date.now()]
  if (/\byesterday\b/.test(t)) return [startOfDay(now) - dayMs, startOfDay(now)]
  if (/\bthis week\b/.test(t)) {
    const monday = startOfDay(now) - ((now.getDay() + 6) % 7) * dayMs
    return [monday, Date.now()]
  }
  const pastN = t.match(/\b(?:past|last)\s+(\d+)\s+days?\b/)
  if (pastN) return [Date.now() - Number(pastN[1]) * dayMs, Date.now()]
  return null
}

export async function searchFinder(query, dateRange = {}) {
  seed()
  await delay(300)
  const open = readJSON(ITEMS_KEY, []).filter((it) => it.status === 'OPEN')
  const range = parseDatePhrase(String(query || '')) ||
    (dateRange.startDate || dateRange.endDate
      ? [
          dateRange.startDate ? new Date(dateRange.startDate).getTime() : 0,
          dateRange.endDate ? new Date(dateRange.endDate).getTime() + dayMs - 1 : Infinity,
        ]
      : null)

  let matches = open
  if (range) matches = matches.filter((it) => {
    const ts = new Date(it.created_at).getTime()
    return ts >= range[0] && ts <= range[1]
  })

  // Keyword matching: skip filler words, match remaining tokens across text fields.
  const STOP = new Set(['show', 'all', 'the', 'a', 'an', 'items', 'item', 'unclaimed', 'from', 'to', 'this', 'past', 'last', 'days', 'day', 'week', 'today', 'yesterday', 'in', 'of', 'and', 'or', 'lost', 'found'])
  const words = String(query || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w))
  if (words.length > 0) {
    matches = matches.filter((it) => {
      const hay = `${it.title} ${it.description} ${it.category} ${it.location_name} ${it.type}`.toLowerCase()
      return words.some((w) => hay.includes(w))
    })
  }

  const summary = range
    ? `Showing ${matches.length} unclaimed item${matches.length === 1 ? '' : 's'}${words.length ? ' matching your keywords' : ''} within the selected date range.`
    : `Showing ${matches.length} unclaimed item${matches.length === 1 ? '' : 's'} matching your query.`
  return { item_ids: matches.map((it) => it.id), summary }
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
}

// --- Geocoding (OpenStreetMap Nominatim) ---
// Swap this function's body to change providers; callers only see { latitude, longitude } | null.

const GEOCODE_MIN_INTERVAL = 1000 // Nominatim usage policy: max 1 request/second
const geocodeCache = new Map() // normalized query -> { latitude, longitude } | null (null = not found, cached too)
let lastGeocodeAt = 0
let geocodeInFlight = null

async function geocodeLocation(query) {
  const key = String(query || '').trim().toLowerCase()
  if (!key) return null
  if (geocodeCache.has(key)) return geocodeCache.get(key)
  if (geocodeInFlight) return geocodeInFlight

  const wait = Math.max(0, lastGeocodeAt + GEOCODE_MIN_INTERVAL - Date.now())
  geocodeInFlight = (async () => {
    try {
      if (wait > 0) await delay(wait)
      lastGeocodeAt = Date.now()
      // TODO: replace with a backend proxy route so API keys/proxying live server-side.
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(key)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
      const data = await res.json()
      const hit = Array.isArray(data) && data.length > 0 ? data[0] : null
      const result = hit ? { latitude: parseFloat(hit.lat), longitude: parseFloat(hit.lon) } : null
      geocodeCache.set(key, result)
      return result
    } finally {
      geocodeInFlight = null
    }
  })()
  return geocodeInFlight
}

export { geocodeLocation }
