import { createSlice } from '@reduxjs/toolkit'

export const DAYS = ['thu2', 'thu3', 'thu4', 'thu5', 'thu6', 'thu7', 'cn']
export const MEALS = ['sang', 'trua', 'toi']
export const makeSlot = (day, meal) => `${day}-${meal}`

const initialState = {
  slots: {},
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMeal: (state, action) => {
      const { slot, recipeId } = action.payload
      state.slots[slot] = recipeId
    },
    removeMeal: (state, action) => {
      delete state.slots[action.payload]
    },
    clearMenu: (state) => {
      state.slots = {}
    },
  },
})

export const { setMeal, removeMeal, clearMenu } = menuSlice.actions
export default menuSlice.reducer