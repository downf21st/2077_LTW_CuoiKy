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

export async function getFavorites(userId) {
  if (!userId) return []
  const json = await request(`/users/${encodeURIComponent(userId)}/favorites`)
  return json.data
}

export async function addFavorite(userId, recipeId) {
  const json = await request(`/users/${encodeURIComponent(userId)}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeId }),
  })
  return json.data
}

export async function removeFavorite(userId, recipeId) {
  await request(
    `/users/${encodeURIComponent(userId)}/favorites/${encodeURIComponent(recipeId)}`,
    { method: 'DELETE' },
  )
}

export async function updateUserProfile(userId, payload) {
  const json = await request(`/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return json.data ?? null
}

const unwrap = (json) => json.data ?? json

const jsonRequest = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function getMenu(userId) {
  const json = await request(`/menus/${encodeURIComponent(userId)}`)
  return unwrap(json)
}

export async function saveMenu(userId, days) {
  const json = await request(
    `/menus/${encodeURIComponent(userId)}`,
    jsonRequest('PUT', { days }),
  )
  return unwrap(json)
}

export async function clearMenuApi(userId) {
  await request(`/menus/${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

export async function createReview(recipeId, { rating, comment }) {
  const json = await request(
    `/recipes/${encodeURIComponent(recipeId)}/reviews`,
    jsonRequest('POST', { rating, comment }),
  )
  return unwrap(json)
}

export async function setRecipeStatus(recipeId, status) {
  const json = await request(
    `/recipes/${encodeURIComponent(recipeId)}/status`,
    jsonRequest('PUT', { status }),
  )
  return unwrap(json)
}

export async function getAdminReviews(params) {
  const json = await request(`/reviews${buildQuery(params)}`)
  return unwrap(json)
}

export async function setReviewHidden(recipeId, reviewId, hidden) {
  const json = await request(
    `/recipes/${encodeURIComponent(recipeId)}/reviews/${encodeURIComponent(reviewId)}`,
    jsonRequest('PUT', { hidden }),
  )
  return unwrap(json)
}

export async function getStats() {
  const json = await request('/stats')
  return unwrap(json)
}
export async function getCategories() {
  const json = await request('/categories')
  return unwrap(json)
}
export async function createCategory(name) {
  const json = await request('/categories', jsonRequest('POST', { name }))
  return unwrap(json)
}

export async function updateCategory(id, name) {
  const json = await request(
    `/categories/${encodeURIComponent(id)}`,
    jsonRequest('PUT', { name }),
  )
  return unwrap(json)
}

export async function deleteCategory(id) {
  await request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE' })
}