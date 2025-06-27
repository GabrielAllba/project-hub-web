"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

interface CustomDrawerProps {
    open: boolean
    onClose: () => void
    children: React.ReactNode
    direction?: "left" | "right"
    shouldScaleBackground?: boolean
}

export function CustomDrawer({
    open,
    onClose,
    children,
    direction = "right",
}: CustomDrawerProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onClose()
            }
        }

        if (open) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [open, onClose])

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose()
        }
    }

    if (!open) return null

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/50  transition-opacity duration-300 ease-out"
                onClick={handleOverlayClick}
                style={{
                    animation: open ? "fadeIn 300ms ease-out" : "fadeOut 300ms ease-out",
                }}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 bottom-0 bg-white w-1/4 shadow-2xl transition-transform duration-300 ease-out ${direction === "right" ? "right-0 translate-x-0" : "left-0 -translate-x-0"
                    }`}
                style={{
                    animation: open
                        ? `slideIn${direction === "right" ? "Right" : "Left"} 300ms ease-out`
                        : `slideOut${direction === "right" ? "Right" : "Left"} 300ms ease-out`,
                }}
            >
                {children}
            </div>


        </div>,
        document.body,
    )
}

interface CustomDrawerContentProps {
    children: React.ReactNode
    className?: string
}

export function CustomDrawerContent({ children, className = "" }: CustomDrawerContentProps) {
    return <div className={`w-full max-w-xl h-full flex flex-col ${className}`}>{children}</div>
}
