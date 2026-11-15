import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const isSame = (a, b) =>
  a.name.trim().toLowerCase() === b.name.trim().toLowerCase() && a.unit === b.unit

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addIngredients: (state, action) => {
      action.payload.forEach((ingredient) => {
        const existing = state.items.find((item) => isSame(item, ingredient))
        if (existing) {
          existing.quantity += Number(ingredient.quantity)
        } else {
          state.items.push({ ...ingredient, quantity: Number(ingredient.quantity) })
        }
      })
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => !isSame(item, action.payload))
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addIngredients, removeItem, clearCart } = cartSlice.actions
export default cartSlice.reducer