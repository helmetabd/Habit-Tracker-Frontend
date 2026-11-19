import { useCallback, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../lib/api'
import type { User } from '../types'

interface AuthResponse {
  user: User
  token: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .get<User>('/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/login', { email, password })
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/register', { name, email, password })
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } finally {
      setToken(null)
      setUser(null)
    }
  }, [])

  return { user, loading, login, register, logout }
}
