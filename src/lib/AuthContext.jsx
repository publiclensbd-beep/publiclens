import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true

    async function checkAdmin(s) {
      if (!s) {
        if (active) setIsAdmin(false)
        return
      }
      const { data } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', s.user.id)
        .maybeSingle()
      if (active) setIsAdmin(Boolean(data))
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(true)
      setTimeout(async () => {
        await checkAdmin(s)
        if (active) setLoading(false)
      }, 0)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase সংযোগ নেই' } }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  const value = {
    session,
    isAdmin,
    loading,
    signIn,
    signOut,
    configured: isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
    }
