import React from "react"
import { BottomNav } from "@/components/bottom-nav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg pb-20">
      <main>{children}</main>
      <BottomNav />
    </div>
  )
}
