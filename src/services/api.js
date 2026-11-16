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
  if (!localStorage.getItem(ITEMS_KEY)) writeJSON(ITEMS_KEY, MOCK_ITEMS)
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

// Lightweight demo keyword parser. Real backend will use Gemini.
function classifyCategory(text) {
  const t = text.toLowerCase()
  if (/\b(cat|pet|dog|animal)\b/.test(t)) return 'Pet'
  if (/\b(key|keys)\b/.test(t)) return 'Keys'
  if (/\b(gadget|phone|earbud|laptop|charger|headphone|watch|tablet)\b/.test(t)) return 'Gadget'
  if (/\b(id|document|card|license|passport|wallet|bag|backpack|purse)\b/.test(t)) return 'Wallet / Bag'
  if (/\b(id|document|license|passport|certificate)\b/.test(t)) return 'ID / Document'
  return 'Other'
}

function extractLocation(text) {
  const m = text.match(/(?:at|near|in|around)\s+([A-Z][A-Za-z'&\s]+?)(?:[.,;]|$)/)
  return m ? m[1].trim() : ''
}

function suggestTitle(text, type) {
  const cleaned = text.replace(/[.,;!?]$/, '').trim()
  const prefix = type === 'LOST' ? 'Lost' : 'Found'
  const words = cleaned.split(/\s+/)
  const short = words.slice(0, 6).join(' ')
  return `${prefix}: ${short}`
}

export async function analyzeReportText(description, type) {
  // TODO: replace with fetch('/api/ai/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, type }) })
  // Expected request:  { description: string, type: 'LOST' | 'FOUND' }
  // Expected response: { suggested_title: string, suggested_category: string, suggested_location: string, is_demo: true }
  await delay(500)
  const text = String(description || '').trim()
  return {
    suggested_title: suggestTitle(text, type),
    suggested_category: classifyCategory(text),
    suggested_location: extractLocation(text),
    is_demo: true,
  }
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

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
}
