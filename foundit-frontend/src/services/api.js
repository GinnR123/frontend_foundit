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
  seed()
  await delay(200)
  const items = readJSON(ITEMS_KEY, []).filter(isValidItem)
  const item = items.find((it) => it.id === itemId)
  if (!item || item.matched_item_id == null) return []
  return items.filter((it) => it.id === item.matched_item_id)
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
