import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { STORAGE_KEY, readStoredUser } from './authStorage'
import { setApiUserId } from '../api'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = readStoredUser()
    setApiUserId(storedUser?.id)
    return storedUser
  })

  useEffect(() => {
    setApiUserId(user?.id)
  }, [user])

  const login = ({ id, name, email, role }) => {
    const nextUser = { id, name, email, role }
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = {
    user,
    role: user ? user.role : 'guest',
    isLoggedIn: user !== null,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}