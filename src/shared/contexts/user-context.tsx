"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"

import type { User } from "@/domain/entities/user"
import { LoadingSpinner } from "@/presentation/components/loading/loading-spinner"
import { useGetMe } from "@/shared/hooks/use-get-me"
import { useUpdateNotFirstUser } from "@/shared/hooks/use-update-not-first-user"

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  updateUser: (updated: Partial<User>) => void
  markNotFirstTime: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { triggerGetMe, triggerGetMeResponse, triggerGetMeloading } = useGetMe()
  const { triggerUpdateNotFirstUser } = useUpdateNotFirstUser()

  const [user, setUser] = useState<User | null>(null)
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false)
  const navigate = useNavigate()

  const refreshUser = async () => {
    try {
      await triggerGetMe()
    } catch (e) {
      console.error("Failed to refresh user", e)
    }
  }

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null))
  }

  const markNotFirstTime = async () => {
    try {
      await triggerUpdateNotFirstUser()
      updateUser({ isUserFirstTime: false })
    } catch (e) {
      console.error("Failed to update user first-time flag", e)
    }
  }

  useEffect(() => {
    refreshUser()
    const timer = setTimeout(() => {
      setMinimumLoadTimePassed(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (triggerGetMeResponse?.data) {
      const { id, username, email, isEmailVerified, isUserFirstTime } = triggerGetMeResponse.data
      setUser({ id, username, email, isEmailVerified, isUserFirstTime })
    }
  }, [triggerGetMeResponse])

  useEffect(() => {
    if (!triggerGetMeloading && user?.isUserFirstTime) {
      navigate("/dashboard/first-time-user")
    }
  }, [user, triggerGetMeloading, navigate])

  const isStillLoading = triggerGetMeloading || !minimumLoadTimePassed

  if (isStillLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner message="" />
      </div>
    )
  }

  const value: UserContextType = {
    user,
    loading: isStillLoading,
    refreshUser,
    updateUser,
    markNotFirstTime,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
