// UserContext.tsx
import { createContext, useContext, useEffect, useState } from "react"
import { useGetMe } from "@/shared/hooks/use-get-me"
import type { User } from "@/domain/entities/user"

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({ user: null, loading: true })

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { triggerGetMe, triggerGetMeResponse, triggerGetMeloading } = useGetMe()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      await triggerGetMe()
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (triggerGetMeResponse?.data) {
      const { id, username, email } = triggerGetMeResponse.data
      setUser({ id, username, email })
    }
  }, [triggerGetMeResponse])

  return (
    <UserContext.Provider value={{ user, loading: triggerGetMeloading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
