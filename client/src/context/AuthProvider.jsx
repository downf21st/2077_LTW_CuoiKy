import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AuthContext } from './AuthContext'
import { resetMenu } from '../redux/menuSlice'
import { resetSyncedMenuUser } from '../hooks/useMenuSync'
import {
  readStoredUser,
  readCachedProfile,
  writeStoredUser,
  updateStoredUser,
  clearStoredUser,
} from './authStorage'

export default function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const [user, setUser] = useState(readStoredUser)

  const login = (userData, options = {}) => {
    const cached = readCachedProfile(userData?.id || userData?.email) || {}
    const nextUser = {
      id: userData.id,
      name: userData.name || userData.fullName || cached.name || '',
      email: userData.email || '',
      role: userData.role || 'member',
      username: userData.username ?? cached.username ?? '',
      bio: userData.bio ?? cached.bio ?? '',
      avatar: userData.avatar ?? cached.avatar ?? '',
    }
    const remember = options.remember ?? true
    setUser(nextUser)
    writeStoredUser(nextUser, remember)
  }

  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev
      const nextUser = { ...prev, ...patch }
      updateStoredUser(nextUser)
      return nextUser
    })
  }

  const logout = () => {
    setUser(null)
    clearStoredUser()
    resetSyncedMenuUser()
    dispatch(resetMenu())
  }

  const value = {
    user,
    role: user ? user.role : 'guest',
    isLoggedIn: user !== null,
    login,
    updateUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}