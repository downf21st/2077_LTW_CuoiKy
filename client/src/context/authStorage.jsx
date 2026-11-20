export const STORAGE_KEY = 'cooked_user'
const PROFILE_CACHE_PREFIX = 'cooked_profile_'

export function readStoredUser() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw)
    const cached = readCachedProfile(user?.id || user?.email)
    return cached ? { ...user, ...cached } : user
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

export function updateStoredUser(nextUser) {
  try {
    const inSession = sessionStorage.getItem(STORAGE_KEY) !== null
    const inLocal = localStorage.getItem(STORAGE_KEY) !== null
    const targetStorage = inSession && !inLocal ? sessionStorage : localStorage
    targetStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    writeCachedProfile(nextUser)
  } catch {
  }
}

export function readCachedProfile(key) {
  if (!key) return null
  try {
    const raw = localStorage.getItem(`${PROFILE_CACHE_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeCachedProfile(user) {
  const key = user?.id || user?.email
  if (!key) return
  try {
    const snapshot = {
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
    }
    localStorage.setItem(`${PROFILE_CACHE_PREFIX}${key}`, JSON.stringify(snapshot))
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