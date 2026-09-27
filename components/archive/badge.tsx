import type * as React from "react"
import { cn } from "@/lib/utils"

type BadgeTone = "neutral" | "primary" | "muted" | "outline" | "adult" | "success"

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  primary: "bg-primary text-primary-foreground",
  muted: "bg-muted text-muted-foreground",
  outline: "border border-border text-foreground",
  adult: "bg-destructive/12 text-destructive",
  success: "bg-accent text-accent-foreground",
}

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium leading-none",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
