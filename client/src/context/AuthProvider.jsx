import { useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  readStoredUser,
  writeStoredUser,
  clearStoredUser,
} from './authStorage'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = ({ id, name, email, role }, options = {}) => {
    const nextUser = { id, name, email, role }
    const remember = options.remember ?? true
    setUser(nextUser)
    writeStoredUser(nextUser, remember)
  }

  const logout = () => {
    setUser(null)
    clearStoredUser()
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