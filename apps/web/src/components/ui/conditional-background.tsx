"use client"

import { usePathname } from "next/navigation"
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background"

export function ConditionalBackground() {
  const pathname = usePathname()
  if (pathname === "/tutor") return null
  return <MeshGradientBackground />
}
