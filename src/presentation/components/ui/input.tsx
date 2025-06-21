import { cn } from "@/shared/utils/merge-class"
import * as React from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-transparent px-3 py-1 text-sm transition-colors outline-none",
        "placeholder:text-muted-foreground",
        // Fokus: border biru tebal tanpa blur
        "focus-visible:border-blue-600 focus-visible:border-2 focus-visible:outline-2 focus-visible:outline focus-visible:outline-blue-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
