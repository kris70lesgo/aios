"use client"

import { MeshGradient } from "@paper-design/shaders-react"

export function MeshGradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <MeshGradient
        className="w-full h-full"
        colors={["#000000", "#0d0d0d", "#1a1a1a", "#0a0a0f"]}
        speed={0.4}
      />
      {/* subtle ambient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-violet-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-indigo-900/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-fuchsia-900/3 rounded-full blur-xl animate-pulse" style={{ animationDuration: "8s", animationDelay: "0.5s" }} />
      </div>
    </div>
  )
}
