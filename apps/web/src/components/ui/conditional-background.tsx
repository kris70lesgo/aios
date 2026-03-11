"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DotPattern } from "@/components/ui/dot-pattern"

export function ConditionalBackground() {
  const pathname = usePathname()
  if (pathname === "/tutor") return null
  return (
    <div className="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
      <DotPattern
        glow={true}
        className={cn(
          "text-gray-400",
          "[mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_75%)]"
        )}
      />
    </div>
  )
}
