"use client"

import type React from "react"

import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"

export type UserType = "free" | "premium" | "admin"

export interface AuthUser {
  id: string
  email: string
  name?: string
  type: UserType
}

export interface AuthSession {
  user: AuthUser
}

interface AuthContextType {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            type: (session.user.user_metadata?.type as UserType) || "free",
          }

          setUser(authUser)
          setSession({ user: authUser })
        } else {
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          type: (session.user.user_metadata?.type as UserType) || "free",
        }

        setUser(authUser)
        setSession({ user: authUser })
      } else {
        setUser(null)
        setSession(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setUser(null)
    setSession(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Named exports for compatibility
export const auth = async () => {
  // This is a client-side function, return null for server-side compatibility
  return null
}

export { signOut } from "./auth"
