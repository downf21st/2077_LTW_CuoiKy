import { readStoredUser } from './context/authStorage'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function buildQuery(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    const text = Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean).join(',')
      : String(value ?? '').trim()

    if (text !== '') search.set(key, text)
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}

function getUserHeaders() {
  const user = readStoredUser()
  return user && user.id ? { 'x-user-id': user.id } : {}
}

async function request(path, { headers, ...options } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getUserHeaders(), ...headers },
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Lỗi ${res.status}`)
  return json
}

function recipesPath({ page = 1, limit = 100, ...filters } = {}) {
  return `/recipes${buildQuery({ page, limit, ...filters })}`
}

export function getRecipesUrl(params) {
  return `${BASE_URL}${recipesPath(params)}`
}

export async function getRecipes(params) {
  const json = await request(recipesPath(params))
  return json.data
}

export async function getRecipeById(id) {
  const json = await request(`/recipes/${id}`)
  return json.data
}
export async function createRecipe(formData) {
  const json = await request('/recipes', { method: 'POST', body: formData })
  return json.data
}

export async function updateRecipe(id, formData) {
  const json = await request(`/recipes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: formData,
  })
  return json.data
}
export async function deleteRecipe(id) {
  await request(`/recipes/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function getMyRecipes(userId) {
  if (!userId) return []
  const json = await request(recipesPath({ authorId: userId }))
  return json.data
}

export async function updateUserProfile(userId, payload) {
  if (!userId) return { synced: false, data: payload }
  try {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getUserHeaders(),
      },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    if (res.status === 404 || res.status === 405) {
      return { synced: false, data: payload }
    }
    if (!res.ok) {
      throw new Error(json.message || `Lỗi ${res.status}`)
    }
    return { synced: true, data: json.data || json.user || payload }
  } catch (err) {
    if (err instanceof TypeError) {
      return { synced: false, data: payload }
    }
    throw err
  }
}