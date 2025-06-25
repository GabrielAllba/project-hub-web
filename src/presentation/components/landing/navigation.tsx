"use client"

import { useGetMe } from "@/shared/hooks/use-get-me"
import { cn } from "@/shared/utils/merge-class"
import { getGradientForUser, getUserInitials } from "@/shared/utils/product-backlog-utils"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
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
          <div className="hidden md:flex items-center space-x-4">

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
                <span className="text-sm font-bold text-gray-900">
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

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex flex-col h-full space-y-8">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">Project Hub</span>
                </div>

                {/* Nav links */}
                <div className="flex flex-col space-y-4 text-base font-medium text-gray-700">
                  <Link to="#features">Features</Link>
                  <Link to="#resources">Resources</Link>
                  <Link to="#templates">Templates</Link>
                  <Link to="#pricing">Pricing</Link>
                  <Link to="#enterprise">Enterprise</Link>
                </div>

                {/* Auth section */}
                <div className="mt-auto flex flex-col space-y-3">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false)
                        navigate("/dashboard")
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link to="/register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
