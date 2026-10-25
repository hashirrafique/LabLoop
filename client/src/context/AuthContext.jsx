import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // only need to wait if there is a saved token to check
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))

  // if a token is already saved, ask the server who it belongs to (keeps you logged in after refresh)
  useEffect(() => {
    if (!localStorage.getItem('token')) return

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
