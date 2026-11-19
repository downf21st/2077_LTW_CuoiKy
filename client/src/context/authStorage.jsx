export const STORAGE_KEY = 'cooked_user'

export function readStoredUser() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeStoredUser(user, remember = true) {
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    const targetStorage = remember ? localStorage : sessionStorage
    targetStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}