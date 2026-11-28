import { createSlice, createSelector } from '@reduxjs/toolkit'
import { mergeIngredients } from '../utils/weeklyMenuHelper'

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const MEAL_KEYS = ['breakfast', 'lunch', 'dinner']

export const DAY_LABELS = {
  mon: 'Thứ 2',
  tue: 'Thứ 3',
  wed: 'Thứ 4',
  thu: 'Thứ 5',
  fri: 'Thứ 6',
  sat: 'Thứ 7',
  sun: 'Chủ nhật',
}
export const MEAL_LABELS = {
  breakfast: 'Sáng',
  lunch: 'Trưa',
  dinner: 'Tối',
}

export function createEmptyDays() {
  return Object.fromEntries(
    DAY_KEYS.map((day) => [day, { breakfast: [], lunch: [], dinner: [] }]),
  )
}

const newUid = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

const initialState = {
  days: createEmptyDays(),
  weekKey: null,
  status: 'idle',
  dirty: false,
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuLoading(state) {
      state.status = 'loading'
    },
    setMenuError(state) {
      state.status = 'error'
    },
    setWeekKey(state, action) {
      const weekKey = action.payload
      if (state.weekKey === weekKey) return
      state.weekKey = weekKey
      state.days = createEmptyDays()
      state.status = 'loading'
      state.dirty = false
    },
    setMenu(state, action) {
      state.days = action.payload.days
      if (action.payload.weekKey !== undefined) {
        state.weekKey = action.payload.weekKey
      }
      state.status = 'ready'
      state.dirty = false
    },
    addRecipeToSlot: {
      reducer(state, action) {
        const { day, meal, item } = action.payload
        state.days[day][meal].push(item)
        state.dirty = true
      },
      prepare({ day, meal, recipe }) {
        return {
          payload: {
            day,
            meal,
            item: {
              uid: newUid(),
              recipeId: recipe.id ?? recipe._id,
              title: recipe.title,
              image: recipe.image ?? '',
              ingredients: (recipe.ingredients ?? []).map((ing) => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
              })),
            },
          },
        }
      },
    },
    removeRecipeFromSlot(state, action) {
      const { day, meal, uid } = action.payload
      state.days[day][meal] = state.days[day][meal].filter(
        (item) => item.uid !== uid,
      )
      state.dirty = true
    },
    moveRecipe(state, action) {
      const { from, to } = action.payload
      const source = state.days[from.day][from.meal]
      const index = source.findIndex((item) => item.uid === from.uid)
      if (index === -1) return
      const [moved] = source.splice(index, 1)
      state.days[to.day][to.meal].push(moved)
      state.dirty = true
    },
    clearMenu(state) {
      state.days = createEmptyDays()
      state.dirty = true
    },
    resetMenu() {
      return { days: createEmptyDays(), weekKey: null, status: 'idle', dirty: false }
    },
    markSaved(state) {
      state.dirty = false
    },
  },
})

export const {
  setMenuLoading,
  setMenuError,
  setWeekKey,
  setMenu,
  addRecipeToSlot,
  removeRecipeFromSlot,
  moveRecipe,
  clearMenu,
  resetMenu,
  markSaved,
} = menuSlice.actions

export const selectMenuDays = (state) => state.menu.days
export const selectMenuWeekKey = (state) => state.menu.weekKey
export const selectMenuStatus = (state) => state.menu.status
export const selectMenuDirty = (state) => state.menu.dirty
export const selectSlotItems = (day, meal) => (state) => state.menu.days[day][meal]
export const selectMenuItemCount = (state) =>
  DAY_KEYS.reduce(
    (total, day) =>
      total +
      MEAL_KEYS.reduce((sum, meal) => sum + state.menu.days[day][meal].length, 0),
    0,
  )

export const selectShoppingList = createSelector(selectMenuDays, mergeIngredients)
export default menuSlice.reducer