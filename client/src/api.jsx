const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `Lỗi ${res.status}`)
  return json
}

export async function getRecipes({
  search = '',
  ingredients = '',
  category = '',
  cookingTime = '',
  difficulty = '',
  page = 1,
  limit = 100,
} = {}) {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set('search', search)
  if (ingredients) params.set('ingredients', ingredients)
  if (category) params.set('category', category)
  if (cookingTime) params.set('cookingTime', cookingTime)
  if (difficulty) params.set('difficulty', difficulty)

  const json = await request(`/recipes?${params}`)
  return json.data
}

export async function getRecipeById(id) {
  const json = await request(`/recipes/${id}`)
  return json.data
}