"use client"

import { useGetMe } from "@/shared/hooks/use-get-me"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"

export function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const {
    triggerGetMe,
    triggerGetMeResponse,
  } = useGetMe()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await triggerGetMe()
        setIsAuthenticated(res.status == "success" && !!res.data)
      } catch {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [triggerGetMe])

  const username =
    triggerGetMeResponse?.data?.username || triggerGetMeResponse?.data?.email || "User"



  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center space-x-">
            <Link to="/" className="flex items-center space-x-2">
              <IconInnerShadowTop className="size-6 text-[#1868DB]" />
              <span className="text-lg font-bold text-[#1868DB] ">{"Project Hub".toUpperCase()}</span>
            </Link>
          </div>

          {/* Right: Desktop CTA */}
          <div className="flex items-center space-x-4">

            {isAuthenticated ? (
              <div
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Avatar className="cursor-pointer h-8 w-8 border-2 border-white shadow-sm ring-1 ring-slate-100">
                  <AvatarFallback
                    className={cn("text-sm font-semibold text-white bg-gradient-to-br", getGradientForUser(username.charAt(0).toUpperCase()))}
                  >
                    {getUserInitials(username.charAt(0).toUpperCase())}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-gray-900 hidden md:flex">
                  {username.toUpperCase()}
                </span>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-[#1868DB] hover:bg-[#1868DB] rounded-md">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          
        </div>
      </div>
    </nav>
  )
}
