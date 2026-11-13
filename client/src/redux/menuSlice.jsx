import { createSlice } from '@reduxjs/toolkit'

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
  },
})

export const { setMeal, removeMeal } = menuSlice.actions
export default menuSlice.reducer