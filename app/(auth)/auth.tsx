"use client"

import type React from "react"

import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User, SupabaseClient } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  supabase: SupabaseClient
  loading: boolean
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("Auth error:", error)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.error("Failed to get user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_OUT") {
        router.push("/login")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return { user, supabase, loading }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
      throw error
    }

    // Force redirect
    window.location.href = "/login"
  } catch (error) {
    console.error("Sign out failed:", error)
    // Force redirect even on error
    window.location.href = "/login"
  }
}

// Export auth object for compatibility
export const auth = {
  signOut,
  useAuth,
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
